/**
 * At least one defined property of a type
 */
export type Leastwise<A = any> = {
  [K in keyof A]: Required<Pick<A, K>> & Partial<Omit<A, K>>;
}[keyof A];

/**
 * Only one property must be defined
 */
export type OneOf<A = any> = {
  [K in keyof A]: { [P in K]: A[P] } & Partial<Record<Exclude<keyof A, K>, never>>;
}[keyof A];
