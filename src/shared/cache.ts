export function getCacheKeys() {
    const restoreKey = `haoke-cli-cache-${process.env.HAOKE_CLI_VERSION}`
    return [
        restoreKey
    ]
}
