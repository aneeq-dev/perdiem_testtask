import { ValidationErrorDetail } from './validation.types';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  errors?: ValidationErrorDetail[];
}
