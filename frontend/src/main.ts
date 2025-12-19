import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

import posthog from 'posthog-js';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));


posthog.init('phc_rA70V3Sly8Pl4c71jEZPB64XUqaiCWf1mqwyi1VnTy2', {
  api_host: 'https://app.posthog.com',
});
