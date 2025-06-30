import { LogEvent } from 'pino'

export interface LoggerConfiguration {
    basePath?: string
    apiPath?: string
    secureLogApiPath?: string
    teamLogApiPath?: string
    onLog?: (event: LogEvent) => void
}

let config: LoggerConfiguration | null = null

export const configureLogger = (configuration: LoggerConfiguration) => {
    config = configuration
}

export const getConfig = (): LoggerConfiguration | null => config
