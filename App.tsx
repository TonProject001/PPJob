
import React, { useState, useEffect, useMemo } from 'react';
import { RawLog, DutyRecord } from './types';
import { processLogs } from './utils/processor';
import DutyTable from './components/DutyTable';

// ระบุ ID ของ Google Sheets ที่ต้องการใช้งานที่นี่
const TARGET_SHEET_ID = '1ak0kxAH9CHgs41l6I7cUDgU38qBygXv7bM-tsJUUMs0';

const App: React.FC = () => {
  const [csvInput, setCsvInput] = useState<string>('');
  const [targetDate, setTargetDate] = useState<string>('');
  const [records, setRecords] = useState<DutyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseCSV = (csv: string): RawLog[] => {
    const lines = csv.split('\n');
    const logs: RawLog[] = [];
    
    // ข้าม Header (สมมติว่าแถวที่ 1 เป็นหัวตาราง)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const parts = line.split(',');
      if (parts.length >= 3) {
        logs.push({
          date: parts[0].trim(),
          time: parts[1].trim(),
          name: parts[2].trim()
        });
      }
    }
    return logs;
  };

  const fetchDataFromSheet = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const exportUrl = `https://docs.google.com/spreadsheets/d/${TARGET_SHEET_ID}/export?format=csv&gid=0`;
      const response = await fetch(exportUrl);
      if (!response.ok) throw new Error('ไม่สามารถเข้าถึงข้อมูลได้ โปรดตรวจสอบว่า Google Sheet ตั้งค่าเป็น "ทุกคนที่มีลิงก์มีสิทธิ์อ่าน"');
      
      const csvText = await response.text();
      setCsvInput(csvText);
      
      const rawLogs = parseCSV(csvText);
      const processed = processLogs(rawLogs);
      
      // เลือกวันที่ล่าสุดให้อัตโนมัติถ้ายังไม่ได้เลือก
      if (rawLogs.length > 0) {
        const dates = Array.from(new Set(rawLogs.map(l => l.date))).sort((a, b) => {
          const [da, ma, ya] = a.split('/').map(Number);
          const [db, mb, yb] = b.split('/').map(Number);
          return new Date(ya, ma, da).getTime() - new Date(yb, mb, db).getTime();
        });
        
        const latest = dates[dates.length - 1];
        setTargetDate(latest);
        
        const filtered = processed.filter(r => r.date === latest);
        setRecords(filtered);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDataFromSheet();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const availableDates = useMemo(() => {
    const rawLogs = parseCSV(csvInput);
    const dates = new Set(rawLogs.map(l => l.date));
    return Array.from(dates).sort((a, b) => {
        const [da, ma, ya] = a.split('/').map(Number);
        const [db, mb, yb] = b.split('/').map(Number);
        return new Date(ya, ma, da).getTime() - new Date(yb, mb, db).getTime();
    });
  }, [csvInput]);

  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDate = e.target.value;
    setTargetDate(newDate);
    const rawLogs = parseCSV(csvInput);
    const processed = processLogs(rawLogs);
    const filtered = processed.filter(r => r.date === newDate);
    setRecords(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Configuration Panel (Hide on print) */}
      <div className="no-print max-w-5xl mx-auto mb-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2.5 rounded-xl shadow-blue-200 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 leading-tight">ระบบลงเวลาปฏิบัติราชการ</h2>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Official Attendance System</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-gray-400 mb-1 ml-1 uppercase">เลือกวันที่ปฏิบัติงาน</label>
                <select 
                  className="p-2.5 pr-10 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer text-sm font-semibold"
                  value={targetDate}
                  onChange={handleDateChange}
                >
                  <option value="">-- เลือกวันที่ --</option>
                  {availableDates.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end gap-2 pt-4 sm:pt-0">
                <button 
                  onClick={fetchDataFromSheet}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white h-[42px] px-5 rounded-xl transition-all flex items-center gap-2 shadow-md shadow-blue-100 font-medium"
                >
                  {isLoading ? (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className="hidden sm:inline">อัปเดตข้อมูล</span>
                </button>
                <button 
                  onClick={() => window.print()}
                  className="bg-gray-900 hover:bg-black text-white h-[42px] px-5 rounded-xl transition-all flex items-center gap-2 shadow-md shadow-gray-200 font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                  </svg>
                  พิมพ์
                </button>
              </div>
            </div>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-sm animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Table Display */}
      <div className="pb-12">
        <DutyTable date={targetDate} records={records} />
      </div>
      
      {/* Footer Info (No Print) */}
      <footer className="no-print text-center text-gray-400 text-[10px] mt-8 pb-8 uppercase tracking-[0.2em]">
        Attendance Tracking System &bull; Integrated with Google Sheets &bull; Ver. 2.1
      </footer>
    </div>
  );
};

export default App;
