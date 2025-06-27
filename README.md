# Pino Logger for Nav

This repo has two libraries, @navikt/pino-logger for logging in a node/bun/deno server environment, and @navikt/next-logger for isomorphic logging in a Next.js application.

- [Docs for @navikt/pino-logger](#naviktpino-logger) - A pino logger for node/bun/deno
- [Docs for @navikt/next-logger](#naviktnext-logger) - An isomorphic logger for Next.js applications

[Go to migrations from v1 to v2/3](#breaking-changes-migrating-from-v1-to-v2v3)

[Go to migrations from v3 to v4](#breaking-changes-migrating-from-v3-to-v4)

# @navikt/pino-logger

An simple logger that lets you log in your server runtime. Logs in a JSON format that [logs.adeo.no](https://logs.adeo.no) understands. And all logs are grouped under your application (`+application:yourapp`) with correct log level.

## Getting started

### Installation

```bash
yarn add @navikt/pino-logger pino
```

```bash
npm i @navikt/pino-logger pino
```

if you want to use the secure logger, you also need to install `pino-roll`:

```bash
yarn add pino-roll
```

```bash
npm i pino-roll
```

### Step 1: Logging

Anywhere in your application where you want to log, you should import `import { logger } from '@navikt/pino-logger';`, this is a [pino](https://github.com/pinojs/pino/blob/master/docs/api.md#logger) instance, use it to log, for example: `logger.warn("Uh oh")`.
Alternatively, if you need secure logging, use `ìmport { secureLogger } from '@navikt/pino-logger';`. See [Securelogs](#Securelogs) for more information on secure logging.

### Step 2: pino-pretty

If you want pino-pretty for local development (and you probably do, simply install it and pipe it:

```bash
yarn add -D pino-pretty
```

```bash
npm i --save-dev pino-pretty
```

Simply pipe the output of your development server into pino pretty with correct message key:

```
"scripts": {
  "dev": "<your server> | pino-pretty --messageKey=message",
}
```

# @navikt/next-logger

An isomorphic logger that lets you log from both the frontend and the backend. Both will log in a JSON format that [logs.adeo.no](https://logs.adeo.no) understands. And all logs are grouped under your application (`+application:yourapp`) with correct log level.

Now with [SecureLogs](https://doc.nais.io/observability/logging/how-to/enable-secure-logs/) support!

## Getting started

### Installation

```bash
yarn add @navikt/next-logger pino
```

```bash
npm i @navikt/next-logger pino
```

if you want to use the secure logger, you also need to install `pino-roll`:

```bash
yarn add pino-roll
```

```bash
npm i pino-roll
```

### Step 1: Prepare Next.js for isomorphic logging

You need an API route that will receive all the log statements from the frontend.

**For app dir:**

Create a new API route `/app/api/logger/route.ts`, it should look like this:

```ts
export { POST } from '@navikt/next-logger/app-dir'
```

**For pages dir:**

Create a new API route `/pages/api/logger.ts`, it should look like this:

```ts
export { loggingRoute as default } from '@navikt/next-logger/pages'
```

### Step 2: Logging

Anywhere in your application where you want to log, you should import `import { logger } from '@navikt/next-logger';`, this is a [pino](https://github.com/pinojs/pino/blob/master/docs/api.md#logger) instance, use it to log, for example: `logger.warn("Uh oh")`.
Alternatively, if you need secure logging, use `ìmport { secureLogger } from '@navikt/next-logger';`. See [Securelogs](#Securelogs) for more information on secure logging.

### Step 3: pino-pretty

If you want pino-pretty for local development (and you probably do, simply install it and pipe it:

```bash
yarn add -D pino-pretty
```

```bash
npm i --save-dev pino-pretty
```

Simply pipe the output of your development server into pino pretty:

```
"scripts": {
  "dev": "next dev | pino-pretty --messageKey=message",
}
```

### Step 4 (Optional): Integrating with [next-logger](https://www.npmjs.com/package/next-logger)

The pino configuration from this library can be shared with [next-logger](https://www.npmjs.com/package/next-logger).

Simply create a `next-logger.config.js` in the root of your project, and re-export the logging config as following:

```js
const { backendLogger } = require('@navikt/next-logger')

module.exports = {
    logger: backendLogger,
}
```

## Configuration

### App Dir

You want this configuration to execute as early as possible, but on the actual client. Typically in your app-dir app, you will have for example a `<Providers>`-client that is `"use client"`-enabled.

On the _root_ of any `"use client"`-enabled file that wraps your root layout.tsx, you can configure the library, for example:

```ts
"use client"

configureLogger({
    basePath: '/my/base/path',
})

export const MyProviders() {
   ...
}
```

### Pages

If your application is using a base path, or you want to have your logger on a different API-route, you can configure the logger.

In your `_app.tsx`, on root in the file, you can use `configureLogger` as such:

```ts
configureLogger({
    basePath: '/my/base/path',
    apiPath: '/api/other-logger',
})
```

Or if you only want to change the base path:

```ts
configureLogger({
    basePath: '/my/base/path',
})
```

## Securelogs

If you want to log sensitive information, you can use the `secureLogger` function. This will instead of logging to stdout log to a file on /secure-logs.
This requires some setup, see [nais docs](https://doc.nais.io/observability/logging/how-to/enable-secure-logs/) for how to enable secure logging in your app.

The log file is setup with [pino-roll](https://www.npmjs.com/package/pino-roll) for rolling the logs based on file size.

Using secure logger as an isomorphic logger requires an additonal API-route in your next app, the configuration is similar to the primary logger route.

**For app dir:**

Create a new API route `/app/api/secure-logger/route.ts`, it should look like this:

```ts
export { POST } from '@navikt/next-logger/secure-log/app-dir'
```

**For pages dir:**

Create a new API route `/pages/api/secure-logger.ts`, it should look like this:

```ts
export { pinoLoggingRoute as default } from '@navikt/next-logger/secure-log/pages'
```

If you need to add some extra metadata to secure log statements server side, you can add an metadata-middleware to extract info from the request:

**App dir**

```ts
import { withMetadata } from '@navikt/next-logger/secure-log/app-dir'
import { UAParser } from 'ua-parser-js'

export const POST = withMetadata((request) => {
    const userAgent = request.headers.get('user-agent')
    if (!userAgent) return { platform: 'unknown' }

    const ua = UAParser(userAgent)

    return {
        platform: ua.device.type ?? 'unknown',
    }
})
```

**Pages**

```ts
import { withMetadata } from '@navikt/next-logger/secure-log/pages'
import { UAParser } from 'ua-parser-js'

export default withMetadata((req) => {
    const userAgent = request.headers.get('user-agent')
    if (!userAgent) return { platform: 'unknown' }

    const ua = UAParser(userAgent)

    return {
        platform: ua.device.type ?? 'unknown',
    }
})
```

Remember not to parse the body using `.json()` or `.text`!

This feature is available only for secure-log.

## Breaking changes: migrating from v1 to v2/v3

The only breaking change is that the paths for the API routes have been updated.

v2→v3 has no breaking changes, but changed how the library was built.

### App Dir

`app/api/logger/route.ts`:

```diff
- export { POSTLoggingRouteHandler as POST } from '@navikt/next-logger'
+ export { POST } from '@navikt/next-logger/app-dir'
```

### Pages

`pages/api/logger/route.ts`:

```diff
- export { pinoLoggingRoute as default } from '@navikt/next-logger'
+ export { loggingRoute as default } from '@navikt/next-logger/pages'
```

If you want to use the new secureLogger feature, refer to the Securelogs docs above.

## Breaking changes: migrating from v3 to v4

The only change is that the default message key is `message` instead of `msg`. This doesn't affect you
if you only view logs in Elastic, but if you have used some manual filters in Grafan (`{{ .msg }}`), you will need to change it to `{{ .message }}`.

If you use `pino-pretty` you will also need to change the `--messageKey` option to `message` instead of `msg`.

```bash
"scripts": {
  "dev": "<dev> | pino-pretty --messageKey=message"
}
```
