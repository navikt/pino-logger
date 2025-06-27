import pino, { DestinationStream, LoggerOptions } from 'pino'
import { createLogger } from '../logger'

export { createLogger } from '../logger'

type SecureLogConfigTuple = [DestinationStream | undefined, LoggerOptions]

let config: SecureLogConfigTuple | null = null
function getConfig() {
    if (config != null) {
        return config
    }

    if (process.env.NODE_ENV === 'production') {
        config = [
            pino.transport({
                target: 'pino-roll',
                options: {
                    file: '/secure-logs/secure.log',
                    size: '128m',
                    symlink: true,
                },
            }),
            {},
        ]
        return config
    }

    console.warn('[SECURE LOG]: Will log secure log to stdout/stderr. Do not use in production.')
    config = [
        undefined,
        {
            msgPrefix: '[SECURE LOG (local dev)]: ',
        },
    ]
    return config
}

/**
 * Uses a proxy to defer the creation of the logger until it is first accessed, this is so that build systems
 * such as nextjs that ofter traverse the module tree during build, doesn't actually try and access the file
 * system /secure-logs/secure.log before runtime.
 */
export const createSecureLogger = (defaultConfig: LoggerOptions = {}): ReturnType<typeof createLogger> => {
    let logger: ReturnType<typeof createLogger> | null = null

    const getLogger = () => {
        const [transport, devConfig] = getConfig()
        logger = createLogger({ ...defaultConfig, ...devConfig }, transport)
        return logger
    }

    return new Proxy(
        {},
        {
            get: (_, prop) => {
                return getLogger()[prop as keyof ReturnType<typeof createLogger>]
            },
        },
    ) as ReturnType<typeof createLogger>
}
