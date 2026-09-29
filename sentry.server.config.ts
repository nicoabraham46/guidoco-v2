// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://b14b2f71284cc7e4e507d2ca4e077f16@o4512076204343296.ingest.us.sentry.io/4512076215353344",
});
