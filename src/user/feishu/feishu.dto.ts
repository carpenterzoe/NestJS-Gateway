import { RECEIVE_TYPE, MSG_TYPE } from '@/helper/feishu/message';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum } from 'class-validator';
export class FeishuMessageDto {
  @IsNotEmpty()
  @IsEnum(RECEIVE_TYPE)
  @ApiProperty({ example: 'open_id', enum: RECEIVE_TYPE })  // 校验时匹配到了枚举string，但是swagger校验的提示变成了数字??
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

export class GetUserTokenDto {
  @IsNotEmpty()
  @ApiProperty({ example: 'xxxx', description: '飞书临时登录凭证' })
  code: string;

  app_token: string;
}

export class FeishuUserInfo {
  accessToken?: string;
  email: string;
  avatarUrl: string;
  avatarThumb: string;
  avatarBig: string;
  avatarMiddle: string;
  mobile: string;
  enName: string;
  name: string;
  feishuUserId: string;
  feishuUnionId: string;
}
