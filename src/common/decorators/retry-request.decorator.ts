import { SetMetadata } from '@nestjs/common';

export const RETRY_ATTEMPTS_KEY = 'retryAttempts';
export const RetryEndpoint = (attempts = 3) =>
  SetMetadata(RETRY_ATTEMPTS_KEY, attempts);
