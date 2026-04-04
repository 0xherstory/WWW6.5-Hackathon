import { VintageAction } from './VintageAction'

type Props = {
  onUploadClick: () => void
  onArchiveClick: () => void
}

export function HomePage({ onUploadClick, onArchiveClick }: Props) {
  return (
    <section className="home-page">
      <div className="home-frame">
        <div className="home-copy">
          <h1 className="home-title">声音</h1>
          <p className="home-description">声音是一个收集音频的网站</p>
        </div>
        <div className="home-actions">
          <VintageAction label="上传声音" onClick={onUploadClick} />
          <VintageAction label="参观声音" onClick={onArchiveClick} />
        </div>
      </div>
    </section>
  )
}
