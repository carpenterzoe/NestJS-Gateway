import { Injectable, Inject } from '@nestjs/common';
import { In, Like, Raw, MongoRepository } from 'typeorm';
import { User } from './user.mongo.entity';
import { FeishuUserInfo } from './feishu/feishu.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: MongoRepository<User>
  ) { }

  createOrSave(user) {
    return this.userRepository.save(user)
  }

  // 跟前面 createOrSave 调的底层数据库都是同一个，所以就是字段多一点的区别 ?
  // 但是 dto 字段都不一样，这样数据库怎么兼容的 ??  - entity User 中定义的字段包含了这两种
  async createOrUpdateByFeishu(feishuUserInfo: FeishuUserInfo) {
    const res = await this.userRepository.save(feishuUserInfo);
    console.log('res: ', res);  // ? 数据库save之后，还把原始信息返回 ???
    return res
    // return await this.userRepository.save(feishuUserInfo);
  }
}
