import { INestApplication } from '@nestjs/common';
import { AllExceptionsFilter } from '../core/exceptions/filters/all-exceptions.filter';
import { DomainExceptionsFilter } from '../core/exceptions/filters/domain-exceptions.filters';

export function exceptionFilterSetup(app: INestApplication) {
  app.useGlobalFilters(new AllExceptionsFilter(), new DomainExceptionsFilter());
}
