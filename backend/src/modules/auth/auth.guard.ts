import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../decorators/is-public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader && !isPublic) {
      throw new UnauthorizedException('No token provided');
    }

    if (authHeader) {
      const [bearer, token] = authHeader.split(' ');
      if (bearer !== 'Bearer' || !token)
        throw new UnauthorizedException('Invalid token format');

      try {
        if (token) {
          request.user = await this.authService.validateToken(token);
        }
        return true;
      } catch {
        return isPublic ? true : this.unauthorized('Invalid token');
      }
    }

    return isPublic;
  }

  private unauthorized(message = 'No token provided'): never {
    throw new UnauthorizedException(message);
  }
}
