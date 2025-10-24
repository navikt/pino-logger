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
