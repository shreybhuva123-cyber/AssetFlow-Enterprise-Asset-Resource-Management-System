export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

export type ValueOf<T extends object> = T[keyof T];

export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

export type DeepRequired<T> = T extends object
  ? { [P in keyof T]-?: DeepRequired<T[P]> }
  : T;

export type AsyncFn<TReturn = void, TArgs extends unknown[] = []> = (
  ...args: TArgs
) => Promise<TReturn>;

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export type RecordWithId<T extends object> = T & { id: string };

export interface SelectOption<T = string> {
  label: string;
  value: T;
  description?: string;
  disabled?: boolean;
}

export interface KeyValuePair<K = string, V = unknown> {
  key: K;
  value: V;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  website?: string;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export type SortOrder = 'asc' | 'desc';

export interface WithPagination {
  page: number;
  pageSize: number;
}

export interface WithSearch {
  search?: string;
}
