export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=zh`
    );
    const data = await res.json();
    return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

export function generateShareData(lat: number, lng: number, address: string) {
  const mapLink = `https://maps.google.com/?q=${lat},${lng}`;
  const text = `[紧急求救] 我遇到危险！位置：${address} 地图：${mapLink} 时间：${new Date().toLocaleString("zh-CN")}`;
  const whatsappLink = `https://wa.me/?text=${encodeURIComponent(text)}`;
  const smsBody = encodeURIComponent(text);
  return { mapLink, text, whatsappLink, smsBody };
}
