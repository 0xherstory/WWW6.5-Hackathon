import { useEffect, useState } from "react";
import { Contract } from "ethers";
import { Loader2, AlertTriangle, Navigation, ExternalLink } from "lucide-react";

interface MapPageProps {
  contract: Contract | null;
}

interface AlertRecord {
  sosId: number;
  lat: number;
  lng: number;
  timestamp: number;
  caller: string;
}

export default function MapPage({ contract }: MapPageProps) {
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<AlertRecord | null>(null);

  // GPS
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setUserPos([p.coords.latitude, p.coords.longitude]);
        setLoading(false);
      },
      () => setLoading(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Fetch ALL SOS records from contract (no time/active filter) — poll every 15s
  useEffect(() => {
    if (!contract) return;
    let cancelled = false;
    const fetchAlerts = async () => {
      try {
        const total = Number(await contract.getTotalSOSCount());
        const records: AlertRecord[] = [];
        for (let id = 1; id <= total; id++) {
          try {
            const rec = await contract.getSOSRecord(id);
            const lat = Number(rec[1]) / 1_000_000;
            const lng = Number(rec[2]) / 1_000_000;
            if (lat !== 0 || lng !== 0) {
              records.push({ sosId: id, lat, lng, timestamp: Number(rec[3]), caller: rec[0] });
            }
          } catch { /* skip */ }
        }
        if (!cancelled) setAlerts(records);
      } catch { /* ignore */ }
    };
    fetchAlerts();
    const timer = setInterval(fetchAlerts, 15_000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [contract]);

  const lat = userPos?.[0] ?? 39.9042;
  const lng = userPos?.[1] ?? 116.4074;

  // When alert selected, compute bbox that includes BOTH user and alert
  const getBbox = () => {
    if (selectedAlert) {
      const minLat = Math.min(lat, selectedAlert.lat);
      const maxLat = Math.max(lat, selectedAlert.lat);
      const minLng = Math.min(lng, selectedAlert.lng);
      const maxLng = Math.max(lng, selectedAlert.lng);
      const padLat = Math.max((maxLat - minLat) * 0.3, 0.005);
      const padLng = Math.max((maxLng - minLng) * 0.3, 0.005);
      return `${minLng - padLng},${minLat - padLat},${maxLng + padLng},${maxLat + padLat}`;
    }
    const delta = 0.015;
    return `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
  };

  // OSM iframe only supports one marker — always show USER position (blue dot)
  // Alert info is shown via the overlay banner + list
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${getBbox()}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <div className="flex flex-1 flex-col px-4 pb-20">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">附近预警</h2>
        <div className="flex items-center gap-2">
          {selectedAlert && (
            <button
              onClick={() => setSelectedAlert(null)}
              className="rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-medium text-primary transition-colors hover:bg-primary/30"
            >
              ← 回到我的位置
            </button>
          )}
          {alerts.length > 0 && (
            <span className="rounded-full bg-sos/20 px-2.5 py-0.5 text-xs font-bold text-sos">
              {alerts.length} 条活跃求救
            </span>
          )}
        </div>
      </div>

      {/* Map + overlay container */}
      <div className="relative mb-4 overflow-hidden rounded-xl border border-border" style={{ height: "55vh" }}>
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">正在定位...</span>
          </div>
        )}

        <iframe
          title="OpenStreetMap"
          src={mapUrl}
          className="h-full w-full border-0"
          style={{ filter: "invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%)" }}
          loading="lazy"
        />

        {/* Selected alert info banner */}
        {selectedAlert && (
          <div className="absolute inset-x-0 top-3 z-10 flex justify-center">
            <div className="flex items-center gap-3 rounded-lg border border-sos/30 bg-background/90 px-4 py-2.5 shadow-lg backdrop-blur">
              <span className="relative flex h-3 w-3">
                <span className="absolute inset-0 animate-ping rounded-full bg-sos/60" />
                <span className="relative h-3 w-3 rounded-full bg-sos" />
              </span>
              <div>
                <p className="text-sm font-bold text-sos">⚠️ 紧急预警 #{selectedAlert.sosId}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {selectedAlert.lat.toFixed(6)}, {selectedAlert.lng.toFixed(6)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-3 left-3 z-10 flex flex-col gap-1.5 rounded-lg bg-background/80 px-3 py-2 text-xs backdrop-blur">
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full border-2 border-blue-400 bg-blue-500 shadow-[0_0_6px_1px_rgba(59,130,246,0.5)]" />
            <span className="text-muted-foreground">我的位置</span>
          </div>
          {alerts.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="relative inline-block h-3 w-3">
                <span className="absolute inset-0 animate-ping rounded-full bg-sos/60" />
                <span className="relative inline-block h-3 w-3 rounded-full border-2 border-white bg-sos shadow-[0_0_6px_1px_rgba(220,38,38,0.5)]" />
              </span>
              <span className="text-muted-foreground">求救点</span>
            </div>
          )}
        </div>
      </div>

      {/* Floating alert list */}
      {alerts.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">点击可跳转到求救位置 ↓</p>
          {alerts.map((a) => {
            const isActive = selectedAlert?.sosId === a.sosId;
            return (
              <button
                key={a.sosId}
                onClick={() => setSelectedAlert(isActive ? null : a)}
                className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                  isActive
                    ? "border-sos bg-sos/10 shadow-[0_0_12px_2px_rgba(220,38,38,0.2)]"
                    : "border-border bg-card hover:bg-accent"
                }`}
              >
                <div className="relative">
                  <AlertTriangle className={`h-5 w-5 shrink-0 ${isActive ? "text-sos" : "text-sos/70"}`} />
                  <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-pulse rounded-full bg-sos" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">SOS 求救 #{a.sosId}</p>
                  <p className="font-mono text-xs text-muted-foreground">{a.lat.toFixed(4)}, {a.lng.toFixed(4)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(a.timestamp * 1000).toLocaleString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {isActive ? (
                    <Navigation className="h-4 w-4 text-sos" />
                  ) : (
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          {contract ? "附近暂无活跃求救信号" : "连接钱包后可查看链上预警"}
        </p>
      )}
    </div>
  );
}
