import { SetMetadata } from '@nestjs/common';

export const jwtConstants = {
  secret: 'yyds', // 秘钥，不对外公开。
  expiresIn: '15s', // 时效时长
  ignoreExpiration: true, // 是否忽略 token 时效 ? 为什么要忽略token时效
};

export const IS_PUBLIC_KEY = 'isPublic';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
