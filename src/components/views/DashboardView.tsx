'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Wrench,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  MapPin,
  ChevronRight,
  Filter,
  ArrowUpRight,
  Monitor,
  Printer,
  Wifi,
  MoreHorizontal,
  RefreshCw,
  Plus,
  Building2,
} from 'lucide-react';
import { monthlyStats, spuBuildings } from '@/lib/mockData';

export default function DashboardView() {
  const {
    registers,
    repairs,
    setCurrentView,
    setSelectedRepairId,
    updateRepairStatus,
    publishCommand,
  } = useApp();

  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);

  // Filter repairs
  const filteredRepairs = selectedBuilding
    ? repairs.filter((r) => r.building.includes(selectedBuilding))
    : repairs;

  // Donut chart calculations
  const totalCategoryCount =
    (registers.HDW10 || 1) +
    (registers.HDW11 || 1) +
    (registers.HDW12 || 1) +
    (registers.HDW13 || 1);

  const categories = [
    {
      label: 'คอมพิวเตอร์',
      register: 'HDW10',
      count: registers.HDW10,
      percent: Math.round((registers.HDW10 / totalCategoryCount) * 100),
      color: '#38bdf8', // sky-400
      icon: Monitor,
    },
    {
      label: 'เครื่องพิมพ์',
      register: 'HDW11',
      count: registers.HDW11,
      percent: Math.round((registers.HDW11 / totalCategoryCount) * 100),
      color: '#10b981', // emerald-500
      icon: Printer,
    },
    {
      label: 'เครือข่าย',
      register: 'HDW12',
      count: registers.HDW12,
      percent: Math.round((registers.HDW12 / totalCategoryCount) * 100),
      color: '#f59e0b', // amber-500
      icon: Wifi,
    },
    {
      label: 'อื่น ๆ / อาคาร',
      register: 'HDW13',
      count: registers.HDW13,
      percent: Math.round((registers.HDW13 / totalCategoryCount) * 100),
      color: '#a855f7', // purple-500
      icon: MoreHorizontal,
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Dashboard ภาพรวมงานซ่อมบำรุง
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            ระบบติดตามสถานะคำร้องซ่อมแบบ Real-Time เชื่อมต่อระบบ HMI / MQTT
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCurrentView('new_request')}
            className="flex items-center space-x-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-500/25 transition-all hover:bg-sky-600 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>แจ้งซ่อมใหม่</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards (Matching PDF Mockup) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: คำร้องทั้งหมด */}
        <div className="relative overflow-hidden rounded-2xl border border-sky-100 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              คำร้องทั้งหมด (HDW1)
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
              <Wrench className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {registers.HDW1}
            </span>
            <span className="text-xs font-semibold text-slate-400">คำร้อง</span>
          </div>
          <div className="mt-2 flex items-center space-x-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+12% จากเดือนที่แล้ว</span>
          </div>
          <div className="absolute top-0 right-0 h-1.5 w-full bg-sky-500"></div>
        </div>

        {/* Card 2: งานซ่อมเสร็จสิ้น */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              งานซ่อมเสร็จสิ้น (HDW4)
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {registers.HDW4}
            </span>
            <span className="text-xs font-semibold text-slate-400">งาน</span>
          </div>
          <div className="mt-2 flex items-center space-x-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+8% อัตราปิดงานสำเร็จ</span>
          </div>
          <div className="absolute top-0 right-0 h-1.5 w-full bg-emerald-500"></div>
        </div>

        {/* Card 3: กำลังดำเนินการ */}
        <div className="relative overflow-hidden rounded-2xl border border-amber-100 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              กำลังดำเนินการ (HDW3)
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {registers.HDW3}
            </span>
            <span className="text-xs font-semibold text-slate-400">งาน</span>
          </div>
          <div className="mt-2 flex items-center space-x-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>
            <span>ช่างกำลังลงพื้นที่</span>
          </div>
          <div className="absolute top-0 right-0 h-1.5 w-full bg-amber-500"></div>
        </div>

        {/* Card 4: รอดำเนินการ */}
        <div className="relative overflow-hidden rounded-2xl border border-rose-100 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              รอดำเนินการ (HDW2)
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {registers.HDW2}
            </span>
            <span className="text-xs font-semibold text-slate-400">งาน</span>
          </div>
          <div className="mt-2 flex items-center space-x-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
            <span>รอจ่ายงาน / รอคิวช่าง</span>
          </div>
          <div className="absolute top-0 right-0 h-1.5 w-full bg-rose-500"></div>
        </div>
      </div>

      {/* Row 2: Monthly Trend Chart & Campus Map */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Monthly Bar Chart (7 Cols) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-7 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">
                สถิติการแจ้งซ่อม (รายเดือน)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                เปรียบเทียบคำร้องทั้งหมด กับงานที่ซ่อมเสร็จสิ้น (XY PLOT HDW1 - HDW4)
              </p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-medium">
              <div className="flex items-center space-x-1.5">
                <span className="h-3 w-3 rounded-sm bg-sky-500"></span>
                <span className="text-slate-600 dark:text-slate-300">คำร้องทั้งหมด</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="h-3 w-3 rounded-sm bg-emerald-500"></span>
                <span className="text-slate-600 dark:text-slate-300">งานเสร็จสิ้น</span>
              </div>
            </div>
          </div>

          {/* SVG Bar Chart */}
          <div className="mt-6 h-64 w-full">
            <svg className="h-full w-full" viewBox="0 0 500 200" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="0" y1="70" x2="500" y2="70" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="0" y1="170" x2="500" y2="170" stroke="#e2e8f0" />

              {/* Bars for each month */}
              {monthlyStats.map((item, idx) => {
                const xBase = 35 + idx * 78;
                const totalH = (item.total / 150) * 140;
                const doneH = (item.done / 150) * 140;

                return (
                  <g key={item.month} className="group cursor-pointer">
                    {/* Bar 1: Total (Sky) */}
                    <rect
                      x={xBase}
                      y={170 - totalH}
                      width="20"
                      height={totalH}
                      rx="4"
                      className="fill-sky-400 transition-all group-hover:fill-sky-500"
                    />
                    {/* Bar 2: Done (Emerald) */}
                    <rect
                      x={xBase + 24}
                      y={170 - doneH}
                      width="20"
                      height={doneH}
                      rx="4"
                      className="fill-emerald-400 transition-all group-hover:fill-emerald-500"
                    />

                    {/* Value Badge on top */}
                    <text
                      x={xBase + 10}
                      y={162 - totalH}
                      textAnchor="middle"
                      className="fill-slate-600 text-[10px] font-semibold opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      {item.total}
                    </text>
                    <text
                      x={xBase + 34}
                      y={162 - doneH}
                      textAnchor="middle"
                      className="fill-slate-600 text-[10px] font-semibold opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      {item.done}
                    </text>

                    {/* Month Label */}
                    <text
                      x={xBase + 22}
                      y="190"
                      textAnchor="middle"
                      className="fill-slate-500 text-xs font-medium"
                    >
                      {item.month}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Campus Map & Building Status (5 Cols) */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-5 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-sky-500" />
                <h3 className="font-bold text-slate-900 dark:text-white">แผนที่พื้นที่การแจ้งซ่อม</h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">มหาวิทยาลัยศรีปทุม</span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              คลิกอาคารเพื่อกรองรายการงานซ่อมในพื้นที่
            </p>

            {/* Interactive Campus SVG Map */}
            <div className="relative mt-4 h-48 w-full overflow-hidden rounded-xl border border-sky-100 bg-gradient-to-br from-sky-50/60 to-indigo-50/40 p-2 dark:border-slate-800 dark:from-slate-800/50 dark:to-slate-900">
              <svg className="h-full w-full" viewBox="0 0 100 80">
                {/* Background Roads / Campus Paths */}
                <path d="M 10 40 Q 50 35 90 40" stroke="#cbd5e1" strokeWidth="3" fill="none" />
                <path d="M 50 10 L 50 70" stroke="#cbd5e1" strokeWidth="2.5" fill="none" />

                {/* Building Blocks */}
                {spuBuildings.map((b) => {
                  const isSelected = selectedBuilding === b.name;
                  return (
                    <g
                      key={b.id}
                      onClick={() =>
                        setSelectedBuilding(selectedBuilding === b.name ? null : b.name)
                      }
                      className="cursor-pointer"
                    >
                      {/* Building Shape */}
                      <rect
                        x={b.x - 12}
                        y={b.y - 8}
                        width="24"
                        height="16"
                        rx="3"
                        className={`transition-all ${
                          isSelected
                            ? 'fill-sky-500 stroke-2 stroke-white dark:stroke-slate-900 shadow-lg'
                            : 'fill-white stroke-1 stroke-sky-300 dark:fill-slate-800 dark:stroke-slate-600'
                        }`}
                      />
                      {/* Building Name */}
                      <text
                        x={b.x}
                        y={b.y + 2}
                        textAnchor="middle"
                        fontSize="3.5"
                        fontWeight="bold"
                        className={isSelected ? 'fill-white' : 'fill-slate-800 dark:fill-slate-200'}
                      >
                        {b.name.split(' ')[0]}
                      </text>

                      {/* Ping marker for active issues */}
                      {b.pending > 0 && (
                        <circle
                          cx={b.x + 9}
                          cy={b.y - 6}
                          r="2.5"
                          className="fill-rose-500 animate-pulse"
                        />
                      )}
                    </g>
                  );
                })}
              </svg>

              {selectedBuilding && (
                <button
                  onClick={() => setSelectedBuilding(null)}
                  className="absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-1 text-[10px] font-semibold text-sky-600 shadow-sm backdrop-blur hover:bg-white dark:bg-slate-800/90 dark:text-sky-400"
                >
                  ล้างตัวกรอง ({selectedBuilding})
                </button>
              )}
            </div>
          </div>

          {/* Quick Building List Pills */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {spuBuildings.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBuilding(selectedBuilding === b.name ? null : b.name)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  selectedBuilding === b.name
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Recent Requests Table & Category Donut Chart */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Recent Requests Table (7 Cols) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-7 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">รายการคำร้องล่าสุด</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                คลิกรายการเพื่อดูรายละเอียดและอัปเดตสถานะงานซ่อม
              </p>
            </div>
            <button
              onClick={() => setCurrentView('my_requests')}
              className="flex items-center space-x-1 text-xs font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400"
            >
              <span>ดูทั้งหมด ({repairs.length})</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-3 font-semibold">เลขที่คำร้อง</th>
                  <th className="py-3 px-3 font-semibold">รายละเอียด / สถานที่</th>
                  <th className="py-3 px-3 font-semibold">สถานะ</th>
                  <th className="py-3 px-3 font-semibold">วันที่แจ้ง</th>
                  <th className="py-3 px-3 text-right font-semibold">คำสั่ง</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRepairs.slice(0, 5).map((item) => (
                  <tr
                    key={item.id}
                    className="group hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-3 font-bold text-sky-600 dark:text-sky-400 whitespace-nowrap">
                      {item.id}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-900 dark:text-slate-100 line-clamp-1">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {item.building} • {item.room}
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {item.status === 'done' ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                          เสร็จสิ้น
                        </span>
                      ) : item.status === 'processing' ? (
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                          <span className="mr-1 h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          กำลังดำเนินการ
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                          <span className="mr-1 h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                          รอดำเนินการ
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap text-[11px]">
                      {item.createdAt.split(' ')[0]}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedRepairId(item.id);
                          setCurrentView('tracking');
                        }}
                        className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 dark:border-slate-700 dark:text-slate-300"
                      >
                        ติดตาม
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Donut & HMI Register Breakdown (5 Cols) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">ประเภทงานซ่อม</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                สัดส่วนการแจ้งซ่อมตามประเภทอุปกรณ์ (HDW10 - HDW13)
              </p>
            </div>
            <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
              รวม {registers.HDW1} คำร้อง
            </span>
          </div>

          {/* SVG Donut Visualizer */}
          <div className="flex items-center justify-center py-4">
            <div className="relative flex h-40 w-40 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#e2e8f0"
                  strokeWidth="12"
                  className="dark:stroke-slate-800"
                />
                {/* Segments */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#38bdf8"
                  strokeWidth="12"
                  strokeDasharray="238.7"
                  strokeDashoffset={238.7 * (1 - 0.32)}
                  strokeLinecap="round"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="12"
                  strokeDasharray="238.7"
                  strokeDashoffset={238.7 * (1 - 0.28)}
                  strokeLinecap="round"
                  className="rotate-[115deg] origin-center"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth="12"
                  strokeDasharray="238.7"
                  strokeDashoffset={238.7 * (1 - 0.24)}
                  strokeLinecap="round"
                  className="rotate-[215deg] origin-center"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {registers.HDW1}
                </span>
                <p className="text-[10px] font-semibold text-slate-400">คำร้อง</p>
              </div>
            </div>
          </div>

          {/* Category List with Registers */}
          <div className="space-y-2.5">
            {categories.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.label}
                  className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs transition-colors hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800"
                >
                  <div className="flex items-center space-x-2.5">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: c.color }}
                    ></span>
                    <Icon className="h-4 w-4 text-slate-500" />
                    <div>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {c.label}
                      </span>
                      <span className="ml-1.5 text-[10px] text-slate-400">({c.register})</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {c.count} งาน
                    </span>
                    <span className="w-10 text-right font-semibold text-slate-500">
                      {c.percent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
