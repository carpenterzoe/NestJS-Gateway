import { DataSource, DataSourceOptions } from 'typeorm';
import { getConfig } from '@/utils'
const path = require('path');

// 设置数据库类型
const databaseType: DataSourceOptions['type'] = 'mongodb';
const { MONGODB_CONFIG } = getConfig()

const MONGODB_DATABASE_CONFIG = {
  ...MONGODB_CONFIG,
  type: databaseType,
  
  // 这个属性配置代表：只要是以 `entity.ts` 结尾的实例类，都会被自动扫描识别，并在数据库中生成对应的实体表。
  entities: [path.join(__dirname, `../../**/entities/*.${MONGODB_CONFIG.entities}.entity{.ts,.js}`)],
}

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
