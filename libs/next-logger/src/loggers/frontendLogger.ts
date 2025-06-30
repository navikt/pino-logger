import pino from 'pino'
import { getConfig } from '../config'

type FrontendLoggerOptions = {
    type: 'secure' | 'team' | 'default'
}

export const frontendLogger = (opts: FrontendLoggerOptions = { type: 'default' }): pino.Logger =>
    pino({
        browser: {
            transmit: {
                send: async (_, logEvent) => {
                    const config = getConfig()

                    if (opts.type == 'default') {
                        config?.onLog?.(logEvent)
                    }

                    try {
                        await fetch(getPath(opts?.type ?? 'default'), {
                            method: 'POST',
                            headers: {
                                'content-type': 'application/json',
                            },
                            body: JSON.stringify(
                                // Hackily massage messages from exceptions into being { err: {...} } to normalize how logging looks
                                errorifyMessages(logEvent),
                            ),
                        })
                    } catch (e) {
                        console.warn(e)
                        console.warn('Unable to log to backend', logEvent)
                    }
                },
            },
        },
    })

function getPath(type: FrontendLoggerOptions['type']): string {
    const config = getConfig()
    switch (type) {
        case 'default':
            return `${config?.basePath ?? ''}${config?.apiPath ?? `/api/logger`}`
        case 'secure':
            return `${config?.basePath ?? ''}${config?.secureLogApiPath ?? `/api/secure-logger`}`
        case 'team':
            return `${config?.basePath ?? ''}${config?.teamLogApiPath ?? `/api/team-logger`}`
    }
}

function errorifyMessages(logEvent: pino.LogEvent): pino.LogEvent {
    logEvent.messages = logEvent.messages.map((message) => {
        if (typeof message === 'object' && 'stack' in message) {
            return {
                err: {
                    type: message.type,
                    stack: message.stack,
                    message: message.msg ?? message.message,
                },
            }
        }
        return message
    })

    return logEvent
}
