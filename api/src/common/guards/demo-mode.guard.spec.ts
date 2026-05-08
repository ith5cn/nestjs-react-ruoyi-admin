import type { ExecutionContext } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { DemoModeGuard } from './demo-mode.guard';

type DemoConfig = {
  DEMO_MODEL?: string | boolean | number;
  DEMO_MODE?: string | boolean | number;
};

const createContext = (method: string, path: string) => ({
  switchToHttp: () => ({
    getRequest: () => ({ method, path }),
  }),
}) as ExecutionContext;

const createGuard = (config: DemoConfig) => new DemoModeGuard({
  get: (key: keyof DemoConfig) => config[key],
} as unknown as ConfigService);

describe('DemoModeGuard', () => {
  it.each(['POST', 'PUT', 'PATCH', 'DELETE'])('allows %s requests when demo model is disabled', (method) => {
    const guard = createGuard({ DEMO_MODEL: 'false' });

    expect(guard.canActivate(createContext(method, '/system/user'))).toBe(true);
  });

  it.each(['POST', 'PUT', 'PATCH', 'DELETE'])('blocks %s requests when demo model is enabled', (method) => {
    const guard = createGuard({ DEMO_MODEL: 'true' });

    expect(() => guard.canActivate(createContext(method, '/system/user'))).toThrow('当前是demo模式，不支持修改！');
  });

  it('allows read-only requests when demo model is enabled', () => {
    const guard = createGuard({ DEMO_MODEL: 'true' });

    expect(guard.canActivate(createContext('GET', '/system/user'))).toBe(true);
    expect(guard.canActivate(createContext('HEAD', '/system/user'))).toBe(true);
    expect(guard.canActivate(createContext('OPTIONS', '/system/user'))).toBe(true);
  });

  it('allows login and token refresh in demo model', () => {
    const guard = createGuard({ DEMO_MODEL: 'true' });

    expect(guard.canActivate(createContext('POST', '/auth/system/login'))).toBe(true);
    expect(guard.canActivate(createContext('POST', '/auth/system/refresh-token'))).toBe(true);
  });

  it('blocks register requests in demo model', () => {
    const guard = createGuard({ DEMO_MODEL: 'true' });

    expect(() => guard.canActivate(createContext('POST', '/auth/system/register'))).toThrow('当前是demo模式，不支持修改！');
  });

  it('keeps compatibility with DEMO_MODE', () => {
    const guard = createGuard({ DEMO_MODE: 'on' });

    expect(() => guard.canActivate(createContext('DELETE', '/system/user/1'))).toThrow('当前是demo模式，不支持修改！');
  });
});
