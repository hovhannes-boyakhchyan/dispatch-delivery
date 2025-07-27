import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, retry, timer } from 'rxjs';
import { RETRY_ATTEMPTS_KEY } from '../decorators';

@Injectable()
export class RetryInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const retryAttempts =
      this.reflector.get<number>(RETRY_ATTEMPTS_KEY, context.getHandler()) || 0;

    return next.handle().pipe(
      retry({
        count: retryAttempts,
        delay: (error, retryCount) => {
          // if (error.status === 400) {
          // throw new NotFoundException();
          // }
          return timer(retryCount * 1000);
        },
      }),
    );
  }
}
