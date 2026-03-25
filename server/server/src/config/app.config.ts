const parsePort = (port: string | undefined): number => {
  if (!port) return 3000;
  const parsed = Number(port);
  return isNaN(parsed) ? 3000 : parsed;
};

export const APP_CONFIG = {
  PORT: parsePort(process.env.PORT),
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const;

