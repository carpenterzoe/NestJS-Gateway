import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';  // jwtService.signIn 调jwt的服务登录
import { FeishuUserInfo } from '@/user/feishu/feishu.dto';
import { FeishuService } from '@/user/feishu/feishu.service'; // 调 FeishuService 拿用户token 用户基本信息
import { User } from '@/user/user.mongo.entity';  // User 类 这里是用来类型标记
import { UserService } from '@/user/user.service';  // 保存用户数据

// 该模块代码中分为两个模块
// 一个是获取飞书用户信息 & 对获取到的用户信息本地落库
// 另外一个是调用 jwtService 进行登录
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private feishuService: FeishuService,
  ) { }

  // 获取飞书用户信息 & accessToken
  async getFeishuInfo(code: string) {
    // 调获取用户 accessToken 的接口，返回内容中 也包含用户的基本信息
    const data = await this.feishuService.getUserToken(code);
    const feishuInfo: FeishuUserInfo = {
      accessToken: data.access_token,
      avatarBig: data.avatar_big,
      avatarMiddle: data.avatar_middle,
      avatarThumb: data.avatar_thumb,
      avatarUrl: data.avatar_url,
      email: data.email,
      enName: data.en_name,
      mobile: data.mobile,
      name: data.name,
      feishuUnionId: data.union_id,
      feishuUserId: data.user_id,
    };
    return feishuInfo;
  }

  // 验证飞书用户
  async validateFeishuUser(code: string): Promise<Payload> {
    // ? code 错误，没拿到 feishuInfo 的情况，未处理??
    console.log('code: ', code);
    const feishuInfo: FeishuUserInfo = await this.getFeishuInfo(
      code,
    );

    console.log('feishuInfo', feishuInfo);

    // 将飞书的用户信息同步到数据库
    const user: User = await this.userService.createOrUpdateByFeishu(
      feishuInfo,
    );

    return {
      userId: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      feishuAccessToken: feishuInfo.accessToken,
      feishuUserId: feishuInfo.feishuUserId,
    };
  }

  // jwt 登录
  async login(user: Payload) {
    return {
      access_token: this.jwtService.sign(user),
    };
  }
}
