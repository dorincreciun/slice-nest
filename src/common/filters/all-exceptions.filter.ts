import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ErrorResponse } from '../types/error-response.type.js';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    if (!(exception instanceof HttpException)) {
      this.logger.error(exception);
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({});
  }
}
