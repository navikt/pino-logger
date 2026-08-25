export type Metadata = Record<string, unknown>

export function prefixKeys(metadata: Metadata | undefined): Metadata | undefined {
    if (!metadata) {
        return metadata
    }

    const prefixedMetadata: Metadata = {}
    for (const key in metadata) {
        prefixedMetadata[`x_${key}`] = metadata[key]
    }

    return prefixedMetadata
}
