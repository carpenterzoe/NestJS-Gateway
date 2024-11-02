import { Module } from '@nestjs/common';
import { FeishuController } from './feishu/feishu.controller';
import { FeishuService } from './feishu/feishu.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserProviders } from './user.providers';
import { DatabaseModule } from '@/common/database/database.module';

@Module({
  imports: [
    DatabaseModule
  ],
  controllers: [
    FeishuController,
    UserController
  ],
  // UserProviders 数据库配置可能不止一种
  providers: [...UserProviders, UserService, FeishuService],
  exports: [UserService],
})
export class UserModule { }