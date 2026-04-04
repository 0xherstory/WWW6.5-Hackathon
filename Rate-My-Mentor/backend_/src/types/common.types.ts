// 所有接口统一返回格式，前端同学对接更方便
export interface ApiResponse<T = any> {
  success: boolean; // 请求是否成功
  data?: T; // 成功时返回的数据
  message: string; // 提示信息
  errorCode?: string; // 失败时的错误码
}

// 分页请求通用参数
export interface PaginationParams {
  page: number;
  pageSize: number;
}