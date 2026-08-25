import { defineConfig } from 'tsdown'

import { sharedConfig } from '../tsdown.common.ts'

export default defineConfig({
    ...sharedConfig,
    entry: ['src/index.ts', 'src/team-log/index.ts'],
})
