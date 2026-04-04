import { useState, useEffect, useCallback, useMemo } from "react"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { ethers } from "ethers"
import { MapContainer, TileLayer, CircleMarker, Popup, Marker, useMapEvents, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { getContracts } from "../utils/contracts"
import { reportLocation, removeLocation, saveServiceLocation, subscribeServiceLocations, subscribeLocations, saveServiceDetail, subscribeServiceDetails, saveContact, subscribeContacts, compressImageToBase64, saveServiceImages, subscribeAllServiceImages, saveActualHours, pushNotification, subscribeNotifications, markNotificationsRead, saveRatingComment, subscribeRatingComments, saveCancelReason, subscribeCancelReason, saveTransferRecord, subscribeTransferRecords } from "../utils/firebase"
import { fetchMember } from "../utils/graphQueries"

// 球面距离（km）
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

// ── 地图点击监听 ─────────────────────────────────────────────
function MapClickHandler({ onPick }) {
  useMapEvents({ click: (e) => onPick({ lat: e.latlng.lat, lng: e.latlng.lng }) })
  return null
}

// 动态飞到指定坐标
function FlyTo({ center }) {
  const map = useMapEvents({})
  useEffect(() => { if (center) map.flyTo(center, 14, { duration: 0.8 }) }, [center])
  return null
}

// 自动缩放以包含所有点
function FitBounds({ points }) {
  const map = useMap()
  useEffect(() => {
    if (!points || points.length === 0) return
    if (points.length === 1) {
      map.setView(points[0], 14)
    } else {
      map.fitBounds(points, { padding: [40, 40], maxZoom: 14 })
    }
  }, [])
  return null
}

// ── 地图选点弹窗 ─────────────────────────────────────────────
function MapPicker({ onConfirm, onCancel, initialLocation }) {
  const [pin, setPin] = useState(initialLocation || null)
  const [search, setSearch] = useState("")
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [flyTarget, setFlyTarget] = useState(null)

  // 打开时自动定位到用户当前位置
  useEffect(() => {
    if (initialLocation) {
      setFlyTarget([initialLocation.lat, initialLocation.lng])
      return
    }
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = [pos.coords.latitude, pos.coords.longitude]
        setFlyTarget(loc)
      },
      () => {},
      { timeout: 6000 }
    )
  }, [])

  async function doSearch() {
    if (!search.trim()) return
    setSearching(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(search)}&format=json&limit=5&accept-language=zh`
      )
      const data = await res.json()
      setResults(data)
    } catch { }
    setSearching(false)
  }

  function pickResult(r) {
    const loc = { lat: parseFloat(r.lat), lng: parseFloat(r.lon) }
    setPin(loc)
    setFlyTarget([loc.lat, loc.lng])
    setResults([])
    setSearch(r.display_name.split(",")[0])
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition((pos) => {
      const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
      setPin(loc)
      setFlyTarget([loc.lat, loc.lng])
    }, () => {}, { timeout: 6000 })
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
      <div style={{ background: "#1f1f2e", border: "1px solid #2d2d3d", borderRadius: 14, width: 520, maxWidth: "95vw", overflow: "hidden" }}>
        {/* 顶栏 */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #2d2d3d" }}>
          <div style={{ fontWeight: 700, color: "#e5e7eb", marginBottom: 12 }}>选择见面地点</div>
          {/* 搜索栏 */}
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && doSearch()}
              placeholder="搜索地址..."
              style={{ flex: 1, background: "#0f0f1a", border: "1px solid #2d2d3d", borderRadius: 8, padding: "8px 12px", color: "#e5e7eb", fontSize: 13 }}
            />
            <button onClick={doSearch} disabled={searching} style={{ background: "#8b5cf6", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 13 }}>
              {searching ? "..." : "搜索"}
            </button>
            <button onClick={useCurrentLocation} style={{ background: "#0f0f1a", color: "#8b5cf6", border: "1px solid #4c1d95", borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontSize: 13, whiteSpace: "nowrap" }}>
              📍 当前位置
            </button>
          </div>
          {/* 搜索结果 */}
          {results.length > 0 && (
            <div style={{ marginTop: 8, background: "#0f0f1a", border: "1px solid #2d2d3d", borderRadius: 8, overflow: "hidden" }}>
              {results.map((r, i) => (
                <div key={i} onClick={() => pickResult(r)} style={{ padding: "10px 12px", fontSize: 13, color: "#d1d5db", cursor: "pointer", borderBottom: i < results.length - 1 ? "1px solid #1f1f2e" : "none" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#1f1f2e"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  📍 {r.display_name.length > 60 ? r.display_name.slice(0, 60) + "..." : r.display_name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 地图 */}
        <div style={{ height: 320, position: "relative" }}>
          <MapContainer center={[31.23, 121.47]} zoom={4} style={{ width: "100%", height: "100%" }}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            <MapClickHandler onPick={setPin} />
            <FlyTo center={flyTarget} />
            {pin && (
              <CircleMarker center={[pin.lat, pin.lng]} radius={10}
                pathOptions={{ color: "#8b5cf6", fillColor: "#8b5cf6", fillOpacity: 0.9, weight: 2 }} />
            )}
          </MapContainer>
          <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", zIndex: 1000, background: "rgba(26,26,46,0.85)", color: "#9ca3af", fontSize: 12, padding: "4px 12px", borderRadius: 20, pointerEvents: "none" }}>
            {pin ? "📍 已选定，可继续调整" : "点击地图选择位置"}
          </div>
        </div>

        {/* 底部按钮 */}
        <div style={{ padding: "14px 20px", display: "flex", gap: 10, justifyContent: "flex-end", borderTop: "1px solid #2d2d3d" }}>
          <button onClick={onCancel} style={{ background: "#0f0f1a", color: "#9ca3af", border: "1px solid #2d2d3d", borderRadius: 8, padding: "8px 20px", cursor: "pointer", fontSize: 14 }}>取消</button>
          <button onClick={() => pin && onConfirm(pin)} disabled={!pin} style={{
            background: pin ? "linear-gradient(135deg, #8b5cf6, #ec4899)" : "#374151",
            color: pin ? "#fff" : "#6b7280", border: "none", borderRadius: 8, padding: "8px 24px", cursor: pin ? "pointer" : "not-allowed", fontSize: 14, fontWeight: 600,
          }}>确认选点</button>
        </div>
      </div>
    </div>
  )
}

// ── Toast 通知 ──────────────────────────────────────────────
function Toast({ messages }) {
  if (!messages.length) return null
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 999, display: "flex", flexDirection: "column", gap: 8 }}>
      {messages.map((m, i) => (
        <div key={i} style={{
          background: m.type === "error" ? "#7f1d1d" : "#1a1a2e",
          border: `1px solid ${m.type === "error" ? "#ef4444" : "#8b5cf6"}`,
          color: m.type === "error" ? "#fca5a5" : "#c4b5fd",
          padding: "12px 20px", borderRadius: 10, fontSize: 14,
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)", maxWidth: 360,
        }}>{m.text}</div>
      ))}
    </div>
  )
}

const TAG_NAMES = ["生活支持", "情感支持", "技能技术", "知识教学", "创意协作"]
const TAG_EMOJIS = ["🏠", "💜", "🔧", "📚", "🎨"]
const TAG_COLORS = ["#a78bfa", "#f9a8d4", "#60a5fa", "#fbbf24", "#34d399"]
const STATUS_NAMES = ["待接单", "进行中", "已完成", "已取消"]
const SKILL_NAMES = ["倾听者", "就医陪伴", "育儿伙伴", "技能导师", "社区守护者", "危机支持者"]
const SKILL_EMOJIS = ["👂", "🏥", "👶", "📚", "🛡️", "🆘"]

// ── 图片灯箱（点击放大，再点缩小）────────────────────────────
function Lightbox({ src, onClose }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 99999, cursor: "zoom-out",
    }}>
      <img src={src} alt="" onClick={e => e.stopPropagation()} style={{
        maxWidth: "90vw", maxHeight: "88vh", borderRadius: 12,
        boxShadow: "0 8px 48px rgba(0,0,0,0.6)", cursor: "default",
      }} />
      <button onClick={onClose} style={{
        position: "fixed", top: 20, right: 24, background: "rgba(255,255,255,0.1)",
        border: "none", color: "#fff", fontSize: 24, cursor: "pointer",
        borderRadius: "50%", width: 40, height: 40, display: "flex",
        alignItems: "center", justifyContent: "center",
      }}>✕</button>
    </div>
  )
}

// ── 通知面板 ─────────────────────────────────────────────────
function NotificationPanel({ notifications, onClose, onNotifClick }) {
  const typeIcon = { accepted: "🎉", confirm_needed: "⏳", completed: "✅", invited: "💌", cancelled: "🔔", transfer: "💸" }
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500 }} onClick={onClose}>
      <div style={{
        position: "absolute", top: 60, right: 32, width: 340, maxHeight: 420, overflowY: "auto",
        background: "#1f1f2e", border: "1px solid #2d2d3d", borderRadius: 12,
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #2d2d3d", fontWeight: 700, color: "#e5e7eb", fontSize: 14 }}>
          通知
        </div>
        {notifications.length === 0 ? (
          <div style={{ padding: "24px 16px", textAlign: "center", color: "#4b5563", fontSize: 13 }}>暂无通知</div>
        ) : notifications.map(n => (
          <div key={n.id}
            onClick={() => n.serviceId && onNotifClick && onNotifClick(n.serviceId)}
            style={{
              padding: "12px 16px", borderBottom: "1px solid #1a1a2e",
              background: n.read ? "transparent" : "rgba(139,92,246,0.06)",
              cursor: n.serviceId ? "pointer" : "default",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => { if (n.serviceId) e.currentTarget.style.background = "rgba(139,92,246,0.12)" }}
            onMouseLeave={e => { e.currentTarget.style.background = n.read ? "transparent" : "rgba(139,92,246,0.06)" }}
          >
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{typeIcon[n.type] || "🔔"}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: n.read ? "#6b7280" : "#e5e7eb", lineHeight: 1.5 }}>{n.message}</div>
                <div style={{ fontSize: 11, color: "#374151", marginTop: 4 }}>
                  {new Date(n.timestamp).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  {n.serviceId && <span style={{ marginLeft: 6, color: "#4b5563" }}>→ 查看详情</span>}
                </div>
              </div>
              {!n.read && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#8b5cf6", flexShrink: 0, marginTop: 4 }} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── 通用深色卡片 ─────────────────────────────────────────────
const Card = ({ children, style, ...rest }) => (
  <div style={{ background: "#1f1f2e", border: "1px solid #2d2d3d", borderRadius: 12, padding: "20px 24px", ...style }} {...rest}>
    {children}
  </div>
)

// ── 主按钮 ───────────────────────────────────────────────────
const Btn = ({ children, onClick, disabled, secondary, small }) => (
  <button onClick={onClick} disabled={disabled} style={{
    background: disabled ? "#374151" : secondary ? "#1f1f2e" : "linear-gradient(135deg, #8b5cf6, #ec4899)",
    color: disabled ? "#6b7280" : secondary ? "#c4b5fd" : "#fff",
    border: secondary ? "1px solid #4c1d95" : "none",
    borderRadius: 8, padding: small ? "6px 14px" : "10px 20px",
    fontSize: small ? 13 : 14, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
  }}>{children}</button>
)

// ── Tab 导航 ─────────────────────────────────────────────────
const Tab = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{
    padding: "8px 20px", borderRadius: 20, border: "none", cursor: "pointer",
    background: active ? "rgba(139,92,246,0.3)" : "transparent",
    color: active ? "#c4b5fd" : "#6b7280",
    fontWeight: active ? 700 : 400, fontSize: 14,
    borderBottom: active ? "2px solid #8b5cf6" : "2px solid transparent",
  }}>{label}</button>
)

// ── Demo Mock 数据（纯前端，不上链，与真实链上数据叠加）──────────
const MOCK_POSTED = [
  { id: "mock-p1", tag: 1, hours: 2, status: 2, detail: { desc: "最近工作压力很大，需要有人陪我聊聊，整理一下思路和情绪。", date: "2026-03-28 19:00", other: "0x3C44...Cd77" } },
  { id: "mock-p2", tag: 2, hours: 3, status: 2, detail: { desc: "准备跳槽，需要帮助修改简历并进行面试模拟练习。", date: "2026-03-25 14:00", other: "0x90F7...9Ac2" } },
  { id: "mock-p3", tag: 0, hours: 1, status: 2, detail: { desc: "需要有人陪同去医院取检查报告，路程约 40 分钟。", date: "2026-03-20 09:30", other: "0x15d3...4Fb1" } },
]
const MOCK_ACCEPTED = [
  { id: "mock-a1", tag: 1, hours: 1, status: 2, detail: { desc: "对方情绪低落，进行了一次一对一倾听陪伴，帮助梳理情绪。", date: "2026-03-29 20:00", other: "0xAb8C...2e44" } },
  { id: "mock-a2", tag: 1, hours: 2, status: 2, detail: { desc: "长时间陪伴倾听，对方经历家庭困扰，全程情绪支持。", date: "2026-03-27 21:00", other: "0x7F1d...9c03" } },
  { id: "mock-a3", tag: 1, hours: 1, status: 2, detail: { desc: "深夜危机陪伴，对方情绪极低，提供即时支持与疏导。", date: "2026-03-22 23:15", other: "0xD2e9...8A11" } },
  { id: "mock-a4", tag: 0, hours: 2, status: 2, detail: { desc: "陪同就医，协助挂号、候诊、取药，全程陪伴约 2 小时。", date: "2026-03-26 10:00", other: "0x5c8B...1F6e" } },
  { id: "mock-a5", tag: 0, hours: 1, status: 2, detail: { desc: "协助行动不便的老人完成日常购物和药品采购。", date: "2026-03-19 15:00", other: "0x9Ea2...C3d7" } },
  { id: "mock-a6", tag: 3, hours: 2, status: 2, detail: { desc: "教授 Python 基础编程，覆盖数据类型、循环和函数。", date: "2026-03-18 14:00", other: "0x4Bc1...77aF" } },
  { id: "mock-a7", tag: 2, hours: 3, status: 2, detail: { desc: "帮助对方准备技术面试，进行两轮完整模拟问答与复盘。", date: "2026-03-15 13:00", other: "0x6Fd0...2B59" } },
  { id: "mock-a8", tag: 1, hours: 1, status: 1, detail: { desc: "正在进行的情感支持，对方近期遭遇感情变故。", date: "2026-03-31 18:00", other: "0xE3c4...0d82" } },
]
// mock 计数：[生活支持, 情感支持, 技能技术, 知识教学, 创意协作]（作为服务方完成次数）
const MOCK_COUNTS    = [2, 3, 1, 1, 0]
const MOCK_TOTAL     = 12
const MOCK_COMPLETED = 7
const MOCK_SCORE_AVG = 462
const MOCK_SKILLS    = [true, true, false, false, false, false] // 倾听者、就医陪伴点亮

// ── HRT 流水 mock 数据（与 MOCK_ACCEPTED / MOCK_POSTED 对应）────
const MOCK_HRT_FLOWS = [
  { id: "mf-a1",  type: "earn",    amount: "1", tag: 1, timestamp: new Date("2026-03-29T20:00:00").getTime() / 1000 },
  { id: "mf-a2",  type: "earn",    amount: "2", tag: 1, timestamp: new Date("2026-03-27T21:00:00").getTime() / 1000 },
  { id: "mf-p1",  type: "spend",   amount: "2", tag: 1, timestamp: new Date("2026-03-28T19:00:00").getTime() / 1000 },
  { id: "mf-a4",  type: "earn",    amount: "2", tag: 0, timestamp: new Date("2026-03-26T10:00:00").getTime() / 1000 },
  { id: "mf-p2",  type: "spend",   amount: "3", tag: 2, timestamp: new Date("2026-03-25T14:00:00").getTime() / 1000 },
  { id: "mf-a3",  type: "earn",    amount: "1", tag: 1, timestamp: new Date("2026-03-22T23:15:00").getTime() / 1000 },
  { id: "mf-p3",  type: "spend",   amount: "1", tag: 0, timestamp: new Date("2026-03-20T09:30:00").getTime() / 1000 },
  { id: "mf-a5",  type: "earn",    amount: "1", tag: 0, timestamp: new Date("2026-03-19T15:00:00").getTime() / 1000 },
  { id: "mf-a6",  type: "earn",    amount: "2", tag: 3, timestamp: new Date("2026-03-18T14:00:00").getTime() / 1000 },
  { id: "mf-a7",  type: "earn",    amount: "3", tag: 2, timestamp: new Date("2026-03-15T13:00:00").getTime() / 1000 },
  { id: "mf-w1",  type: "welcome", amount: "2", tag: null, timestamp: new Date("2026-01-15T10:00:00").getTime() / 1000 },
]

// ── 图表 mock 历史数据 ────────────────────────────────────────
const KNOWN_HRT = {
  "2026-03-31": 1, "2026-03-29": 1, "2026-03-27": 2, "2026-03-26": 2,
  "2026-03-22": 1, "2026-03-19": 1, "2026-03-18": 2, "2026-03-15": 3,
  "2026-03-12": 2, "2026-03-10": 1, "2026-03-08": 2, "2026-03-05": 3,
  "2026-03-03": 1, "2026-02-28": 2, "2026-02-25": 1, "2026-02-22": 3,
  "2026-02-18": 2, "2026-02-15": 1, "2026-02-12": 2, "2026-02-08": 1,
  "2026-02-05": 3, "2026-02-01": 1, "2026-01-28": 2, "2026-01-25": 1,
  "2026-01-20": 3, "2026-01-15": 2, "2026-01-10": 1, "2026-01-05": 2,
}

function buildDailyData(extraPoints = {}, includeMock = true) {
  const today = new Date("2026-03-31")
  const merged = { ...(includeMock ? KNOWN_HRT : {}), ...extraPoints }
  return Array.from({ length: 90 }, (_, i) => {
    const d = new Date(today); d.setDate(d.getDate() - (89 - i))
    const key = d.toISOString().split("T")[0]
    return { date: key, label: `${d.getMonth()+1}/${d.getDate()}`, hrt: merged[key] || 0 }
  })
}
function toMonthly(daily) {
  const map = {}
  daily.forEach(({ date, hrt }) => {
    const m = date.slice(0, 7)
    if (!map[m]) map[m] = { label: `${date.slice(5,7)}月`, hrt: 0 }
    map[m].hrt += hrt
  })
  return Object.values(map)
}
function toYearly(daily) {
  const map = {}
  daily.forEach(({ date, hrt }) => {
    const y = date.slice(0, 4)
    if (!map[y]) map[y] = { label: `${y}年`, hrt: 0 }
    map[y].hrt += hrt
  })
  return Object.values(map)
}

// 根据地址哈希生成稳定的 mock 评分和技能徽章（纯前端展示，不上链）
function getMockForAddr(addr) {
  if (!addr || addr === "0x0000000000000000000000000000000000000000") return { score: 0, skills: new Array(6).fill(false) }
  const h = parseInt(addr.slice(2, 10), 16)
  const score = 430 + (h % 70) // 430-499
  const skills = new Array(6).fill(false)
  skills[h % 5] = true // 至少一个徽章
  if (h % 3 === 0) skills[(h + 2) % 5] = true // 部分人有两个
  return { score, skills }
}

// 每个技能徽章的解锁条件描述和进度计算
// tag: 0=生活支持, 1=情感支持, 2=技能技术, 3=知识教学, 4=创意协作
function getSkillProgress(i, counts, total, score) {
  // counts[0..4] = serviceCountByTag, counts[5] = totalServiceCount
  const life = Number(counts[0] || 0)
  const emotion = Number(counts[1] || 0)
  const skill = Number(counts[2] || 0)
  const avg = score // x100, 450 = 4.50
  switch (i) {
    case 0: return { label: `情感支持 ${emotion}/5 次`, value: Math.min(emotion, 5), max: 5, extra: avg > 0 ? `均分 ${(avg/100).toFixed(2)}/4.50` : "均分 —/4.50", hint: "需情感支持 ≥5 次且均分 ≥4.50" }
    case 1: return { label: `生活支持 ${life}/3 次`, value: Math.min(life, 3), max: 3, extra: null, hint: "需生活支持 ≥3 次" }
    case 2: return { label: `生活支持 ${life}/5 次`, value: Math.min(life, 5), max: 5, extra: avg > 0 ? `均分 ${(avg/100).toFixed(2)}/4.00` : "均分 —/4.00", hint: "需生活支持 ≥5 次且均分 ≥4.00" }
    case 3: return { label: `技能技术 ${skill}/8 次`, value: Math.min(skill, 8), max: 8, extra: avg > 0 ? `均分 ${(avg/100).toFixed(2)}/4.50` : "均分 —/4.50", hint: "需技能技术 ≥8 次且均分 ≥4.50" }
    case 4: return { label: `总服务 ${total}/50 次`, value: Math.min(total, 50), max: 50, extra: null, hint: "需累计完成 ≥50 次服务" }
    case 5: return { label: "管理员颁发", value: 0, max: 1, extra: null, hint: "由平台管理员手动颁发" }
    default: return { label: "", value: 0, max: 1, extra: null, hint: "" }
  }
}

// ── 成员主页 ─────────────────────────────────────────────────
function ProfileTab({ account, contracts, toast, registered, pendingServiceId, onPendingClear }) {
  const [hrt, setHrt] = useState("0")
  const [score, setScore] = useState(0)
  const [skills, setSkills] = useState(new Array(6).fill(false))
  const [counts, setCounts] = useState(new Array(5).fill(0))
  const [totalCount, setTotalCount] = useState(0)
  const [myServices, setMyServices] = useState([])
  const [svcDetails, setSvcDetails] = useState({})
  const [svcImages, setSvcImages] = useState({})
  const [svcLocations, setSvcLocations] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [lightboxSrc, setLightboxSrc] = useState(null)
  const [recordTab, setRecordTab] = useState("accepted")
  const [chartView, setChartView] = useState("day")
  const [realPoints, setRealPoints] = useState({})
  const [submitting, setSubmitting] = useState(false)
  // 评分
  const [ratingScore, setRatingScore] = useState(5)
  const [ratingComment, setRatingComment] = useState("")
  const [showRating, setShowRating] = useState(false)
  // 联系方式
  const [contacts, setContacts] = useState({})
  const [contactInput, setContactInput] = useState("")
  const [savingContact, setSavingContact] = useState(false)
  // 结单调整时长
  const [confirmModal, setConfirmModal] = useState(null)
  const [actualHoursInput, setActualHoursInput] = useState(1)
  const [actualHoursNote, setActualHoursNote] = useState("")
  // 取消服务
  const [cancelModal, setCancelModal] = useState(null)
  const [cancelReason, setCancelReason] = useState("")
  const [cancelReasonData, setCancelReasonData] = useState(null)
  // 对方评分 + 徽章
  const [otherScore, setOtherScore] = useState(null)
  const [otherSkills, setOtherSkills] = useState(null)
  // 评价评论
  const [ratingComments, setRatingComments] = useState({})
  const [myReceivedScore, setMyReceivedScore] = useState(null)
  const [ratingsRevealed, setRatingsRevealed] = useState(false)
  // HRT 转赠
  const [transferModal, setTransferModal] = useState(false)
  const [transferTo, setTransferTo] = useState("")
  const [transferAmount, setTransferAmount] = useState("")
  const [transferNote, setTransferNote] = useState("")
  const [transferring, setTransferring] = useState(false)
  // HRT 流水（The Graph）
  const [hrtFlows, setHrtFlows] = useState([])
  const [flowLoading, setFlowLoading] = useState(false)
  const [memberStats, setMemberStats] = useState(null)
  // 转账流水（Firebase）
  const [transferFlows, setTransferFlows] = useState([])

  // 从 The Graph 拉取 HRT 流水记录
  useEffect(() => {
    if (!account) return
    setFlowLoading(true)
    fetchMember(account)
      .then(data => {
        if (!data) return
        setMemberStats({ hrtEarned: data.hrtEarned, hrtSpent: data.hrtSpent })
        const flows = (data.hrtFlows || []).map(f => ({
          id: f.type + "-" + f.timestamp,
          type: f.type,
          amount: ethers.formatEther(f.amount),
          serviceId: f.serviceId,
          timestamp: Number(f.timestamp),
          tag: null,
        })).sort((a, b) => b.timestamp - a.timestamp)
        setHrtFlows(flows)
      })
      .catch(() => {})
      .finally(() => setFlowLoading(false))
  }, [account])

  // 订阅 Firebase 服务详情、图片、位置
  useEffect(() => {
    const u1 = subscribeServiceDetails(setSvcDetails)
    const u2 = subscribeAllServiceImages(setSvcImages)
    const u3 = subscribeServiceLocations(setSvcLocations)
    return () => { u1(); u2(); u3() }
  }, [])

  // 订阅转账流水
  useEffect(() => {
    if (!account) return
    const unsub = subscribeTransferRecords(account, setTransferFlows)
    return () => unsub()
  }, [account])

  // 打开记录详情时订阅联系方式 + 拉对方评分 + 评论
  useEffect(() => {
    if (!selectedRecord) {
      setContacts({}); setContactInput(""); setOtherScore(null); setOtherSkills(null)
      setRatingComments({}); setMyReceivedScore(null); setRatingsRevealed(false)
      setCancelReasonData(null)
      return
    }
    const unsub1 = subscribeContacts(selectedRecord.id, setContacts)
    const unsub2 = subscribeRatingComments(selectedRecord.id, setRatingComments)
    const unsub3 = subscribeCancelReason(selectedRecord.id, setCancelReasonData)
    // 对方均分 + 技能徽章
    const otherAddr = selectedRecord.role === "requester" ? selectedRecord.provider : selectedRecord.actualRequester
    if (otherAddr && otherAddr !== ethers.ZeroAddress && contracts) {
      contracts.reputation.getAvgScore(otherAddr)
        .then(s => setOtherScore(Number(s)))
        .catch(() => setOtherScore(null))
      contracts.skillNFT.getSkills(otherAddr)
        .then(s => setOtherSkills([...s]))
        .catch(() => setOtherSkills(null))
    }
    // 如果已完成，检查是否可查看收到的分数
    if (selectedRecord.status === 2 && contracts) {
      contracts.reputation.bothSubmitted(selectedRecord.id).then(revealed => {
        setRatingsRevealed(revealed)
        if (revealed) {
          contracts.reputation.getMyScore(selectedRecord.id)
            .then(s => setMyReceivedScore(Number(s)))
            .catch(() => setMyReceivedScore(null))
        }
      }).catch(() => {})
    }
    return () => { unsub1(); unsub2(); unsub3() }
  }, [selectedRecord?.id])

  const load = useCallback(async () => {
    if (!contracts || !account) return
    setLoading(true)
    try {
      const [bal, avg, sk, total, ...tagCounts] = await Promise.all([
        contracts.token.balanceOf(account),
        contracts.reputation.getAvgScore(account),
        contracts.skillNFT.getSkills(account),
        contracts.reputation.getTotalServiceCount(account),
        contracts.reputation.getServiceCount(account, 0),
        contracts.reputation.getServiceCount(account, 1),
        contracts.reputation.getServiceCount(account, 2),
        contracts.reputation.getServiceCount(account, 3),
        contracts.reputation.getServiceCount(account, 4),
      ])
      setHrt(ethers.formatEther(bal))
      setScore(Number(avg))
      setSkills([...sk])
      setTotalCount(Number(total))
      setCounts(tagCounts.map(Number))

      // 加载帮扶记录
      const ids = await contracts.service.getAllServiceIds()
      const list = await Promise.all(ids.map(id => contracts.service.services(id)))
      const acc = account.toLowerCase()
      const mapped = list.map((s, i) => ({
        id: ids[i],
        tag: Number(s.tag),
        hours: Number(s.numHours) / 10,
        status: Number(s.status),
        requester: s.requester,
        actualRequester: s.actualRequester,
        provider: s.provider,
        requesterConfirmed: s.requesterConfirmed,
        providerConfirmed: s.providerConfirmed,
      }))
      const filtered = mapped.filter(s => s.actualRequester?.toLowerCase() === acc || s.provider?.toLowerCase() === acc)
      setMyServices(filtered)
      // 如果详情弹窗还开着，同步更新其确认状态
      setSelectedRecord(prev => {
        if (!prev) return prev
        const updated = filtered.find(s => s.id === prev.id)
        return updated ? { ...prev, ...updated } : prev
      })
    } catch (e) { toast("读取失败：" + e.message, "error") }
    setLoading(false)
  }, [contracts, account])

  useEffect(() => { load() }, [load])

  // 通知跳转：pendingServiceId 有值且 myServices 已加载时，自动打开对应详情
  useEffect(() => {
    if (!pendingServiceId || myServices.length === 0) return
    const found = myServices.find(s => s.id === pendingServiceId)
    if (found) {
      const role = found.actualRequester?.toLowerCase() === account.toLowerCase() ? "requester" : "provider"
      setSelectedRecord({ ...found, role })
      onPendingClear?.()
    }
  }, [pendingServiceId, myServices])

  async function doCancelMatched() {
    if (!cancelModal || !cancelReason) return
    setSubmitting(true)
    try {
      await (await contracts.service.cancelMatched(cancelModal.id)).wait()
      // 保存取消原因到 Firebase
      await saveCancelReason(cancelModal.id, account, cancelReason).catch(() => {})
      // 推送通知给对方
      const isRequester = cancelModal.actualRequester?.toLowerCase() === account.toLowerCase()
      const otherAddr = isRequester ? cancelModal.provider : cancelModal.actualRequester
      if (otherAddr && otherAddr !== ethers.ZeroAddress) {
        pushNotification(otherAddr, {
          type: "cancelled", serviceId: cancelModal.id,
          message: `你的${TAG_NAMES[cancelModal.tag]}服务已被${isRequester ? "发起方" : "服务方"}取消：${cancelReason}`,
        }).catch(() => {})
      }
      toast("服务已取消")
      setCancelModal(null)
      setCancelReason("")
      load()
    } catch (e) { toast(e.reason || e.message, "error") }
    setSubmitting(false)
  }

  async function doTransfer() {
    const amt = parseFloat(transferAmount)
    if (!transferTo || isNaN(amt) || amt <= 0) return
    if (amt > parseFloat(hrt)) { toast("HRT 余额不足", "error"); return }
    setTransferring(true)
    try {
      await (await contracts.token.transfer(transferTo, ethers.parseEther(String(amt)))).wait()
      const ts = Date.now()
      // 双方各存一条流水记录
      await Promise.all([
        saveTransferRecord(account,    { type: "transfer_out", amount: String(amt), counterpart: transferTo,  note: transferNote, timestamp: ts }),
        saveTransferRecord(transferTo, { type: "transfer_in",  amount: String(amt), counterpart: account,     note: transferNote, timestamp: ts }),
      ]).catch(() => {})
      pushNotification(transferTo, {
        type: "transfer", serviceId: null,
        message: `你收到了 ${account.slice(0,8)}...${account.slice(-6)} 转赠的 ${amt} HRT${transferNote ? `，附言：${transferNote}` : ""}`,
      }).catch(() => {})
      toast(`已成功转赠 ${amt} HRT`)
      setTransferModal(false); setTransferTo(""); setTransferAmount(""); setTransferNote("")
      load()
    } catch (e) { toast(e.reason || e.message, "error") }
    setTransferring(false)
  }

  // 查询链上完成事件，获取真实时间戳
  useEffect(() => {
    if (!contracts || !account) return
    ;(async () => {
      try {
        const filter = contracts.service.filters.ServiceCompleted?.() ?? null
        if (!filter) return
        const events = await contracts.service.queryFilter(filter, 0, "latest")
        const points = {}
        for (const ev of events) {
          const svc = await contracts.service.services(ev.args?.[0])
          if (!svc || svc.provider?.toLowerCase() !== account.toLowerCase()) continue
          const block = await contracts.service.runner.provider.getBlock(ev.blockNumber)
          if (!block) continue
          const d = new Date(Number(block.timestamp) * 1000).toISOString().split("T")[0]
          points[d] = (points[d] || 0) + Number(svc.numHours)
        }
        setRealPoints(points)
      } catch { /* 查询失败静默处理 */ }
    })()
  }, [contracts, account])

  // 图表数据（必须在早返回之前，满足 Hook 规则）
  const chartDaily = useMemo(() => buildDailyData(realPoints, registered), [realPoints, registered])
  const chartData = chartView === "day" ? chartDaily : chartView === "month" ? toMonthly(chartDaily) : toYearly(chartDaily)
  const chartTotalHrt = chartDaily.reduce((s, d) => s + d.hrt, 0)

  // serviceId → tag 反查表（必须在早返回之前）
  const serviceTagMap = useMemo(() => {
    const map = {}
    myServices.forEach(s => { map[s.id] = s.tag })
    return map
  }, [myServices])

  if (loading) return <div style={{ color: "#6b7280", textAlign: "center", padding: 40 }}>加载中...</div>

  // 把 Firebase 详情注入真实链上记录
  const withDetail = (s) => {
    const d = svcDetails[s.id]
    if (!d) return s
    return { ...s, detail: { desc: d.description, date: d.datetime ? new Date(d.datetime).toLocaleString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : null, other: null } }
  }
  const realPosted   = myServices.filter(s => s.actualRequester?.toLowerCase() === account.toLowerCase()).map(withDetail)
  const realAccepted = myServices.filter(s => s.provider?.toLowerCase() === account.toLowerCase()).map(withDetail)
  // 只有已注册用户才叠加 mock 演示数据
  const posted   = registered ? [...realPosted,   ...MOCK_POSTED]   : realPosted
  const accepted = registered ? [...realAccepted, ...MOCK_ACCEPTED] : realAccepted

  // 合并 mock 数据（未注册时不叠加）
  const mergedCounts = registered ? counts.map((c, i) => Number(c) + MOCK_COUNTS[i]) : counts.map(Number)
  const mergedTotal  = registered ? totalCount + MOCK_TOTAL : totalCount
  const mergedScore  = registered
    ? (score > 0
        ? Math.round((score * totalCount + MOCK_SCORE_AVG * MOCK_COMPLETED) / (totalCount + MOCK_COMPLETED))
        : MOCK_SCORE_AVG)
    : score
  const mergedSkills = registered ? skills.map((s, i) => s || MOCK_SKILLS[i]) : [...skills]
  const unlockedCount = mergedSkills.filter(Boolean).length

  // HRT 流水：真实链上 + 转账(Firebase) + mock
  const transferFlowsMapped = transferFlows.map(f => ({
    id: "tf-" + f.timestamp + f.type,
    type: f.type,
    amount: f.amount,
    counterpart: f.counterpart,
    note: f.note,
    timestamp: Math.floor(f.timestamp / 1000),
    tag: null,
  }))
  const mergedFlows = registered
    ? [...hrtFlows, ...transferFlowsMapped, ...MOCK_HRT_FLOWS].sort((a, b) => b.timestamp - a.timestamp)
    : [...hrtFlows, ...transferFlowsMapped].sort((a, b) => b.timestamp - a.timestamp)
  const totalEarned = mergedFlows.filter(f => f.type !== "spend" && f.type !== "transfer_out").reduce((s, f) => s + parseFloat(f.amount), 0)
  const totalSpent  = mergedFlows.filter(f => f.type === "spend" || f.type === "transfer_out").reduce((s, f) => s + parseFloat(f.amount), 0)

  const recordItem = (s, role) => (
    <div key={s.id} onClick={() => setSelectedRecord({ ...s, role })}
      style={{
        display: "flex", alignItems: "center", gap: 10, marginBottom: 6,
        padding: "8px 12px", borderRadius: 8, background: "#0f0f1a",
        borderLeft: `2px solid ${TAG_COLORS[s.tag]}`,
        cursor: "pointer", transition: "background 0.15s",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "#181828"}
      onMouseLeave={e => e.currentTarget.style.background = "#0f0f1a"}
    >
      <span style={{ fontSize: 16, flexShrink: 0 }}>{TAG_EMOJIS[s.tag]}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: s.detail?.desc ? 3 : 0 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#d1d5db" }}>{TAG_NAMES[s.tag]}</span>
          <span style={{ fontSize: 11, color: "#4b5563" }}>{s.hours}h</span>
          <span style={{ fontSize: 11, padding: "1px 6px", borderRadius: 8, marginLeft: "auto", flexShrink: 0,
            background: s.status === 2 ? "rgba(52,211,153,0.1)" : s.status === 1 ? "rgba(251,191,36,0.1)" : s.status === 3 ? "rgba(239,68,68,0.1)" : "rgba(139,92,246,0.1)",
            color: s.status === 2 ? "#34d399" : s.status === 1 ? "#fbbf24" : s.status === 3 ? "#f87171" : "#c4b5fd",
          }}>{STATUS_NAMES[s.status]}</span>
        </div>
        {s.detail?.desc && (
          <div style={{ fontSize: 12, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {s.detail.desc}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Hero 身份卡 ── */}
      <div style={{
        background: "linear-gradient(135deg, #12122a 0%, #1a1a2e 60%, #1f1828 100%)",
        border: "1px solid rgba(139,92,246,0.2)", borderRadius: 20, padding: "28px 32px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -40, left: 40, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

        {/* 地址行 */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, flexShrink: 0,
          }}>👤</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#e5e7eb", fontFamily: "monospace" }}>
              {account.slice(0, 10)}...{account.slice(-8)}
            </div>
            <div style={{ fontSize: 12, color: "#4b5563", marginTop: 2 }}>HerTime 成员</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <Btn small onClick={() => { setTransferModal(true); setTransferTo(""); setTransferAmount(""); setTransferNote("") }}>💸 转赠 HRT</Btn>
            <Btn secondary small onClick={load}>刷新数据</Btn>
          </div>
        </div>

        {/* 4 指标 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "rgba(255,255,255,0.04)", borderRadius: 14, overflow: "hidden" }}>
          {[
            { label: "HRT 余额", value: parseFloat(hrt).toFixed(1), sub: "1 HRT = 1 小时", color: "#c4b5fd", bg: "rgba(139,92,246,0.08)" },
            { label: "声誉评分", value: (mergedScore / 100).toFixed(2), sub: "链上永久记录", color: "#f9a8d4", bg: "rgba(236,72,153,0.06)" },
            { label: "技能徽章", value: `${unlockedCount} / 6`, sub: "Soulbound NFT", color: "#a78bfa", bg: "rgba(167,139,250,0.06)" },
            { label: "服务总计", value: `${mergedTotal}`, sub: `完成 ${mergedTotal - 1} 次`, color: "#34d399", bg: "rgba(52,211,153,0.06)" },
          ].map((item, i) => (
            <div key={i} style={{ padding: "18px 20px", background: item.bg, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 10, letterSpacing: "0.05em", textTransform: "uppercase" }}>{item.label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: item.color, lineHeight: 1 }}>{item.value}</div>
              <div style={{ fontSize: 11, color: "#374151", marginTop: 8 }}>{item.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 主内容双列 ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>

        {/* 左列：图表 + 帮扶记录 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* HRT 贡献轨迹 */}
          <Card style={{ padding: "22px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#e5e7eb" }}>HRT 贡献轨迹</div>
                <div style={{ fontSize: 12, color: "#4b5563", marginTop: 3 }}>近 90 天共获得 {chartTotalHrt} HRT</div>
              </div>
              <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.04)", borderRadius: 20, padding: 3 }}>
                {[["day", "日"], ["month", "月"], ["year", "年"]].map(([key, label]) => (
                  <button key={key} onClick={() => setChartView(key)} style={{
                    padding: "4px 14px", borderRadius: 16, border: "none", cursor: "pointer", fontSize: 12,
                    background: chartView === key ? "rgba(139,92,246,0.5)" : "transparent",
                    color: chartView === key ? "#e5e7eb" : "#6b7280",
                    fontWeight: chartView === key ? 700 : 400,
                    transition: "all 0.15s",
                  }}>{label}</button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="hrtGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="label" tick={{ fill: "#4b5563", fontSize: 11 }} tickLine={false} axisLine={false}
                  interval={chartView === "day" ? 13 : 0} />
                <YAxis tick={{ fill: "#4b5563", fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "#1a1a2e", border: "1px solid #3d2d6e", borderRadius: 8, fontSize: 13 }}
                  labelStyle={{ color: "#9ca3af" }} itemStyle={{ color: "#c4b5fd" }}
                  formatter={(v) => [`${v} HRT`, "获得"]}
                />
                <Area type="monotone" dataKey="hrt" stroke="#8b5cf6" strokeWidth={2} fill="url(#hrtGrad)" dot={false} activeDot={{ r: 4, fill: "#c4b5fd" }} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* 帮扶记录 */}
          <Card style={{ padding: "22px 24px" }}>
            {/* Tab 切换 */}
            <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 16, borderBottom: "1px solid #2d2d3d", paddingBottom: 0 }}>
              {[
                { key: "accepted", label: "我接单的服务", count: accepted.length, color: "#34d399", bg: "rgba(52,211,153,0.15)" },
                { key: "posted",   label: "我发起的需求", count: posted.length,   color: "#c4b5fd", bg: "rgba(139,92,246,0.2)" },
                { key: "flows",    label: "HRT 流水",      count: mergedFlows.length, color: "#fbbf24", bg: "rgba(251,191,36,0.15)" },
              ].map(({ key, label, count, color, bg }) => {
                const active = (recordTab || "accepted") === key
                return (
                  <button key={key} onClick={() => setRecordTab(key)} style={{
                    padding: "8px 16px", border: "none", cursor: "pointer", fontSize: 13,
                    background: "transparent", fontWeight: active ? 700 : 400,
                    color: active ? "#e5e7eb" : "#6b7280",
                    borderBottom: active ? "2px solid #8b5cf6" : "2px solid transparent",
                    marginBottom: -1, display: "flex", alignItems: "center", gap: 6,
                  }}>
                    {label}
                    <span style={{ background: bg, color, borderRadius: 10, padding: "1px 7px", fontSize: 11 }}>{count}</span>
                  </button>
                )
              })}
            </div>

            {/* HRT 流水列表 */}
            {(recordTab === "flows") ? (
              <div>
                {/* 汇总行 */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
                  {[
                    { label: "总收入", value: `+${totalEarned.toFixed(1)}`, color: "#34d399", bg: "rgba(52,211,153,0.06)" },
                    { label: "总支出", value: `-${totalSpent.toFixed(1)}`,  color: "#f87171", bg: "rgba(239,68,68,0.06)" },
                    { label: "净增",   value: `${(totalEarned - totalSpent).toFixed(1)}`, color: "#c4b5fd", bg: "rgba(139,92,246,0.06)" },
                  ].map(item => (
                    <div key={item.label} style={{ background: item.bg, borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
                      <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: item.color }}>{item.value} <span style={{ fontSize: 11 }}>HRT</span></div>
                    </div>
                  ))}
                </div>
                {/* 数据来源标注 */}
                <div style={{ fontSize: 11, color: "#374151", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: "#34d399" }}>●</span> 链上数据来自 The Graph 索引
                  {flowLoading && <span style={{ color: "#6b7280" }}>  加载中...</span>}
                </div>
                {/* 流水列表 */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {mergedFlows.map(f => {
                    const isEarn = f.type !== "spend" && f.type !== "transfer_out"
                    const label = f.type === "welcome" ? "注册奖励"
                      : f.type === "earn" ? "服务收入"
                      : f.type === "spend" ? "服务消费"
                      : f.type === "transfer_in" ? "转账收入"
                      : "转账支出"
                    const icon = f.type === "welcome" ? "🎁"
                      : f.type === "transfer_in" || f.type === "transfer_out" ? "💸"
                      : isEarn ? "↑" : "↓"
                    const isMock = f.id?.startsWith("mf-")
                    // 真实流水从 serviceTagMap 反查 tag
                    const tag = f.tag !== null && f.tag !== undefined ? f.tag
                      : (f.serviceId ? serviceTagMap[f.serviceId] : undefined)
                    // 转账副标题：地址 + 附言合成一行
                    const transferSub = f.counterpart
                      ? `${f.type === "transfer_in" ? "来自" : "转至"} ${f.counterpart.slice(0,8)}...${f.counterpart.slice(-6)}${f.note ? ` · "${f.note}"` : ""}`
                      : null
                    const date = new Date(f.timestamp * 1000).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
                    return (
                      <div key={f.id} style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 14px", borderRadius: 10, background: "#0f0f1a",
                        borderLeft: `2px solid ${isEarn ? "#34d399" : "#f87171"}`,
                      }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                          background: isEarn ? "rgba(52,211,153,0.12)" : "rgba(239,68,68,0.12)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 15,
                        }}>{icon}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#d1d5db" }}>{label}</span>
                            {tag !== undefined && tag !== null && (
                              <span style={{ fontSize: 11, color: "#6b7280" }}>{TAG_EMOJIS[tag]} {TAG_NAMES[tag]}</span>
                            )}
                            {isMock && <span style={{ fontSize: 10, color: "#374151", border: "1px solid #2d2d3d", borderRadius: 4, padding: "1px 5px" }}>样本</span>}
                          </div>
                          <div style={{ fontSize: 11, color: "#4b5563", marginTop: 2 }}>
                            {transferSub ? <span style={{ fontFamily: transferSub.startsWith("来自") || transferSub.startsWith("转至") ? "inherit" : "monospace" }}>{transferSub} · {date}</span> : date}
                          </div>
                        </div>
                        <div style={{ fontSize: 17, fontWeight: 800, color: isEarn ? "#34d399" : "#f87171", flexShrink: 0 }}>
                          {isEarn ? "+" : "-"}{parseFloat(f.amount).toFixed(1)} <span style={{ fontSize: 11 }}>HRT</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              /* 单列记录列表 */
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {((recordTab || "accepted") === "accepted" ? accepted : posted).map(s =>
                  recordItem(s, (recordTab || "accepted") === "accepted" ? "provider" : "requester")
                )}
              </div>
            )}
          </Card>
        </div>

        {/* 右列：技能徽章 */}
        <Card style={{ padding: "22px 22px" }}>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#e5e7eb" }}>技能徽章</div>
            <div style={{ fontSize: 12, color: "#4b5563", marginTop: 4 }}>Soulbound · 不可转让 · 链上颁发</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {SKILL_NAMES.map((name, i) => {
              const lit = mergedSkills[i]
              const prog = getSkillProgress(i, mergedCounts, mergedTotal, mergedScore)
              const pct = lit ? 100 : (prog.max > 0 ? Math.round(prog.value / prog.max * 100) : 0)
              return (
                <div key={i} title={lit ? `✓ ${name}` : prog.hint} style={{
                  padding: "12px 14px", borderRadius: 12,
                  background: lit ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${lit ? "rgba(139,92,246,0.4)" : "#2d2d3d"}`,
                  boxShadow: lit ? "0 0 16px rgba(139,92,246,0.12)" : "none",
                  position: "relative", overflow: "hidden",
                }}>
                  {lit && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,#8b5cf6,#ec4899)" }} />}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 20, filter: lit ? "none" : "grayscale(1) opacity(0.3)", flexShrink: 0 }}>{SKILL_EMOJIS[i]}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: lit ? "#d4b8ff" : "#6b7280" }}>{name}</div>
                      <div style={{ fontSize: 11, color: lit ? "#6b5a8a" : "#374151", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {lit ? prog.label.replace(/\d+\/(\d+)/, (_, max) => `${max}/${max}`) : prog.label}
                      </div>
                    </div>
                    {lit
                      ? <span style={{ fontSize: 10, color: "#8b5cf6", background: "rgba(139,92,246,0.25)", borderRadius: 6, padding: "2px 7px", flexShrink: 0 }}>已获得</span>
                      : <span style={{ fontSize: 11, color: "#4b5563", flexShrink: 0 }}>{pct}%</span>
                    }
                  </div>
                  <div style={{ background: "#2d2d3d", borderRadius: 4, height: 4, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 4, transition: "width 0.4s ease",
                      width: `${pct}%`,
                      background: lit ? "linear-gradient(90deg,#8b5cf6,#ec4899)" : "linear-gradient(90deg,#4b5563,#6b7280)",
                    }} />
                  </div>
                  {prog.extra && <div style={{ fontSize: 11, color: "#4b5563", marginTop: 5 }}>{prog.extra}</div>}
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* 帮扶记录详情弹窗 */}
      {selectedRecord && (() => {
        const r = selectedRecord
        const isRequester = r.role === "requester"
        return (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}
            onClick={() => setSelectedRecord(null)}>
            <div style={{ background: "#1f1f2e", border: "1px solid #2d2d3d", borderRadius: 16, width: 720, maxWidth: "96vw", maxHeight: "90vh", overflow: "auto" }}
              onClick={e => e.stopPropagation()}>
              {/* 顶部色条 */}
              <div style={{ height: 3, borderRadius: "16px 16px 0 0", background: `linear-gradient(90deg, ${TAG_COLORS[r.tag]}, transparent)` }} />
              {/* 头部 */}
              <div style={{ padding: "18px 24px 14px", borderBottom: "1px solid #2d2d3d", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 30 }}>{TAG_EMOJIS[r.tag]}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 17, color: "#e5e7eb" }}>{TAG_NAMES[r.tag]}</div>
                    <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
                      {r.hours} 小时 · <span style={{
                        color: r.status === 2 ? "#34d399" : r.status === 1 ? "#fbbf24" : r.status === 3 ? "#f87171" : "#c4b5fd"
                      }}>{STATUS_NAMES[r.status]}</span> · {isRequester ? "我发起" : "我接单"}
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedRecord(null)} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 20 }}>✕</button>
              </div>

              {/* 双列主体 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>

                {/* 左列：服务说明 + 图片 + 地图 */}
                <div style={{ padding: "18px 20px", borderRight: "1px solid #2d2d3d", display: "flex", flexDirection: "column", gap: 14 }}>
                  {/* 服务说明 */}
                  <div>
                    <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>服务说明</div>
                    {r.detail?.desc
                      ? <div style={{ fontSize: 13, color: "#d1d5db", lineHeight: 1.7, background: "#0f0f1a", borderRadius: 8, padding: "10px 12px" }}>{r.detail.desc}</div>
                      : <div style={{ fontSize: 13, color: "#374151", fontStyle: "italic" }}>暂无服务说明</div>
                    }
                  </div>

                  {/* 现场图片 */}
                  {svcImages[r.id]?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>现场图片</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {svcImages[r.id].map((url, i) => (
                          <img key={i} src={url} alt="" onClick={() => setLightboxSrc(url)}
                            style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8, border: "1px solid #2d2d3d", cursor: "zoom-in" }} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 见面地点地图 */}
                  {(() => {
                    const loc = svcLocations[r.id]
                    if (!loc) return null
                    return (
                      <div>
                        <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>见面地点</div>
                        <div style={{ borderRadius: 10, overflow: "hidden", height: 180 }}>
                          <MapContainer center={[loc.lat, loc.lng]} zoom={2} style={{ width: "100%", height: "100%" }} zoomControl={false}>
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                            <FitBounds points={[[loc.lat, loc.lng]]} />
                            <CircleMarker center={[loc.lat, loc.lng]} radius={10}
                              pathOptions={{ color: "#8b5cf6", fillColor: "#8b5cf6", fillOpacity: 0.9, weight: 2 }} />
                          </MapContainer>
                        </div>
                      </div>
                    )
                  })()}
                </div>

                {/* 右列：时间 + 对方 + HRT + 联系 + 评价 + 操作 */}
                <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                  {/* 时间 */}
                  {r.detail?.date && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#c4b5fd", background: "#0f0f1a", borderRadius: 8, padding: "8px 12px" }}>
                      <span>🕐</span><span>{r.detail.date}</span>
                    </div>
                  )}

                  {/* 对方地址 + 评分 + 技能徽章 */}
                  {(r.detail?.other || (r.provider && r.provider !== ethers.ZeroAddress)) && (() => {
                    const otherAddr = isRequester ? r.provider : r.actualRequester
                    const mock = getMockForAddr(otherAddr)
                    const displayScore = otherScore > 0 ? otherScore : mock.score
                    const displaySkills = otherSkills?.some(Boolean) ? otherSkills : mock.skills
                    return (
                      <div style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 10, padding: "10px 12px" }}>
                        <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>{isRequester ? "服务方" : "需求方"}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: 12, color: "#c4b5fd", fontFamily: "monospace" }}>
                            {r.detail?.other || (otherAddr ? `${otherAddr.slice(0, 8)}...${otherAddr.slice(-6)}` : "")}
                          </span>
                          <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 10, background: "rgba(251,191,36,0.15)", color: "#fbbf24", fontWeight: 700 }}>
                            ★ {(displayScore / 100).toFixed(2)}
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {displaySkills.map((has, i) => has ? (
                            <span key={i} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "rgba(139,92,246,0.2)", color: "#c4b5fd", border: "1px solid rgba(139,92,246,0.3)" }}>
                              {SKILL_EMOJIS[i]} {SKILL_NAMES[i]}
                            </span>
                          ) : null)}
                        </div>
                      </div>
                    )
                  })()}

                  {/* HRT 结算 */}
                  {r.status === 2 && (
                    <div style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "#34d399" }}>
                      ✓ {isRequester ? `已支付 ${r.hours} HRT` : `已获得 ${r.hours} HRT`}，链上永久记录
                    </div>
                  )}

                  {/* 联系方式交换（进行中） */}
                  {r.status === 1 && !r.id?.startsWith("mock") && (() => {
                    const myRole = isRequester ? "requester" : "provider"
                    const otherRole = isRequester ? "provider" : "requester"
                    const mySaved = contacts[myRole]?.contact
                    const otherContact = contacts[otherRole]?.contact
                    return (
                      <div style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 10, padding: "12px 14px" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#c4b5fd", marginBottom: 8 }}>💬 联系方式交换</div>
                        {otherContact
                          ? <div style={{ fontSize: 13, color: "#34d399", marginBottom: 8 }}>
                              {isRequester ? "服务方" : "需求方"}：<strong>{otherContact}</strong>
                            </div>
                          : <div style={{ fontSize: 12, color: "#4b5563", marginBottom: 8 }}>对方尚未填写联系方式</div>
                        }
                        <div style={{ display: "flex", gap: 8 }}>
                          <input value={mySaved || contactInput} onChange={e => !mySaved && setContactInput(e.target.value)}
                            readOnly={!!mySaved} placeholder="微信/手机号等"
                            style={{ flex: 1, background: "#0f0f1a", border: "1px solid #2d2d3d", borderRadius: 8, padding: "7px 10px", color: mySaved ? "#6b7280" : "#e5e7eb", fontSize: 13 }} />
                          {!mySaved && (
                            <button onClick={async () => { if (!contactInput.trim()) return; setSavingContact(true); await saveContact(r.id, myRole, contactInput.trim()).catch(() => {}); setSavingContact(false) }}
                              disabled={savingContact || !contactInput.trim()}
                              style={{ background: contactInput.trim() ? "linear-gradient(135deg,#8b5cf6,#ec4899)" : "#374151", color: "#fff", border: "none", borderRadius: 8, padding: "7px 12px", fontSize: 13, cursor: "pointer" }}>
                              {savingContact ? "..." : "保存"}
                            </button>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: "#4b5563", marginTop: 5 }}>仅双方可见</div>
                      </div>
                    )
                  })()}

                  {/* 收到的评价（双方都提交评分后可见） */}
                  {r.status === 2 && ratingsRevealed && !r.id?.startsWith("mock") && (
                    <div style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 10, padding: "10px 12px" }}>
                      <div style={{ fontSize: 11, color: "#fbbf24", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>⭐ 你收到的评价</div>
                      {myReceivedScore !== null && (
                        <div style={{ display: "flex", gap: 3, marginBottom: 6 }}>
                          {[1,2,3,4,5].map(i => (
                            <span key={i} style={{ fontSize: 16, color: i <= myReceivedScore ? "#f59e0b" : "#374151" }}>★</span>
                          ))}
                          <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: 4, alignSelf: "center" }}>{myReceivedScore} 星</span>
                        </div>
                      )}
                      {(() => {
                        const otherAddr = isRequester ? r.provider?.toLowerCase() : r.actualRequester?.toLowerCase()
                        const comment = otherAddr && ratingComments[otherAddr]?.comment
                        return comment ? (
                          <div style={{ fontSize: 13, color: "#d1d5db", lineHeight: 1.6, background: "#0f0f1a", borderRadius: 8, padding: "8px 10px" }}>"{comment}"</div>
                        ) : <div style={{ fontSize: 12, color: "#4b5563" }}>对方未留文字评价</div>
                      })()}
                    </div>
                  )}

                  {/* 取消原因展示（已取消的服务） */}
                  {r.status === 3 && cancelReasonData && (
                    <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "10px 12px", fontSize: 13 }}>
                      <span style={{ color: "#f87171" }}>取消原因：</span>
                      <span style={{ color: "#9ca3af" }}>{cancelReasonData.reason || "未填写"}</span>
                    </div>
                  )}

                  {/* 操作按钮 */}
                  {!r.id?.startsWith("mock") && (r.status === 1 || r.status === 2) && (
                    <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingTop: 4, alignItems: "center" }}>
                      {r.status === 1 && (
                        <Btn small onClick={async () => {
                          if (isRequester) {
                            setActualHoursInput(r.hours); setActualHoursNote(""); setConfirmModal(r)
                            setSelectedRecord(null)
                          } else {
                            setSubmitting(true)
                            try {
                              await (await contracts.service.confirmCompletion(r.id)).wait()
                              pushNotification(r.actualRequester, {
                                type: "completed", serviceId: r.id,
                                message: `你的${TAG_NAMES[r.tag]}服务已完成，可以去提交评分了！`
                              }).catch(() => {})
                              toast("确认成功！"); load(); setSelectedRecord(null)
                            } catch (e) { toast(e.reason || e.message, "error") }
                            setSubmitting(false)
                          }
                        }} disabled={submitting
                          || (isRequester && r.requesterConfirmed)
                          || (!isRequester && r.providerConfirmed)}>
                          {(isRequester && r.requesterConfirmed) || (!isRequester && r.providerConfirmed) ? "已确认，等待对方" : "确认完成"}
                        </Btn>
                      )}
                      {r.status === 2 && (
                        <Btn small secondary onClick={() => { setShowRating(true); setRatingScore(5); setRatingComment("") }}>
                          提交评分
                        </Btn>
                      )}
                      {r.status === 1 && !(r.requesterConfirmed && !isRequester) && (
                        <button onClick={() => { setCancelModal(r); setCancelReason(""); setSelectedRecord(null) }}
                          style={{ marginLeft: "auto", background: "none", border: "1px solid #374151", borderRadius: 8, padding: "6px 12px", color: "#6b7280", fontSize: 13, cursor: "pointer" }}>
                          取消服务
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* 结单调整时长 modal */}
      {confirmModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}
          onClick={() => setConfirmModal(null)}>
          <Card style={{ width: 400, maxWidth: "92vw" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 700, color: "#e5e7eb", fontSize: 16, marginBottom: 6 }}>确认结单</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>
              预计时长 <strong style={{ color: "#c4b5fd" }}>{confirmModal.hours}h</strong>，如实际不同可调整。调整后链上将按实际时长结算 HRT。
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 8 }}>实际时长（小时）</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button onClick={() => setActualHoursInput(v => Math.max(0.1, Math.round((v - 0.5) * 10) / 10))}
                  style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid #2d2d3d", background: "#0f0f1a", color: "#e5e7eb", fontSize: 20, cursor: "pointer" }}>−</button>
                <input type="number" min={0.1} max={24} step={0.1} value={actualHoursInput}
                  onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v) && v >= 0.1 && v <= 24) setActualHoursInput(Math.round(v * 10) / 10) }}
                  style={{ width: 72, background: "#0f0f1a", border: "1px solid #3d3d5c", borderRadius: 8, padding: "6px 0", color: "#c4b5fd", fontSize: 22, fontWeight: 800, textAlign: "center", boxSizing: "border-box" }} />
                <button onClick={() => setActualHoursInput(v => Math.min(24, Math.round((v + 0.5) * 10) / 10))}
                  style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid #2d2d3d", background: "#0f0f1a", color: "#e5e7eb", fontSize: 20, cursor: "pointer" }}>+</button>
                {actualHoursInput !== confirmModal.hours && (
                  <span style={{ fontSize: 12, color: actualHoursInput > confirmModal.hours ? "#fbbf24" : "#34d399" }}>
                    {actualHoursInput > confirmModal.hours ? `↑ 超出 ${actualHoursInput - confirmModal.hours}h` : `↓ 减少 ${confirmModal.hours - actualHoursInput}h`}
                  </span>
                )}
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 8 }}>备注（可选）</div>
              <input value={actualHoursNote} onChange={e => setActualHoursNote(e.target.value)}
                placeholder="例：双方协商延时"
                style={{ width: "100%", background: "#0f0f1a", border: "1px solid #2d2d3d", borderRadius: 8, padding: "8px 12px", color: "#e5e7eb", fontSize: 13, boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Btn secondary small onClick={() => setConfirmModal(null)}>取消</Btn>
              <Btn small onClick={async () => {
                setSubmitting(true)
                try {
                  if (actualHoursInput !== confirmModal.hours) {
                    await (await contracts.service.adjustHours(confirmModal.id, Math.round(actualHoursInput * 10))).wait()
                    await saveActualHours(confirmModal.id, actualHoursInput, actualHoursNote).catch(() => {})
                  } else if (actualHoursNote) {
                    await saveActualHours(confirmModal.id, actualHoursInput, actualHoursNote).catch(() => {})
                  }
                  await (await contracts.service.confirmCompletion(confirmModal.id)).wait()
                  // 需求方确认后通知服务方
                  pushNotification(confirmModal.provider, {
                    type: "confirm_needed", serviceId: confirmModal.id,
                    message: `需求方已确认${TAG_NAMES[confirmModal.tag]}服务完成，请你也确认以完成 HRT 结算`
                  }).catch(() => {})
                  toast("结单成功！"); setConfirmModal(null); load()
                } catch (e) { toast(e.reason || e.message, "error") }
                setSubmitting(false)
              }} disabled={submitting}>{submitting ? "结单中..." : "确认结单"}</Btn>
            </div>
          </Card>
        </div>
      )}

      {/* 转赠 HRT modal */}
      {transferModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}
          onClick={() => setTransferModal(false)}>
          <Card style={{ width: 420, maxWidth: "92vw" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 700, color: "#e5e7eb", fontSize: 16, marginBottom: 4 }}>💸 转赠 HRT</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>
              当前余额 <strong style={{ color: "#c4b5fd" }}>{parseFloat(hrt).toFixed(1)} HRT</strong>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 6 }}>收款地址</div>
                <input value={transferTo} onChange={e => setTransferTo(e.target.value)}
                  placeholder="0x..."
                  style={{ width: "100%", background: "#0f0f1a", border: "1px solid #2d2d3d", borderRadius: 8, padding: "9px 12px", color: "#e5e7eb", fontSize: 13, boxSizing: "border-box", fontFamily: "monospace" }} />
              </div>

              <div>
                <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 6 }}>转赠数量（HRT）</div>
                <input type="number" min="0.1" step="0.1" value={transferAmount} onChange={e => setTransferAmount(e.target.value)}
                  placeholder="例：1.5"
                  style={{ width: "100%", background: "#0f0f1a", border: "1px solid #2d2d3d", borderRadius: 8, padding: "9px 12px", color: "#c4b5fd", fontSize: 16, fontWeight: 700, boxSizing: "border-box" }} />
              </div>

              <div>
                <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 6 }}>附言 <span style={{ color: "#4b5563" }}>（可选）</span></div>
                <input value={transferNote} onChange={e => setTransferNote(e.target.value)}
                  placeholder="例：妈妈，这是我帮邻居积累的，你留着用"
                  style={{ width: "100%", background: "#0f0f1a", border: "1px solid #2d2d3d", borderRadius: 8, padding: "9px 12px", color: "#e5e7eb", fontSize: 13, boxSizing: "border-box" }} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 22 }}>
              <Btn secondary small onClick={() => setTransferModal(false)}>取消</Btn>
              <Btn small onClick={doTransfer}
                disabled={transferring || !transferTo || !transferAmount || parseFloat(transferAmount) <= 0}>
                {transferring ? "转赠中..." : "确认转赠"}
              </Btn>
            </div>
          </Card>
        </div>
      )}

      {/* 评分 modal */}
      {showRating && selectedRecord && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <Card style={{ width: 380, maxWidth: "90vw" }}>
            <div style={{ fontWeight: 700, color: "#e5e7eb", marginBottom: 6, fontSize: 16 }}>提交评分</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>双盲评分：双方都提交后才同时公开</div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 8 }}>评分</div>
              <div style={{ display: "flex", gap: 4 }}>
                {[1,2,3,4,5].map(i => (
                  <span key={i} onClick={() => setRatingScore(i)}
                    style={{ fontSize: 28, cursor: "pointer", color: i <= ratingScore ? "#f59e0b" : "#374151" }}>★</span>
                ))}
                <span style={{ marginLeft: 8, color: "#6b7280", alignSelf: "center" }}>{ratingScore} 星</span>
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 8 }}>评价（可选）</div>
              <textarea value={ratingComment} onChange={e => setRatingComment(e.target.value)}
                rows={3} placeholder="写下你的评价..."
                style={{ width: "100%", background: "#0f0f1a", border: "1px solid #2d2d3d", borderRadius: 8, padding: 10, color: "#e5e7eb", fontSize: 13, resize: "vertical", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Btn secondary small onClick={() => setShowRating(false)}>取消</Btn>
              <Btn small onClick={async () => {
                setSubmitting(true)
                try {
                  const hash = ratingComment ? ethers.keccak256(ethers.toUtf8Bytes(ratingComment)) : ethers.ZeroHash
                  await (await contracts.reputation.submitRating(selectedRecord.id, ratingScore, hash)).wait()
                  if (ratingComment) await saveRatingComment(selectedRecord.id, account, ratingComment).catch(() => {})
                  toast("评分提交成功！等待对方提交后自动公开")
                  setShowRating(false); setSelectedRecord(null); load()
                } catch (e) { toast(e.reason || e.message, "error") }
                setSubmitting(false)
              }} disabled={submitting}>{submitting ? "提交中..." : "提交评分"}</Btn>
            </div>
          </Card>
        </div>
      )}

      {/* 取消服务弹窗 */}
      {cancelModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}
          onClick={() => setCancelModal(null)}>
          <Card style={{ width: 400, maxWidth: "92vw" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 700, color: "#e5e7eb", fontSize: 16, marginBottom: 4 }}>取消服务</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 18 }}>
              {TAG_EMOJIS[cancelModal.tag]} {TAG_NAMES[cancelModal.tag]} · {cancelModal.hours} 小时
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 10 }}>取消原因</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {["临时有事，时间冲突", "需求已解决，不再需要", "双方协商取消", "其他原因"].map(opt => (
                  <label key={opt} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
                    padding: "8px 12px", borderRadius: 8,
                    background: cancelReason === opt ? "rgba(139,92,246,0.1)" : "#0f0f1a",
                    border: `1px solid ${cancelReason === opt ? "rgba(139,92,246,0.4)" : "#1e1e2e"}`,
                  }}>
                    <input type="radio" name="cancelReason" value={opt} checked={cancelReason === opt}
                      onChange={() => setCancelReason(opt)} style={{ accentColor: "#8b5cf6" }} />
                    <span style={{ fontSize: 13, color: "#d1d5db" }}>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Btn secondary small onClick={() => setCancelModal(null)}>不取消了</Btn>
              <button onClick={doCancelMatched} disabled={!cancelReason || submitting}
                style={{ padding: "6px 18px", borderRadius: 8, border: "none", cursor: cancelReason && !submitting ? "pointer" : "not-allowed",
                  background: cancelReason ? "rgba(239,68,68,0.8)" : "#374151", color: "#fff", fontSize: 13, fontWeight: 600 }}>
                {submitting ? "取消中..." : "确认取消"}
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* 图片灯箱 */}
      {lightboxSrc && <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
    </div>
  )
}

// ── 需求广场 ─────────────────────────────────────────────────
function BoardTab({ account, contracts, toast, userLocation }) {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [ratingTarget, setRatingTarget] = useState(null)
  const [ratingScore, setRatingScore] = useState(5)
  const [ratingComment, setRatingComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [svcLocations, setSvcLocations] = useState({})
  const [svcDetails, setSvcDetails] = useState({})
  const [distFilter, setDistFilter] = useState(0)
  const [pendingAccept, setPendingAccept] = useState(null)
  const [selectedService, setSelectedService] = useState(null)
  const [contacts, setContacts] = useState({})
  const [contactInput, setContactInput] = useState("")
  const [savingContact, setSavingContact] = useState(false)
  const [svcImages, setSvcImages] = useState({})
  const [lightboxSrc, setLightboxSrc] = useState(null)
  const [confirmModal, setConfirmModal] = useState(null) // { service } 结单调整时长弹窗
  const [actualHoursInput, setActualHoursInput] = useState(1)
  const [actualHoursNote, setActualHoursNote] = useState("")
  const [providerScore, setProviderScore] = useState(null) // 接单人评分
  const [providerSkills, setProviderSkills] = useState(null) // 接单人徽章 bool[6]
  const [requesterScores, setRequesterScores] = useState({}) // 发布人信誉分 { address: score }
  const [tagFilter, setTagFilter] = useState(-1) // -1 = 全部
  const [cancelBoardModal, setCancelBoardModal] = useState(null)
  const [cancelBoardReason, setCancelBoardReason] = useState("")

  useEffect(() => {
    const u1 = subscribeServiceLocations(setSvcLocations)
    const u2 = subscribeServiceDetails(setSvcDetails)
    const u3 = subscribeAllServiceImages(setSvcImages)
    return () => { u1(); u2(); u3() }
  }, [])

  // 打开/关闭详情弹窗时订阅联系方式 + 拉接单人评分和徽章
  useEffect(() => {
    if (!selectedService) { setContacts({}); setContactInput(""); setProviderScore(null); setProviderSkills(null); return }
    const unsub = subscribeContacts(selectedService.id, setContacts)
    const p = selectedService.provider
    if (p && p !== ethers.ZeroAddress && contracts) {
      contracts.reputation.getAvgScore(p).then(s => setProviderScore(Number(s))).catch(() => setProviderScore(null))
      contracts.skillNFT.getSkills(p).then(s => setProviderSkills(s.map(Boolean))).catch(() => setProviderSkills(null))
    }
    return () => unsub()
  }, [selectedService?.id])

  const load = useCallback(async () => {
    if (!contracts) return
    setLoading(true)
    try {
      const ids = await contracts.service.getAllServiceIds()
      const list = await Promise.all(ids.map(id => contracts.service.services(id)))
      const mapped = list.map((s, i) => ({
        id: ids[i],
        requester: s.requester,
        actualRequester: s.actualRequester,
        provider: s.provider,
        tag: Number(s.tag),
        hours: Number(s.numHours) / 10,
        status: Number(s.status),
        requesterConfirmed: s.requesterConfirmed,
        providerConfirmed: s.providerConfirmed,
      }))
      setServices(mapped.slice().reverse())
      // 批量拉发布人评分（去重）
      const addrs = [...new Set(mapped.map(s => s.actualRequester).filter(a => a && a !== ethers.ZeroAddress))]
      const scores = {}
      await Promise.all(addrs.map(async a => {
        try { scores[a.toLowerCase()] = Number(await contracts.reputation.getAvgScore(a)) } catch { }
      }))
      setRequesterScores(scores)
    } catch (e) { toast("读取失败：" + e.message, "error") }
    setLoading(false)
  }, [contracts])

  useEffect(() => { load() }, [load])

  async function doAccept(id) {
    setSubmitting(true)
    try {
      await (await contracts.service.acceptService(id)).wait()
      // 通知需求方有人接单
      if (pendingAccept) {
        pushNotification(pendingAccept.actualRequester, {
          type: "accepted", serviceId: id,
          message: `你的${TAG_NAMES[pendingAccept.tag]}需求有人接单了！快去详情页交换联系方式吧`
        }).catch(() => {})
      }
      toast("接单成功！")
      setPendingAccept(null)
      load()
    } catch (e) { toast((e.reason || e.message), "error") }
    setSubmitting(false)
  }

  async function doCancelMatchedBoard() {
    if (!cancelBoardModal || !cancelBoardReason) return
    setSubmitting(true)
    try {
      await (await contracts.service.cancelMatched(cancelBoardModal.id)).wait()
      await saveCancelReason(cancelBoardModal.id, account, cancelBoardReason).catch(() => {})
      const acc = account.toLowerCase()
      const isRequester = cancelBoardModal.actualRequester?.toLowerCase() === acc
      const otherAddr = isRequester ? cancelBoardModal.provider : cancelBoardModal.actualRequester
      if (otherAddr && otherAddr !== ethers.ZeroAddress) {
        pushNotification(otherAddr, {
          type: "cancelled", serviceId: cancelBoardModal.id,
          message: `你的${TAG_NAMES[cancelBoardModal.tag]}服务已被${isRequester ? "发起方" : "服务方"}取消：${cancelBoardReason}`,
        }).catch(() => {})
      }
      toast("服务已取消")
      setCancelBoardModal(null)
      setCancelBoardReason("")
      load()
    } catch (e) { toast(e.reason || e.message, "error") }
    setSubmitting(false)
  }

  function openConfirmModal(service) {
    setActualHoursInput(service.hours)
    setActualHoursNote("")
    setConfirmModal(service)
  }

  async function confirm(service) {
    setSubmitting(true)
    const isRequester = service.actualRequester?.toLowerCase() === account?.toLowerCase()
    try {
      if (actualHoursInput !== service.hours) {
        await (await contracts.service.adjustHours(service.id, Math.round(actualHoursInput * 10))).wait()
        await saveActualHours(service.id, actualHoursInput, actualHoursNote).catch(() => {})
      } else if (actualHoursNote) {
        await saveActualHours(service.id, actualHoursInput, actualHoursNote).catch(() => {})
      }
      await (await contracts.service.confirmCompletion(service.id)).wait()
      if (isRequester) {
        // 需求方确认，通知服务方
        pushNotification(service.provider, {
          type: "confirm_needed", serviceId: service.id,
          message: `需求方已确认${TAG_NAMES[service.tag]}服务完成，请你也确认以完成 HRT 结算`
        }).catch(() => {})
      } else {
        // 服务方确认（最终完成），通知需求方
        pushNotification(service.actualRequester, {
          type: "completed", serviceId: service.id,
          message: `你的${TAG_NAMES[service.tag]}服务已完成，可以去提交评分了！`
        }).catch(() => {})
      }
      toast("结单成功！" + (actualHoursInput !== service.hours ? `链上已更新为 ${actualHoursInput} HRT` : ""))
      setConfirmModal(null)
      load()
    } catch (e) { toast((e.reason || e.message), "error") }
    setSubmitting(false)
  }

  async function submitRating() {
    if (!ratingTarget) return
    setSubmitting(true)
    try {
      const hash = ratingComment
        ? ethers.keccak256(ethers.toUtf8Bytes(ratingComment))
        : ethers.ZeroHash
      await (await contracts.reputation.submitRating(ratingTarget.id, ratingScore, hash)).wait()
      if (ratingComment) await saveRatingComment(ratingTarget.id, account, ratingComment).catch(() => {})
      toast("评分提交成功！等待对方提交后自动公开")
      setRatingTarget(null)
      setRatingComment("")
      setRatingScore(5)
    } catch (e) { toast((e.reason || e.message), "error") }
    setSubmitting(false)
  }

  if (loading) return <div style={{ color: "#6b7280", textAlign: "center", padding: 40 }}>加载中...</div>

  const acc = account?.toLowerCase()

  // 计算每个真实服务的距离
  const servicesWithDist = services.map(s => {
    const loc = svcLocations[s.id]
    const dist = (loc && userLocation)
      ? haversine(userLocation.lat, userLocation.lng, loc.lat, loc.lng)
      : null
    return { ...s, loc, dist }
  })

  // 合并 Mock 服务（带内嵌定位）
  const mockBoardWithDist = MOCK_BOARD_SERVICES.map(s => ({
    ...s,
    loc: { lat: s.lat, lng: s.lng },
    dist: userLocation ? haversine(userLocation.lat, userLocation.lng, s.lat, s.lng) : null,
  }))

  // 只显示待接单，再按距离 + 类型筛选
  const allPending = [...servicesWithDist, ...mockBoardWithDist].filter(s => s.status === 0)
  const filtered = allPending
    .filter(s => distFilter === 0 || s.dist === null || s.dist <= distFilter)
    .filter(s => tagFilter === -1 || s.tag === tagFilter)

  return (
    <div>
      {/* 顶栏：类型筛选 */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        {[[-1, "全部"], [0, "🏠 生活支持"], [1, "💜 情感支持"], [2, "🔧 技能技术"], [3, "📚 知识教学"], [4, "🎨 创意协作"]].map(([val, label]) => (
          <button key={val} onClick={() => setTagFilter(val)} style={{
            padding: "4px 12px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12,
            background: tagFilter === val ? `rgba(${val === -1 ? "139,92,246" : val === 0 ? "167,139,250" : val === 1 ? "249,168,212" : val === 2 ? "96,165,250" : val === 3 ? "251,191,36" : "52,211,153"},0.25)` : "#1f1f2e",
            color: tagFilter === val ? (val === -1 ? "#c4b5fd" : TAG_COLORS[val]) : "#6b7280",
            fontWeight: tagFilter === val ? 700 : 400,
          }}>{label}</button>
        ))}
      </div>
      {/* 距离筛选 + 刷新 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {[[0, "全部"], [5, "5km"], [10, "10km"], [20, "20km"]].map(([val, label]) => (
            <button key={val} onClick={() => setDistFilter(val)} style={{
              padding: "5px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12,
              background: distFilter === val ? "rgba(139,92,246,0.3)" : "#1f1f2e",
              color: distFilter === val ? "#c4b5fd" : "#6b7280",
              fontWeight: distFilter === val ? 700 : 400,
            }}>{val === 0 ? "📋 " : "📍 "}{label}</button>
          ))}
        </div>
        <Btn secondary small onClick={load}>刷新</Btn>
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", color: "#4b5563", padding: 40 }}>
          {distFilter > 0 ? `${distFilter}km 内暂无需求，试试扩大范围` : "暂无服务需求，去发布一个吧"}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(s => {
          const isRequester = s.actualRequester?.toLowerCase() === acc
          const isProvider = s.provider?.toLowerCase() === acc
          return (
            <div key={s.id} onClick={() => setSelectedService(s)} style={{
              background: "#1f1f2e", borderRadius: 12, cursor: "pointer",
              borderLeft: `3px solid ${TAG_COLORS[s.tag]}`,
              padding: "16px 20px",
              transition: "background 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "#25253a"}
              onMouseLeave={e => e.currentTarget.style.background = "#1f1f2e"}
            >
              {/* 头部：类型 + 状态 + 地址 + 距离 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 17 }}>{TAG_EMOJIS[s.tag]}</span>
                  <span style={{ fontWeight: 700, color: "#e5e7eb", fontSize: 15 }}>{TAG_NAMES[s.tag]}</span>
                  <span style={{ fontSize: 12, color: "#6b7280" }}>{s.hours} 小时</span>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10,
                    background: s.status === 0 ? "rgba(139,92,246,0.15)" : s.status === 1 ? "rgba(251,191,36,0.15)" : s.status === 2 ? "rgba(52,211,153,0.15)" : "rgba(239,68,68,0.1)",
                    color: s.status === 0 ? "#c4b5fd" : s.status === 1 ? "#fbbf24" : s.status === 2 ? "#34d399" : "#f87171",
                  }}>{STATUS_NAMES[s.status]}</span>
                  {isRequester && (
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: "rgba(236,72,153,0.15)", color: "#f9a8d4", fontWeight: 600 }}>我发布的</span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  {s.dist !== null && (
                    <span style={{ fontSize: 11, color: "#8b5cf6", background: "rgba(139,92,246,0.1)", borderRadius: 6, padding: "2px 8px" }}>
                      📍 {s.dist < 1 ? (s.dist * 1000).toFixed(0) + " m" : s.dist.toFixed(1) + " km"}
                    </span>
                  )}
                  {(() => {
                    const reqAddr = s.actualRequester?.toLowerCase()
                    const score = (reqAddr && requesterScores[reqAddr]) || s.avgScore
                    return score > 0 ? (
                      <span style={{ fontSize: 11, color: "#fbbf24" }}>★ {(score / 100).toFixed(2)}</span>
                    ) : null
                  })()}
                  <span style={{ fontSize: 11, color: "#4b5563", fontFamily: "monospace" }}>
                    {s.requester === ethers.ZeroAddress ? "匿名" : s.requester.slice(0, 6) + "..."}
                  </span>
                </div>
              </div>

              {/* 描述（有才显示） */}
              {(svcDetails[s.id]?.description || s.description) && (
                <div style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.6, marginBottom: 10,
                  overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                  {svcDetails[s.id]?.description || s.description}
                </div>
              )}

              {/* 缩略图预览 */}
              {(svcImages[s.id]?.length > 0 || s.images?.length > 0) && (
                <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                  {(svcImages[s.id] || s.images || []).slice(0, 3).map((url, i) => (
                    <img key={i} src={url} alt="" style={{ width: 48, height: 36, objectFit: "cover", borderRadius: 6, border: "1px solid #2d2d3d" }} />
                  ))}
                </div>
              )}

              {/* 底部：时间 + 确认进度 + 操作按钮 */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                {(svcDetails[s.id]?.datetime || s.datetime) && (
                  <span style={{ fontSize: 12, color: "#6b7280" }}>
                    🕐 {svcDetails[s.id]?.datetime || s.datetime}
                  </span>
                )}
                {s.status === 1 && (isRequester || isProvider) && (
                  <span style={{ fontSize: 12, color: "#6b7280" }}>
                    {s.requesterConfirmed ? "✓" : "○"} 需求方 · {s.providerConfirmed ? "✓" : "○"} 服务方
                  </span>
                )}
                <div style={{ flex: 1 }} />
                {s.status === 0 && !isRequester && (
                  <Btn small onClick={e => { e.stopPropagation(); setPendingAccept(s) }} disabled={submitting}>接单</Btn>
                )}
                {s.status === 1 && (isRequester || isProvider) && (
                  <Btn small onClick={e => { e.stopPropagation(); isRequester ? openConfirmModal(s) : confirm(s) }} disabled={submitting ||
                    (isRequester && s.requesterConfirmed) || (isProvider && s.providerConfirmed)}>
                    {(isRequester && s.requesterConfirmed) || (isProvider && s.providerConfirmed) ? "已确认，等待对方" : "确认完成"}
                  </Btn>
                )}
                {s.status === 2 && (isRequester || isProvider) && (
                  <Btn small secondary onClick={e => { e.stopPropagation(); setRatingTarget(s) }}>提交评分</Btn>
                )}
                <button onClick={e => { e.stopPropagation(); setSelectedService(s) }} style={{
                  background: "none", border: "none", color: "#6b7280",
                  fontSize: 12, cursor: "pointer", padding: "4px 2px",
                }}>详情 →</button>
              </div>
            </div>
          )
        })}
      </div>

      {/* 服务详情弹窗 */}
      {selectedService && (() => {
        const s = selectedService
        const loc = svcLocations[s.id] || s.loc || null
        const detail = svcDetails[s.id] || (s.description ? { description: s.description, datetime: s.datetime } : null)
        const images = svcImages[s.id] || s.images || []
        const dist = (loc && userLocation) ? haversine(userLocation.lat, userLocation.lng, loc.lat, loc.lng) : null
        const isRequester = s.actualRequester?.toLowerCase() === acc
        const isProvider = s.provider?.toLowerCase() === acc
        return (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }} onClick={() => setSelectedService(null)}>
            <div style={{ background: "#1f1f2e", border: "1px solid #2d2d3d", borderRadius: 14, width: 480, maxWidth: "94vw", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
              {/* 头部 */}
              <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #2d2d3d" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <span style={{ fontSize: 32 }}>{TAG_EMOJIS[s.tag]}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 18, color: "#e5e7eb" }}>{TAG_NAMES[s.tag]}</div>
                      <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{s.hours} 小时 · {STATUS_NAMES[s.status]}</div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedService(null)} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 20, lineHeight: 1 }}>✕</button>
                </div>
              </div>

              <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
                {/* 需求说明 */}
                {detail?.description && (
                  <div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>需求说明</div>
                    <div style={{ fontSize: 14, color: "#d1d5db", lineHeight: 1.6, background: "#0f0f1a", borderRadius: 8, padding: "10px 12px" }}>{detail.description}</div>
                  </div>
                )}

                {/* 现场图片 */}
                {images.length > 0 && (
                  <div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>现场图片</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {images.map((url, i) => (
                        <img key={i} src={url} alt="" onClick={() => setLightboxSrc(url)}
                          style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "1px solid #2d2d3d", cursor: "zoom-in" }} />
                      ))}
                    </div>
                  </div>
                )}

                {/* 期望时间 */}
                {detail?.datetime && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#c4b5fd" }}>
                    <span>🕐</span>
                    <span>{detail.datetime}</span>
                  </div>
                )}

                {/* 位置地图 */}
                {loc ? (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>见面地点</div>
                      {dist !== null && (
                        <div style={{ fontSize: 12, color: "#8b5cf6" }}>
                          📍 距你 {dist < 1 ? (dist * 1000).toFixed(0) + " 米" : dist.toFixed(1) + " km"}
                        </div>
                      )}
                    </div>
                    <div style={{ borderRadius: 10, overflow: "hidden", height: 200 }}>
                      <MapContainer center={[loc.lat, loc.lng]} zoom={2} style={{ width: "100%", height: "100%" }} zoomControl={false}>
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                        <FitBounds points={userLocation
                          ? [[loc.lat, loc.lng], [userLocation.lat, userLocation.lng]]
                          : [[loc.lat, loc.lng]]} />
                        <CircleMarker center={[loc.lat, loc.lng]} radius={10} pathOptions={{ color: "#8b5cf6", fillColor: "#8b5cf6", fillOpacity: 0.9, weight: 2 }} />
                        {userLocation && (
                          <CircleMarker center={[userLocation.lat, userLocation.lng]} radius={7} pathOptions={{ color: "#ec4899", fillColor: "#ec4899", fillOpacity: 0.7, weight: 2 }} />
                        )}
                      </MapContainer>
                    </div>
                    {userLocation && dist !== null && (
                      <div style={{ fontSize: 12, color: "#4b5563", marginTop: 6, textAlign: "center" }}>
                        紫点：见面地点 · 粉点：你的位置
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: "#4b5563", textAlign: "center", padding: "12px 0" }}>未提供见面地点</div>
                )}

                {/* 发布者 + 接单人 */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ fontSize: 12, color: "#4b5563", fontFamily: "monospace" }}>
                    发布者：{s.requester === ethers.ZeroAddress ? "匿名" : s.requester}
                  </div>
                  {s.provider && s.provider !== ethers.ZeroAddress && (
                    <div style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 10, padding: "12px 14px" }}>
                      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>接单人</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: providerSkills?.some(Boolean) ? 10 : 0 }}>
                        <span style={{ fontSize: 13, color: "#c4b5fd", fontFamily: "monospace" }}>
                          {s.provider.slice(0, 10)}...{s.provider.slice(-8)}
                        </span>
                        {providerScore !== null && (
                          <span style={{ fontSize: 13, padding: "2px 10px", borderRadius: 10, background: "rgba(251,191,36,0.15)", color: "#fbbf24", fontWeight: 700 }}>
                            ★ {providerScore > 0 ? (providerScore / 100).toFixed(2) : "暂无评分"}
                          </span>
                        )}
                      </div>
                      {providerSkills?.some(Boolean) && (
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {providerSkills.map((has, i) => has ? (
                            <span key={i} style={{ fontSize: 12, padding: "3px 10px", borderRadius: 20, background: "rgba(139,92,246,0.2)", color: "#c4b5fd", border: "1px solid rgba(139,92,246,0.3)" }}>
                              {SKILL_EMOJIS[i]} {SKILL_NAMES[i]}
                            </span>
                          ) : null)}
                        </div>
                      )}
                      {providerSkills && !providerSkills.some(Boolean) && (
                        <div style={{ fontSize: 12, color: "#4b5563" }}>暂无技能徽章</div>
                      )}
                    </div>
                  )}
                </div>

                {/* 联系方式交换（仅匹配状态下当事人可见） */}
                {s.status === 1 && (isRequester || isProvider) && (() => {
                  const myRole = isRequester ? "requester" : "provider"
                  const otherRole = isRequester ? "provider" : "requester"
                  const mySaved = contacts[myRole]?.contact
                  const otherContact = contacts[otherRole]?.contact
                  async function handleSaveContact() {
                    if (!contactInput.trim()) return
                    setSavingContact(true)
                    await saveContact(s.id, myRole, contactInput.trim()).catch(() => {})
                    setSavingContact(false)
                  }
                  return (
                    <div style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 10, padding: "14px 16px" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#c4b5fd", marginBottom: 10 }}>💬 联系方式交换</div>

                      {/* 对方联系方式 */}
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
                          {isRequester ? "服务方" : "需求方"}联系方式
                        </div>
                        {otherContact ? (
                          <div style={{ background: "#1f1f2e", borderRadius: 8, padding: "10px 14px", fontSize: 14, color: "#e5e7eb", fontWeight: 500 }}>
                            {otherContact}
                          </div>
                        ) : (
                          <div style={{ fontSize: 13, color: "#374151", fontStyle: "italic" }}>对方尚未填写</div>
                        )}
                      </div>

                      {/* 我的联系方式 */}
                      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
                        我的联系方式 {mySaved && <span style={{ color: "#34d399" }}>✓ 已保存</span>}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          value={mySaved || contactInput}
                          onChange={e => !mySaved && setContactInput(e.target.value)}
                          placeholder="微信号 / 手机号 / 备注..."
                          readOnly={!!mySaved}
                          style={{
                            flex: 1, background: "#0f0f1a", border: "1px solid #2d2d3d",
                            borderRadius: 8, padding: "8px 12px", color: mySaved ? "#6b7280" : "#e5e7eb",
                            fontSize: 13,
                          }}
                        />
                        {!mySaved && (
                          <button onClick={handleSaveContact} disabled={savingContact || !contactInput.trim()} style={{
                            background: contactInput.trim() ? "linear-gradient(135deg,#8b5cf6,#ec4899)" : "#374151",
                            color: "#fff", border: "none", borderRadius: 8,
                            padding: "8px 16px", fontSize: 13, cursor: contactInput.trim() ? "pointer" : "not-allowed",
                            whiteSpace: "nowrap",
                          }}>
                            {savingContact ? "保存中..." : "保存"}
                          </button>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: "#4b5563", marginTop: 8 }}>
                        仅双方可见 · 服务完成后请自行删除对方联系方式
                      </div>
                    </div>
                  )
                })()}

                {/* 操作按钮 */}
                <div style={{ display: "flex", gap: 8, paddingTop: 4, alignItems: "center" }}>
                  {s.status === 0 && !isRequester && (
                    <Btn small onClick={() => { setSelectedService(null); setPendingAccept(s) }} disabled={submitting}>接单</Btn>
                  )}
                  {s.status === 1 && (isRequester || isProvider) && (
                    <Btn small onClick={() => { setSelectedService(null); isRequester ? openConfirmModal(s) : confirm(s) }} disabled={submitting || (isRequester && s.requesterConfirmed) || (isProvider && s.providerConfirmed)}>
                      {(isRequester && s.requesterConfirmed) || (isProvider && s.providerConfirmed) ? "已确认，等待对方" : "确认完成"}
                    </Btn>
                  )}
                  {s.status === 2 && (isRequester || isProvider) && (
                    <Btn small secondary onClick={() => { setSelectedService(null); setRatingTarget(s) }}>提交评分</Btn>
                  )}
                  {/* 取消按钮：进行中且不是已确认的服务方 */}
                  {s.status === 1 && (isRequester || isProvider) && !(s.requesterConfirmed && isProvider) && (
                    <button onClick={() => { setSelectedService(null); setCancelBoardModal(s); setCancelBoardReason("") }}
                      style={{ marginLeft: "auto", background: "none", border: "1px solid #374151", borderRadius: 8, padding: "6px 14px", color: "#6b7280", fontSize: 13, cursor: "pointer" }}>
                      取消服务
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* 接单确认弹窗 */}
      {pendingAccept && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <Card style={{ width: 440, maxWidth: "92vw" }}>
            <div style={{ fontWeight: 700, color: "#e5e7eb", fontSize: 16, marginBottom: 4 }}>确认接单</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
              {TAG_EMOJIS[pendingAccept.tag]} {TAG_NAMES[pendingAccept.tag]} · {pendingAccept.hours} 小时
            </div>

            {/* 小地图 */}
            {pendingAccept.loc ? (
              <div style={{ borderRadius: 10, overflow: "hidden", marginBottom: 14, height: 220 }}>
                <MapContainer
                  center={[pendingAccept.loc.lat, pendingAccept.loc.lng]}
                  zoom={2}
                  style={{ width: "100%", height: "100%" }}
                  zoomControl={false}
                >
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                  <FitBounds points={userLocation
                    ? [[pendingAccept.loc.lat, pendingAccept.loc.lng], [userLocation.lat, userLocation.lng]]
                    : [[pendingAccept.loc.lat, pendingAccept.loc.lng]]} />
                  <CircleMarker center={[pendingAccept.loc.lat, pendingAccept.loc.lng]} radius={10}
                    pathOptions={{ color: "#8b5cf6", fillColor: "#8b5cf6", fillOpacity: 0.85, weight: 2 }}>
                    <Popup><div style={{ fontSize: 13 }}>📍 见面地点</div></Popup>
                  </CircleMarker>
                  {userLocation && (
                    <CircleMarker center={[userLocation.lat, userLocation.lng]} radius={8}
                      pathOptions={{ color: "#ec4899", fillColor: "#ec4899", fillOpacity: 0.7, weight: 2 }}>
                      <Popup><div style={{ fontSize: 13 }}>你的位置</div></Popup>
                    </CircleMarker>
                  )}
                </MapContainer>
              </div>
            ) : (
              <div style={{ background: "#0f0f1a", borderRadius: 10, padding: "20px", textAlign: "center", color: "#4b5563", fontSize: 13, marginBottom: 14 }}>
                需求方未提供见面地点
              </div>
            )}

            {pendingAccept.dist !== null && (
              <div style={{ background: "rgba(139,92,246,0.1)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#c4b5fd", marginBottom: 16 }}>
                📍 见面地点距你约 <strong>{pendingAccept.dist < 1 ? (pendingAccept.dist * 1000).toFixed(0) + " 米" : pendingAccept.dist.toFixed(1) + " km"}</strong>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Btn secondary small onClick={() => setPendingAccept(null)}>取消</Btn>
              <Btn small onClick={() => doAccept(pendingAccept.id)} disabled={submitting}>
                {submitting ? "接单中..." : "确认接单"}
              </Btn>
            </div>
          </Card>
        </div>
      )}

      {/* 结单调整时长 modal（仅发起人） */}
      {confirmModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}
          onClick={() => setConfirmModal(null)}>
          <Card style={{ width: 400, maxWidth: "92vw" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 700, color: "#e5e7eb", fontSize: 16, marginBottom: 6 }}>确认结单</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>
              预计时长 <strong style={{ color: "#c4b5fd" }}>{confirmModal.hours}h</strong>，如实际时长不同可在此调整。调整后链上将按实际时长结算 HRT。
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 8 }}>实际时长（小时）</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button onClick={() => setActualHoursInput(v => Math.max(0.1, Math.round((v - 0.5) * 10) / 10))}
                  style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid #2d2d3d", background: "#0f0f1a", color: "#e5e7eb", fontSize: 20, cursor: "pointer" }}>−</button>
                <input type="number" min={0.1} max={24} step={0.1} value={actualHoursInput}
                  onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v) && v >= 0.1 && v <= 24) setActualHoursInput(Math.round(v * 10) / 10) }}
                  style={{ width: 72, background: "#0f0f1a", border: "1px solid #3d3d5c", borderRadius: 8, padding: "6px 0", color: "#c4b5fd", fontSize: 22, fontWeight: 800, textAlign: "center", boxSizing: "border-box" }} />
                <button onClick={() => setActualHoursInput(v => Math.min(24, Math.round((v + 0.5) * 10) / 10))}
                  style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid #2d2d3d", background: "#0f0f1a", color: "#e5e7eb", fontSize: 20, cursor: "pointer" }}>+</button>
                {actualHoursInput !== confirmModal.hours && (
                  <span style={{ fontSize: 12, color: actualHoursInput > confirmModal.hours ? "#fbbf24" : "#34d399" }}>
                    {actualHoursInput > confirmModal.hours ? `↑ 超出 ${actualHoursInput - confirmModal.hours}h` : `↓ 减少 ${confirmModal.hours - actualHoursInput}h`}
                  </span>
                )}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 8 }}>备注（可选，如时长变化原因）</div>
              <input value={actualHoursNote} onChange={e => setActualHoursNote(e.target.value)}
                placeholder="例：服务过程超时，双方协商一致"
                style={{ width: "100%", background: "#0f0f1a", border: "1px solid #2d2d3d", borderRadius: 8, padding: "8px 12px", color: "#e5e7eb", fontSize: 13, boxSizing: "border-box" }} />
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Btn secondary small onClick={() => setConfirmModal(null)}>取消</Btn>
              <Btn small onClick={() => confirm(confirmModal)} disabled={submitting}>
                {submitting ? "结单中..." : "确认结单"}
              </Btn>
            </div>
          </Card>
        </div>
      )}

      {/* 评分弹窗 */}
      {ratingTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <Card style={{ width: 380, maxWidth: "90vw" }}>
            <div style={{ fontWeight: 700, color: "#e5e7eb", marginBottom: 6, fontSize: 16 }}>提交评分</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>双盲评分：双方都提交后才同时公开，防止报复性打分</div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 8 }}>评分</div>
              <div style={{ display: "flex", gap: 4 }}>
                {[1,2,3,4,5].map(i => (
                  <span key={i} onClick={() => setRatingScore(i)}
                    style={{ fontSize: 28, cursor: "pointer", color: i <= ratingScore ? "#f59e0b" : "#374151" }}>★</span>
                ))}
                <span style={{ marginLeft: 8, color: "#6b7280", alignSelf: "center" }}>{ratingScore} 星</span>
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 8 }}>评价（可选）</div>
              <textarea value={ratingComment} onChange={e => setRatingComment(e.target.value)}
                rows={3} placeholder="写下你的评价..."
                style={{ width: "100%", background: "#0f0f1a", border: "1px solid #2d2d3d", borderRadius: 8, padding: 10, color: "#e5e7eb", fontSize: 13, resize: "vertical", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Btn secondary small onClick={() => setRatingTarget(null)}>取消</Btn>
              <Btn small onClick={submitRating} disabled={submitting}>
                {submitting ? "提交中..." : "提交评分"}
              </Btn>
            </div>
          </Card>
        </div>
      )}

      {/* 取消服务弹窗 */}
      {cancelBoardModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}
          onClick={() => setCancelBoardModal(null)}>
          <Card style={{ width: 400, maxWidth: "92vw" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 700, color: "#e5e7eb", fontSize: 16, marginBottom: 4 }}>取消服务</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 18 }}>
              {TAG_EMOJIS[cancelBoardModal.tag]} {TAG_NAMES[cancelBoardModal.tag]} · {cancelBoardModal.hours} 小时
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 10 }}>取消原因</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {["临时有事，时间冲突", "需求已解决，不再需要", "双方协商取消", "其他原因"].map(opt => (
                  <label key={opt} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
                    padding: "8px 12px", borderRadius: 8,
                    background: cancelBoardReason === opt ? "rgba(139,92,246,0.1)" : "#0f0f1a",
                    border: `1px solid ${cancelBoardReason === opt ? "rgba(139,92,246,0.4)" : "#1e1e2e"}`,
                  }}>
                    <input type="radio" name="cancelBoardReason" value={opt} checked={cancelBoardReason === opt}
                      onChange={() => setCancelBoardReason(opt)} style={{ accentColor: "#8b5cf6" }} />
                    <span style={{ fontSize: 13, color: "#d1d5db" }}>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Btn secondary small onClick={() => setCancelBoardModal(null)}>不取消了</Btn>
              <button onClick={doCancelMatchedBoard} disabled={!cancelBoardReason || submitting}
                style={{ padding: "6px 18px", borderRadius: 8, border: "none", cursor: cancelBoardReason && !submitting ? "pointer" : "not-allowed",
                  background: cancelBoardReason ? "rgba(239,68,68,0.8)" : "#374151", color: "#fff", fontSize: 13, fontWeight: 600 }}>
                {submitting ? "取消中..." : "确认取消"}
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* 图片灯箱 */}
      {lightboxSrc && <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
    </div>
  )
}

// ── 发布需求 ─────────────────────────────────────────────────
const TAG_OPTIONS = [
  { value: 0, label: "🏠 生活支持", desc: "陪伴就医、育儿协助、接送" },
  { value: 1, label: "💜 情感支持", desc: "倾听陪伴、情绪疏导、危机陪同" },
  { value: 2, label: "🔧 技能技术", desc: "翻译、法律资源、职场辅导" },
  { value: 3, label: "📚 知识教学", desc: "编程、设计、语言学习" },
  { value: 4, label: "🎨 创意协作", desc: "摄影、文案、设计协助" },
]

// ── 需求广场 Mock 服务（带真实图片、定位） ───────────────────
const _p = (seed, w = 400, h = 280) => `https://picsum.photos/seed/${seed}/${w}/${h}`
const MOCK_BOARD_SERVICES = [
  {
    id: "mock-b1", tag: 1, hours: 2, status: 0,
    requester: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    actualRequester: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    provider: "0x0000000000000000000000000000000000000000",
    description: "最近工作压力很大，情绪积压，需要一个温柔的倾听者陪我聊聊，线上视频或面对面均可。",
    datetime: "2026-04-06 19:00",
    lat: 31.232, lng: 121.474,  // 上海静安
    images: [_p("cafe42"), _p("cozy17")], avgScore: 492,
  },
  {
    id: "mock-b2", tag: 0, hours: 3, status: 0,
    requester: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
    actualRequester: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
    provider: "0x0000000000000000000000000000000000000000",
    description: "妈妈需要去医院做复查，路程约 40 分钟，需要有人陪同挂号候诊取报告，全程约 3 小时。",
    datetime: "2026-04-07 09:00",
    lat: 39.908, lng: 116.397,  // 北京西城
    images: [_p("hospital8"), _p("street23")], avgScore: 478,
  },
  {
    id: "mock-b3", tag: 3, hours: 2, status: 0,
    requester: "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
    actualRequester: "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
    provider: "0x0000000000000000000000000000000000000000",
    description: "想系统学习 Python 数据分析，目前零基础，希望能每周安排 2 小时的一对一教学，偏实践向。",
    datetime: "2026-04-08 14:00",
    lat: 23.129, lng: 113.264,  // 广州天河
    images: [_p("laptop55"), _p("study31")], avgScore: 465,
  },
  {
    id: "mock-b4", tag: 4, hours: 4, status: 0,
    requester: "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955",
    actualRequester: "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955",
    provider: "0x0000000000000000000000000000000000000000",
    description: "需要摄影师帮我拍一组户外写真，地点在公园，希望风格自然清新，提供简单修图。",
    datetime: "2026-04-09 10:00",
    lat: 22.541, lng: 114.059,  // 深圳福田
    images: [_p("park77"), _p("photo12"), _p("garden9")], avgScore: 488,
  },
  {
    id: "mock-b5", tag: 2, hours: 1, status: 0,
    requester: "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f",
    actualRequester: "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f",
    provider: "0x0000000000000000000000000000000000000000",
    description: "准备换工作，需要有职场经验的人帮我过一遍简历，重点是科技行业方向，线上沟通即可。",
    datetime: "2026-04-05 20:00",
    lat: 30.572, lng: 104.066,  // 成都高新
    images: [_p("office3"), _p("work88")], avgScore: 450,
  },
]

// ── 排行榜 Mock 数据 ──────────────────────────────────────────
// skills: [倾听者, 就医陪伴, 育儿伙伴, 技能导师, 社区守护者, 危机支持者]
const MOCK_LEADERBOARD = [
  { address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", weeklyHrt: 8,  annualHrt: 156, serviceCount: 48, avgScore: 492, skills: [true,  true,  true,  true,  true,  false] },
  { address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906", weeklyHrt: 6,  annualHrt: 124, serviceCount: 38, avgScore: 478, skills: [true,  true,  false, true,  false, false] },
  { address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", weeklyHrt: 5,  annualHrt: 98,  serviceCount: 31, avgScore: 465, skills: [true,  false, true,  false, true,  false] },
  { address: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc", weeklyHrt: 4,  annualHrt: 87,  serviceCount: 27, avgScore: 488, skills: [false, true,  false, true,  false, true ] },
  { address: "0x976EA74026E726554dB657fA54763abd0C3a0aa9", weeklyHrt: 4,  annualHrt: 76,  serviceCount: 23, avgScore: 471, skills: [true,  false, false, true,  false, false] },
  { address: "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955", weeklyHrt: 3,  annualHrt: 65,  serviceCount: 20, avgScore: 450, skills: [false, true,  true,  false, false, false] },
  { address: "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f", weeklyHrt: 3,  annualHrt: 54,  serviceCount: 17, avgScore: 460, skills: [true,  false, false, false, true,  false] },
  { address: "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720", weeklyHrt: 2,  annualHrt: 43,  serviceCount: 14, avgScore: 445, skills: [false, false, false, true,  false, false] },
  { address: "0xBcd4042DE499D14e55001CcbB24a551F3b954096", weeklyHrt: 2,  annualHrt: 35,  serviceCount: 11, avgScore: 455, skills: [true,  false, false, false, false, false] },
  { address: "0x71bE63f3384f5fb98995898A86B02Fb2426c5788", weeklyHrt: 1,  annualHrt: 22,  serviceCount: 7,  avgScore: 430, skills: [false, false, false, false, false, false] },
]

const MEDAL = ["🥇", "🥈", "🥉"]

function LeaderboardTab({ account, contracts }) {
  const [period, setPeriod] = useState("week")
  const [realData, setRealData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!contracts) return
    async function load() {
      setLoading(true)
      try {
        const events = await contracts.token.queryFilter(contracts.token.filters.ServiceMint())
        const map = {}
        const now = Math.floor(Date.now() / 1000)
        const weekAgo = now - 7 * 24 * 3600
        const yearStart = Math.floor(new Date(new Date().getFullYear(), 0, 1).getTime() / 1000)
        for (const e of events) {
          const block = await e.getBlock()
          const ts = block.timestamp
          const addr = e.args.provider.toLowerCase()
          if (!map[addr]) map[addr] = { address: e.args.provider, weeklyHrt: 0, annualHrt: 0, serviceCount: 0, avgScore: 0 }
          const hrt = Number(ethers.formatEther(e.args.amount))
          if (ts >= weekAgo) map[addr].weeklyHrt += hrt
          if (ts >= yearStart) map[addr].annualHrt += hrt
          map[addr].serviceCount++
        }
        const entries = Object.values(map)
        await Promise.all(entries.map(async entry => {
          try { entry.avgScore = Number(await contracts.reputation.getAvgScore(entry.address)) } catch { }
          try { entry.skills = (await contracts.skillNFT.getSkills(entry.address)).map(Boolean) } catch { }
        }))
        setRealData(entries)
      } catch (e) { console.error(e) }
      setLoading(false)
    }
    load()
  }, [contracts])

  const sorted = useMemo(() => {
    const realAddrs = new Set(realData.map(r => r.address.toLowerCase()))
    const mocks = MOCK_LEADERBOARD.filter(m => !realAddrs.has(m.address.toLowerCase()))
    return [...realData, ...mocks].sort((a, b) =>
      period === "week" ? b.weeklyHrt - a.weeklyHrt : b.annualHrt - a.annualHrt
    )
  }, [realData, period])

  const myAddr = account?.toLowerCase()

  // 我的排名：真实数据找位置，找不到给个 demo mock 排名
  const myRealIdx = myAddr ? sorted.findIndex(e => e.address.toLowerCase() === myAddr) : -1
  const myEntry = myRealIdx >= 0 ? sorted[myRealIdx] : null
  const myMockRank = useMemo(() => {
    if (!myAddr) return null
    // 基于地址哈希生成稳定的随机排名（11-35 之间）
    const hash = parseInt(myAddr.slice(2, 8), 16)
    return 11 + (hash % 25)
  }, [myAddr])

  return (
    <div>
      {/* 切换周期 */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[["week", "本周贡献"], ["year", "全年贡献"]].map(([id, label]) => (
          <button key={id} onClick={() => setPeriod(id)} style={{
            padding: "7px 20px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: id === period ? 700 : 400,
            background: id === period ? "rgba(139,92,246,0.3)" : "#1f1f2e",
            color: id === period ? "#c4b5fd" : "#6b7280",
          }}>{label}</button>
        ))}
      </div>

      {/* 我的排名卡片 */}
      {account && (
        <div style={{
          background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(236,72,153,0.15))",
          border: "1px solid rgba(139,92,246,0.5)", borderRadius: 14,
          padding: "16px 20px", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#c4b5fd", minWidth: 48, textAlign: "center" }}>
            #{myRealIdx >= 0 ? myRealIdx + 1 : myMockRank}
          </div>
          <div style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
            background: `hsl(${parseInt(account.slice(2, 8), 16) % 360},60%,45%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, fontWeight: 700, color: "#fff" }}>
            {account.slice(2, 4).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span style={{ fontFamily: "monospace", fontSize: 13, color: "#c4b5fd" }}>
                {account.slice(0, 10)}...{account.slice(-8)}
              </span>
              <span style={{ fontSize: 10, background: "rgba(139,92,246,0.3)", color: "#c4b5fd", borderRadius: 6, padding: "2px 6px" }}>我</span>
            </div>
            <div style={{ fontSize: 12, color: "#9ca3af" }}>
              完成 {myEntry?.serviceCount ?? 12} 次 · 均分 {myEntry?.avgScore > 0 ? (myEntry.avgScore / 100).toFixed(2) : "4.62"}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 22, fontWeight: 800,
              background: "linear-gradient(135deg, #c4b5fd, #f9a8d4)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {myEntry ? (period === "week" ? myEntry.weeklyHrt : myEntry.annualHrt) : (period === "week" ? 3 : 47)} <span style={{ fontSize: 13 }}>HRT</span>
            </div>
            <div style={{ fontSize: 11, color: "#6b7280" }}>{period === "week" ? "本周贡献" : "今年贡献"}</div>
          </div>
        </div>
      )}

      {loading && <div style={{ color: "#6b7280", textAlign: "center", padding: 20 }}>加载链上数据...</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sorted.map((entry, i) => {
          const isSelf = entry.address.toLowerCase() === myAddr
          const hrt = period === "week" ? entry.weeklyHrt : entry.annualHrt
          const isReal = realData.some(r => r.address.toLowerCase() === entry.address.toLowerCase())
          return (
            <div key={entry.address} style={{
              background: isSelf ? "rgba(139,92,246,0.12)" : "#1f1f2e",
              border: `1px solid ${isSelf ? "rgba(139,92,246,0.4)" : "#2d2d3d"}`,
              borderRadius: 12, padding: "14px 20px",
              display: "flex", alignItems: "center", gap: 14,
            }}>
              {/* 排名 */}
              <div style={{ width: 36, textAlign: "center", fontSize: i < 3 ? 22 : 14, fontWeight: 800,
                color: i < 3 ? undefined : "#4b5563", flexShrink: 0 }}>
                {i < 3 ? MEDAL[i] : `#${i + 1}`}
              </div>

              {/* 头像 */}
              <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                background: `hsl(${parseInt(entry.address.slice(2, 8), 16) % 360},60%,45%)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 700, color: "#fff" }}>
                {entry.address.slice(2, 4).toUpperCase()}
              </div>

              {/* 地址 + 标签 + 徽章 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <span style={{ fontFamily: "monospace", fontSize: 13, color: isSelf ? "#c4b5fd" : "#e5e7eb" }}>
                    {entry.address.slice(0, 8)}...{entry.address.slice(-6)}
                  </span>
                  {isSelf && <span style={{ fontSize: 10, background: "rgba(139,92,246,0.25)", color: "#c4b5fd", borderRadius: 6, padding: "2px 6px" }}>你</span>}
                  {!isReal && <span style={{ fontSize: 10, color: "#4b5563", borderRadius: 6, padding: "2px 6px", border: "1px solid #2d2d3d" }}>样本</span>}
                </div>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: entry.skills?.some(Boolean) ? 6 : 0 }}>
                  完成 {entry.serviceCount} 次 · 均分 {entry.avgScore > 0 ? (entry.avgScore / 100).toFixed(2) : "—"}
                </div>
                {entry.skills?.some(Boolean) && (
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {entry.skills.map((has, i) => has ? (
                      <span key={i} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "rgba(139,92,246,0.15)", color: "#c4b5fd", border: "1px solid rgba(139,92,246,0.25)" }}>
                        {SKILL_EMOJIS[i]} {SKILL_NAMES[i]}
                      </span>
                    ) : null)}
                  </div>
                )}
              </div>

              {/* HRT */}
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 20, fontWeight: 800,
                  background: "linear-gradient(135deg, #c4b5fd, #f9a8d4)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {hrt} <span style={{ fontSize: 13 }}>HRT</span>
                </div>
                <div style={{ fontSize: 11, color: "#4b5563" }}>{period === "week" ? "本周" : "今年"}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ fontSize: 12, color: "#374151", textAlign: "center", marginTop: 20 }}>
        标有"样本"的为演示数据 · 真实链上数据自动排在前面
      </div>
    </div>
  )
}

function PostTab({ contracts, toast, onPosted, onGoToBoard, userLocation }) {
  const [tag, setTag] = useState(0)
  const [hours, setHours] = useState(1)
  const [anonymous, setAnonymous] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [location, setLocation] = useState(null)
  const [showMapPicker, setShowMapPicker] = useState(false)
  const [nearbyCount, setNearbyCount] = useState(0)
  const [description, setDescription] = useState("")
  const [datetime, setDatetime] = useState("")
  const [images, setImages] = useState([]) // { file, previewUrl }[]
  const [uploadProgress, setUploadProgress] = useState("")
  const [successModal, setSuccessModal] = useState(false)

  // 统计 5km 内在线人数
  useEffect(() => {
    const base = userLocation || location
    if (!base) return
    const unsub = subscribeLocations((users) => {
      const count = users.filter(u => haversine(base.lat, base.lng, u.lat, u.lng) <= 5).length
      setNearbyCount(count)
    })
    return () => unsub()
  }, [userLocation, location])

  function handleImageSelect(e) {
    const files = Array.from(e.target.files).slice(0, 4 - images.length)
    const newImgs = files.map(file => ({ file, previewUrl: URL.createObjectURL(file) }))
    setImages(prev => [...prev, ...newImgs].slice(0, 4))
    e.target.value = ""
  }

  function removeImage(idx) {
    setImages(prev => {
      URL.revokeObjectURL(prev[idx].previewUrl)
      return prev.filter((_, i) => i !== idx)
    })
  }

  async function handlePost() {
    if (!contracts) return
    setSubmitting(true)
    try {
      const receipt = await (await contracts.service.postService(tag, Math.round(hours * 10), anonymous)).wait()
      const event = receipt.logs.find(l => {
        try { return contracts.service.interface.parseLog(l).name === "ServicePosted" } catch { return false }
      })
      if (event) {
        const parsed = contracts.service.interface.parseLog(event)
        const serviceId = parsed.args[0]
        if (location) await saveServiceLocation(serviceId, location.lat, location.lng).catch(() => {})
        if (description || datetime) await saveServiceDetail(serviceId, { description, datetime }).catch(() => {})
        // 上传图片
        if (images.length > 0) {
          setUploadProgress("压缩图片中...")
          const base64List = []
          for (let i = 0; i < images.length; i++) {
            setUploadProgress(`处理图片 ${i + 1}/${images.length}...`)
            const b64 = await compressImageToBase64(images[i].file)
            base64List.push(b64)
          }
          await saveServiceImages(serviceId, base64List).catch(() => {})
          setUploadProgress("")
        }
      }
      setImages([])
      setSuccessModal(true)
    } catch (e) { toast((e.reason || e.message), "error") }
    setSubmitting(false)
    setUploadProgress("")
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
      {/* 左栏：表单 */}
      <Card>
        <div style={{ fontWeight: 700, color: "#e5e7eb", fontSize: 16, marginBottom: 20 }}>发布服务需求</div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 10 }}>服务类型</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {TAG_OPTIONS.map(opt => (
              <div key={opt.value} onClick={() => setTag(opt.value)} style={{
                padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                background: tag === opt.value ? "rgba(139,92,246,0.2)" : "#0f0f1a",
                border: `1px solid ${tag === opt.value ? "#8b5cf6" : "#2d2d3d"}`,
              }}>
                <div style={{ fontWeight: 600, color: tag === opt.value ? "#c4b5fd" : "#9ca3af", fontSize: 14 }}>{opt.label}</div>
                <div style={{ fontSize: 12, color: "#4b5563", marginTop: 2 }}>{opt.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>预计时长（小时，支持 0.5 步进）</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setHours(h => Math.max(0.5, Math.round((h - 0.5) * 10) / 10))}
              style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid #2d2d3d", background: "#0f0f1a", color: "#e5e7eb", fontSize: 20, cursor: "pointer", flexShrink: 0 }}>−</button>
            <input type="number" min={0.5} max={24} step={0.5} value={hours}
              onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v) && v >= 0.5 && v <= 24) setHours(Math.round(v * 10) / 10) }}
              style={{ flex: 1, background: "#0f0f1a", border: "1px solid #2d2d3d", borderRadius: 8, padding: "10px 14px", color: "#e5e7eb", fontSize: 16, fontWeight: 700, textAlign: "center", boxSizing: "border-box" }} />
            <button onClick={() => setHours(h => Math.min(24, Math.round((h + 0.5) * 10) / 10))}
              style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid #2d2d3d", background: "#0f0f1a", color: "#e5e7eb", fontSize: 20, cursor: "pointer", flexShrink: 0 }}>+</button>
            <span style={{ fontSize: 13, color: "#6b7280", flexShrink: 0 }}>= {hours} HRT</span>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>需求说明（可选）</div>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            rows={3} placeholder="描述你的具体需求，比如：需要陪同去医院复诊，地点浦东新区..."
            style={{ width: "100%", background: "#0f0f1a", border: "1px solid #2d2d3d", borderRadius: 8, padding: "10px 14px", color: "#e5e7eb", fontSize: 13, resize: "vertical", boxSizing: "border-box" }} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>期望时间（可选）</div>
          <input type="datetime-local" value={datetime} onChange={e => setDatetime(e.target.value)}
            style={{ width: "100%", background: "#0f0f1a", border: "1px solid #2d2d3d", borderRadius: 8, padding: "10px 14px", color: "#e5e7eb", fontSize: 13, boxSizing: "border-box", colorScheme: "dark" }} />
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, cursor: "pointer" }}>
          <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} />
          <span style={{ fontSize: 13, color: "#9ca3af" }}>匿名发布（对外隐藏钱包地址）</span>
        </label>

        {/* 位置 */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>见面地点（可选）</div>
          {location ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 8, padding: "10px 14px" }}>
              <span style={{ fontSize: 13, color: "#c4b5fd" }}>📍 已选定见面地点</span>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setShowMapPicker(true)} style={{ background: "none", border: "none", color: "#8b5cf6", cursor: "pointer", fontSize: 12 }}>重新选择</button>
                <button onClick={() => setLocation(null)} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 12 }}>✕ 清除</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowMapPicker(true)} style={{
              width: "100%", background: "#0f0f1a", border: "1px dashed #4c1d95",
              borderRadius: 8, padding: "10px 14px", color: "#8b5cf6",
              fontSize: 13, cursor: "pointer", textAlign: "left",
            }}>
              🗺 点击在地图上选择见面地点
            </button>
          )}
          {(userLocation || location) && nearbyCount > 0 && (
            <div style={{ marginTop: 8, fontSize: 12, color: "#34d399" }}>
              ✓ 5km 内有 <strong>{nearbyCount}</strong> 名成员在线，可能帮助你
            </div>
          )}

          {showMapPicker && (
            <MapPicker
              onConfirm={(loc) => { setLocation(loc); setShowMapPicker(false) }}
              onCancel={() => setShowMapPicker(false)}
            />
          )}
        </div>

        {/* 图片上传 */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>
            现场图片（最多 4 张，链下存储）
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {images.map((img, idx) => (
              <div key={idx} style={{ position: "relative", width: 72, height: 72 }}>
                <img src={img.previewUrl} alt="" style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8, border: "1px solid #2d2d3d" }} />
                <button onClick={() => removeImage(idx)} style={{
                  position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%",
                  background: "#ef4444", border: "none", color: "#fff", fontSize: 11, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
                }}>✕</button>
              </div>
            ))}
            {images.length < 4 && (
              <label style={{
                width: 72, height: 72, borderRadius: 8, border: "1px dashed #4c1d95",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#8b5cf6", fontSize: 11, gap: 4,
              }}>
                <span style={{ fontSize: 22 }}>+</span>
                <span>添加图片</span>
                <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleImageSelect} />
              </label>
            )}
          </div>
        </div>

        <Btn onClick={handlePost} disabled={submitting}>
          {submitting ? (uploadProgress || "发布中...") : `发布需求（消耗 ${hours} HRT）`}
        </Btn>
      </Card>

      {/* 右栏：预览 + 说明 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card>
          {/* 标题行 */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontWeight: 700, color: "#e5e7eb", fontSize: 15 }}>发布预览</div>
            <div style={{ fontSize: 11, color: "#4b5563", background: "#0f0f1a", borderRadius: 6, padding: "3px 8px" }}>实时预览</div>
          </div>

          {/* 头部：类型 + 时长 + 状态 */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 14, borderBottom: "1px solid #2d2d3d", marginBottom: 14 }}>
            <span style={{ fontSize: 36 }}>{TAG_OPTIONS[tag]?.label.split(" ")[0]}</span>
            <div>
              <div style={{ fontWeight: 700, color: "#e5e7eb", fontSize: 17 }}>{TAG_OPTIONS[tag]?.label.slice(3)}</div>
              <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
                {hours} 小时 · <span style={{ color: "#c4b5fd" }}>待接单</span> · {anonymous ? "匿名" : "公开"}
              </div>
            </div>
          </div>

          {/* 需求说明 */}
          {description ? (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 5 }}>需求说明</div>
              <div style={{ fontSize: 13, color: "#d1d5db", lineHeight: 1.6, background: "#0f0f1a", borderRadius: 8, padding: "10px 12px" }}>
                {description}
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: 12, fontSize: 13, color: "#374151", background: "#0f0f1a", borderRadius: 8, padding: "10px 12px", fontStyle: "italic" }}>
              暂无需求说明
            </div>
          )}

          {/* 期望时间 */}
          {datetime ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#c4b5fd", marginBottom: 12 }}>
              <span>🕐</span>
              <span>{new Date(datetime).toLocaleString("zh-CN", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          ) : (
            <div style={{ fontSize: 12, color: "#374151", marginBottom: 12 }}>🕐 未设置期望时间</div>
          )}

          {/* 见面地点 */}
          {location ? (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}>见面地点</div>
              <div style={{ borderRadius: 10, overflow: "hidden", height: 180 }}>
                <MapContainer center={[location.lat, location.lng]} zoom={14} style={{ width: "100%", height: "100%" }} zoomControl={false}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                  <CircleMarker center={[location.lat, location.lng]} radius={10}
                    pathOptions={{ color: "#8b5cf6", fillColor: "#8b5cf6", fillOpacity: 0.9, weight: 2 }} />
                  {userLocation && (
                    <CircleMarker center={[userLocation.lat, userLocation.lng]} radius={7}
                      pathOptions={{ color: "#ec4899", fillColor: "#ec4899", fillOpacity: 0.7, weight: 2 }} />
                  )}
                </MapContainer>
              </div>
              {userLocation && (
                <div style={{ fontSize: 11, color: "#4b5563", marginTop: 5, textAlign: "center" }}>
                  紫点：见面地点 · 粉点：你的位置
                </div>
              )}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: "#374151", background: "#0f0f1a", borderRadius: 8, padding: "10px 12px", marginBottom: 12, textAlign: "center" }}>
              📍 未选择见面地点
            </div>
          )}

          {/* 图片预览 */}
          {images.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}>现场图片</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {images.map((img, i) => (
                  <img key={i} src={img.previewUrl} alt="" style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8, border: "1px solid #2d2d3d" }} />
                ))}
              </div>
            </div>
          )}

          {/* HRT 消耗 */}
          <div style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>
            发布将消耗 <span style={{ color: "#c4b5fd", fontWeight: 700 }}>{hours} HRT</span>，服务完成后转给服务方
          </div>
        </Card>

        <Card>
          <div style={{ fontWeight: 700, color: "#e5e7eb", marginBottom: 12 }}>发布说明</div>
          {[
            ["01", "发布需求", "选择类型、时长，声誉高的成员优先展示"],
            ["02", "双方确认", "服务方接单并完成后，双方各自确认"],
            ["03", "Token 结算", "合约自动 burn 你的 HRT，mint 给服务方"],
            ["04", "双盲评分", "双方各自打分，都提交后同时公开"],
          ].map(([num, title, desc]) => (
            <div key={num} style={{ display: "flex", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(139,92,246,0.3)", color: "#c4b5fd", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>{num}</div>
              <div>
                <div style={{ fontWeight: 600, color: "#e5e7eb", fontSize: 13 }}>{title}</div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{desc}</div>
              </div>
            </div>
          ))}
        </Card>

        {anonymous && (
          <div style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#9ca3af" }}>
            💜 匿名模式：链上只记录匿名 ID，适合情感支持、家暴相关等敏感需求
          </div>
        )}
      </div>

      {/* 发布成功弹窗 */}
      {successModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ background: "#1f1f2e", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 20, padding: "40px 36px", textAlign: "center", width: 360, maxWidth: "92vw" }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#e5e7eb", marginBottom: 10 }}>需求发布成功！</div>
            <div style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7, marginBottom: 28 }}>
              你的需求已上链，{images.length > 0 ? "照片也已上传，" : ""}附近的成员将会看到它。
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={() => { setSuccessModal(false); onGoToBoard() }} style={{
                background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
                color: "#fff", border: "none", borderRadius: 12,
                padding: "14px 0", fontSize: 15, fontWeight: 700, cursor: "pointer", width: "100%",
              }}>去需求广场看看 →</button>
              <button onClick={() => { setSuccessModal(false); setDescription(""); setDatetime(""); setLocation(null); setTag(0); setHours(1) }} style={{
                background: "transparent", color: "#6b7280", border: "1px solid #2d2d3d",
                borderRadius: 12, padding: "12px 0", fontSize: 14, cursor: "pointer", width: "100%",
              }}>继续发布新需求</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Demo 主页 ────────────────────────────────────────────────
export default function DemoPage({ onBack, onOpenMap }) {
  useEffect(() => { window.scrollTo(0, 0) }, [])
  const [account, setAccount] = useState("")
  const [contracts, setContracts] = useState(null)
  const [registered, setRegistered] = useState(false)
  const [invited, setInvited] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [tab, setTab] = useState("profile")
  const [pendingServiceId, setPendingServiceId] = useState(null)
  const [toasts, setToasts] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  // 通知
  const [notifications, setNotifications] = useState([])
  const [showNotifs, setShowNotifs] = useState(false)
  // 邀请好友弹窗
  const [inviteModal, setInviteModal] = useState(false)
  const [inviteTarget, setInviteTarget] = useState("")
  const [inviting, setInviting] = useState(false)

  function toast(text, type = "info") {
    setToasts(t => [...t, { text, type }])
    setTimeout(() => setToasts(t => t.filter((_, i) => i !== 0)), 4000)
  }

  async function connectWithAddress(provider, addr) {
    const signer = await provider.getSigner(addr)
    const c = await getContracts(signer)
    setAccount(addr)
    setContracts(c)
    const [reg, inv] = await Promise.all([
      c.token.registered(addr),
      c.service.isInvited(addr),
    ])
    setRegistered(reg)
    setInvited(inv)
    setUserLocation(null)
    reportLocation(addr).then(loc => { if (loc) setUserLocation(loc) }).catch(() => {})
  }

  // 订阅通知
  useEffect(() => {
    if (!account) { setNotifications([]); return }
    const unsub = subscribeNotifications(account, setNotifications)
    return () => unsub()
  }, [account])

  async function connect() {
    if (!window.ethereum) return toast("请先安装 MetaMask 或 Core Wallet", "error")
    try {
      const { ethers } = await import("ethers")
      // 强制弹出 MetaMask 账户选择器，不会被缓存跳过
      await window.ethereum.request({ method: "wallet_requestPermissions", params: [{ eth_accounts: {} }] })
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send("eth_requestAccounts", [])
      const addr = ethers.getAddress(accounts[0])
      await connectWithAddress(provider, addr)

      // 切换账户：直接更新 state，不重载页面
      window.ethereum.removeAllListeners("accountsChanged")
      window.ethereum.on("accountsChanged", async (accounts) => {
        if (accounts.length === 0) {
          setAccount(""); setContracts(null); setRegistered(false); setUserLocation(null)
        } else {
          try {
            const p = new ethers.BrowserProvider(window.ethereum)
            await connectWithAddress(p, ethers.getAddress(accounts[0]))
            toast("已切换账户")
          } catch (e) { toast(e.message, "error") }
        }
      })
      window.ethereum.on("chainChanged", () => window.location.reload())
    } catch (e) { toast(e.message, "error") }
  }

  async function register() {
    setRegistering(true)
    try {
      await (await contracts.service.register()).wait()
      setRegistered(true)
      setInvited(true)
      setTab("profile")
      toast("注册成功！已获得 2 HRT 启动资金")
    } catch (e) { toast((e.reason || e.message), "error") }
    setRegistering(false)
  }

  async function sendInvite() {
    if (!inviteTarget.trim()) return
    setInviting(true)
    try {
      const addr = ethers.getAddress(inviteTarget.trim())
      await (await contracts.service.invite(addr)).wait()
      toast(`已邀请 ${addr.slice(0, 8)}...，对方现在可以注册了`)
      setInviteModal(false); setInviteTarget("")
    } catch (e) { toast(e.reason || e.message || "地址格式不正确", "error") }
    setInviting(false)
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", color: "#f1f1f1" }}>
      {/* 顶栏 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", borderBottom: "1px solid #1f1f2e" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 14 }}>← 返回</button>
          <span style={{ fontWeight: 700, fontSize: 18, background: "linear-gradient(135deg, #c4b5fd, #f9a8d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            HerTime
          </span>
        </div>
        {account ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 13, color: "#6b7280", fontFamily: "monospace" }}>
              {account.slice(0, 6)}...{account.slice(-4)}
            </div>
            {/* 通知铃铛 */}
            <div style={{ position: "relative" }}>
              <button onClick={() => {
                setShowNotifs(v => !v)
                if (unreadCount > 0) markNotificationsRead(account).catch(() => {})
              }} style={{
                background: "none", border: "1px solid #2d2d3d", borderRadius: 8, padding: "5px 10px",
                color: unreadCount > 0 ? "#c4b5fd" : "#6b7280", cursor: "pointer", fontSize: 16, position: "relative",
              }}>
                🔔
                {unreadCount > 0 && (
                  <span style={{
                    position: "absolute", top: -6, right: -6, background: "#ec4899", color: "#fff",
                    borderRadius: "50%", width: 16, height: 16, fontSize: 10, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{unreadCount > 9 ? "9+" : unreadCount}</span>
                )}
              </button>
              {showNotifs && <NotificationPanel notifications={notifications} onClose={() => setShowNotifs(false)}
                onNotifClick={serviceId => { setTab("profile"); setPendingServiceId(serviceId); setShowNotifs(false) }} />}
            </div>
            {registered && <Btn small secondary onClick={() => setInviteModal(true)}>邀请好友</Btn>}
            <Btn small secondary onClick={() => onOpenMap(account)}>🗺 地图</Btn>
            <Btn small secondary onClick={() => { removeLocation(account).catch(()=>{}); setAccount(""); setContracts(null); setRegistered(false); setInvited(false); onBack() }}>退出</Btn>
          </div>
        ) : null}
      </div>

      {/* 未连接：首页 */}
      {!account && (
        <div style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
          {/* Hero */}
          <div style={{ textAlign: "center", padding: "80px 24px 64px", maxWidth: 720, margin: "0 auto" }}>
            <div style={{ display: "inline-block", background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.35)", color: "#c4b5fd", padding: "5px 16px", borderRadius: 20, fontSize: 13, marginBottom: 28 }}>
              Avalanche · Solidity · Web3
            </div>
            <h1 style={{ fontSize: 56, fontWeight: 800, margin: "0 0 16px", background: "linear-gradient(135deg, #c4b5fd, #f9a8d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.1 }}>
              女性互助时间银行
            </h1>
            <p style={{ fontSize: 18, color: "#9ca3af", margin: "0 0 48px", lineHeight: 1.6 }}>
              每一小时的互助，都永久记录在链上。<br />平台停运，贡献永不消失。
            </p>
            <button onClick={connect} style={{
              background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
              color: "#fff", border: "none", borderRadius: 12,
              padding: "16px 48px", fontSize: 18, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 4px 24px rgba(139,92,246,0.4)",
            }}>
              连接 MetaMask 参与
            </button>
            <p style={{ fontSize: 13, color: "#4b5563", marginTop: 12 }}>
              支持 Hardhat 本地节点（chainId 31337）· Avalanche Fuji 测试网（43113）
            </p>
          </div>

          {/* 统计数字 */}
          <div style={{ background: "rgba(139,92,246,0.06)", borderTop: "1px solid #1f1f2e", borderBottom: "1px solid #1f1f2e", padding: "40px 24px" }}>
            <div style={{ maxWidth: 800, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0 }}>
              {[
                { num: "32,344", label: "注册成员", sub: "来自全国各地" },
                { num: "2,144,568", label: "服务小时", sub: "累计互助时长" },
                { num: "98.7%", label: "好评率", sub: "基于链上双盲评分" },
              ].map((item, i) => (
                <div key={i} style={{ textAlign: "center", padding: "0 24px", borderRight: i < 2 ? "1px solid #2d2d3d" : "none" }}>
                  <div style={{ fontSize: 44, fontWeight: 800, background: "linear-gradient(135deg, #c4b5fd, #f9a8d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    {item.num}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "#e5e7eb", marginTop: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>{item.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 服务类型 */}
          <div style={{ maxWidth: 900, margin: "0 auto", padding: "56px 24px" }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "#e5e7eb", textAlign: "center", marginBottom: 32 }}>五大互助类型</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
              {[
                { icon: "🏠", name: "生活支持", desc: "陪伴就医\n育儿协助" },
                { icon: "💜", name: "情感支持", desc: "倾听陪伴\n情绪疏导" },
                { icon: "🔧", name: "技能技术", desc: "翻译法律\n职场辅导" },
                { icon: "📚", name: "知识教学", desc: "编程设计\n语言学习" },
                { icon: "🎨", name: "创意协作", desc: "摄影剪辑\n文字策划" },
              ].map((item) => (
                <div key={item.name} style={{ background: "#1f1f2e", border: "1px solid #2d2d3d", borderRadius: 12, padding: "20px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>{item.icon}</div>
                  <div style={{ fontWeight: 700, color: "#e5e7eb", fontSize: 14, marginBottom: 6 }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6, whiteSpace: "pre-line" }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 技能徽章预览 */}
          <div style={{ background: "#1a1a2e", borderTop: "1px solid #1f1f2e", borderBottom: "1px solid #1f1f2e", padding: "48px 24px" }}>
            <div style={{ maxWidth: 900, margin: "0 auto" }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: "#e5e7eb", textAlign: "center", marginBottom: 8 }}>技能徽章 NFT</h2>
              <p style={{ fontSize: 14, color: "#6b7280", textAlign: "center", marginBottom: 32 }}>根据链上服务记录自动颁发 · Soulbound · 不可转让 · 平台停运后永久存续</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 }}>
                {[
                  { icon: "👂", name: "倾听者" },
                  { icon: "🏥", name: "就医陪伴" },
                  { icon: "👶", name: "育儿伙伴" },
                  { icon: "📚", name: "技能导师" },
                  { icon: "🛡️", name: "社区守护者" },
                  { icon: "🆘", name: "危机支持者" },
                ].map((b) => (
                  <div key={b.name} style={{ background: "#0f0f1a", border: "1px solid #2d2d3d", borderRadius: 10, padding: "16px 8px", textAlign: "center" }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{b.icon}</div>
                    <div style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600 }}>{b.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 底部留白 */}
          <div style={{ padding: "48px 0" }} />
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 40px" }}>

        {account && !registered && invited && (
          <div style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 10, padding: "14px 18px", color: "#fbbf24", fontSize: 14, marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>你已获得邀请！注册可获得 <strong>2 HRT</strong> 启动资金</span>
            <Btn small onClick={register} disabled={registering}>
              {registering ? "注册中..." : "立即注册"}
            </Btn>
          </div>
        )}
        {account && !registered && !invited && (
          <div style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: 10, padding: "14px 18px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ color: "#c4b5fd", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>HerTime 采用邀请制</div>
              <div style={{ color: "#6b7280", fontSize: 13 }}>需要已注册成员邀请你才能加入。把你的钱包地址发给认识的成员，请她邀请你。</div>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(account); toast("地址已复制") }} style={{
              background: "#1f1f2e", border: "1px solid #2d2d3d", borderRadius: 8, padding: "8px 14px",
              color: "#9ca3af", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
            }}>复制地址</button>
          </div>
        )}

        {account && (
          <>
            <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid #1f1f2e", paddingBottom: 0 }}>
              {[["profile", "我的主页"], ["board", "需求广场"], ["post", "发布需求"], ["rank", "排行榜"]].map(([id, label]) => (
                <Tab key={id} label={label} active={tab === id} onClick={() => setTab(id)} />
              ))}
            </div>

            {tab === "profile" && <ProfileTab key={tab + account} account={account} contracts={contracts} toast={toast} registered={registered}
              pendingServiceId={pendingServiceId} onPendingClear={() => setPendingServiceId(null)} />}
            {tab === "board" && <BoardTab account={account} contracts={contracts} toast={toast} userLocation={userLocation} />}
            {tab === "post" && <PostTab contracts={contracts} toast={toast} onPosted={() => setTab("board")} onGoToBoard={() => setTab("board")} userLocation={userLocation} />}
            {tab === "rank" && <LeaderboardTab account={account} contracts={contracts} />}
          </>
        )}
      </div>

      {/* 邀请好友弹窗 */}
      {inviteModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}
          onClick={() => setInviteModal(false)}>
          <Card style={{ width: 420, maxWidth: "92vw" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 700, color: "#e5e7eb", fontSize: 16, marginBottom: 6 }}>邀请好友加入 HerTime</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>
              输入对方的钱包地址，链上邀请后她即可注册并获得 2 HRT 启动资金。
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 8 }}>对方钱包地址</div>
              <input
                value={inviteTarget}
                onChange={e => setInviteTarget(e.target.value)}
                placeholder="0x..."
                style={{ width: "100%", background: "#0f0f1a", border: "1px solid #2d2d3d", borderRadius: 8, padding: "10px 12px", color: "#e5e7eb", fontSize: 13, fontFamily: "monospace", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#9ca3af", marginBottom: 20 }}>
              💡 你也可以复制自己的地址分享给朋友，让她把地址告诉你后再邀请：
              <div style={{ fontFamily: "monospace", color: "#c4b5fd", marginTop: 6, fontSize: 11 }}>{account}</div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Btn secondary small onClick={() => setInviteModal(false)}>取消</Btn>
              <Btn small onClick={sendInvite} disabled={inviting || !inviteTarget.trim()}>
                {inviting ? "邀请中..." : "确认邀请"}
              </Btn>
            </div>
          </Card>
        </div>
      )}

      <Toast messages={toasts} />
    </div>
  )
}
