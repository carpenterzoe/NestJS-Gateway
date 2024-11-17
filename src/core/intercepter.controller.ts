import { Public } from '@/auth/constants';
import {
  Controller,
  Get,
  Req,
  Res,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

// 当访问到项目已存在的接口时，会正常走之前的业务逻辑
// 当访问不存在的业务逻辑路由时，将统一进入 IntercepterController 中

// @Controller()
// 加上星号 所有的请求都被拦截到这里来了
@Controller('*')
export class IntercepterController {
  constructor() { }
  @Public()
  @Get()
  async getApp(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
    // 注意，此时的 getApp 引入了 @Res() res: FastifyReply
    // 不能直接 return 返回值
    // 需要使用 res.send 来返回 html 格式
    res.send('html')
  }
}
