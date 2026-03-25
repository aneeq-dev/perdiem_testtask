const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:4000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export const SECURITY_CONFIG = {
  CORS: {
    origin: allowedOrigins,
    credentials: true,
    optionsSuccessStatus: 200,
  },
  HELMET: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  },
  BODY_PARSER: {
    json: {
      limit: '10mb',
      strict: true,
    },
    urlencoded: {
      extended: true,
      limit: '10mb',
      parameterLimit: 100,
    },
  },
  TRUST_PROXY: process.env.TRUST_PROXY === 'true' || false,
};

