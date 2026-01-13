import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { VerifyFunctionWithRequest } from "passport-local";
import { Strategy as LocalStrategy } from "passport-local";
import { getDatabase } from "@/configs/connection.config";
import { userSettings, users } from "@/schemas/schema";
import { createId } from "@paralleldrive/cuid2";
import { log } from "@/utils/logger";
import { eq } from "drizzle-orm";
import { compare } from "bcrypt";
import { config } from "dotenv";
import passport from "passport";
import express from "express";
config();

const verify: VerifyFunctionWithRequest = async (
  req,
  email,
  incomingPassword,
  done
) => {
  try {
    const db = await getDatabase();
    const userId: string | undefined = req.body.userId;

    const user = await db.query.users.findFirst({
      where: (t, { eq }) => (userId ? eq(t.id, userId) : eq(t.email, email)),
      with: { userSettings: true },
    });

    if (userId && user) {
      return done(null, user);
    }

    if (!user) return done(null, false);

    // !The condition below is if the immediate signin is required
    if (user?.password === incomingPassword) {
      return done(null, user);
    }

    const isPasswordMatched = await compare(incomingPassword, user.password);
    if (!isPasswordMatched) return done(null, false);

    return done(null, user);
  } catch (error) {
    log.error(error);
    return done(error);
  }
};

export const initializePassportLocal = () => {
  passport.use(
    new LocalStrategy(
      { usernameField: "email", passReqToCallback: true },
      verify
    )
  );

  passport.serializeUser((user, done) => {
    return done(null, (user as typeof users.$inferSelect).id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const db = await getDatabase();
      const user = await db.query.users.findFirst({
        where: (t, { eq }) => eq(t.id, id as string),
        with: { userSettings: true },
      });

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  });
};

export const initializePassportGoogle = () => {
  const url = {
    development: `${process.env.BACKEND_DOMAIN}/api/auth/google/callback/flowName=GeneralOAuthFlow`,
    production: `${process.env.BACKEND_DOMAIN}/api/auth/google/callback/flowName=GeneralOAuthFlow`,
  };

  const environment = express().get("env") as keyof typeof url;

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: url[environment],
      },
      async (_, __, profile, done) => {
        try {
          const db = await getDatabase();
          const user = await db.query.users.findFirst({
            where: (t, { eq }) => eq(t.email, profile._json.email!),
            with: { userSettings: true },
          });

          // !return existing user
          if (user) {
            !user.profilePublicId &&
              (await db
                .update(users)
                .set({
                  profilePic: profile._json.picture,
                })
                .where(eq(users.id, user.id)));
            return done(null, user);
          } else {
            // !create one otherwise
            const [isUserInserted] = await db.insert(users).values({
              password: createId().concat("placeholder_oauth"),
              profilePic: profile._json.picture,
              fullName: profile._json.name,
              email: profile._json.email!,
            });

            if (isUserInserted.affectedRows) {
              const fetchedNewUser = await db.query.users.findFirst({
                where: (t, { eq }) => eq(t.email, profile._json.email!),
                with: { userSettings: true },
              });

              const [isuserSettingsInserted] = await db
                .insert(userSettings)
                .values({
                  clientLink: {
                    url: process.env.CLIENT_DOMAIN!,
                    isDisabled: false,
                  },
                  userId: fetchedNewUser?.id!,
                  clientTheme: "light",
                });

              if (!isuserSettingsInserted.affectedRows) {
                return done(null, false);
              }

              if (fetchedNewUser) {
                return done(null, fetchedNewUser);
              }
            }
          }

          return done(null, false);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
};
