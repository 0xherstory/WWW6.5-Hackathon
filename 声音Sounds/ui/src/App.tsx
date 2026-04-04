import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { registerSound } from './api/registerSound'
import { uploadAudio } from './api/upload'
import { buildArchiveGroups } from './lib/archive'
import type { SoundEntry } from './types/sound'

type Overlay = 'about' | 'upload' | 'detail' | null

type UploadDraft = {
  name: string
  location: string
  date: string
  link: string
  note: string
}

const columns = [
  ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
  ['H', 'I', 'J', 'K', 'L', 'M', 'N'],
  ['O', 'P', 'Q', 'R', 'S', 'T', 'U'],
  ['V', 'W', 'X', 'Y', 'Z'],
]

const baseSounds: SoundEntry[] = [
  {
    id: 'sound-che',
    name: '车',
    fileName: '车.m4a',
    cid: '',
    ipfsUrl: '',
    location: '街角',
    description: '等红灯时，车流声音很密。',
  },
  {
    id: 'sound-di',
    name: '笛子',
    fileName: '笛子.m4a',
    cid: '',
    ipfsUrl: '',
    location: '河边',
    description: '隔着一段距离传过来的笛声。',
  },
  {
    id: 'sound-feng',
    name: '风',
    fileName: '风.m4a',
    cid: '',
    ipfsUrl: '',
    location: '楼顶',
    description: '风打在围栏上，声音有点空。',
  },
  {
    id: 'sound-hailang',
    name: '海浪',
    fileName: '海浪.m4a',
    cid: '',
    ipfsUrl: '',
    location: '岸边',
    description: '浪声一阵一阵推过来。',
  },
  {
    id: 'sound-shu',
    name: '树',
    fileName: '树.m4a',
    cid: '',
    ipfsUrl: '',
    location: '楼下',
    description: '风吹过树叶的时候很轻。',
  },
]

const emptyDraft: UploadDraft = {
  name: '',
  location: '',
  date: '',
  link: '',
  note: '',
}

function createSoundId() {
  return `sound-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
}

function App() {
  const [searchValue, setSearchValue] = useState('')
  const [sounds, setSounds] = useState<SoundEntry[]>(baseSounds)
  const [overlay, setOverlay] = useState<Overlay>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadDraft, setUploadDraft] = useState<UploadDraft>(emptyDraft)
  const [selectedSoundId, setSelectedSoundId] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState('')
  const [registerError, setRegisterError] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isLinkCopied, setIsLinkCopied] = useState(false)
  const [isRegisterSuccess, setIsRegisterSuccess] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const filteredSounds = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase()
    if (!keyword) {
      return sounds
    }

    return sounds.filter((sound) => {
      return [sound.name, sound.location ?? '', sound.description ?? '']
        .join(' ')
        .toLowerCase()
        .includes(keyword)
    })
  }, [searchValue, sounds])

  const archiveGroups = useMemo(() => buildArchiveGroups(filteredSounds), [filteredSounds])

  const selectedSound = useMemo(
    () => sounds.find((sound) => sound.id === selectedSoundId) ?? null,
    [selectedSoundId, sounds],
  )

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) {
      return
    }

    const sync = () => {
      const nextProgress = audio.duration ? audio.currentTime / audio.duration : 0
      setProgress(nextProgress)
      setIsPlaying(!audio.paused)
    }

    audio.addEventListener('play', sync)
    audio.addEventListener('pause', sync)
    audio.addEventListener('ended', sync)
    audio.addEventListener('timeupdate', sync)

    sync()

    return () => {
      audio.removeEventListener('play', sync)
      audio.removeEventListener('pause', sync)
      audio.removeEventListener('ended', sync)
      audio.removeEventListener('timeupdate', sync)
    }
  }, [selectedSoundId, overlay])

  function openDetail(soundId: string) {
    setSelectedSoundId(soundId)
    setRegisterError('')
    setIsRegisterSuccess(false)
    setOverlay('detail')
  }

  function closeOverlay() {
    audioRef.current?.pause()
    setIsPlaying(false)
    setProgress(0)
    setIsLinkCopied(false)
    setIsRegisterSuccess(false)
    setUploadError('')
    setRegisterError('')
    setOverlay(null)
  }

  async function handleUpload() {
    if (!selectedFile || !uploadDraft.name.trim()) {
      setUploadError('请填写名称并选择音频')
      return
    }

    setUploadError('')

    try {
      const result = await uploadAudio(selectedFile)
      const sound: SoundEntry = {
        id: createSoundId(),
        name: uploadDraft.name.trim(),
        fileName: result.fileName,
        cid: result.cid,
        ipfsUrl: result.ipfsUrl,
        location: uploadDraft.location.trim() || undefined,
        date: uploadDraft.date.trim() || undefined,
        mediaUrl: uploadDraft.link.trim() || undefined,
        description: uploadDraft.note.trim() || undefined,
      }

      setSounds((current) => [...current, sound])
      setUploadDraft(emptyDraft)
      setSelectedFile(null)
      setSelectedSoundId(sound.id)
      setOverlay('detail')
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : '上传失败')
    }
  }

  function toggleAudio() {
    if (!audioRef.current) {
      return
    }

    if (audioRef.current.paused) {
      void audioRef.current.play()
      return
    }

    audioRef.current.pause()
  }

  function handleSeek(nextProgress: number) {
    const audio = audioRef.current
    if (!audio || !audio.duration) {
      return
    }

    audio.currentTime = audio.duration * nextProgress
    setProgress(nextProgress)
  }

  async function copyLink(link: string) {
    try {
      await navigator.clipboard.writeText(link)
      setIsLinkCopied(true)
    } catch {
      setRegisterError('复制失败')
    }
  }

  async function handleRegister() {
    if (!selectedSound?.cid) {
      setRegisterError('请先上传音频')
      return
    }

    setRegisterError('')
    setIsRegisterSuccess(false)
    setIsRegistering(true)

    try {
      const result = await registerSound(`ipfs://${selectedSound.cid}`)
      setSounds((current) =>
        current.map((sound) =>
          sound.id === selectedSound.id
            ? {
                ...sound,
                contentUri: result.contentUri,
                txHash: result.txHash,
                soundId: result.soundId,
              }
            : sound,
        ),
      )
      setIsRegisterSuccess(true)
    } catch (error) {
      setRegisterError(error instanceof Error ? error.message : '上链失败')
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <main className="voice-page">
      <header className="voice-header">
        <h1 className="voice-logo">声音</h1>
        <div className="voice-tools">
          <label className="voice-search">
            <span className="search-icon" aria-hidden="true" />
            <input
              aria-label="搜索声音"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
          </label>
          <button type="button" className="voice-nav-link" onClick={() => setOverlay('about')}>
            关于
          </button>
          <button
            type="button"
            className="voice-nav-link"
            onClick={() => {
              setUploadError('')
              setOverlay('upload')
            }}
          >
            上传
          </button>
        </div>
      </header>

      <section className="voice-index" aria-label="声音索引">
        {columns.map((column) => (
          <div key={column.join('-')} className="voice-column">
            {column.map((letter) => (
              <article key={letter} className="voice-group">
                <div className="voice-letter">{letter}</div>
                <div className="voice-items">
                  {archiveGroups[letter].map((sound) => (
                    <button
                      key={sound.id}
                      type="button"
                      className="voice-item"
                      onClick={() => openDetail(sound.id)}
                    >
                      {sound.name}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ))}
      </section>

      {overlay === 'about' ? (
        <div className="scene-overlay" role="dialog" aria-label="关于声音">
          <article className="about-card">
            <button type="button" className="overlay-close" onClick={closeOverlay}>
              关闭
            </button>
            <p>声音是一个上传、收听并把音频记录到链上的 demo。</p>
            <p>音频文件上传到 IPFS，链上只登记内容地址。</p>
          </article>
        </div>
      ) : null}

      {overlay === 'upload' ? (
        <div className="scene-overlay" role="dialog" aria-label="上传声音卡片">
          <article className="sound-preview-card">
            <button type="button" className="overlay-close" onClick={closeOverlay}>
              关闭
            </button>
            <div className="sound-preview-audio is-upload">
              <label className="upload-audio-entry">
                <span className="upload-audio-plus">+</span>
                <span className={selectedFile ? 'upload-audio-text is-selected' : 'upload-audio-text'}>
                  {selectedFile?.name || '上传音频'}
                </span>
                <span className="upload-audio-line" />
                <input
                  className="file-picker"
                  aria-label="选择音频文件"
                  type="file"
                  accept=".m4a,.mp3,.wav,.ogg,.aac,.flac,audio/*"
                  onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            <div className="sound-preview-body">
              <div className="sound-preview-meta">
                <label className="sound-meta-row">
                  <span className="sound-meta-label">名称*</span>
                  <input
                    aria-label="名称*"
                    className="sound-meta-input"
                    placeholder="Empty"
                    value={uploadDraft.name}
                    onChange={(event) =>
                      setUploadDraft((current) => ({ ...current, name: event.target.value }))
                    }
                  />
                </label>
                <label className="sound-meta-row">
                  <span className="sound-meta-label">地点</span>
                  <input
                    aria-label="地点"
                    className="sound-meta-input"
                    placeholder="Empty"
                    value={uploadDraft.location}
                    onChange={(event) =>
                      setUploadDraft((current) => ({ ...current, location: event.target.value }))
                    }
                  />
                </label>
                <label className="sound-meta-row">
                  <span className="sound-meta-label">日期</span>
                  <input
                    aria-label="日期"
                    className="sound-meta-input"
                    placeholder="Empty"
                    value={uploadDraft.date}
                    onChange={(event) =>
                      setUploadDraft((current) => ({ ...current, date: event.target.value }))
                    }
                  />
                </label>
                <label className="sound-meta-row">
                  <span className="sound-meta-label">链接</span>
                  <input
                    aria-label="链接"
                    className="sound-meta-input"
                    placeholder="Empty"
                    value={uploadDraft.link}
                    onChange={(event) =>
                      setUploadDraft((current) => ({ ...current, link: event.target.value }))
                    }
                  />
                </label>
              </div>

              <textarea
                aria-label="声音注解"
                className="sound-note-box sound-note-input is-placeholder"
                placeholder="在这里留下声音的注解..."
                value={uploadDraft.note}
                onChange={(event) =>
                  setUploadDraft((current) => ({ ...current, note: event.target.value }))
                }
              />

              <div className="card-actions">
                <button type="button" className="card-submit" onClick={handleUpload}>
                  确认上传
                </button>
              </div>
              {uploadError ? <p className="card-error">{uploadError}</p> : null}
            </div>
          </article>
        </div>
      ) : null}

      {overlay === 'detail' && selectedSound ? (
        <div className="scene-overlay" role="dialog" aria-label="声音详情卡片">
          <article className="sound-preview-card">
            <button type="button" className="overlay-close" onClick={closeOverlay}>
              关闭
            </button>
            <div className="sound-preview-audio">
              <button type="button" className="audio-toggle" aria-label="播放音频" onClick={toggleAudio}>
                <span className={isPlaying ? 'audio-toggle-pause' : 'audio-toggle-shape'} />
              </button>
              <div className="audio-track">
                <div className="audio-progress" style={{ width: `${progress * 100}%` }} />
                <span className="audio-thumb" style={{ left: `${progress * 100}%` }} />
                <input
                  className="audio-slider"
                  aria-label="音频进度"
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={progress * 100}
                  onChange={(event) => handleSeek(Number(event.target.value) / 100)}
                />
              </div>
              <audio ref={audioRef} src={selectedSound.ipfsUrl} preload="metadata" />
            </div>

            <div className="sound-preview-body">
              <div className="sound-preview-meta">
                <div className="sound-meta-row">
                  <span className="sound-meta-label">名称</span>
                  <span className="sound-meta-value">{selectedSound.name}</span>
                </div>
                <div className="sound-meta-row">
                  <span className="sound-meta-label">地点</span>
                  <span className={selectedSound.location ? 'sound-meta-value' : 'sound-meta-value is-empty'}>
                    {selectedSound.location || 'Empty'}
                  </span>
                </div>
                <div className="sound-meta-row">
                  <span className="sound-meta-label">日期</span>
                  <span className={selectedSound.date ? 'sound-meta-value' : 'sound-meta-value is-empty'}>
                    {selectedSound.date || 'Empty'}
                  </span>
                </div>
                <div className="sound-meta-row">
                  <span className="sound-meta-label">链接</span>
                  <div className="sound-link-group">
                    <span className="sound-meta-value sound-meta-link" title={selectedSound.contentUri || selectedSound.mediaUrl || `ipfs://${selectedSound.cid || 'Empty'}`}>
                      {selectedSound.contentUri || selectedSound.mediaUrl || `ipfs://${selectedSound.cid || 'Empty'}`}
                    </span>
                    {(selectedSound.contentUri || selectedSound.mediaUrl || selectedSound.cid) ? (
                      <button
                        type="button"
                        className="copy-link-button"
                        aria-label={isLinkCopied ? '链接已复制' : '复制链接'}
                        title={isLinkCopied ? '链接已复制' : '复制链接'}
                        onClick={() => copyLink(selectedSound.contentUri || selectedSound.mediaUrl || `ipfs://${selectedSound.cid}`)}
                      >
                        <span className="copy-icon" aria-hidden="true">
                          <span className="copy-icon-back" />
                          <span className="copy-icon-front" />
                        </span>
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className={selectedSound.description ? 'sound-note-box' : 'sound-note-box is-placeholder'}>
                {selectedSound.description || '在这里留下声音的注解...'}
              </div>

              {selectedSound.cid && !selectedSound.contentUri ? (
                <button
                  type="button"
                  className="card-submit"
                  onClick={handleRegister}
                  disabled={isRegistering}
                >
                  {isRegistering ? '登记中...' : '上链登记'}
                </button>
              ) : null}

              {isRegisterSuccess ? <p className="card-success">登记成功！</p> : null}
              {registerError ? <p className="card-error">{registerError}</p> : null}
            </div>
          </article>
        </div>
      ) : null}
    </main>
  )
}

export default App
