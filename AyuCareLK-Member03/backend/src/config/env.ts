export interface AppEnv {
  NODE_ENV: 'development' | 'test' | 'production';
  PORT: number;
  FRONTEND_ORIGINS: string;
  JWT_ACCESS_SECRET: string;
  JWT_ACCESS_TTL_SECONDS: number;
  SWAGGER_PATH: string;
}

export function validateEnv(input: Record<string, unknown>): AppEnv {
  const NODE_ENV = String(input.NODE_ENV ?? 'development');
  if (!['development', 'test', 'production'].includes(NODE_ENV)) throw new Error('Invalid NODE_ENV');
  const PORT = Number(input.PORT ?? 3001);
  const JWT_ACCESS_TTL_SECONDS = Number(input.JWT_ACCESS_TTL_SECONDS ?? 900);
  if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) throw new Error('Invalid PORT');
  if (!Number.isInteger(JWT_ACCESS_TTL_SECONDS) || JWT_ACCESS_TTL_SECONDS < 60 || JWT_ACCESS_TTL_SECONDS > 3600) throw new Error('Invalid JWT_ACCESS_TTL_SECONDS');
  const JWT_ACCESS_SECRET = String(input.JWT_ACCESS_SECRET ?? '');
  if (JWT_ACCESS_SECRET.length < 32 || JWT_ACCESS_SECRET.startsWith('replace-with-')) throw new Error('Set a strong JWT_ACCESS_SECRET (at least 32 characters)');
  const FRONTEND_ORIGINS = String(input.FRONTEND_ORIGINS ?? '');
  const origins = FRONTEND_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean);
  if (!origins.length || origins.some((origin) => {
    try { const url = new URL(origin); return !['http:', 'https:'].includes(url.protocol) || url.origin !== origin; }
    catch { return true; }
  })) throw new Error('FRONTEND_ORIGINS must contain exact http(s) origins');
  const SWAGGER_PATH = String(input.SWAGGER_PATH ?? 'api/docs').replace(/^\/+|\/+$/g, '');
  if (!SWAGGER_PATH || SWAGGER_PATH.includes('..')) throw new Error('Invalid SWAGGER_PATH');
  return { NODE_ENV: NODE_ENV as AppEnv['NODE_ENV'], PORT, FRONTEND_ORIGINS: origins.join(','), JWT_ACCESS_SECRET, JWT_ACCESS_TTL_SECONDS, SWAGGER_PATH };
}
