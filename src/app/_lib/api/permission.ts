import { UserDisplayResponse } from "./user";

export enum Permissions {
    SHOW_ADMIN_AREA = "SHOW_ADMIN_AREA"
}

export function hasPermission(permission: Permissions, user?: UserDisplayResponse) {
    return user?.permissions?.includes(permission);
}