import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { UserService } from "@/services/user.service";
import { AuthGuard } from "@/guards/auth.guard";
import { CurrentUser } from "@/decorators/current-user.decorator";
import { UpdateUserProfileDto } from "@/dto/user-profile.dto";
import { users } from "@/schemas/schema";

@Controller("api/user")
@UseGuards(AuthGuard)
export class UserProfileController {
  constructor(private readonly userService: UserService) {}

  @Get("profile")
  async getProfile(@CurrentUser() user: typeof users.$inferSelect) {
    return this.userService.getUserProfile(user.id);
  }

  @Put("profile")
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @CurrentUser() user: typeof users.$inferSelect,
    @Body() updateDto: UpdateUserProfileDto
  ) {
    return this.userService.updateUserProfile(user.id, updateDto);
  }
}
