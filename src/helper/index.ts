import { ExecutionContext, createParamDecorator } from "@nestjs/common";

// 用户信息里面的内容会在后期频繁使用到，所以我们自定义一个用户的装饰器 PayloadUser，方便后期使用
export const PayloadUser = createParamDecorator(
  (data, ctx: ExecutionContext): Payload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
