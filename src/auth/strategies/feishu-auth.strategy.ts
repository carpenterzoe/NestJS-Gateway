import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Query, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Strategy } from 'passport-custom';
import { FastifyRequest } from 'fastify'

// FeishuStrategy 根据 passport 提供的方法，自定义了飞书的专属策略，
// 调用 authService 中的 validateFeishuUser 方法，从飞书获取对应的用户信息
@Injectable()
export class FeishuStrategy extends PassportStrategy(Strategy, 'feishu') {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(req: FastifyRequest): Promise<Payload> {
    const q: any = req.query;

    // 根据feishu授权窗口登录拿到的code，获取 user_token 和 用户基础信息，并且落库 返回部分用户信息 user
    const user = await this.authService.validateFeishuUser(q.code as string);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}