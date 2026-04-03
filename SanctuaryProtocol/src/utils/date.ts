export function getDaysDifference(startDate: Date, endDate: Date = new Date()): number {
  const diffTime = endDate.getTime() - startDate.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function formatDistanceToNow(date: Date, locale: string = 'zh'): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const isEn = locale === 'en';
  
  if (diffInSeconds < 60) {
    return isEn ? 'just now' : '刚刚';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return isEn ? `${diffInMinutes} min ago` : `${diffInMinutes}分钟前`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return isEn ? `${diffInHours} hr ago` : `${diffInHours}小时前`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return isEn ? `${diffInDays} days ago` : `${diffInDays}天前`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return isEn ? `${diffInMonths} mo ago` : `${diffInMonths}个月前`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return isEn ? `${diffInYears} yr ago` : `${diffInYears}年前`;
}
