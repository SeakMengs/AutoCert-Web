export enum ResponseStatus {
  SUCCESS = 1,
  UNSUCCESSFUL = 0,
}

export type SuccessResponse<T> = {
  data: T;
  message: string;
  success: true;
};

export type ErrorResponse<T = any> = SuccessResponse<T> & {
  success: false;
  error: string | Array<{ [key: string]: string }>;
};

export type ResponseJson<T, E = any> = SuccessResponse<T> | ErrorResponse<E>;
