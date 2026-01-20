# Pino Logger for Nav

This repo has two libraries, @navikt/pino-logger for logging in a node/bun/deno server environment, and @navikt/next-logger for isomorphic logging in a Next.js application.

- [Docs for @navikt/pino-logger](#naviktpino-logger) - A pino logger for node/bun/deno
- [Docs for @navikt/next-logger](#naviktnext-logger) - An isomorphic logger for Next.js applications

Latest news (2025-01-25): Secure logs is now completely shut off in Nav, and support in this library was removed in a minor version.

[Go to migrations from v3 to v4](#breaking-changes-migrating-from-v3-to-v4)

# @navikt/pino-logger

A simple logger that lets you log in your server runtime. Logs in a JSON format that [logs.az.nav.no](https://logs.az.nav.no/) understands, and Grafana Faro is happy with.

## Getting started

### Installation

```bash
yarn add @navikt/pino-logger pino
```

```bash
npm i @navikt/pino-logger pino
```

if you want to use the [team logs](https://docs.nais.io/observability/logging/how-to/team-logs), you also need to
install `pino-socket`:

```bash
yarn add pino-socket
```

```bash
npm i pino-socket
```

### Step 1: Logging

Anywhere in your application where you want to log, you should import `import { logger } from '@navikt/pino-logger';`,
this is a [pino](https://github.com/pinojs/pino/blob/master/docs/api.md#logger) instance, use it to log, for example:
`logger.warn("Uh oh")`.

Alternatively, if you need secure logging (team logs), use `ìmport { teamLogger } from '@navikt/pino-logger/team-logs';`.
See [Team Logs](#team-logs) for more information on secure logging.

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

An isomorphic logger that lets you log from both the frontend and the backend. Both will log in a JSON format
that [logs.adeo.no](https://logs.adeo.no) understands. And all logs are grouped under your application (`+application:yourapp`) with correct log level.

## Getting started

### Installation

```bash
yarn add @navikt/next-logger pino
```

```bash
npm i @navikt/next-logger pino
```

if you want to use the [team logs](https://docs.nais.io/observability/logging/how-to/team-logs), you also need to
install `pino-socket`:

```bash
yarn add pino-socket
```

```bash
npm i pino-socket
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

Anywhere in your application where you want to log, you should import `import { logger } from '@navikt/next-logger';`,
this is a [pino](https://github.com/pinojs/pino/blob/master/docs/api.md#logger) instance, use it to log, for example:
`logger.warn("Uh oh")`.

Alternatively, if you need secure logging, use `ìmport { teamLogger } from '@navikt/next-logger/team-logs';`.
See [Team Logs](#team-logs) for more information on secure logging.

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

You want this configuration to execute as early as possible, but on the actual client. Typically in your app-dir app,
you will have for example a `<Providers>`-client that is `"use client"`-enabled.

On the _root_ of any `"use client"`-enabled file that wraps your root layout.tsx, you can configure the library, for
example:

```ts
"use client"

configureLogger({
    basePath: '/my/base/path',
})

export function MyProviders(): ReactElement {
   ...
}
```

### Pages

If your application is using a base path, or you want to have your logger on a different API-route, you can configure
the logger.

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

## Team Logs

If you want to log sensitive information, this will ship the logs to
nais' ["Team Logs"](https://docs.nais.io/observability/logging/how-to/team-logs/) instead of the default logs. This is
useful for logging sensitive information that you don't want to be publicly available.

See the [team log docs](https://docs.nais.io/observability/logging/how-to/team-logs/) for details on how to enable it
for your app.

This library uses the `pino-socket` library to send logs to the team logs over TCP to the nais' team log ingester.

Using team logger as an isomorphic logger requires an additonal API-route in your next app, the configuration is
similar to the primary logger route.

**For app dir:**

Create a new API route `/app/api/team-logger/route.ts`, it should look like this:

```ts
export { POST } from '@navikt/next-logger/team-log/app-dir'
```

**For pages dir:**

Create a new API route `/pages/api/team-logger.ts`, it should look like this:

```ts
export { pinoLoggingRoute as default } from '@navikt/next-logger/team-log/pages'
```

If you need to add some extra metadata to team log statements server side, you can add an metadata-middleware to
extract info from the request:

**App dir**

```ts
import { withMetadata } from '@navikt/next-logger/team-log/app-dir'
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
import { withMetadata } from '@navikt/next-logger/team-log/pages'
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

This feature is available only for team-log.

## Breaking changes: migrating from v3 to v4

The only change is that the default message key is `message` instead of `msg`. This doesn't affect you
if you only view logs in Elastic, but if you have used some manual filters in Grafana (`{{ .msg }}`), you will need to
change it to `{{ .message }}`.

If you use `pino-pretty` you will also need to change the `--messageKey` option to `message` instead of `msg`.

```bash
"scripts": {
  "dev": "<dev> | pino-pretty --messageKey=message"
}
```
