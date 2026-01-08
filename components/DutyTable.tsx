
import React from 'react';
import { DutyRecord } from '../types';
import { formatThaiDateFull, formatTimeShort } from '../utils/dateTimeUtils';

interface DutyTableProps {
  date: string;
  records: DutyRecord[];
}

const DutyTable: React.FC<DutyTableProps> = ({ date, records }) => {
  const displayDate = date ? formatThaiDateFull(date) : 'โปรดเลือกข้อมูลวันที่';

  // Sort records for the display: by shift priority and then by time
  const sortedForDisplay = [...records].sort((a, b) => {
    const shiftOrder = { 'ดึก': 1, 'เช้า': 2, 'บ่าย': 3 };
    if (shiftOrder[a.shift] !== shiftOrder[b.shift]) {
      return shiftOrder[a.shift] - shiftOrder[b.shift];
    }
    return (a.sortKey || 0) - (b.sortKey || 0);
  });

  return (
    <div className="bg-white p-8 md:p-12 shadow-xl min-h-[11in] w-fit mx-auto print-area border border-gray-100 rounded-sm">
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-black font-['Sarabun']">บัญชีลงเวลาการปฏิบัติราชการของข้าราชการ</h1>
        <div className="inline-block border-b border-black pb-1 px-8">
          <p className="text-lg text-black">{displayDate}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="border-collapse border-[1.5px] border-black text-sm text-black">
          <thead>
            <tr className="bg-gray-50 whitespace-nowrap">
              <th className="border border-black p-2 text-center font-bold px-4">ลำดับ</th>
              <th className="border border-black p-2 text-center font-bold px-4">เวร</th>
              <th className="border border-black p-2 text-center font-bold px-8">ชื่อ-สกุล</th>
              <th className="border border-black p-2 text-center font-bold px-8">ลายมือชื่อ</th>
              <th className="border border-black p-2 text-center font-bold px-4">เวลามา</th>
              <th className="border border-black p-2 text-center font-bold px-8">ลายมือชื่อ</th>
              <th className="border border-black p-2 text-center font-bold px-4">เวลากลับ</th>
              <th className="border border-black p-2 text-center font-bold px-4">หมายเหตุ</th>
            </tr>
          </thead>
          <tbody>
            {sortedForDisplay.length > 0 ? (
              sortedForDisplay.map((record, index) => (
                <tr key={index} className="h-10 hover:bg-gray-50 transition-colors whitespace-nowrap">
                  <td className="border border-black p-1 text-center align-middle px-2">{index + 1}</td>
                  <td className="border border-black p-1 text-center align-middle font-medium px-2">{record.shift}</td>
                  <td className="border border-black p-1 px-6 align-middle text-[15px] text-center">{record.name}</td>
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1 text-center align-middle font-mono font-bold px-2">
                    {formatTimeShort(record.timeIn)}
                  </td>
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1 text-center align-middle font-mono font-bold px-2">
                    {formatTimeShort(record.timeOut)}
                  </td>
                  <td className="border border-black p-1 text-[11px] font-medium leading-tight text-center px-4">
                    {record.remarks}
                  </td>
                </tr>
              ))
            ) : (
              Array.from({ length: 15 }).map((_, i) => (
                <tr key={i} className="h-10">
                  <td className="border border-black p-1 text-center text-gray-200">{i + 1}</td>
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1"></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-12 flex justify-end pr-4 text-sm no-print-pr-0">
        <div className="text-center w-[400px] space-y-3 text-black">
          <p className="mb-8 font-medium whitespace-nowrap">
            ลงชื่อ..............................................................ผู้ตรวจสอบ
          </p>
          <p className="font-medium whitespace-nowrap">
            (..............................................................)
          </p>
          <p className="font-medium whitespace-nowrap">
            ตำแหน่ง..............................................................
          </p>
        </div>
      </div>
    </div>
  );
};

export default DutyTable;
