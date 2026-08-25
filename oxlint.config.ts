import tsmBase from '@navikt/tsm-oxlint'
import tsmReact from '@navikt/tsm-oxlint/react'
import { defineConfig } from 'oxlint'

export default defineConfig({
    extends: [tsmBase, tsmReact],
    plugins: ['nextjs', 'vitest'],
    options: { typeCheck: true, typeAware: true },
})
