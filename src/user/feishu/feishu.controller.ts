import { Body, Controller, Post, Version, VERSION_NEUTRAL, } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FeishuService } from './feishu.service';
import { FeishuMessageDto, GetUserTokenDto } from './feishu.dto';

@ApiTags('飞书')
@Controller('feishu')
export class FeishuController {
  constructor(private readonly feishuService: FeishuService) { }

  @ApiOperation({
    summary: '消息推送',
  })
  @Version([VERSION_NEUTRAL])
  @Post('sendMessage')
  sendMessage(@Body() params: FeishuMessageDto) {
    const { receive_id_type, ...rest } = params
    return this.feishuService.sendMessage(receive_id_type, rest);
  }

  // controller 用于接收前端http请求，具体的业务逻辑处理 or 调其他服务 在 service
  @ApiOperation({
    summary: '获取用户凭证',
  })
  @Post('getUserToken')
  getUserToken(@Body() params: GetUserTokenDto) {
    const { code } = params
    return this.feishuService.getUserToken(code);
  }
}
