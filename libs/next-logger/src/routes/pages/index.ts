import { createLogger } from '@navikt/pino-logger'
import { NextApiRequest, NextApiResponse } from 'next'

import { createLoggingApiRoute } from './loggingApiRoute'

export const loggingRoute: (req: NextApiRequest, res: NextApiResponse) => void = createLoggingApiRoute(createLogger())()
