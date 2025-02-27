export enum CheckResult {
    NotLogged,
    Allowed,
    Denied
}

export function checkPermission(permissionCode: string): CheckResult {
    return CheckResult.NotLogged;
}