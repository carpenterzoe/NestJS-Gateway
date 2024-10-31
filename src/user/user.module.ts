import { Module } from '@nestjs/common';

import { CacheModule} from '@nestjs/cache-manager';

import { FeishuService } from './feishu/feishu.service';
import { FeishuController } from './feishu/feishu.controller';


@Module({
  imports: [
    CacheModule.register(),
  ],
  controllers: [
    FeishuController
  ],
  providers: [FeishuService],
})
export class UserModule {}
