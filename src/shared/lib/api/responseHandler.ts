// 표준화된 API 응답 및 에러 처리 시스템
// FSD 원칙에 따라 공통 로직을 shared 레이어에서 관리

export interface StandardApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  timestamp?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp?: string;
}

export class ApiException extends Error {
  public readonly code: string;
  public readonly details?: any;
  public readonly statusCode?: number;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    details?: any,
    statusCode?: number
  ) {
    super(message);
    this.name = 'ApiException';
    this.code = code;
    this.details = details;
    this.statusCode = statusCode;
  }
}

// API 응답 표준화 래퍼
export const standardizeResponse = <T>(data: T, message?: string): StandardApiResponse<T> => {
  return {
    data,
    success: true,
    message,
    timestamp: new Date().toISOString()
  };
};

// API 에러 응답 생성
export const createErrorResponse = (
  message: string,
  code: string = 'API_ERROR',
  details?: any
): StandardApiResponse<null> => {
  return {
    data: null,
    success: false,
    message,
    timestamp: new Date().toISOString()
  };
};

// 일관된 에러 처리 함수
export const handleApiError = (error: any): never => {
  if (error.response?.data) {
    const { data } = error.response;
    
    // 서버에서 표준 에러 형태로 응답한 경우
    if (data.code && data.message) {
      throw new ApiException(
        data.message,
        data.code,
        data.details,
        error.response.status
      );
    }
    
    // 서버에서 단순 메시지만 응답한 경우
    if (typeof data.message === 'string') {
      throw new ApiException(
        data.message,
        'SERVER_ERROR',
        data,
        error.response.status
      );
    }
    
    // 다른 형태의 에러 응답
    throw new ApiException(
      '서버에서 오류가 발생했습니다.',
      'SERVER_ERROR',
      data,
      error.response.status
    );
  }
  
  // 네트워크 에러 또는 요청 에러
  if (error.code) {
    throw new ApiException(
      getNetworkErrorMessage(error.code),
      error.code,
      error
    );
  }
  
  // 알 수 없는 에러
  throw new ApiException(
    error.message || '알 수 없는 오류가 발생했습니다.',
    'UNKNOWN_ERROR',
    error
  );
};

// 네트워크 에러 메시지 매핑
const getNetworkErrorMessage = (code: string): string => {
  const errorMessages: Record<string, string> = {
    'ENOTFOUND': '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.',
    'ECONNREFUSED': '서버가 응답하지 않습니다. 잠시 후 다시 시도해주세요.',
    'ETIMEDOUT': '요청 시간이 초과되었습니다. 다시 시도해주세요.',
    'ECONNABORTED': '요청이 중단되었습니다.',
    'NETWORK_ERROR': '네트워크 오류가 발생했습니다.',
    'TIMEOUT': '요청 시간이 초과되었습니다.'
  };
  
  return errorMessages[code] || '네트워크 오류가 발생했습니다.';
};

// 사용자 친화적인 에러 메시지 생성
export const getUserFriendlyMessage = (error: ApiException): string => {
  const codeMessageMap: Record<string, string> = {
    'USER_NOT_FOUND': '사용자를 찾을 수 없습니다.',
    'INVALID_CREDENTIALS': '로그인 정보가 올바르지 않습니다.',
    'TOKEN_EXPIRED': '세션이 만료되었습니다. 다시 로그인해주세요.',
    'UNAUTHORIZED': '권한이 없습니다.',
    'FORBIDDEN': '접근이 거부되었습니다.',
    'VALIDATION_ERROR': '입력한 정보를 확인해주세요.',
    'DUPLICATE_ERROR': '이미 존재하는 데이터입니다.',
    'RATE_LIMIT_EXCEEDED': '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
    'SERVER_ERROR': '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    'MAINTENANCE': '현재 서비스 점검 중입니다.'
  };
  
  return codeMessageMap[error.code] || error.message;
};

// 성공 응답 체크 함수
export const isSuccessResponse = <T>(
  response: StandardApiResponse<T>
): response is StandardApiResponse<T> & { success: true } => {
  return response.success === true;
};

// 에러 응답 체크 함수
export const isErrorResponse = <T>(
  response: StandardApiResponse<T>
): response is StandardApiResponse<T> & { success: false } => {
  return response.success === false;
};

// React Query onError 핸들러용 유틸리티
export const createQueryErrorHandler = (
  onError?: (error: ApiException) => void
) => {
  return (error: unknown) => {
    if (error instanceof ApiException) {
      onError?.(error);
      return;
    }
    
    // ApiException이 아닌 경우 변환
    const apiError = new ApiException(
      error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      'UNKNOWN_ERROR',
      error
    );
    
    onError?.(apiError);
  };
};

// 재시도 로직을 위한 에러 분류
export const isRetryableError = (error: ApiException): boolean => {
  const retryableCodes = [
    'NETWORK_ERROR',
    'TIMEOUT',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'SERVER_ERROR'
  ];
  
  const retryableStatusCodes = [500, 502, 503, 504];
  
  return (
    retryableCodes.includes(error.code) ||
    (typeof error.statusCode === 'number' && retryableStatusCodes.includes(error.statusCode))
  );
}; 