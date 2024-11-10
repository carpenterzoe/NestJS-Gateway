import { APP_ID, APP_SECRET } from './const';
import { methodV } from '@/utils/request';

export type GetAppTokenRes = {
  code: number;
  msg: string;
  app_access_token: string;
  expire: number;
};

export const getAppToken = async () => {
  const { data } = await methodV({
    url: `/auth/v3/app_access_token/internal`,
    method: 'POST',
    params: {
      app_id: APP_ID,
      app_secret: APP_SECRET,
    },
  });
  return data as GetAppTokenRes;
};

/**
 * 换取用户凭证 access_token
 * 
 * app_token: 飞书应用返回 apptoken (调飞书接口都要用到，redis缓存了的)
 * code: 飞书登录预授权重定向返回 code (有效期只有 5 mins)
 * https://open.feishu.cn/open-apis/authen/v1/index?app_id=cli_a7aaa395b4b8100d&redirect_uri=http%3A%2F%2F127.0.0.1%3A8080%2Fauth
 */
export const getUserToken = async ({ code, app_token }) => {
  const { data } = await methodV({
    url: `/authen/v1/access_token`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${app_token}`,
    },
    params: {
      grant_type: 'authorization_code',
      code,
    },
  });

  // 调用成功后，可以将 access_token 缓存
  // 使用 access_token 调用飞书提供的任意接口
  // 但前提是这个应用拥有对应的模块接口权限才能够正常调用。
  return data;
};

/**
 * 刷新用户凭证
 * 
 * 安全起见，飞书获取的 access_token 和 refresh_token 均存在有效期
 * access_token 有效期为 2小时
 * 过期之前可以通过有效期更长的 refresh_token 缓存新的 access_token，来保证能够正常调用飞书接口
 */
export const refreshUserToken = async ({ refreshToken, app_token }) => {
  const { data } = await methodV({
    url: `/authen/v1/refresh_access_token`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${app_token}`,
    },
    params: {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      app_token,
    },
  });
  return data;
};