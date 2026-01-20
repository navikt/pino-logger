import { LogEvent } from 'pino'

export interface LoggerConfiguration {
    basePath?: string
    apiPath?: string
    teamLogApiPath?: string
    onLog?: (event: LogEvent) => void
}

declare global {
    var _loggerConfig: LoggerConfiguration | null
}

export const configureLogger = (configuration: LoggerConfiguration) => {
    globalThis._loggerConfig = configuration
}

export const getConfig = (): LoggerConfiguration | null => {
    return globalThis._loggerConfig || null
}
