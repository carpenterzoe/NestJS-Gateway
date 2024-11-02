import { User } from './user.mongo.entity';

export const UserProviders = [
  {
    // 这几个配置是干啥的？？？ 怎么关联起来的？
    provide: 'USER_REPOSITORY',
    useFactory: async (AppDataSource) => await AppDataSource.getRepository(User),
    inject: ['MONGODB_DATA_SOURCE'],
  },
];
