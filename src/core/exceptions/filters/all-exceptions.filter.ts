import { Catch, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { BaseExceptionFilter } from './base-exception.filter';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  onCatch(exception: unknown, response: Response): void {
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json(this.getDefaultHttpBody(exception));
  }
}
