import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters';
import { ClassRequestAndResponseLogger } from './common/interceptors';
import { HeadersGuard } from './common/guards';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });
  const configs: ConfigService = app.get(ConfigService);
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));
  app.useGlobalInterceptors(new ClassRequestAndResponseLogger());
  app.useGlobalGuards(new HeadersGuard());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  const logger = new Logger('DISPATCH DELIVERY');
  const port = configs.get<number>('PORT');
  const NODE_ENV = configs.get<number>('NODE_ENV');

  await app.listen(port, () => {
    logger.log(`Service is running on ==>> http://...:${port}`);
    logger.log(`ENVIRONMENT ==>> ${NODE_ENV}`);
  });
}
bootstrap();
