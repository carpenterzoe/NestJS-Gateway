import { RECEIVE_TYPE, MSG_TYPE } from '@/helper/feishu/message';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum } from 'class-validator';
export class FeishuMessageDto {
  @IsNotEmpty()
  @IsEnum(RECEIVE_TYPE)
  @ApiProperty({ example: 'email', enum: RECEIVE_TYPE })  // 校验时匹配到了枚举string，但是swagger校验的提示变成了数字??
  receive_id_type: RECEIVE_TYPE

  // TODO: 需要先调接口获取到用户的open_id，或者拿到其他正确id 才能调通
  @IsNotEmpty()
  @ApiProperty({ example: 'ou_76aec9c7245edd84d75dea4707bde27d' })
  receive_id: string

  @IsNotEmpty()
  @ApiProperty({ example: '{\"text\":\" test content\"}' })
  content: string

  @IsNotEmpty()
  @IsEnum(MSG_TYPE)
  @ApiProperty({ example: 'text', enum: MSG_TYPE })
  msg_type?: keyof MSG_TYPE
}
