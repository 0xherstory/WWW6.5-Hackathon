import { describe, expect, it } from 'vitest'
import { buildArchiveGroups, getSoundInitial } from './archive'
import type { SoundEntry } from '../types/sound'

describe('archive helpers', () => {
  it('maps 雨声 to Y', () => {
    expect(getSoundInitial('雨声')).toBe('Y')
  })

  it('maps latin names to uppercase initials', () => {
    expect(getSoundInitial('car')).toBe('C')
  })

  it('groups uploaded sounds by initial', () => {
    const sounds: SoundEntry[] = [
      {
        id: '1',
        name: '雨声',
        fileName: '雨声.m4a',
        cid: 'bafy-yu',
        ipfsUrl: 'https://gateway.pinata.cloud/ipfs/bafy-yu',
      },
      {
        id: '2',
        name: '车声',
        fileName: '车声.m4a',
        cid: 'bafy-che',
        ipfsUrl: 'https://gateway.pinata.cloud/ipfs/bafy-che',
      },
    ]

    const groups = buildArchiveGroups(sounds)

    expect(groups.Y[0]?.name).toBe('雨声')
    expect(groups.C[0]?.name).toBe('车声')
    expect(groups.A).toEqual([])
  })
})
