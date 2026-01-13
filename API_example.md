# NestJS Style API Example

Yeh ek complete example hai jo pure NestJS style mein hai - Express use nahi karta.

## Files Created

1. **DTO (Data Transfer Object)** - `src/dto/user-profile.dto.ts`

   - Request validation ke liye

2. **Guard** - `src/guards/auth.guard.ts`

   - Authentication check ke liye (Express middleware ki jagah)

3. **Decorator** - `src/decorators/current-user.decorator.ts`

   - Current user ko easily access karne ke liye

4. **Service** - `src/services/user.service.ts`

   - Business logic (Dependency Injection ke saath)

5. **Controller** - `src/controllers/user-profile.controller.ts`
   - API endpoints (NestJS decorators ke saath)

## API Endpoints

### 1. Get User Profile

```1
GET /api/user/profile
Headers: Cookie (with session)
Response: { id, email, fullName, ... }
```

### 2. Update User Profile

````3

## Key Differences from Express

### Express Style (Old)

```typescript
export default async (req: Request, res: Response) => {
  const user = req.user;
  res.json(user);
};
````

### NestJS Style (New)

```typescript
@Controller("api/user")
@UseGuards(AuthGuard)
export class UserProfileController {
  constructor(private readonly userService: UserService) {}

  @Get("profile")
  async getProfile(@CurrentUser() user: typeof users.$inferSelect) {
    return this.userService.getUserProfile(user.id);
  }
}
```

## Benefits

1. ✅ **Dependency Injection** - Services easily testable
2. ✅ **Type Safety** - Better TypeScript support
3. ✅ **Validation** - Automatic DTO validation
4. ✅ **Decorators** - Clean, readable code
5. ✅ **Guards** - Reusable authentication
6. ✅ **No Express Directly** - Pure NestJS patterns

## Testing

1. Start server: `npm run dev`
2. Login first to get session cookie
3. Then call: `GET http://localhost:3000/api/user/profile`
