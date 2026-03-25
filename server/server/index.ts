import './src/config/env.loader';

import http from 'http';
import { Server } from 'http';
import { APP_CONFIG } from './src/config/app.config';
import app from './src/app';

const PORT = APP_CONFIG.PORT;
const HOST = process.env.HOST || '0.0.0.0';
const SHUTDOWN_TIMEOUT = 10000; // 10 seconds

let server: Server | null = null;
let isShuttingDown = false;

const createServer = (): Server => {
  const httpServer = http.createServer(app);

  httpServer.keepAliveTimeout = 65000;
  httpServer.headersTimeout = 66000;

  httpServer.on('error', (error: NodeJS.ErrnoException) => {
    if (error.syscall !== 'listen') {
      throw error;
    }

    const bind = typeof PORT === 'string' ? `Pipe ${PORT}` : `Port ${PORT}`;

    switch (error.code) {
      case 'EACCES':
        console.error(`${bind} requires elevated privileges`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(`${bind} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  });

  httpServer.on('listening', () => {
    const addr = httpServer.address();
    const bind =
      typeof addr === 'string' ? `pipe ${addr}` : `port ${addr?.port || PORT}`;
    console.log(`🚀 Server is running on ${bind}`);
    console.log(`📦 Environment: ${APP_CONFIG.NODE_ENV}`);
    console.log(`🌐 Access the API at: http://localhost:${PORT}`);
  });

  httpServer.on('connection', (socket) => {
    if (isShuttingDown) {
      socket.destroy();
      return;
    }
  });

  httpServer.on('clientError', (err, socket) => {
    if (socket.writable) {
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    } else {
      socket.destroy(err);
    }
  });

  return httpServer;
};

const startServer = (): void => {
  try {
    server = createServer();
    server.listen(PORT, HOST);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

const gracefulShutdown = (signal: string): void => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`\n📛 Received ${signal}. Starting graceful shutdown...`);

  if (!server) {
    console.log('Server not initialized, exiting...');
    process.exit(0);
  }

  server.close((err) => {
    if (err) {
      console.error('Error during server shutdown:', err);
      process.exit(1);
    }

    console.log('✅ Server closed successfully');
    console.log('👋 Exiting process...');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('⏰ Forced shutdown after timeout');
    if (server) {
      server.closeAllConnections();
    }
    process.exit(1);
  }, SHUTDOWN_TIMEOUT);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (error: Error) => {
  console.error('💥 Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

startServer();
