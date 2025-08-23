class AppError extends Error {
    //  HTTP 상태 코드를 저장할 프로퍼티
   public statusCode: number;
   public status: string;
   public isOperational: boolean;
 
   constructor(message: string, statusCode: number) {
        // 부모 Error 클래스에 에러 메시지 전달
       super(message);
 
     this.statusCode = statusCode;
     // 상태 코드가 4xx로 시작하면 'fail', 아니면 'error'로 자동 설정
     this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
     // 모든 AppError는 예측 가능한 운영 오류로 간주
     this.isOperational = true;
 
     Error.captureStackTrace(this, this.constructor);
   }
 }
 
 export default AppError;