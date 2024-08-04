import { Logger } from '@nestjs/common';
const logger = new Logger();

export function Retry(retries = 3, delayMs = 1000): MethodDecorator {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const retryLogic = async (attempt: number): Promise<any> => {
        const delayRandomMs = delayMs * Math.round(Math.random() * retries);
        return originalMethod.apply(this, args).catch(async (error: any) => {
          logger.log(`RETRY attempt in method ${propertyKey}: ${attempt}`);
          if (attempt < retries) {
            return new Promise((resolve) =>
              setTimeout(resolve, delayRandomMs),
            ).then(() => retryLogic(attempt + 1));
          } else {
            throw error;
          }
        });
      };
      return retryLogic(1);
    };
  };
}
