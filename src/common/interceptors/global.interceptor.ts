import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { tap } from 'rxjs';
import { Request, Response } from 'express';

@Injectable()
export class ClassRequestAndResponseLogger implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const logger = new Logger(context.getClass().name);
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const { method, originalUrl } = request;
    const startTime = Date.now();

    response.on('close', () => {
      const requestTime = Date.now() - startTime;
      const contentLength = response.get('content-length');
      const { statusCode, statusMessage } = response;

      if (statusCode <= 201) {
        logger.log(
          `${method}, path: ${originalUrl}, statusCode: ${statusCode}, content-length: ${contentLength}, ${requestTime}ms, status: SUCCESS`,
        );
      } else if (statusCode < 400) {
        logger.warn(
          `${method}, path: ${originalUrl}, statusCode: ${statusCode}, content-length: ${contentLength}, ${requestTime}ms, status: WARNING`,
        );
      } else if (statusCode >= 400) {
        logger.error(
          `${method}, path: ${originalUrl}, statusCode: ${statusCode}, content-length: ${contentLength}, ${requestTime}ms, status: ERROR ${statusMessage}`,
        );
      }
    });
    return next.handle().pipe(tap());
  }
}
