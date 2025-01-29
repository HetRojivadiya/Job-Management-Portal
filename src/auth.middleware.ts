import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthLoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('\n🔍 ===== AUTH MIDDLEWARE CHECK =====');

    // Log request details
    console.log('⏰ Time:', new Date().toISOString());
    console.log('📍 Endpoint:', `${req.method} ${req.originalUrl}`);
    console.log('🔑 Headers:', {
      'user-agent': req.headers['user-agent'],
      authorization: req.headers['authorization']
        ? 'Bearer [HIDDEN]'
        : 'No token',
    });

    const startTime = Date.now();

    // Add response logging
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      console.log('📤 Response Status:', res.statusCode);
      console.log(`⚡ Duration: ${duration}ms`);
      console.log('===== END MIDDLEWARE CHECK =====\n');
    });

    next();
  }
}
