
export const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export const parseThaiDate = (dateStr: string) => {
  const [day, month, year] = dateStr.split('/').map(Number);
  return { day, month, year };
};

export const formatThaiDateFull = (dateStr: string) => {
  const { day, month, year } = parseThaiDate(dateStr);
  const thaiYear = year > 2500 ? year : year + 543;
  return `วันที่ ${day} เดือน ${THAI_MONTHS[month - 1]} พ.ศ. ${thaiYear}`;
};

export const timeToMinutes = (timeStr: string) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

/**
 * ตัดวินาทีออก เช่น 08:30:15 -> 08:30
 */
export const formatTimeShort = (timeStr: string) => {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
  }
  return timeStr;
};

// Define strict ranges based on user requirements
export const isMorningIn = (mins: number) => mins >= 7 * 60 && mins <= 8.5 * 60;
export const isMorningOut = (mins: number) => mins >= 15.5 * 60 && mins <= 20 * 60;

export const isAfternoonIn = (mins: number) => mins >= 15 * 60 && mins <= 17 * 60;
export const isAfternoonOut = (mins: number) => (mins >= 23.5 * 60 || mins <= 2 * 60);

export const isNightIn = (mins: number) => (mins >= 22 * 60 || mins <= 0.5 * 60);
export const isNightOut = (mins: number) => mins >= 7.8 * 60 && mins <= 10 * 60;
