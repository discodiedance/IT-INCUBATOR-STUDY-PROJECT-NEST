import { DynamicModule, INestApplication } from '@nestjs/common';
import { swaggerSetup } from './swagger.setup';
import { globalPrefixSetup } from './glolbal-prefix.setup';
import { enableCorsSetup } from './enable-cors.setup';
import { pipesSetup } from './pipes.setup';
import { exceptionFilterSetup } from './exception-filter.setup';
import { validationConstraintsSetup } from './validation-constraints.setup';
import { CoreConfig } from '../core/core.config';
import { proxySetup } from './proxy-setup';
import { cookieParserSetup } from './cookie-parser.setup';

export function appSetup(
  app: INestApplication,
  coreConfig: CoreConfig,
  DynamicAppModule: DynamicModule,
) {
  pipesSetup(app);
  globalPrefixSetup(app);
  proxySetup(app);
  swaggerSetup(app, coreConfig.isSwaggerEnabled);
  enableCorsSetup(app);
  validationConstraintsSetup(app, DynamicAppModule);
  exceptionFilterSetup(app, coreConfig);
  cookieParserSetup(app);
}
