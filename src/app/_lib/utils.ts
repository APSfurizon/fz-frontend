export function nullifyEmptyString (value?: string) {
    return value ? value.length > 0 ? value : undefined : undefined;
}