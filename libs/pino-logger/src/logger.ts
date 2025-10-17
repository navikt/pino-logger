import pino, { DestinationStream, LoggerOptions } from 'pino'

export const createLogger = (defaultConfig: LoggerOptions = {}, destination?: DestinationStream): pino.Logger =>
    pino(
        {
            ...defaultConfig,
            timestamp: pino.stdTimeFunctions.isoTime,
            messageKey: 'message',
            formatters: {
                level: (label) => ({ level: label }),
            },
        },
        destination,
    )
