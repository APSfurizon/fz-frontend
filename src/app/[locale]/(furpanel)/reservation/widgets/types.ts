/** Base type for widget props */
export type WidgetBaseProps<T extends NonNullable<any>> = {
  /** The initial data retrieved from server side-render, to prevent waterfall calls */
  initialData: T;
};
