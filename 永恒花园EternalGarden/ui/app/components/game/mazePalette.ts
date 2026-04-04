/**
 * 莫兰迪系迷宫配色：柔粉、肉色、淡紫。
 * 顶面保持 ~92–96% 明度；立面 ~84–90%（过暗会像「脏灰」）。
 * MazeCanvas / MazeIntroBackdrop 共用。
 */
export const MAZE_TILE_TOP = ["#F5E8E6", "#F3EDE6", "#EDE8F2"] as const;
export const MAZE_TILE_LEFT = ["#E0C8C6", "#D8CFC4", "#D4C8DC"] as const;
export const MAZE_TILE_RIGHT = ["#D4B8BC", "#C8BEB4", "#C8B8CC"] as const;
/** 墙仍要略深于地面，但避免压成「深褐块」 */
export const MAZE_TILE_WALL = ["#B0A0A0", "#A4989C", "#9C949E"] as const;

/** 画布天空渐变（与砖块协调，整体偏亮） */
export const MAZE_BG_STOPS = { top: "#FFFCFA", mid: "#F8F0F4", bot: "#F0E8EE" } as const;

/** 开场 SVG 天光 */
export const MAZE_INTRO_SKY = { top: "#FFFBFA", mid: "#F6EEF2", bot: "#EDE6EE" } as const;
export const MAZE_INTRO_GLOW_CENTER = "#F2D8E4";
