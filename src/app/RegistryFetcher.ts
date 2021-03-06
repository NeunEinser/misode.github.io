import { CollectionRegistry } from '@mcschema/core'

export const mcdata = (version: string, registry: string) => {
  return `https://raw.githubusercontent.com/Arcensoth/mcdata/${version}/processed/reports/registries/${registry}/data.min.json`
}

export const RegistryFetcher = async (target: CollectionRegistry, registries: string[], version = 'master') => {
  await Promise.all(registries.map(async r => {
    try {
      const res = await fetch(mcdata(version, r))
      const data = await res.json()
      target.register(r, data.values)
    } catch (e) {
      console.error(`Error occurred while fetching registry for ${r}.`, e)
    }
  }))
}
