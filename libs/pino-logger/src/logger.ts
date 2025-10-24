import pino, { DestinationStream, LoggerOptions } from 'pino'
import { context, isSpanContextValid, trace } from '@opentelemetry/api'

export const createLogger = (defaultConfig: LoggerOptions = {}, destination?: DestinationStream): pino.Logger =>
    pino(
        {
            ...defaultConfig,
            timestamp: pino.stdTimeFunctions.isoTime,
            messageKey: 'message',
            formatters: {
                level: (label) => ({ level: label }),
                log: (object: any) => {
                    if (object.err) {
                        // backendlogger has an Error-instance, frontendlogger has already serialized it
                        const err = object.err instanceof Error ? pino.stdSerializers.err(object.err) : object.err
                        object.stack_trace = err.stack
                        object.type = err.type
                        object.message = err.message
                        delete object.err
                    }

                    return object
                },
            },
            mixin: () => {
                const span = trace.getSpan(context.active())
                if (!span) return {}

                const spanContext = span.spanContext()
                if (!isSpanContextValid(spanContext)) return {}

                return {
                    trace_id: spanContext.traceId,
                    span_id: spanContext.spanId,
                    trace_flags: `0${spanContext.traceFlags.toString(16)}`,
                }
            },
        },
        destination,
    )
