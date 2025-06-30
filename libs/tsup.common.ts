import { Options } from 'tsup'

export const sharedConfig: Options = {
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    metafile: true,
}
