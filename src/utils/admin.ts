import type { users } from "@/schemas/schema";

export type Permissions =
  | "add dj"
  | "ai generation"
  | "edit dj"
  | "add list"
  | "add event"
  | "add admin"
  | "edit list"
  | "edit admin"
  | "edit event"
  | "delete list"
  | "magic login"
  | "add coupons"
  | "delete event"
  | "delete admin"
  | "edit coupons"
  | "delete client"
  | "submit query"
  | "deactivate dj"
  | "reset ratings"
  | "delete coupons"
  | "delete generation"
  | "import playlists"
  | "delete playlists"
  | "transfer ratings"
  | "add payment method"
  | "apply subscription"
  | "cancel subscription"
  | "dj profile settings"
  | "view billing history"
  | "delete payment method"
  | "add subscription plan"
  | "admin profile settings"
  | "edit subscription plan"
  | "delete subscription plan"
  | "delete list"
  | "edit default payment method";

type User = typeof users.$inferSelect;

export const hasPermission = (
  permission: Permissions,
  user: User,
  allowDj?: boolean
) => {
  if (user.userRoles === "admin" || allowDj) return true;

  return user.userRoles === "sub_admin" &&
    user?.permissions?.includes(permission)
    ? true
    : false;
};

type PermissionSubset<T extends Permissions[]> = {
  [K in T[number]]: boolean;
};

export const hasPermissions = <P extends Permissions[], U extends User>(
  permissions: P,
  user: U
): PermissionSubset<P> => {
  const data: Partial<Record<Permissions, boolean>> = {};

  for (let p of permissions)
    data[p] =
      user.userRoles === "sub_admin" ? user?.permissions?.includes(p) : false;

  return data as Record<Permissions, boolean>;
};
