import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { getConfig } from './utils';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
    }),
    MongooseModule.forRoot('mongodb://localhost:27017/'),
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      isGlobal: true, // 全局注册后，在业务模块就可以直接使用了
      load: [getConfig],  // load 的 getConfig 是函数
    }), UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
