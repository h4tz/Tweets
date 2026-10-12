import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  jwtSecret: required('JWT_SECRET'),
  jwtRefreshSecret: required('JWT_REFRESH_SECRET'),
  access_token_lifetime_minutes: Number(process.env.ACCESS_TOKEN_LIFETIME_MINUTES ?? 5),
  refresh_token_lifetime_days: Number(process.env.REFRESH_TOKEN_LIFETIME_DAYS ?? 1),
};
