// 封装 MongoDB 的 Provider
// 如果需要引入 MySQL 或者其他类型数据库，只需要替换对应的配置参数，重复对应的步骤即可。
import { DataSource, DataSourceOptions } from 'typeorm';
import { getConfig } from '@/utils'
const path = require('path');

// 设置数据库类型
const databaseType: DataSourceOptions['type'] = 'mongodb';
const { MONGODB_CONFIG } = getConfig()

const MONGODB_DATABASE_CONFIG = {
  ...MONGODB_CONFIG,
  type: databaseType,
  
  // 踏马的 不能用 npm run start:hotdev，否则编译出来没有dist目录，找不到对应的 entities 路径
  
  // 这个属性配置代表：只要是以 `entity.ts` 结尾的实例类，都会被自动扫描识别，并在数据库中生成对应的实体表。
  entities: [path.join(__dirname, `../../**/*.${MONGODB_CONFIG.entities}.entity.{ts,js}`)],
  
  // entities: [path.join(__dirname, '**', '*.entity.{ts,js}')]
  // 路径配置报错，import module 相关错误
  // 参考解决:
  // https://stackoverflow.com/questions/59435293/typeorm-entity-in-nestjs-cannot-use-import-statement-outside-a-module/66991810
}

// 可以看到这里 entities 路径是 dist/xx，是编译后的路径，不是src的路径
// console.log('entities', MONGODB_DATABASE_CONFIG.entities);

const MONGODB_DATA_SOURCE = new DataSource(MONGODB_DATABASE_CONFIG)

// 数据库注入
export const DatabaseProviders = [
  {
    provide: 'MONGODB_DATA_SOURCE',
    useFactory: async () => {
      await MONGODB_DATA_SOURCE.initialize()
      return MONGODB_DATA_SOURCE
    }
  }
];
