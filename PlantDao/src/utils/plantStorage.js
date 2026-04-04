// 本地植物管理存储工具 - 支持离线个人植物管理

const PLANTS_KEY = 'plantdao_plants'
const RECORDS_KEY = 'plantdao_care_records'

const SPECIES_LIST = [
  { species: '绿萝', emoji: '🌿', difficulty: '简单' },
  { species: '月季', emoji: '🌹', difficulty: '中等' },
  { species: '仙人掌', emoji: '🌵', difficulty: '简单' },
  { species: '樱花', emoji: '🌸', difficulty: '困难' },
  { species: '石莲花', emoji: '🪴', difficulty: '简单' },
  { species: '太阳花', emoji: '🌻', difficulty: '中等' },
  { species: '薰衣草', emoji: '💜', difficulty: '中等' },
  { species: '富贵竹', emoji: '🎋', difficulty: '简单' },
  { species: '蝴蝶兰', emoji: '🪻', difficulty: '困难' },
  { species: '多肉', emoji: '🌵', difficulty: '简单' },
  { species: '吊兰', emoji: '🌿', difficulty: '简单' },
  { species: '茉莉花', emoji: '🤍', difficulty: '中等' },
  { species: '玫瑰', emoji: '🌹', difficulty: '中等' },
  { species: '薄荷', emoji: '🌿', difficulty: '简单' },
  { species: '铜钱草', emoji: '🪙', difficulty: '简单' },
  { species: '龟背竹', emoji: '🌿', difficulty: '中等' },
  { species: '文竹', emoji: '🌿', difficulty: '中等' },
  { species: '芦荟', emoji: '🌵', difficulty: '简单' },
  { species: '发财树', emoji: '🌳', difficulty: '简单' },
  { species: '白掌', emoji: '🤍', difficulty: '中等' },
  { species: '红豆杉', emoji: '🌲', difficulty: '困难' },
  { species: '其他', emoji: '🌱', difficulty: '中等' },
]

const ACTION_TYPES = {
  water: { label: '浇水', icon: '💧', color: 'blue' },
  fertilize: { label: '施肥', icon: '🧪', color: 'green' },
  repot: { label: '换盆', icon: '🪴', color: 'amber' },
  photo: { label: '拍照记录', icon: '📸', color: 'cyan' },
  medicine: { label: '用药', icon: '💊', color: 'purple' },
  note: { label: '备注', icon: '📝', color: 'gray' },
  milestone: { label: '里程碑', icon: '⭐', color: 'yellow' },
  prune: { label: '修剪', icon: '✂️', color: 'teal' },
  move: { label: '移动位置', icon: '🏠', color: 'orange' },
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

// ============ 植物操作 ============

export function getPlants() {
  try {
    return JSON.parse(localStorage.getItem(PLANTS_KEY) || '[]')
  } catch {
    return []
  }
}

export function getPlant(id) {
  const plants = getPlants()
  return plants.find(p => p.id === id) || null
}

export function addPlant(plantData) {
  const plants = getPlants()
  const newPlant = {
    id: generateId(),
    name: plantData.name || '未命名植物',
    species: plantData.species || '其他',
    emoji: plantData.emoji || SPECIES_LIST.find(s => s.species === plantData.species)?.emoji || '🌱',
    difficulty: plantData.difficulty || '中等',
    note: plantData.note || '',
    health: 80,
    water: 70,
    sunlight: 70,
    soil: 70,
    growthLevel: 1,
    maxGrowth: 20,
    careStreak: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tokenId: null, // NFT token ID (if minted on chain)
    isLocal: true,
    photos: [], // photo URLs (base64)
  }
  plants.unshift(newPlant)
  localStorage.setItem(PLANTS_KEY, JSON.stringify(plants))

  // 添加创建记录
  addCareRecord({
    plantId: newPlant.id,
    action: 'note',
    note: `添加了新植物「${newPlant.name}」(${newPlant.species}) 🎉`,
    photo: null,
  })

  return newPlant
}

export function updatePlant(id, updates) {
  const plants = getPlants()
  const idx = plants.findIndex(p => p.id === id)
  if (idx === -1) return null
  plants[idx] = { ...plants[idx], ...updates, updatedAt: Date.now() }
  localStorage.setItem(PLANTS_KEY, JSON.stringify(plants))
  return plants[idx]
}

export function deletePlant(id) {
  let plants = getPlants()
  plants = plants.filter(p => p.id !== id)
  localStorage.setItem(PLANTS_KEY, JSON.stringify(plants))
  // Also delete related records
  let records = getCareRecords()
  records = records.filter(r => r.plantId !== id)
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records))
  return true
}

// ============ 护理记录操作 ============

export function getCareRecords(plantId) {
  try {
    const all = JSON.parse(localStorage.getItem(RECORDS_KEY) || '[]')
    if (plantId) {
      return all.filter(r => r.plantId === plantId).sort((a, b) => b.timestamp - a.timestamp)
    }
    return all.sort((a, b) => b.timestamp - a.timestamp)
  } catch {
    return []
  }
}

export function addCareRecord(recordData) {
  const records = JSON.parse(localStorage.getItem(RECORDS_KEY) || '[]')
  const newRecord = {
    id: generateId(),
    plantId: recordData.plantId,
    action: recordData.action || 'note',
    note: recordData.note || '',
    photo: recordData.photo || null, // base64 data URL
    quality: recordData.quality || 100,
    timestamp: Date.now(),
  }
  records.unshift(newRecord)
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records))

  // 更新植物状态
  if (recordData.plantId) {
    const plant = getPlant(recordData.plantId)
    if (plant) {
      const updates = { updatedAt: Date.now() }

      switch (recordData.action) {
        case 'water':
          updates.water = Math.min(100, plant.water + 20)
          updates.health = Math.min(100, plant.health + 3)
          break
        case 'fertilize':
          updates.soil = Math.min(100, plant.soil + 25)
          updates.health = Math.min(100, plant.health + 3)
          break
        case 'repot':
          updates.soil = 100
          updates.health = Math.min(100, plant.health + 10)
          updates.growthLevel = Math.min(plant.maxGrowth, plant.growthLevel + 1)
          break
        case 'medicine':
          updates.health = Math.min(100, plant.health + 15)
          break
        case 'photo':
          // 照片不改变状态
          break
        case 'prune':
          updates.health = Math.min(100, plant.health + 5)
          break
      }

      // 随时间自然衰减（模拟）
      if (recordData.action !== 'note' && recordData.action !== 'photo') {
        updates.careStreak = plant.careStreak + 1
      }

      updatePlant(recordData.plantId, updates)
    }
  }

  return newRecord
}

export function deleteCareRecord(id) {
  let records = getCareRecords()
  records = records.filter(r => r.id !== id)
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records))
  return true
}

// ============ 统计数据 ============

export function getPlantStats(plantId) {
  const records = getCareRecords(plantId)
  const stats = {
    totalCares: records.filter(r => r.action !== 'note' && r.action !== 'milestone').length,
    waterCount: records.filter(r => r.action === 'water').length,
    fertilizeCount: records.filter(r => r.action === 'fertilize').length,
    repotCount: records.filter(r => r.action === 'repot').length,
    photoCount: records.filter(r => r.action === 'photo').length,
    medicineCount: records.filter(r => r.action === 'medicine').length,
    pruneCount: records.filter(r => r.action === 'prune').length,
    lastCareTime: records.length > 0 ? records[0].timestamp : null,
    photoRecords: records.filter(r => r.action === 'photo' && r.photo),
  }
  return stats
}

export function getOverallStats() {
  const plants = getPlants()
  const allRecords = getCareRecords()
  return {
    totalPlants: plants.length,
    totalCares: allRecords.length,
    healthyPlants: plants.filter(p => p.health > 60).length,
    needsAttention: plants.filter(p => p.health < 40 || p.water < 30).length,
    totalPhotos: allRecords.filter(r => r.photo).length,
  }
}

// ============ 常量导出 ============

export { SPECIES_LIST, ACTION_TYPES }