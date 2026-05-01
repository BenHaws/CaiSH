
import { type Request, type Response, type NextFunction } from 'express';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly traceId: string;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.traceId = crypto.randomUUID(); // trace id for audit logs
    Error.captureStackTrace(this, this.constructor);
  }
}

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

  // Professional feedback: No sensitive stack traces in production
  res.status(statusCode).json({
    status,
    traceId: err.traceId,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
