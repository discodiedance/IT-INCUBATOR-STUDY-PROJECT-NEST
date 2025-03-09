import { INestApplication } from '@nestjs/common';
import { AllExceptionsFilter } from '../core/exceptions/filters/all-exceptions.filter';
import { DomainExceptionsFilter } from '../core/exceptions/filters/domain-exceptions.filters';
import { CoreConfig } from '../core/core.config';

export function exceptionFilterSetup(
  app: INestApplication,
  coreConfig: CoreConfig,
) {
  app.useGlobalFilters(
    new AllExceptionsFilter(coreConfig),
    new DomainExceptionsFilter(),
  );
}
