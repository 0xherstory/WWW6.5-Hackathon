import { pinyin } from 'pinyin-pro'
import type { SoundEntry } from '../types/sound'

export type ArchiveGroups = Record<string, SoundEntry[]>

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export function getSoundInitial(name: string) {
  const first = name.trim()[0]

  if (!first) {
    return '#'
  }

  if (/[a-z]/i.test(first)) {
    return first.toUpperCase()
  }

  const py = pinyin(first, { toneType: 'none', type: 'array' })[0] ?? ''
  const initial = py[0]?.toUpperCase() ?? '#'

  return /[A-Z]/.test(initial) ? initial : '#'
}

export function buildArchiveGroups(sounds: SoundEntry[]): ArchiveGroups {
  const groups = Object.fromEntries(letters.map((letter) => [letter, [] as SoundEntry[]])) as ArchiveGroups

  for (const sound of sounds) {
    const initial = getSoundInitial(sound.name)
    if (!groups[initial]) {
      continue
    }
    groups[initial].push(sound)
  }

  return groups
}
