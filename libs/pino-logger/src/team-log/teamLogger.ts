import pino, { DestinationStream, LoggerOptions } from 'pino'
import { createLogger } from '../logger'

export { createLogger } from '../logger'

type RequiredNaisFields = Record<string, string>

type TeamLogConfigTriple = [DestinationStream | undefined, RequiredNaisFields, LoggerOptions]

let config: TeamLogConfigTriple | null = null
function getConfig(): TeamLogConfigTriple {
    if (config != null) {
        return config
    }

    if (process.env.NODE_ENV === 'production') {
        const requiredFields = getTeamLogRequiredFields()

        config = [
            pino.transport({
                target: 'pino-socket',
                options: {
                    address: 'team-logs.nais-system',
                    port: 5170,
                    mode: 'tcp',
                },
            }),
            requiredFields,
            {},
        ]
        return config
    }

    console.warn('[TEAM LOG]: Will log secure log to stdout/stderr. Do not use in production.')
    config = [
        undefined,
        {},
        {
            msgPrefix: '[TEAM LOG (local dev)]: ',
        },
    ]
    return config
}

/**
 * Uses a proxy to defer the creation of the logger until it is first accessed, this is so that build systems
 * such as nextjs that ofter traverse the module tree during build doesn't try to load pino-socket before runtime.
 */
export const createTeamLogger = (defaultConfig: LoggerOptions = {}): ReturnType<typeof createLogger> => {
    let logger: ReturnType<typeof createLogger> | null = null

    const getLogger = () => {
        const [transport, requiredFields, devConfig] = getConfig()
        logger = createLogger({ ...defaultConfig, ...devConfig }, transport).child(requiredFields)
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

function getTeamLogRequiredFields(): Record<string, string> {
    const requiredFields = {
        google_cloud_project: process.env.GOOGLE_CLOUD_PROJECT,
        nais_namespace_name: process.env.NAIS_NAMESPACE,
        nais_pod_name: process.env.NAIS_POD_NAME ?? process.env.HOSTNAME,
        nais_container_name: process.env.NAIS_APP_NAME,
    } as const

    for (const [key, value] of Object.entries(requiredFields)) {
        if (value == null) {
            throw new Error(`Missing required field for team log: ${key}, is this running in nais k8s?`)
        }
    }

    return requiredFields as Record<string, string>
}
