import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
// 因为 FeishuAuthGuard 已经继承了通用的 AuthGuard
// 验证逻辑在 FeishuStrategy 实现了，所以并没有额外的代码出现
// 如果有其他的逻辑则需要对不同的方法进行重写已完成需求。

// ??? FeishuAuthGuard 和 FeishuStrategy 是怎么对接上的??? 没有看到调用关系
//  - 通过 AuthGuard('feishu') 字符串传参???
export class FeishuAuthGuard extends AuthGuard('feishu') { }
