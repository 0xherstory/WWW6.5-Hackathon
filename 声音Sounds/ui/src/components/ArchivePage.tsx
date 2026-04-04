import { buildArchiveGroups } from '../lib/archive'
import type { SoundEntry } from '../types/sound'

type Props = {
  sounds: SoundEntry[]
  onBack: () => void
  onSelectSound: (sound: SoundEntry) => void
}

export function ArchivePage({ sounds, onBack, onSelectSound }: Props) {
  const groups = buildArchiveGroups(sounds)
  const columns = [
    ['A', 'B', 'C', 'D', 'E'],
    ['F', 'G', 'H', 'I', 'J'],
    ['K', 'L', 'M', 'N', 'O'],
    ['P', 'Q', 'R', 'S', 'T'],
    ['U', 'V', 'W', 'X', 'Y', 'Z'],
  ]

  return (
    <section className="archive-page">
      <div className="archive-header">
        <h1>声音数据库</h1>
        <button type="button" className="archive-back" onClick={onBack}>
          返回首页
        </button>
      </div>
      <div className="archive-columns">
        {columns.map((letters) => (
          <div key={letters.join('-')} className="archive-column">
            {letters.map((letter) => (
              <section key={letter} className="archive-group">
                <p className="archive-letter">{letter}</p>
                <div className="archive-items">
                  {groups[letter].map((sound) => (
                    <button
                      key={sound.id}
                      type="button"
                      className="archive-link"
                      onClick={() => onSelectSound(sound)}
                    >
                      {sound.name}
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
