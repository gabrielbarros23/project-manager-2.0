import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './interceptors/loggin.interceptor';
import { ExcludeNullInterceptor } from './interceptors/exclude-null.interceptor';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';
import cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './exceptions/global-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter))
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  app.useGlobalInterceptors(new LoggingInterceptor(), new ExcludeNullInterceptor(), new TimeoutInterceptor())
  app.use(cookieParser())

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
