/* eslint-disable @typescript-eslint/naming-convention */
export type IPartialRequired<T, K extends keyof T>
  = Partial<T> & Required<Pick<T, K>>;
