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
