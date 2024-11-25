export function nullifyEmptyStrings (values?: (string | undefined)[]) {
    return values?.map(s => nullifyEmptyString(s));
}

export function nullifyEmptyString (value?: string) {
    return value ? value.length > 0 ? value : undefined : undefined;
}