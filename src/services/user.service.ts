import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { getDatabase } from "@/configs/connection.config";
import { users } from "@/schemas/schema";
import { eq } from "drizzle-orm";
import { UpdateUserProfileDto } from "@/dto/user-profile.dto";

@Injectable()
export class UserService {
  async getUserProfile(userId: string) {
    const db = await getDatabase();

    const user = await db.query.users.findFirst({
      where: (t, { eq }) => eq(t.id, userId),
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUserProfile(userId: string, updateDto: UpdateUserProfileDto) {
    const db = await getDatabase();

    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: (t, { eq }) => eq(t.id, userId),
    });

    if (!existingUser) {
      throw new NotFoundException("User not found");
    }

    // Check if email is being updated and if it already exists
    if (updateDto.email && updateDto.email !== existingUser.email) {
      const emailExists = await db.query.users.findFirst({
        where: (t, { eq }) => eq(t.email, updateDto.email as string),
      });

      if (emailExists) {
        throw new ConflictException("Email already exists");
      }
    }

    // Update user
    const updateData: Partial<typeof users.$inferInsert> = {};
    if (updateDto.fullName) updateData.fullName = updateDto.fullName;
    if (updateDto.email) updateData.email = updateDto.email;

    await db.update(users).set(updateData).where(eq(users.id, userId));

    // Return updated user
    const updatedUser = await db.query.users.findFirst({
      where: (t, { eq }) => eq(t.id, userId),
    });

    const { password, ...userWithoutPassword } = updatedUser!;
    return userWithoutPassword;
  }
}
