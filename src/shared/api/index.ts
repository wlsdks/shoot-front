export * from './api';

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
} 