import type { UserConfig } from 'tsdown'

export const sharedConfig: UserConfig = {
    format: 'esm',
    dts: true,
    sourcemap: true,
    clean: true,
    target: false,
}
