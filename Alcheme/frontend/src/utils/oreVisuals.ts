import { uiAssets } from '@/utils/uiAssets'

export type OreDimension = 'Wisdom' | 'Will' | 'Creation' | 'Connection'

const baseDimensionInfo = {
  Wisdom: { label: 'Wisdom', gradient: 'ore-gradient-wisdom' },
  Will: { label: 'Will', gradient: 'ore-gradient-will' },
  Creation: { label: 'Creation', gradient: 'ore-gradient-creation' },
  Connection: { label: 'Connection', gradient: 'ore-gradient-connection' },
} as const

const crystalPools: Record<OreDimension, readonly string[]> = {
  Wisdom: [uiAssets.crystals[0], uiAssets.crystals[1], uiAssets.crystals[6]],
  Will: [uiAssets.crystals[4], uiAssets.crystals[6], uiAssets.crystals[3]],
  Creation: [uiAssets.crystals[2], uiAssets.crystals[3], uiAssets.crystals[5]],
  Connection: [uiAssets.crystals[5], uiAssets.crystals[1], uiAssets.crystals[6]],
}

const glowPools = [
  'ore-gradient-wisdom',
  'ore-gradient-will',
  'ore-gradient-creation',
  'ore-gradient-connection',
  'ore-gradient-arcane',
] as const

function hashSeed(seed: string) {
  let hash = 0

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0
  }

  return hash
}

export function getOreVisual(dimension: OreDimension, seed: string) {
  const pool = crystalPools[dimension]
  const hash = hashSeed(seed)
  const crystal = pool[hash % pool.length]
  const glowClass = glowPools[hash % glowPools.length]

  return {
    ...baseDimensionInfo[dimension],
    crystal,
    glowClass,
  }
}
