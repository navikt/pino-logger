import { defineConfig } from 'tsup'

import { sharedConfig } from '../tsup.common'

export default defineConfig({
    ...sharedConfig,
    entry: ['src/index.ts', 'src/secure-log/index.ts', 'src/team-log/index.ts'],
})
