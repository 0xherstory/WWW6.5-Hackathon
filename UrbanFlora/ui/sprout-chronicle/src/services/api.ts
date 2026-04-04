// API 基础地址，本地开发时指向 Java 后端
// 部署时替换为实际后端地址
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

// ============ 类型定义 ============

export interface PlantDTO {
  id: number;
  tokenId: number;
  name: string;
  location: string;
  imageUrl: string;
  owner: string;
  mine: boolean;
  createdAt: string;
}

export interface RecordDTO {
  id: number;
  plantId: number;
  stage: string | null;
  description: string;
  imageUrl: string | null;
  createdAt: string;
}

export interface CreatePlantPayload {
  tokenId: string;
  name: string;
  location: string;
  imageUrl: string;
}

export interface CreateRecordPayload {
  plantId: string;
  stage: string;
  description: string;
}

// ============ API 调用 ============

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json: ApiResponse<T> = await res.json();
  if (json.code !== 0) throw new Error(json.message || '请求失败');
  return json.data;
}

function walletHeaders(address: string): HeadersInit {
  return { 'X-Wallet-Address': address };
}

/** 获取植物列表 */
export async function fetchPlants(address: string): Promise<PlantDTO[]> {
  return request<PlantDTO[]>('/plants/list', {
    headers: walletHeaders(address),
  });
}

/** 上传图片，返回图片 URL */
export async function uploadImage(address: string, file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  return request<string>('/upload', {
    method: 'POST',
    headers: walletHeaders(address),
    body: formData,
  });
}

/** 创建植物 */
export async function createPlant(address: string, payload: CreatePlantPayload): Promise<unknown> {
  return request('/plants/create', {
    method: 'POST',
    headers: {
      ...walletHeaders(address),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

/** 添加植物观察记录 */
export async function createRecord(address: string, payload: CreateRecordPayload): Promise<unknown> {
  return request('/records/create', {
    method: 'POST',
    headers: {
      ...walletHeaders(address),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

/** 获取植物的观察记录列表 */
export async function fetchRecords(address: string, plantId: number): Promise<RecordDTO[]> {
  return request<RecordDTO[]>(`/records/list?plantId=${plantId}`, {
    headers: walletHeaders(address),
  });
}
