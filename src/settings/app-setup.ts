import { INestApplication } from '@nestjs/common';
import { swaggerSetup } from './swagger.setup';
import { globalPrefixSetup } from './glolbal-prefix.setup';
import { enableCorsSetup } from './enable-cors.setup';
import { globalPipesSetup } from './global-pipes.setup';
import { exceptionFilterSetup } from './exception-filter.setup';

export function appSetup(app: INestApplication) {
  globalPipesSetup(app);
  globalPrefixSetup(app);
  swaggerSetup(app);
  enableCorsSetup(app);
  exceptionFilterSetup(app);
}
