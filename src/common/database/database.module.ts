import { Module } from '@nestjs/common';
import { DatabaseProviders } from './database.providers';

@Module({
  // 可能不止一个数据库，所以 DatabaseProviders 本身就是数组，在这里展开 ?
  providers: [...DatabaseProviders],
  exports: [...DatabaseProviders],
})

export class DatabaseModule { }