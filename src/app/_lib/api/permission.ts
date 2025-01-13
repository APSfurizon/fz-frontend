import { UserDisplayResponse } from "./user";

export enum Permissions {
    CAN_SEE_ADMIN_PAGES = "CAN_SEE_ADMIN_PAGES",
    CAN_MANAGE_ROOMS = "CAN_MANAGE_ROOMS"
}

export function hasPermission(permission: Permissions, user?: UserDisplayResponse) {
    return user?.permissions?.includes(permission);
}