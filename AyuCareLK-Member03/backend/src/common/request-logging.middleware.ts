import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');
  use(request: Request, response: Response, next: NextFunction): void {
    const started = Date.now();
    response.on('finish', () => {
      // Deliberately exclude URL, query, headers and body: they may contain credentials.
      this.logger.log(`${request.method} ${response.statusCode} ${Date.now() - started}ms`);
    });
    next();
  }
}
