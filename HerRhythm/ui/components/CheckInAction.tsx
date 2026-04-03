'use client'

import { useEffect } from 'react'
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { avalancheFuji } from 'wagmi/chains'
import { CHECKIN_CONTRACT_ADDRESS } from '@/contracts/checkinConfig'
import { checkinAbi } from '@/contracts/checkinAbi'

export default function CheckInAction({
  onSuccess,
}: {
  onSuccess?: () => void
}) {
  const { address, isConnected } = useAccount()

  const {
    data: hasCheckedInToday,
    isLoading: isCheckingStatus,
    refetch: refetchCheckStatus,
  } = useReadContract({
    address: CHECKIN_CONTRACT_ADDRESS,
    abi: checkinAbi,
    functionName: 'hasCheckedInToday',
    args: address ? [address] : undefined,
    chainId: avalancheFuji.id,
    query: {
      enabled: !!address,
    },
  })

  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract()

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash,
  })

  useEffect(() => {
    if (isConfirmed) {
      refetchCheckStatus()
      onSuccess?.()
    }
  }, [isConfirmed, onSuccess, refetchCheckStatus])

  if (!isConnected) {
    return (
      <p className="text-center text-sm text-[#9b9c95]">
        请先连接右上角钱包后再打卡
      </p>
    )
  }

  if (isCheckingStatus) {
    return (
      <p className="text-center text-sm text-[#9b9c95]">
        正在检查今日打卡状态...
      </p>
    )
  }

  if (hasCheckedInToday) {
    return (
      <div className="flex flex-col items-center gap-2">
        <p className="text-center text-sm text-[#758073]">
          今日已打卡
        </p>
        <p className="text-center text-xs text-[#9b9c95]">
          你已经完成今天的记录啦
        </p>
      </div>
    )
  }

  const buttonText = isWritePending
    ? '等待钱包签名...'
    : isConfirming
    ? '链上确认中...'
    : isConfirmed
    ? '打卡成功'
    : '今日打卡 / Check in now'

  const errorText = writeError
    ? writeError.message.toLowerCase().includes('user rejected')
      ? '你已取消此次签名'
      : '打卡失败，请稍后重试'
    : null

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={() =>
          writeContract({
            address: CHECKIN_CONTRACT_ADDRESS,
            abi: checkinAbi,
            functionName: 'checkIn',
            chainId: avalancheFuji.id,
          })
        }
        disabled={isWritePending || isConfirming || !!hasCheckedInToday}
        className="rounded-full border border-white/30 bg-[#dbe4d6] px-7 py-3 text-sm tracking-[0.03em] text-[#3a463f] shadow-[0_16px_32px_rgba(110,122,103,0.14),inset_0_1px_0_rgba(255,255,255,0.34)] transition-all duration-500 hover:-translate-y-0.5 hover:scale-[1.018] hover:bg-[#d6e0d1] hover:shadow-[0_20px_38px_rgba(110,122,103,0.18)] active:scale-[0.988] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {buttonText}
      </button>

      {hash && (
        <p className="max-w-[320px] break-all text-center text-xs text-[#9b9c95]">
          Tx: {hash}
        </p>
      )}

      {errorText && (
        <p className="text-center text-sm text-[#b26b6b]">
          {errorText}
        </p>
      )}

      {isConfirmed && (
        <p className="text-center text-sm text-[#758073]">
          打卡成功，正在更新状态...
        </p>
      )}
    </div>
  )
}