import { VersioningType, VERSION_NEUTRAL } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/exceptions/base.exception.filter';
import { HttpExceptionFilter } from './common/exceptions/http.exception.filter';

import { AppModule } from './app.module';
import { generateDocument } from './doc';

declare const module: any;

async function bootstrap() {

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // 接口版本化管理
  app.enableVersioning({
    type: VersioningType.URI,
    // defaultVersion: '1',
    defaultVersion: [VERSION_NEUTRAL, '1', '2']
  });

  // 统一响应拦截
  app.useGlobalInterceptors(new TransformInterceptor());
  
  // 异常拦截 - 非http异常? &  http异常  非http异常具体是什么异常
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());

  // 热更新
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

  // 创建文档
  generateDocument(app)

  await app.listen(3000);
}
bootstrap();
