import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  getAppToken,
  // getUserAccessToken,
  // getUserToken,
  // refreshUserToken,
} from 'src/helper/feishu/auth';

import {
  messages,
  RECEIVE_TYPE,
  MESSAGES_PARAMS,
} from '@/helper/feishu/message';

import { Cache } from 'cache-manager';
import { BusinessException } from '@/common/exceptions/business.exception';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FeishuService {
  private APP_TOKEN_CACHE_KEY
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {
    this.APP_TOKEN_CACHE_KEY = this.configService.get('APP_TOKEN_CACHE_KEY')
  }

  async getAppToken() {
    let appToken: string;
    appToken = await this.cacheManager.get(this.APP_TOKEN_CACHE_KEY);
    if (!appToken) {
      const response = await getAppToken();
      if (response.code === 0) {
        // token 有效期为 2 小时，在此期间调用该接口 token 不会改变。
        // 当 token 有效期小于 30 分的时候,再次请求获取 token 的时候，会生成一个新的 token，与此同时老的 token 依然有效。
        appToken = response.app_access_token;
        
         // cacheManager set ttl 是毫秒，而接口拿到的是秒，所以转换一下
        const ttl = (response.expire - 60) * 1000
       
        this.cacheManager.set(this.APP_TOKEN_CACHE_KEY, appToken, ttl);
      } else {
        throw new BusinessException('飞书调用异常')
      }
    }
    return appToken;
  }

  // params 标记类型后一直报错，暂时先忽略它的类型
  async sendMessage(receive_id_type: RECEIVE_TYPE, params) {
    const app_token = await this.getAppToken()
    return messages(receive_id_type, params, app_token)
  }
}
