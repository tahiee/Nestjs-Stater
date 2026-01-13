import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { users } from "@/schemas/schema";

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as typeof users.$inferSelect;
  }
);
