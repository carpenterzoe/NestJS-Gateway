import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { jwtConstants } from '../constants';
import { FastifyRequest } from "fastify";

// 把cookie中的jwt信息解析出来
const cookieExtractor = function (req: FastifyRequest) {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['jwt'];
  }
  return token;
};

// JwtStrategy 则是使用 passport-jwt 拓展的功能，对 cookie 做了拦截、解密等功能。
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: jwtConstants.ignoreExpiration,
      secretOrKey: jwtConstants.secret,
    });
  }

  // 这个 validate 是做啥的？ 这不是直接返回了用户信息(Payload)吗 ?
  async validate(payload: Payload): Promise<Payload> {
    return { ...payload };
  }
}