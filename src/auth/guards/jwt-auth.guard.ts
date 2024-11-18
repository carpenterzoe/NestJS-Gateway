import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { BUSINESS_ERROR_CODE } from '@/common/exceptions/business.error.codes';
import { BusinessException } from '@/common/exceptions/business.exception';
import { IS_PUBLIC_KEY } from '../constants';


// JwtAuthGuard 模块实现了 canActivate 与 handleRequest 的重写
// 分别是针对于自定义逻辑与异常捕获的处理
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    // 权限守卫 ? 在这里定义了，在接口层面怎么调用的?
    // 前置拦截，返回true false，控制当前请求是否能继续进行
    canActivate(context: ExecutionContext) {

        // 根据key值 检索请求元数据
        const loginAuth = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            // 以下这部分可以暂时忽略去理解意思，当做模板语法，查的其他例子 权限守卫这部分基本都是这样写的
            context.getHandler(),
            context.getClass(),
        ]);

        // 如果请求标记了 public，权限守卫直接返回 true，请求继续
        if (loginAuth) {
            return true;
        }

        // value indicating whether or not the current request is allowed to proceed.
        return super.canActivate(context);
    }

    // 授权异常捕获的处理
    handleRequest(err, user, info) {
        if (err || !user) {
            throw (
                err ||
                new BusinessException({
                    code: BUSINESS_ERROR_CODE.TOKEN_INVALID,
                    message: 'token 已失效',
                })
            );
        }
        return user;
    }
}
