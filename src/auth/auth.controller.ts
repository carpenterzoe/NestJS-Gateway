import {
  Controller,
  UseGuards,
  Res,
  Get,
  Query,
  VERSION_NEUTRAL,
} from '@nestjs/common';

import { FeishuAuthGuard } from './guards/feishu-auth.guard'; // 路由守卫
import { AuthService } from './auth.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';  // 文档注释
import { GetTokenByApplications } from './auth.dto';  // 接口定义 dto
import { Public } from './constants'; // public装饰器 为什么放在contants? 奇怪
import { PayloadUser } from '@/helper'; // 获取用户信息的装饰器
import { FastifyReply } from 'fastify'

@ApiTags('用户认证')
@Controller({
  path: 'auth',
  version: [VERSION_NEUTRAL]
})
export class AuthController {
  constructor(
    private authService: AuthService,
  ) { }

  @ApiOperation({
    summary: '飞书 Auth2 授权登录',
    description: '通过 code 获取`access_token` https://open.feishu.cn/open-apis/authen/v1/index?app_id=cli_a7aaa395b4b8100d&redirect_uri=http%3A%2F%2F127.0.0.1%3A8080%2Fauth',
  })
  // 这里 UseGuards 调用 AuthGuard('feishu'), 也就是 feishu-auth.strategy 的 validate?
  // 即 接收code, 返回 user
  @UseGuards(FeishuAuthGuard)
  @Public()
  @Get('/feishu/auth2')
  // 接口这个fn里面定义好几个装饰器，先后顺序 执行从上到下?
  async getFeishuTokenByApplications(
    // 这里 放 PayloadUser 是啥意思? 用户信息是入参?? 如果不是是话，内容还没返回呢?? 用来校验是否返回???
    //  - 这里的 user 实际上是 FeishuAuthGuard 通过 code换回的
    @PayloadUser() user: Payload,
    //  if it should passthrough Nest response processing pipeline.
    @Res({ passthrough: true }) response: FastifyReply,
    // 校验入参
    @Query() query: GetTokenByApplications,
  ) {
    // 调 jwtService.sign 获取 access_token，设置 cookie
    const { access_token } = await this.authService.login(user);
    response.setCookie('jwt', access_token, {
      path: '/',
    });

    // 这里返回的是 jwt 根据user信息生成的，而 /getUserToken 返回的 是feishu api拿到的
    return access_token
  }

  @ApiOperation({
    summary: '解析 token',
    description: '解析 token 信息',
  })
  @Get('/token/info')
  async getTokenInfo(@PayloadUser() user: Payload) {
    return user;
  }
}
