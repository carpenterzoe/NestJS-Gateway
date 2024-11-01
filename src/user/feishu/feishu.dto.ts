import { RECEIVE_TYPE, MSG_TYPE } from '@/helper/feishu/message';
import { ApiProperty } from '@nestjs/swagger';

export class FeishuMessageDto {
  @ApiProperty({ example: 'open_id' })
  receive_id_type: RECEIVE_TYPE

  // TODO: 需要先调接口获取到用户的open_id，或者拿到其他正确id 才能调通
  @ApiProperty({ example: 'ou_76aec9c7245edd84d75dea4707bde27d' })
  receive_id: string

  @ApiProperty({ example: '{\"text\":\" test content\"}' })
  content: string

  @ApiProperty({ example: 'text', enum: MSG_TYPE })
  msg_type?: keyof MSG_TYPE
}
