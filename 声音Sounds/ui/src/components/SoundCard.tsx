import type { SoundEntry } from '../types/sound'
import { DotPattern } from './DotPattern'

type Props = {
  sound: SoundEntry
  onClose: () => void
}

export function SoundCard({ sound, onClose }: Props) {
  return (
    <section className="sound-card-overlay">
      <article className="sound-card">
        <button type="button" className="sound-card-close" onClick={onClose}>
          ×
        </button>
        <DotPattern>
          <div className="sound-card-head">
            <button type="button" className="sound-play-button">
              播放
            </button>
          </div>
        </DotPattern>
        <div className="sound-card-body">
          <label className="sound-field sound-field-main">
            <span>
              名称 <em>*</em>
            </span>
            <input value={sound.name} readOnly />
          </label>
          <div className="sound-field-row">
            <label className="sound-field">
              <span>上传者</span>
              <input value={sound.uploader ?? ''} readOnly />
            </label>
            <label className="sound-field">
              <span>地点</span>
              <input value={sound.location ?? ''} readOnly />
            </label>
          </div>
          <label className="sound-field sound-field-area">
            <span>描述</span>
            <textarea value={sound.description ?? ''} readOnly rows={6} />
          </label>
        </div>
      </article>
    </section>
  )
}
