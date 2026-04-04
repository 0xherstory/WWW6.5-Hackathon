import { useEffect, useState } from "react"
import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents } from "react-leaflet"
import { subscribeLocations } from "../utils/firebase"
import "leaflet/dist/leaflet.css"

function FlyTo({ center }) {
  const map = useMapEvents({})
  useEffect(() => { if (center) map.flyTo(center, 13, { duration: 0.8 }) }, [center])
  return null
}

export default function MapPage({ account, onBack }) {
  const [users, setUsers] = useState([])
  const [userCenter, setUserCenter] = useState(null)

  useEffect(() => {
    const unsub = subscribeLocations(setUsers)
    return () => unsub()
  }, [])

  // 自动定位到用户当前位置
  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserCenter([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { timeout: 6000 }
    )
  }, [])

  const online = users.length
  const others = users.filter(u => u.address.toLowerCase() !== account?.toLowerCase())

  return (
    <div style={{ position: "fixed", inset: 0, background: "#0f0f1a", zIndex: 100 }}>
      {/* 顶栏 */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 60, zIndex: 1000,
        padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(26,26,46,0.95)", borderBottom: "1px solid #2d2d3d",
        backdropFilter: "blur(8px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{
            background: "none", border: "1px solid #4c1d95", color: "#c4b5fd",
            borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 13,
          }}>← 返回</button>
          <span style={{ fontWeight: 700, fontSize: 16, color: "#e5e7eb" }}>附近成员地图</span>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#c4b5fd", lineHeight: 1.2 }}>{online}</div>
            <div style={{ fontSize: 11, color: "#6b7280" }}>在线成员</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#f9a8d4", lineHeight: 1.2 }}>{others.length}</div>
            <div style={{ fontSize: 11, color: "#6b7280" }}>附近可接单</div>
          </div>
        </div>
      </div>

      {/* 地图 */}
      <div style={{ position: "absolute", top: 60, bottom: 0, left: 0, right: 0 }}>
        <MapContainer center={[31.23, 121.47]} zoom={4} style={{ width: "100%", height: "100%" }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <FlyTo center={userCenter} />
          {users.map((u) => {
            const isSelf = u.address.toLowerCase() === account?.toLowerCase()
            return (
              <CircleMarker
                key={u.address}
                center={[u.lat, u.lng]}
                radius={isSelf ? 10 : 7}
                pathOptions={{
                  color: isSelf ? "#8b5cf6" : "#ec4899",
                  fillColor: isSelf ? "#8b5cf6" : "#ec4899",
                  fillOpacity: isSelf ? 0.9 : 0.6,
                  weight: 2,
                }}
              >
                <Popup>
                  <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                    {isSelf
                      ? <><strong>你</strong><br />{u.address.slice(0, 8)}...{u.address.slice(-6)}</>
                      : <>{u.address.slice(0, 8)}...{u.address.slice(-6)}<br /><span style={{ color: "#ec4899" }}>可接单</span></>
                    }
                  </div>
                </Popup>
              </CircleMarker>
            )
          })}
        </MapContainer>

        {/* 图例 */}
        <div style={{
          position: "absolute", bottom: 24, left: 24, zIndex: 1000,
          background: "rgba(26,26,46,0.92)", border: "1px solid #2d2d3d",
          borderRadius: 10, padding: "12px 16px", fontSize: 13,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#8b5cf6" }} />
            <span style={{ color: "#c4b5fd" }}>你的位置</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ec4899", opacity: 0.7 }} />
            <span style={{ color: "#f9a8d4" }}>其他成员（10分钟内在线）</span>
          </div>
        </div>
      </div>
    </div>
  )
}
