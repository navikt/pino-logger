import { Options } from 'tsup'

export const sharedConfig: Options = {
    format: "esm",
    dts: true,
    sourcemap: true,
    clean: true,
    metafile: true,
}
