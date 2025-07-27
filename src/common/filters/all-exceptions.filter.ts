import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ErrorTypeEnum } from '../enums';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private logger: Logger;

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {
    this.logger = new Logger();
  }

  catch(exception: any, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const responseInfo =
      exception instanceof HttpException ? exception?.getResponse() : exception;
    const message =
      exception instanceof HttpException
        ? responseInfo.message || exception.message
        : 'Internal server error';

    const responseBody = {
      statusCode: httpStatus,
      title: responseInfo.title,
      type: responseInfo.type || ErrorTypeEnum.error,
      name: exception.name,
      message,
      error: responseInfo.error,
      data: responseInfo.response,
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };
    const response = ctx.getResponse<Response>();
    response.on('close', () => {
      this.logger.error(
        exception.response?.message
          ? JSON.stringify(exception.response.message)
          : exception,
        exception?.stack,
        'DISPATCH EXCEPTION',
      );
    });

    if (httpStatus === HttpStatus.INTERNAL_SERVER_ERROR) {
      responseBody.message = 'Internal server error';
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
