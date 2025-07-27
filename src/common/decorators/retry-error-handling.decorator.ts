import { Logger } from '@nestjs/common';
const logger = new Logger();

export function RetryErrorHandling(): MethodDecorator {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        if (error.status === 409) {
          logger.warn(`in method ${propertyKey}: ${error.status}`);
          if (propertyKey === 'createJob') {
            return { job_id: '' };
          }
          return {};
        }
        throw error;
      }
    };
  };
}
