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

    // const isProduction = process.env.NODE_ENV === 'production';

    // if (isProduction && status === HttpStatus.INTERNAL_SERVER_ERROR) {
    //   response.status(status).json({
    //     ...this.getDefaultHttpBody(exception),
    //     path: null,
    //     message: 'Some error occurred',
    //   });

    //   return;
    // }

    response.status(status).json(this.getDefaultHttpBody(exception));
  }
}
