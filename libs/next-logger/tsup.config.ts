import { defineConfig } from 'tsup'

import { sharedConfig } from '../tsup.common'

export default defineConfig({
    ...sharedConfig,
    entry: [
        'src/index.ts',
        'src/routes/app-dir/index.ts',
        'src/routes/pages/index.ts',
        'src/team-log/index.ts',
        'src/team-log/routes/app-dir/index.ts',
        'src/team-log/routes/pages/index.ts',
    ],
})
