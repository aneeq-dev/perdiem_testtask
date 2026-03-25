import { SquareEnvironment } from '../types/square.types';

const environment = (process.env.SQUARE_ENVIRONMENT || 'sandbox') as SquareEnvironment;
const baseUrl =
  environment === 'production'
    ? 'https://connect.squareup.com/v2'
    : 'https://connect.squareupsandbox.com/v2';

export const SQUARE_CONFIG = {
  ACCESS_TOKEN: process.env.SQUARE_ACCESS_TOKEN || '',
  ENVIRONMENT: environment,
  BASE_URL: baseUrl,
  WEBHOOK_SIGNATURE_KEY: process.env.SQUARE_WEBHOOK_SIGNATURE_KEY || '',
};

