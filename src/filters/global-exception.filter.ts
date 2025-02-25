import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = 500;
    let message = 'Internal server error';

    // Handle HTTP Exceptions (like BadRequestException)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse() as any;
      // Get the actual message from the exception
      message = response.message || response;
    } 
    // Handle general errors
    else if (exception instanceof Error) {
      message = exception.message;
    }

    this.logger.error(
      `Status: ${status} | Path: ${request.url} | Message: ${message}`,
      exception instanceof Error ? exception.stack : undefined
    );

    response.status(status).json({
      statusCode: status,
      message: message,
    });
  }
}