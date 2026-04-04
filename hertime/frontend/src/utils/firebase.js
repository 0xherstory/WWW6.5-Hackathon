import { initializeApp } from "firebase/app"
import { getDatabase, ref, set, onValue, remove, push, get, update } from "firebase/database"

const firebaseConfig = {
  apiKey: "AIzaSyB2WLI9Q-d6e2tGo65MNfduQuqT2Z1SGco",
  authDomain: "hertime-5afc5.firebaseapp.com",
  databaseURL: "https://hertime-5afc5-default-rtdb.firebaseio.com",
  projectId: "hertime-5afc5",
  storageBucket: "hertime-5afc5.firebasestorage.app",
  messagingSenderId: "32378310827",
  appId: "1:32378310827:web:848bad1a6cd6e325f3e7ee"
}

const app = initializeApp(firebaseConfig)
const db = getDatabase(app)

// 精度降低到小数点后2位（约1km精度，保护隐私）
function truncate(coord) {
  return Math.round(coord * 100) / 100
}

// 上报位置（连接钱包后调用）
export async function reportLocation(address) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("浏览器不支持定位"))
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const key = address.toLowerCase()
        const lat = truncate(pos.coords.latitude)
        const lng = truncate(pos.coords.longitude)
        await set(ref(db, `locations/${key}`), { address, lat, lng, updatedAt: Date.now() })
        resolve({ lat, lng })
      },
      (err) => reject(new Error("定位失败：" + err.message)),
      { timeout: 8000 }
    )
  })
}

// 删除自己的位置（退出时调用）
export async function removeLocation(address) {
  const key = address.toLowerCase()
  await remove(ref(db, `locations/${key}`))
}

// 监听所有在线用户位置（10分钟内有更新的视为在线）
export function subscribeLocations(callback) {
  const r = ref(db, "locations")
  const ONLINE_THRESHOLD = 10 * 60 * 1000 // 10分钟
  return onValue(r, (snapshot) => {
    const data = snapshot.val() || {}
    const now = Date.now()
    const users = Object.values(data).filter(u => now - u.updatedAt < ONLINE_THRESHOLD)
    callback(users)
  })
}

// 保存服务详情（描述 + 期望时间）
export async function saveServiceDetail(serviceId, detail) {
  const key = serviceId.replace(/^0x/, "")
  await set(ref(db, `service_details/${key}`), detail)
}

// 监听所有服务详情
export function subscribeServiceDetails(callback) {
  return onValue(ref(db, "service_details"), (snapshot) => {
    const data = snapshot.val() || {}
    const result = {}
    for (const [k, v] of Object.entries(data)) result["0x" + k] = v
    callback(result)
  })
}

// 保存服务需求位置（发布后调用，serviceId 为 bytes32 hex 字符串）
export async function saveServiceLocation(serviceId, lat, lng) {
  const key = serviceId.replace(/^0x/, "")
  await set(ref(db, `service_locations/${key}`), {
    lat: truncate(lat),
    lng: truncate(lng),
  })
}

// 一次性读取所有服务位置，返回 { [serviceId]: {lat, lng} }
export function subscribeServiceLocations(callback) {
  return onValue(ref(db, "service_locations"), (snapshot) => {
    const data = snapshot.val() || {}
    // 还原 key 为 0x 格式
    const result = {}
    for (const [k, v] of Object.entries(data)) {
      result["0x" + k] = v
    }
    callback(result)
  })
}

// 保存联系方式（匹配后调用，role: "requester" | "provider"）
export async function saveContact(serviceId, role, contact) {
  const key = serviceId.replace(/^0x/, "")
  await set(ref(db, `contacts/${key}/${role}`), { contact, updatedAt: Date.now() })
}

// 监听某个服务的双方联系方式
export function subscribeContacts(serviceId, callback) {
  const key = serviceId.replace(/^0x/, "")
  return onValue(ref(db, `contacts/${key}`), (snapshot) => {
    callback(snapshot.val() || {})
  })
}

// 在浏览器里压缩图片，返回 base64 字符串（存入 Realtime Database，无需 Storage）
export function compressImageToBase64(file, maxSize = 600, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement("canvas")
      canvas.width = w; canvas.height = h
      canvas.getContext("2d").drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL("image/jpeg", quality))
    }
    img.onerror = reject
    img.src = url
  })
}

// 保存服务图片 URL 列表（追加到现有列表）
export async function saveServiceImages(serviceId, urls) {
  const key = serviceId.replace(/^0x/, "")
  await set(ref(db, `service_images/${key}`), urls)
}

// 监听某个服务的图片列表
export function subscribeServiceImages(serviceId, callback) {
  const key = serviceId.replace(/^0x/, "")
  return onValue(ref(db, `service_images/${key}`), (snapshot) => {
    callback(snapshot.val() || [])
  })
}

// 监听所有服务图片（用于广场批量加载）
export function subscribeAllServiceImages(callback) {
  return onValue(ref(db, "service_images"), (snapshot) => {
    const data = snapshot.val() || {}
    const result = {}
    for (const [k, v] of Object.entries(data)) result["0x" + k] = v
    callback(result)
  })
}

// 保存实际结算时长（发起人在结单时填写，链下记录）
export async function saveActualHours(serviceId, actualHours, note = "") {
  const key = serviceId.replace(/^0x/, "")
  await set(ref(db, `actual_hours/${key}`), { actualHours, note, updatedAt: Date.now() })
}

// 读取实际时长（一次性，用于展示）
export function subscribeActualHours(serviceId, callback) {
  const key = serviceId.replace(/^0x/, "")
  return onValue(ref(db, `actual_hours/${key}`), (snapshot) => {
    callback(snapshot.val() || null)
  })
}

// ── 站内通知 ─────────────────────────────────────────────────

// 推送一条通知给某地址
export async function pushNotification(address, { type, serviceId, message }) {
  if (!address || address === "0x0000000000000000000000000000000000000000") return
  const key = address.toLowerCase()
  const notifRef = push(ref(db, `notifications/${key}`))
  await set(notifRef, { type, serviceId, message, timestamp: Date.now(), read: false })
}

// 订阅某地址的通知列表（按时间倒序）
export function subscribeNotifications(address, callback) {
  if (!address) return () => {}
  const key = address.toLowerCase()
  return onValue(ref(db, `notifications/${key}`), (snapshot) => {
    const data = snapshot.val() || {}
    const list = Object.entries(data)
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.timestamp - a.timestamp)
    callback(list)
  })
}

// 将某地址所有未读通知标为已读
export async function markNotificationsRead(address) {
  if (!address) return
  const key = address.toLowerCase()
  const snap = await get(ref(db, `notifications/${key}`))
  const data = snap.val() || {}
  const updates = {}
  for (const id of Object.keys(data)) {
    if (!data[id].read) updates[`notifications/${key}/${id}/read`] = true
  }
  if (Object.keys(updates).length > 0) await update(ref(db), updates)
}

// ── 评价评论 ─────────────────────────────────────────────────

// 保存评价文字（提交评分时调用）
export async function saveRatingComment(serviceId, raterAddress, comment) {
  if (!comment.trim()) return
  const key = serviceId.replace(/^0x/, "")
  const addr = raterAddress.toLowerCase()
  await set(ref(db, `rating_comments/${key}/${addr}`), { comment, timestamp: Date.now() })
}

// 订阅某服务的评价评论 { [addr]: { comment, timestamp } }
export function subscribeRatingComments(serviceId, callback) {
  const key = serviceId.replace(/^0x/, "")
  return onValue(ref(db, `rating_comments/${key}`), (snapshot) => {
    const data = snapshot.val() || {}
    const result = {}
    for (const [k, v] of Object.entries(data)) result[k] = v
    callback(result)
  })
}

// 保存取消原因（链下记录）
export async function saveCancelReason(serviceId, cancellerAddress, reason) {
  const key = serviceId.replace(/^0x/, "")
  await set(ref(db, `cancel_reasons/${key}`), {
    canceller: cancellerAddress,
    reason,
    timestamp: Date.now(),
  })
}

// ── HRT 转账记录 ──────────────────────────────────────────────

// 保存一条转账记录到某地址的流水（sender 和 receiver 各调用一次）
export async function saveTransferRecord(address, record) {
  const key = address.toLowerCase()
  const r = push(ref(db, `hrt_transfers/${key}`))
  await set(r, { ...record, timestamp: record.timestamp || Date.now() })
}

// 订阅某地址的转账流水
export function subscribeTransferRecords(address, callback) {
  if (!address) return () => {}
  const key = address.toLowerCase()
  return onValue(ref(db, `hrt_transfers/${key}`), (snapshot) => {
    const data = snapshot.val() || {}
    const list = Object.values(data).sort((a, b) => b.timestamp - a.timestamp)
    callback(list)
  })
}

// 订阅取消原因
export function subscribeCancelReason(serviceId, callback) {
  const key = serviceId.replace(/^0x/, "")
  return onValue(ref(db, `cancel_reasons/${key}`), (snapshot) => {
    callback(snapshot.val() || null)
  })
}
