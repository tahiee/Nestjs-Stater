import {
  int,
  text,
  json,
  varchar,
  decimal,
  boolean,
  timestamp,
  mysqlEnum,
  mysqlTable,
  mediumtext,
  ReferenceConfig,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import type { Permissions } from "@/utils/admin";
import { createInsertSchema } from "drizzle-zod";
import { createId, init } from "@paralleldrive/cuid2";

type Percentage = {
  percentage: number;
};

export type Result = { track: string; score: number };

export type Relevance = {
  track: Percentage;
  genres: Percentage;
  artists: Percentage;
};

const timeStamps = {
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
};

const uuid = (columnName: string) =>
  varchar(columnName, { length: 128 }).$defaultFn(() => createId());

const foreignkeyRef = (
  columnName: string,
  refColumn: ReferenceConfig["ref"],
  actions?: ReferenceConfig["actions"]
) => varchar(columnName, { length: 128 }).references(refColumn, actions);

interface IProxyData {
  id: string;
  email: string;
  password: string;
  planId: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  isProxy: boolean | null;
  fullName: string | null;
  profilePic: string | null;
  companyName: string | null;
  proxyData: IProxyData | null;
  isDeactivated: boolean | null;
  profilePublicId: string | null;
  showRatingAlert: boolean | null;
  stripeCustomerId: string | null;
  permissions: Permissions[] | null;
  userRoles: "user" | "admin" | "client" | "sub_admin" | null;
}

export const users = mysqlTable("users", {
  id: uuid("id").primaryKey(),
  isProxy: boolean("is_proxy").default(false),
  fullName: varchar("full_name", { length: 100 }),
  proxyData: json("proxy_data").$type<IProxyData>(),
  profilePic: varchar("profile_pic", { length: 255 }),
  companyName: varchar("company_name", { length: 100 }),
  permissions: json("permissions").$type<Permissions[]>(),
  isDeactivated: boolean("is_deactivated").default(false),
  password: varchar("password", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  showRatingAlert: boolean("show_rating_alert").default(false),
  profilePublicId: varchar("profile_public_id", { length: 255 }),
  stripeCustomerId: varchar("stripe_customer_id", { length: 100 }),
  planId: foreignkeyRef("plan_id", () => plans.id, { onDelete: "set null" }),
  userRoles: mysqlEnum("user_roles", [
    "user",
    "admin",
    "client",
    "sub_admin",
  ]).default("user"),
  ...timeStamps,
});

export const usersrelations = relations(users, ({ one }) => ({
  userSettings: one(userSettings, {
    references: [userSettings.userId],
    fields: [users.id],
  }),
  plan: one(plans, {
    fields: [users.planId],
    references: [plans.id],
  }),
}));

export const emailTemplates = mysqlTable("email_templates", {
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  htmlContent: text("html_content").notNull(),
  ...timeStamps,
});

export const plans = mysqlTable("plans", {
  id: uuid("id").primaryKey(),
  description: text("description").notNull(),
  title: varchar("title", { length: 100 }).unique().notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  features: json("features")
    .$type<{ type: "playlist generations" | "events"; amount: string }[]>()
    .notNull(),
  type: varchar("type", { length: 10, enum: ["private", "public"] }).notNull(),
  email: varchar("email", { length: 50 }),
  ...timeStamps,
});

export const userSettings = mysqlTable("user_settings", {
  id: uuid("id").primaryKey(),
  clientTheme: mysqlEnum("client_theme", ["light", "dark"]).default("light"),
  clientLink: json("client_link")
    .$type<{ url: string; isDisabled: boolean }>()
    .notNull(),
  userId: foreignkeyRef("user_id", () => users.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
});

export const clients = mysqlTable("clients", {
  id: uuid("id").primaryKey(),
  clientName: varchar("client_name", { length: 100 }).notNull(),
  ...timeStamps,
});

export const verification = mysqlTable("verification", {
  id: varchar("id", { length: 128 })
    .$defaultFn(init({ length: 10 }))
    .primaryKey(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  token: text("token").notNull(),
});

export const verificationrelations = relations(verification, ({ one }) => ({
  user: one(users, {
    fields: [verification.email],
    references: [users.email],
  }),
}));

export const testimonials = mysqlTable("testimonials", {
  id: uuid("id").primaryKey(),
  content: text("content").notNull(),
  userId: foreignkeyRef("user_id", () => users.id, {
    onDelete: "cascade",
  }).notNull(),
  rating: mysqlEnum("rating", [
    "1",
    "1.5",
    "2",
    "2.5",
    "3",
    "3.5",
    "4",
    "4.5",
    "5",
  ]).notNull(),
  ...timeStamps,
});

export const testimonialsrelations = relations(testimonials, ({ one }) => ({
  user: one(users, {
    fields: [testimonials.userId],
    references: [users.id],
  }),
}));

export const sessions = mysqlTable("sessions", {
  sessionId: varchar("session_id", { length: 128 }).primaryKey().notNull(),
  expires: int("expires").notNull(),
  data: mediumtext("data"),
  ...timeStamps,
});

export const throttleinsight = mysqlTable("throttle_insight", {
  waitTime: int("wait_time").notNull(),
  msBeforeNext: int("ms_before_next").notNull(),
  endPoint: varchar("end_point", { length: 225 }),
  pointsAllotted: int("allotted_points").notNull(),
  consumedPoints: int("consumed_points").notNull(),
  remainingPoints: int("remaining_points").notNull(),
  key: varchar("key", { length: 225 }).primaryKey().notNull(),
  isFirstInDuration: boolean("is_first_in_duration").notNull(),
});

export const userInsertSchema = createInsertSchema(users);
export const plansInsertSchema = createInsertSchema(plans);
export const testimonialInsertSchema = createInsertSchema(testimonials);
