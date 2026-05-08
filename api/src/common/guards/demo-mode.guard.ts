import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiException } from '../exceptions/api.exception';

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const ALLOWED_MUTATION_PATHS = new Set(['/auth/system/login', '/auth/system/refresh-token']);
const ENABLED_VALUES = new Set(['true', '1', 'yes', 'on']);

@Injectable()
export class DemoModeGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    if (!this.isDemoModel()) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const method = String(request.method || '').toUpperCase();
    const path = this.normalizePath(request.path || request.url || '');

    if (!MUTATION_METHODS.has(method) || ALLOWED_MUTATION_PATHS.has(path)) {
      return true;
    }

    throw new ApiException(403, '当前是demo模式，不支持修改！');
  }

  private isDemoModel(): boolean {
    return this.isEnabled(this.configService.get<string>('DEMO_MODEL'))
      || this.isEnabled(this.configService.get<string>('DEMO_MODE'));
  }

  private isEnabled(value?: string | boolean | number): boolean {
    return ENABLED_VALUES.has(String(value ?? '').trim().toLowerCase());
  }

  private normalizePath(path: string): string {
    return path.split('?')[0].replace(/\/+$/, '') || '/';
  }
}
