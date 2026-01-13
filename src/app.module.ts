import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { AppController } from "./app.controller";
import { UserProfileController } from "@/controllers/user-profile.controller";
import { UserService } from "./services/user.service";

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "public"),
      exclude: ["/api*"],
    }),
  ],
  controllers: [AppController, UserProfileController],
  providers: [UserService],
})
export class AppModule {}
