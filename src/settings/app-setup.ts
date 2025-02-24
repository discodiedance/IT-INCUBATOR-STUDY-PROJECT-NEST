import { INestApplication } from '@nestjs/common';
import { swaggerSetup } from './swagger.setup';
import { globalPrefixSetup } from './glolbal-prefix.setup';
import { enableCorsSetup } from './enable-cors.setup';
import { pipesSetup } from './pipes.setup';
import { exceptionFilterSetup } from './exception-filter.setup';
import { validationConstraintsSetup } from './validation-constraints.setup';

export function appSetup(app: INestApplication) {
  pipesSetup(app);
  globalPrefixSetup(app);
  swaggerSetup(app);
  enableCorsSetup(app);
  exceptionFilterSetup(app);
  validationConstraintsSetup(app);
}
