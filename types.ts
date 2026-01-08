
export enum ShiftType {
  MORNING = 'เช้า',
  AFTERNOON = 'บ่าย',
  NIGHT = 'ดึก'
}

export interface RawLog {
  date: string; // DD/MM/YYYY
  time: string; // HH:mm:ss
  name: string;
}

export interface DutyRecord {
  id: number;
  shift: ShiftType;
  name: string;
  timeIn: string;
  timeOut: string;
  date: string;
  remarks: string;
  sortKey: number; // For chronological sorting
}
