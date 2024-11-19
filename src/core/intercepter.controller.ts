import { Public } from '@/auth/constants';
import {
  Controller,
  Get,
  Req,
  Res,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { URL } from 'url';
import { IntercepterService } from './intercepter.service';


// 当访问到项目已存在的接口时，会正常走之前的业务逻辑
// 当访问不存在的业务逻辑路由时，将统一进入 IntercepterController 中

// @Controller() 加上星号 所有其他Controller 匹配不到的请求 都被拦截到这里来了
@Controller('*')
export class IntercepterController {
  constructor(private readonly intercepterService: IntercepterService) { }
  @Public()
  @Get()
  async getApp(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
    // 注意，此时的 getApp 引入了 @Res() res: FastifyReply
    // 不能直接 return 返回值
    // 需要使用 res.send 来返回 html 格式
    // res.send('html')

    // const urlObj = new URL(req.url, `http://${req.headers.host}`);
    // console.log('urlObj===>', urlObj)
    // res.send(req.headers.host)

    const urlObj = new URL(req.url, `http://${req.headers.host}`);
    if (urlObj.pathname === '/favicon.ico') return res.send('ico');

    const html = await this.intercepterService.readHtml(urlObj);

    if (!html) return res.send('404');

    res.headers({
      'Content-Type': 'text/html',
    });
    res.send(html);
  }
}
