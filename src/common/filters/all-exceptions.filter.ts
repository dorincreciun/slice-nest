import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type { ErrorResponse } from '../types/error-response.type';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response<ErrorResponse>>();

    if (!(exception instanceof HttpException)) {
      this.logger.error(exception);
    }

    const statusCode = this.resolveExceptionStatus(exception);
    const message = this.resolveExceptionMessage(exception);

    response.status(statusCode).json({
      statusCode,
      code: HttpStatus[statusCode] ?? 'UNKNOWN_ERROR',
      message,
      details: null,
      meta: {
        path: request.url,
        timestamp: new Date().toISOString(),
      },
    });
  }

  private resolveExceptionStatus(exception: unknown): number {
    return exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private resolveExceptionMessage(exception: unknown): string {
    if (!(exception instanceof HttpException)) {
      return 'Internal server error';
    }

    const body = exception.getResponse();

    if (typeof body === 'string') {
      return body;
    }

    if ('message' in body) {
      const { message } = body;
      if (typeof message === 'string') return message;
      if (Array.isArray(message)) return message.join(', ');
    }

    return exception.message;
  }
}
