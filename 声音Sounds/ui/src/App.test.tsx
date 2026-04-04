import { fireEvent, render, screen } from '@testing-library/react'
import { registerSound } from './api/registerSound'
import App from './App'

vi.mock('./api/registerSound', () => ({
  registerSound: vi.fn(),
}))

const mockedRegisterSound = vi.mocked(registerSound)

describe('App', () => {
  afterEach(() => {
    mockedRegisterSound.mockReset()
    vi.restoreAllMocks()
  })

  it('renders the confirmed single-page shell', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: '声音' })).toBeInTheDocument()
    expect(screen.getByLabelText('搜索声音')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '关于' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '上传' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '笛子' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '海浪' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '车' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '树' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '风' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '雨' })).not.toBeInTheDocument()
  })

  it('opens the upload receipt card and uploads 雨 into Y', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          fileName: 'rain.m4a',
          cid: 'bafy123',
          ipfsUrl: 'https://gateway.pinata.cloud/ipfs/bafy123',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    )

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '上传' }))

    expect(screen.getByLabelText('名称*')).toHaveAttribute('placeholder', 'Empty')
    expect(screen.getByLabelText('地点')).toHaveAttribute('placeholder', 'Empty')
    expect(screen.getByLabelText('日期')).toHaveAttribute('placeholder', 'Empty')
    expect(screen.getByLabelText('链接')).toHaveAttribute('placeholder', 'Empty')
    expect(screen.getByLabelText('声音注解')).toHaveAttribute('placeholder', '在这里留下声音的注解...')

    fireEvent.change(screen.getByLabelText('名称*'), { target: { value: '雨' } })
    fireEvent.change(screen.getByLabelText('地点'), { target: { value: '窗边' } })
    fireEvent.change(screen.getByLabelText('声音注解'), {
      target: { value: '午觉睡醒发现下雨了，听了一会雨声。' },
    })
    fireEvent.change(screen.getByLabelText('选择音频文件'), {
      target: { files: [new File(['audio'], 'rain.m4a', { type: 'audio/mp4' })] },
    })

    fireEvent.click(screen.getByRole('button', { name: '确认上传' }))

    expect(await screen.findByRole('button', { name: '播放音频' })).toBeInTheDocument()
    expect(screen.getByText('午觉睡醒发现下雨了，听了一会雨声。')).toBeInTheDocument()
    expect(screen.getByText('Y')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '雨' })).toBeInTheDocument()
  })

  it('finishes onchain registration from the detail receipt card', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          fileName: 'rain.m4a',
          cid: 'bafy123',
          ipfsUrl: 'https://gateway.pinata.cloud/ipfs/bafy123',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    )

    mockedRegisterSound.mockResolvedValue({
      txHash: '0xabc',
      soundId: '0',
      contentUri: 'ipfs://bafy123',
    })

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '上传' }))
    fireEvent.change(screen.getByLabelText('名称*'), { target: { value: '雨' } })
    fireEvent.change(screen.getByLabelText('选择音频文件'), {
      target: { files: [new File(['audio'], 'rain.m4a', { type: 'audio/mp4' })] },
    })
    fireEvent.click(screen.getByRole('button', { name: '确认上传' }))

    fireEvent.click(await screen.findByRole('button', { name: '上链登记' }))

    expect(await screen.findByRole('button', { name: '复制链接' })).toBeInTheDocument()
    expect(screen.getByText('登记成功！')).toBeInTheDocument()
    expect(screen.queryByText('0xabc')).not.toBeInTheDocument()
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('hides the register button after onchain registration succeeds', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          fileName: 'rain.m4a',
          cid: 'bafy123',
          ipfsUrl: 'https://gateway.pinata.cloud/ipfs/bafy123',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    )

    mockedRegisterSound.mockResolvedValue({
      txHash: '0xabc',
      soundId: '0',
      contentUri: 'ipfs://bafy123',
    })

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '上传' }))
    fireEvent.change(screen.getByLabelText('名称*'), { target: { value: '雨' } })
    fireEvent.change(screen.getByLabelText('选择音频文件'), {
      target: { files: [new File(['audio'], 'rain.m4a', { type: 'audio/mp4' })] },
    })
    fireEvent.click(screen.getByRole('button', { name: '确认上传' }))

    const registerButton = await screen.findByRole('button', { name: '上链登记' })
    fireEvent.click(registerButton)

    expect(await screen.findByText('登记成功！')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '上链登记' })).not.toBeInTheDocument()
  })

  it('keeps both sounds when uploading another sound with the same name', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          fileName: 'tree-new.m4a',
          cid: 'bafy456',
          ipfsUrl: 'https://gateway.pinata.cloud/ipfs/bafy456',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    )

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '上传' }))
    fireEvent.change(screen.getByLabelText('名称*'), { target: { value: '树' } })
    fireEvent.change(screen.getByLabelText('选择音频文件'), {
      target: { files: [new File(['audio'], 'tree-new.m4a', { type: 'audio/mp4' })] },
    })
    fireEvent.click(screen.getByRole('button', { name: '确认上传' }))

    await screen.findByRole('button', { name: '播放音频' })

    expect(screen.getAllByRole('button', { name: '树' })).toHaveLength(2)
  })


  it('shows upload failure message when upload fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: '上传失败' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '上传' }))
    fireEvent.change(screen.getByLabelText('名称*'), { target: { value: '雨' } })
    fireEvent.change(screen.getByLabelText('选择音频文件'), {
      target: { files: [new File(['audio'], 'rain.m4a', { type: 'audio/mp4' })] },
    })

    fireEvent.click(screen.getByRole('button', { name: '确认上传' }))

    expect(await screen.findByText('上传失败')).toBeInTheDocument()
  })
})
