import { ApiResponse } from '../types/common.types';

// 成功响应，所有接口成功都用这个返回
export function successResponse<T>(
  data: T,
  message: string = '操作成功'
): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
  };
}

// 失败响应，所有接口报错都用这个返回
export function errorResponse(
  message: string,
  errorCode: string = 'ERROR'
): ApiResponse {
  return {
    success: false,
    message,
    errorCode,
  };
}