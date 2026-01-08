
import { RawLog, DutyRecord, ShiftType } from '../types';
import { 
  timeToMinutes, 
  isMorningIn, isMorningOut, 
  isAfternoonIn, isAfternoonOut, 
  isNightIn, isNightOut 
} from './dateTimeUtils';

export const processLogs = (logs: RawLog[]): DutyRecord[] => {
  // 1. Sort logs by absolute time (date + time)
  const sortedLogs = [...logs].sort((a, b) => {
    const [da, ma, ya] = a.date.split('/').map(Number);
    const [db, mb, yb] = b.date.split('/').map(Number);
    const dateA = new Date(ya, ma - 1, da).getTime();
    const dateB = new Date(yb, mb - 1, db).getTime();
    if (dateA !== dateB) return dateA - dateB;
    return timeToMinutes(a.time) - timeToMinutes(b.time);
  });

  const finalRecords: DutyRecord[] = [];
  // Store active shifts per person: { [name]: { [ShiftType]: DutyRecord } }
  const activeShifts: Record<string, Partial<Record<ShiftType, DutyRecord>>> = {};

  sortedLogs.forEach((log) => {
    const name = log.name.trim();
    const mins = timeToMinutes(log.time);
    if (!activeShifts[name]) activeShifts[name] = {};

    const userShifts = activeShifts[name];

    // Priority Check: Is this an OUT for an existing active shift?
    // We check OUT first because some ranges overlap (e.g. 08:00 is both Morning-In and Night-Out)
    
    // Check NIGHT OUT
    if (isNightOut(mins) && userShifts[ShiftType.NIGHT]) {
      const record = userShifts[ShiftType.NIGHT]!;
      record.timeOut = log.time;
      finalRecords.push({ ...record } as DutyRecord);
      delete userShifts[ShiftType.NIGHT];
      return;
    }

    // Check MORNING OUT
    if (isMorningOut(mins) && userShifts[ShiftType.MORNING]) {
      const record = userShifts[ShiftType.MORNING]!;
      record.timeOut = log.time;
      finalRecords.push({ ...record } as DutyRecord);
      delete userShifts[ShiftType.MORNING];
      return;
    }

    // Check AFTERNOON OUT
    if (isAfternoonOut(mins) && userShifts[ShiftType.AFTERNOON]) {
      const record = userShifts[ShiftType.AFTERNOON]!;
      record.timeOut = log.time;
      finalRecords.push({ ...record } as DutyRecord);
      delete userShifts[ShiftType.AFTERNOON];
      return;
    }

    // If not an OUT, is it an IN for a new shift?
    
    // Check MORNING IN
    if (isMorningIn(mins)) {
      userShifts[ShiftType.MORNING] = {
        id: 0,
        name,
        shift: ShiftType.MORNING,
        timeIn: log.time,
        timeOut: '',
        date: log.date,
        remarks: '',
        sortKey: mins
      };
      return;
    }

    // Check AFTERNOON IN
    if (isAfternoonIn(mins)) {
      userShifts[ShiftType.AFTERNOON] = {
        id: 0,
        name,
        shift: ShiftType.AFTERNOON,
        timeIn: log.time,
        timeOut: '',
        date: log.date,
        remarks: '',
        sortKey: mins
      };
      return;
    }

    // Check NIGHT IN
    if (isNightIn(mins)) {
      userShifts[ShiftType.NIGHT] = {
        id: 0,
        name,
        shift: ShiftType.NIGHT,
        timeIn: log.time,
        timeOut: '',
        date: log.date, // This is the start date of the shift
        remarks: '',
        sortKey: mins
      };
      return;
    }

    // If it's an OUT range but NO IN was found, we still show it but mark remark
    if (isMorningOut(mins)) {
      finalRecords.push({
        id: 0, name, shift: ShiftType.MORNING, timeIn: '', timeOut: log.time, date: log.date, remarks: 'ไม่พบเวลามา', sortKey: mins
      });
    } else if (isAfternoonOut(mins)) {
      finalRecords.push({
        id: 0, name, shift: ShiftType.AFTERNOON, timeIn: '', timeOut: log.time, date: log.date, remarks: 'ไม่พบเวลามา', sortKey: mins
      });
    } else if (isNightOut(mins)) {
      finalRecords.push({
        id: 0, name, shift: ShiftType.NIGHT, timeIn: '', timeOut: log.time, date: log.date, remarks: 'ไม่พบเวลามา', sortKey: mins
      });
    }
  });

  // Handle remaining active shifts that never scanned OUT
  Object.keys(activeShifts).forEach(name => {
    const userShifts = activeShifts[name];
    Object.keys(userShifts).forEach(shiftType => {
      const record = userShifts[shiftType as ShiftType]!;
      record.remarks = 'ไม่พบเวลากลับ';
      finalRecords.push({ ...record } as DutyRecord);
    });
  });

  return finalRecords;
};
