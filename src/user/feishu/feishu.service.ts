import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  getAppToken,
  // getUserAccessToken,
  getUserToken,
  refreshUserToken,
} from 'src/helper/feishu/auth';
import { GetUserTokenDto } from './feishu.dto';

import {
  messages,
  RECEIVE_TYPE,
  MESSAGES_PARAMS,
} from '@/helper/feishu/message';

import { Cache } from 'cache-manager';
import { BusinessException } from '@/common/exceptions/business.exception';
import { ConfigService } from '@nestjs/config';
import { BUSINESS_ERROR_CODE } from '@/common/exceptions/business.error.codes';

@Injectable()
export class FeishuService {
  private APP_TOKEN_CACHE_KEY
  private USER_TOKEN_CACHE_KEY
  private USER_REFRESH_TOKEN_CACHE_KEY
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {
    this.APP_TOKEN_CACHE_KEY = this.configService.get('APP_TOKEN_CACHE_KEY')
    this.USER_TOKEN_CACHE_KEY = this.configService.get('USER_TOKEN_CACHE_KEY')
    this.USER_REFRESH_TOKEN_CACHE_KEY = this.configService.get('USER_REFRESH_TOKEN_CACHE_KEY')
  }

  // 将feishu返回的秒，转换成 redis 用到的 ttl (毫秒)
  // cacheManager set ttl 是毫秒，而接口拿到的是秒，所以转换一下
  // Property 'getMillisecondForTtl' is private and only accessible within class 'FeishuService'
  private getMillisecondForTtl(second: number) {
    const TIME_LAG = 60 // 时间差
    return (second - TIME_LAG) * 1000
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
        // const ttl = (response.expire - 60) * 1000
        const ttl = this.getMillisecondForTtl (response.expire)
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

  // service层 处理具体的业务逻辑 & 调外部服务
  async getUserToken(code: string) {
    const app_token = await this.getAppToken()
    const dto: GetUserTokenDto = {
      code,
      app_token
    };
    const res: any = await getUserToken(dto);
    if (res.code !== 0) {
      throw new BusinessException(res.msg);
    }
    return res.data;
  }

  // 缓存用户token
  async setUserCacheToken(tokenInfo: any) {
    const {
      refresh_token,
      access_token,
      user_id,
      expires_in,
      refresh_expires_in,
    } = tokenInfo;

    // 缓存用户的 token
    // const ttlUserToken = (expires_in - 60) * 1000  // cacheManager set ttl 是毫秒，而接口拿到的是秒，所以转换一下
    const ttlForUserToken = this.getMillisecondForTtl(expires_in)
    await this.cacheManager.set(`${this.USER_TOKEN_CACHE_KEY}_${user_id}`, access_token, ttlForUserToken);

    // 缓存用户的 fresh token
    // const ttlRefreshToken = (refresh_expires_in - 60) * 1000
    const ttlForRefreshToken = this.getMillisecondForTtl(refresh_expires_in)
    await this.cacheManager.set(
      `${this.USER_REFRESH_TOKEN_CACHE_KEY}_${user_id}`,
      refresh_token,
      ttlForRefreshToken,
    );
  }

  async getCachedUserToken(userId: string) {
    let userToken: string = await this.cacheManager.get(
       `${this.USER_TOKEN_CACHE_KEY}_${userId}`,
    );

    // 如果 token 失效
    if (!userToken) {
      const refreshToken: string = await this.cacheManager.get(
        `${this.USER_REFRESH_TOKEN_CACHE_KEY}_${userId}`,
      );
      if (!refreshToken) {
        throw new BusinessException({
          code: BUSINESS_ERROR_CODE.TOKEN_INVALID,
          message: 'token 已失效',
        });
      }
      // 获取新的用户 token
      const userTokenInfo = await this.getUserTokenByRefreshToken(refreshToken);
      // 更新缓存的用户 token
      await this.setUserCacheToken(userTokenInfo);
      userToken = userTokenInfo.access_token;
    }
    return userToken;
  }

  async getUserTokenByRefreshToken(refreshToken: string) {
    return await refreshUserToken({
      refreshToken,
      app_token: await this.getAppToken(),
    });
  }
}
