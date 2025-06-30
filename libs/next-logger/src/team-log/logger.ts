import { createTeamLogger } from '@navikt/pino-logger/team-log'
import { frontendLogger as frontendLogger } from '../loggers/frontendLogger'

export const teamLogger = typeof window !== 'undefined' ? frontendLogger({ type: 'team' }) : createTeamLogger()
