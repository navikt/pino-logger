import pino, { DestinationStream, LoggerOptions } from 'pino'

export const createLogger = (defaultConfig: LoggerOptions = {}, destination?: DestinationStream): pino.Logger => {
    return pino(
        {
            ...defaultConfig,
            timestamp: false,
            messageKey: 'message',
            formatters: {
                level: (label) => ({ level: label }),
            },
        },
        destination,
    )
}
