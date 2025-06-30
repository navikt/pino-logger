import { createSecureLogger } from '@navikt/pino-logger/secure-log'
import { frontendLogger as frontendLogger } from '../loggers/frontendLogger'

export const secureLogger = typeof window !== 'undefined' ? frontendLogger({ type: 'secure' }) : createSecureLogger()
