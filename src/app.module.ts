import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet'
import { getConfig } from './utils';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { IntercepterModule } from './core/intercepter.module'
import { UserModule } from './user/user.module';

import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      url: 'redis://localhost:6379',
    }),
    MongooseModule.forRoot('mongodb://localhost:27017/'),
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      isGlobal: true, // 全局注册后，在业务模块就可以直接使用了
      load: [getConfig],  // load 的 getConfig 是函数
    }),
    UserModule,
    AuthModule,
    IntercepterModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule { }
