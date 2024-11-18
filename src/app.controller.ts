import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // 这里跟 intercepter.controller 的默认入口重复了
  // @Get()
  // getHello(): string {
  //   return this.appService.getHello();
  // }
}
