export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  lastPage: number;
  [key: string]: any;
}

export interface ApiResponse<T, M = PaginationMeta> {
  success: boolean;
  message: string;
  data: T;
  meta?: M;
}
