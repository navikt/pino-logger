import { NextApiRequest, NextApiResponse } from 'next'

import { Metadata } from '../../../routes/metadata'
import { createLoggingApiRoute } from '../../../routes/pages/loggingApiRoute'
import { teamLogger } from '../../logger'

const baseLoggingRoute = createLoggingApiRoute(teamLogger)

export const loggingRoute: (req: NextApiRequest, res: NextApiResponse) => void = baseLoggingRoute()

export type MetadataFn = (req: NextApiRequest) => Promise<Metadata> | Metadata
export const withMetadata = (metadataFn: MetadataFn) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        const metadata = await metadataFn(req)

        baseLoggingRoute(metadata)(req, res)
    }
}
