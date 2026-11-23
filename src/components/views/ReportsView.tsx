'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  BarChart3,
  Download,
  Printer as PrintIcon,
  PieChart,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  TrendingUp,
} from 'lucide-react';
import { spuBuildings } from '@/lib/mockData';

export default function ReportsView() {
  const { registers, repairs } = useApp();

  const total = registers.HDW1 || 1;
  const done = registers.HDW4;
  const processing = registers.HDW3;
  const pending = registers.HDW2;

  const donePercent = Math.round((done / total) * 100);
  const procPercent = Math.round((processing / total) * 100);
  const pendPercent = Math.round((pending / total) * 100);

  const categories = [
    { name: 'คอมพิวเตอร์ (HDW10)', count: registers.HDW10, color: 'bg-sky-500' },
    { name: 'เครื่องพิมพ์ (HDW11)', count: registers.HDW11, color: 'bg-emerald-500' },
    { name: 'ระบบเครือข่าย (HDW12)', count: registers.HDW12, color: 'bg-amber-500' },
    { name: 'อื่น ๆ / อาคาร (HDW13)', count: registers.HDW13, color: 'bg-purple-500' },
  ];

  // Export CSV function
  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Title',
      'Category',
      'Building',
      'Room',
      'Reporter',
      'Status',
      'CreatedAt',
      'Technician',
    ];
    const rows = repairs.map((r) => [
      r.id,
      `"${r.title.replace(/"/g, '""')}"`,
      r.categoryLabel,
      `"${r.building}"`,
      r.room,
      r.reporterName,
      r.status,
      r.createdAt,
      `"${r.technicianName || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smart_fix_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 p-6">
      {/* Title & Action Buttons */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            รายงานและวิเคราะห์ข้อมูล (Reports & Analytics)
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            สรุปผลการดำเนินงานซ่อมบำรุง ประสิทธิภาพการแก้ไขปัญหา และสถิติตามอาคาร
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <PrintIcon className="h-4 w-4" />
            <span>พิมพ์รายงาน</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 rounded-xl bg-sky-500 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-sky-500/25 hover:bg-sky-600"
          >
            <Download className="h-4 w-4" />
            <span>ส่งออก CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-400">อัตราการปิดงานสำเร็จ (Resolution Rate)</span>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {donePercent}%
            </span>
            <span className="text-xs text-slate-500 font-medium">({done}/{total} รายการ)</span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${donePercent}%` }}
            ></div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-400">ระยะเวลาเฉลี่ยในการตอบสนอง</span>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-sky-600 dark:text-sky-400">
              24 นาที
            </span>
            <span className="text-xs text-slate-500 font-medium">หลังแจ้งคำร้อง</span>
          </div>
          <p className="mt-3 text-[11px] text-emerald-600 font-semibold">
            เร็วกว่าเกณฑ์มาตรฐาน 35%
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-400">ระยะเวลาเฉลี่ยในการปิดงานซ่อม</span>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
              3.5 ชม.
            </span>
            <span className="text-xs text-slate-500 font-medium">ต่อรายการ</span>
          </div>
          <p className="mt-3 text-[11px] text-slate-400">
            รวมอะไหล่และทดสอบการใช้งาน
          </p>
        </div>
      </div>

      {/* Breakdown Details */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Category Breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-bold text-slate-900 dark:text-white">
            สัดส่วนตามประเภทอุปกรณ์ (HMI Registers)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            จำแนกตามรหัส Register ในระบบควบคุมอัตโนมัติ
          </p>

          <div className="mt-6 space-y-4">
            {categories.map((c) => {
              const pct = Math.round((c.count / (total || 1)) * 100);
              return (
                <div key={c.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">{c.name}</span>
                    <span className="text-slate-900 dark:text-white">
                      {c.count} รายการ ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full ${c.color} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Building Stats Table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-bold text-slate-900 dark:text-white">
            สถิติงานซ่อมแยกตามอาคาร (มหาวิทยาลัยศรีปทุม)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            แสดงจำนวนงานซ่อมที่เกิดขึ้นในแต่ละอาคาร
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="py-2.5 px-3">อาคาร</th>
                  <th className="py-2.5 px-3 text-center">รอดำเนินการ</th>
                  <th className="py-2.5 px-3 text-center">กำลังซ่อม</th>
                  <th className="py-2.5 px-3 text-center">เสร็จสิ้น</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {spuBuildings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      {b.name}
                    </td>
                    <td className="py-2.5 px-3 text-center text-rose-600 font-bold">
                      {b.pending}
                    </td>
                    <td className="py-2.5 px-3 text-center text-amber-600 font-bold">
                      {b.processing}
                    </td>
                    <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">
                      {b.done}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
