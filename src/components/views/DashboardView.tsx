'use client';

import React, { useState, useMemo } from 'react';
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
  Monitor,
  Printer,
  Wifi,
  MoreHorizontal,
  RefreshCw,
  Plus,
  Building2,
  Search,
  X,
  BarChart2,
  LineChart,
  FileText,
  SlidersHorizontal,
  Eye,
  Check,
  Calendar,
  User,
  Sparkles,
} from 'lucide-react';
import { monthlyStats, spuBuildings } from '@/lib/mockData';
import { RepairStatus, RepairItem } from '@/types';

export default function DashboardView() {
  const {
    registers,
    repairs,
    setCurrentView,
    setSelectedRepairId,
    updateRepairStatus,
    publishCommand,
    publishMessage,
  } = useApp();

  // Local Filter States
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | RepairStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [chartMode, setChartMode] = useState<'bar' | 'line'>('bar');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);

  // Quick Detail Modal State
  const [detailModalItem, setDetailModalItem] = useState<RepairItem | null>(null);

  // Manual Refresh Handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    // Request fresh status from HMI
    publishCommand({ command: 'get_dashboard' });
    publishMessage('repair/command', { command: 'get_dashboard' });

    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshSuccess(true);
      setTimeout(() => setRefreshSuccess(false), 2500);
    }, 800);
  };

  // Quick Status Advance Handler
  const handleAdvanceStatus = (item: RepairItem, e: React.MouseEvent) => {
    e.stopPropagation();
    let nextStatus: RepairStatus = 'done';
    if (item.status === 'pending') {
      nextStatus = 'processing';
    } else if (item.status === 'processing') {
      nextStatus = 'done';
    } else {
      nextStatus = 'pending';
    }
    updateRepairStatus(item.id, nextStatus);
  };

  // Filter repairs by Building, Status, Category, and Search
  const filteredRepairs = useMemo(() => {
    return repairs.filter((r) => {
      const matchBuilding = !selectedBuilding || r.building.includes(selectedBuilding);
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchCategory =
        !categoryFilter ||
        r.category.toLowerCase() === categoryFilter.toLowerCase() ||
        (categoryFilter === 'other' && !['computer', 'printer', 'network'].includes(r.category));
      const matchSearch =
        !searchQuery ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.building.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.reporterName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchBuilding && matchStatus && matchCategory && matchSearch;
    });
  }, [repairs, selectedBuilding, statusFilter, categoryFilter, searchQuery]);

  // Donut chart calculations
  const totalCategoryCount = Math.max(
    (registers.HDW10 || 0) +
      (registers.HDW11 || 0) +
      (registers.HDW12 || 0) +
      (registers.HDW13 || 0),
    1
  );

  const categories = [
    {
      id: 'computer',
      label: 'คอมพิวเตอร์',
      register: 'HDW10 (X10)',
      count: registers.HDW10 || 0,
      percent: Math.round(((registers.HDW10 || 0) / totalCategoryCount) * 100),
      color: '#38bdf8', // sky-400
      icon: Monitor,
    },
    {
      id: 'printer',
      label: 'เครื่องพิมพ์',
      register: 'HDW11 (X11)',
      count: registers.HDW11 || 0,
      percent: Math.round(((registers.HDW11 || 0) / totalCategoryCount) * 100),
      color: '#10b981', // emerald-500
      icon: Printer,
    },
    {
      id: 'network',
      label: 'เครือข่าย / เน็ต',
      register: 'HDW12 (X12)',
      count: registers.HDW12 || 0,
      percent: Math.round(((registers.HDW12 || 0) / totalCategoryCount) * 100),
      color: '#f59e0b', // amber-500
      icon: Wifi,
    },
    {
      id: 'other',
      label: 'อื่น ๆ / อาคาร',
      register: 'HDW13 (X13)',
      count: registers.HDW13 || 0,
      percent: Math.round(((registers.HDW13 || 0) / totalCategoryCount) * 100),
      color: '#a855f7', // purple-500
      icon: MoreHorizontal,
    },
  ];

  // Active filters count
  const activeFilterCount =
    (statusFilter !== 'all' ? 1 : 0) +
    (selectedBuilding ? 1 : 0) +
    (categoryFilter ? 1 : 0) +
    (searchQuery ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedBuilding(null);
    setStatusFilter('all');
    setCategoryFilter(null);
    setSearchQuery('');
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-4 sm:space-y-7 sm:p-6 xl:p-8">
      {/* Page Title & Interactive Header Actions */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center rounded-md bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:bg-sky-950/80 dark:text-sky-300">
              SPU CAMPUS SYSTEM
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              SMART FIX SERVICE
            </span>
          </div>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            ภาพรวมงานซ่อมบำรุง
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            ระบบติดตามสถานะคำร้องและสั่งการซ่อมบำรุง เชื่อมต่อ HMI & MQTT แบบเรียลไทม์
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="รีเฟรชข้อมูลจาก MQTT และจอ HMI"
            className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-sky-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{refreshSuccess ? 'อัปเดตแล้ว!' : 'ซิงค์ข้อมูล'}</span>
          </button>

          {/* Reports Navigation Button */}
          <button
            onClick={() => setCurrentView('reports')}
            title="ดูรายงานสถิติวิเคราะห์"
            className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <FileText className="h-3.5 w-3.5 text-indigo-500" />
            <span>รายงาน</span>
          </button>

          {/* MQTT/Settings Button */}
          <button
            onClick={() => setCurrentView('settings')}
            title="ตั้งค่าระบบและ HMI Register"
            className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-amber-500" />
            <span>ตั้งค่า HMI</span>
          </button>

          {/* New Request Button */}
          <button
            onClick={() => setCurrentView('new_request')}
            className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-sky-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-sky-500/20 transition-all hover:from-sky-700 hover:to-sky-800 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>แจ้งซ่อมใหม่</span>
          </button>
        </div>
      </div>

      {/* 4 Interactive KPI Cards (Clickable Filter Controls) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {/* Card 1: คำร้องทั้งหมด */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter('all');
            setCategoryFilter(null);
          }}
          className={`relative overflow-hidden rounded-2xl border p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-5 ${
            statusFilter === 'all' && !categoryFilter
              ? 'border-sky-500 bg-sky-50/40 ring-2 ring-sky-500/30 dark:bg-sky-950/20'
              : 'border-slate-200 bg-white hover:border-sky-300 dark:border-slate-800 dark:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 sm:text-sm">
              คำร้องทั้งหมด (HDW1)
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
              <Wrench className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="tabular-nums text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {registers.HDW1}
            </span>
            <span className="text-xs font-semibold text-slate-400">คำร้อง</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+12% เดือนนี้</span>
            </span>
            <span className="text-[10px] text-slate-400">คลิกดูกลุ่มนี้</span>
          </div>
          <div className="absolute top-0 right-0 h-1.5 w-full bg-sky-500"></div>
        </button>

        {/* Card 2: งานซ่อมเสร็จสิ้น */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'done' ? 'all' : 'done')}
          className={`relative overflow-hidden rounded-2xl border p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-5 ${
            statusFilter === 'done'
              ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/30 dark:bg-emerald-950/20'
              : 'border-slate-200 bg-white hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 sm:text-sm">
              งานสำเร็จ (HDW4)
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="tabular-nums text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {registers.HDW4}
            </span>
            <span className="text-xs font-semibold text-slate-400">งาน</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              ปิดงานสำเร็จ
            </span>
            <span className="text-[10px] text-slate-400">
              {statusFilter === 'done' ? '✓ กรองอยู่' : 'คลิกเพื่อกรอง'}
            </span>
          </div>
          <div className="absolute top-0 right-0 h-1.5 w-full bg-emerald-500"></div>
        </button>

        {/* Card 3: กำลังดำเนินการ */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'processing' ? 'all' : 'processing')}
          className={`relative overflow-hidden rounded-2xl border p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-5 ${
            statusFilter === 'processing'
              ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/30 dark:bg-amber-950/20'
              : 'border-slate-200 bg-white hover:border-amber-300 dark:border-slate-800 dark:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 sm:text-sm">
              กำลังดำเนินการ (HDW3)
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="tabular-nums text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {registers.HDW3}
            </span>
            <span className="text-xs font-semibold text-slate-400">งาน</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="flex items-center space-x-1.5 text-amber-600 dark:text-amber-400 font-semibold">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>
              <span>ช่างกำลังซ่อม</span>
            </span>
            <span className="text-[10px] text-slate-400">
              {statusFilter === 'processing' ? '✓ กรองอยู่' : 'คลิกเพื่อกรอง'}
            </span>
          </div>
          <div className="absolute top-0 right-0 h-1.5 w-full bg-amber-500"></div>
        </button>

        {/* Card 4: รอดำเนินการ */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
          className={`relative overflow-hidden rounded-2xl border p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-5 ${
            statusFilter === 'pending'
              ? 'border-rose-500 bg-rose-50/40 ring-2 ring-rose-500/30 dark:bg-rose-950/20'
              : 'border-slate-200 bg-white hover:border-rose-300 dark:border-slate-800 dark:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 sm:text-sm">
              รอดำเนินการ (HDW2)
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="tabular-nums text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {registers.HDW2}
            </span>
            <span className="text-xs font-semibold text-slate-400">งาน</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-rose-600 dark:text-rose-400 font-semibold">
              รอจัดคิวช่าง
            </span>
            <span className="text-[10px] text-slate-400">
              {statusFilter === 'pending' ? '✓ กรองอยู่' : 'คลิกเพื่อกรอง'}
            </span>
          </div>
          <div className="absolute top-0 right-0 h-1.5 w-full bg-rose-500"></div>
        </button>
      </div>

      {/* Row 2: Monthly Trend Chart & Campus Map */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 xl:gap-5">
        {/* Monthly Trend Chart (7 Cols) */}
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:col-span-7 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-slate-900 dark:text-white">
                  สถิติการแจ้งซ่อม (XY PLOT HDW1 - HDW4)
                </h3>
                {selectedMonth && (
                  <span className="rounded-md bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                    เลือก: {selectedMonth}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                คลิกที่แท่งแต่ละเดือนเพื่อดูยอดสถิติเจาะลึก
              </p>
            </div>

            {/* Chart Mode Toggle Buttons */}
            <div className="flex items-center space-x-2">
              <div className="flex rounded-lg border border-slate-200 p-0.5 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setChartMode('bar')}
                  className={`flex items-center space-x-1 rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
                    chartMode === 'bar'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <BarChart2 className="h-3 w-3" />
                  <span>แท่ง</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChartMode('line')}
                  className={`flex items-center space-x-1 rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
                    chartMode === 'line'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <LineChart className="h-3 w-3" />
                  <span>เส้น</span>
                </button>
              </div>

              {selectedMonth && (
                <button
                  type="button"
                  onClick={() => setSelectedMonth(null)}
                  className="rounded-lg bg-slate-100 p-1 text-slate-500 hover:bg-slate-200 dark:bg-slate-800"
                  title="ล้างการเลือกเดือน"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Interactive Chart Visualizer */}
          <div className="mt-6 h-64 w-full">
            <svg className="h-full w-full" viewBox="0 0 500 200" preserveAspectRatio="none">
              {/* Horizontal Grid Lines */}
              <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="0" y1="70" x2="500" y2="70" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="0" y1="170" x2="500" y2="170" stroke="#cbd5e1" strokeWidth="1.5" />

              {/* Chart Mode: Line / XY Plot Mode */}
              {chartMode === 'line' && (
                <>
                  {/* Total Line (Sky) */}
                  <polyline
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={monthlyStats
                      .map((d, i) => `${45 + i * 78},${170 - (d.total / 150) * 140}`)
                      .join(' ')}
                  />
                  {/* Done Line (Emerald) */}
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={monthlyStats
                      .map((d, i) => `${45 + i * 78},${170 - (d.done / 150) * 140}`)
                      .join(' ')}
                  />
                </>
              )}

              {/* Data Points / Bars for each month */}
              {monthlyStats.map((item, idx) => {
                const xBase = 35 + idx * 78;
                const totalH = (item.total / 150) * 140;
                const doneH = (item.done / 150) * 140;
                const isSelected = selectedMonth === item.month;

                return (
                  <g
                    key={item.month}
                    onClick={() => setSelectedMonth(isSelected ? null : item.month)}
                    className="group cursor-pointer"
                  >
                    {/* Background highlight when selected */}
                    {isSelected && (
                      <rect
                        x={xBase - 6}
                        y="10"
                        width="58"
                        height="165"
                        rx="8"
                        className="fill-sky-50/80 dark:fill-sky-950/30 stroke-1 stroke-sky-300"
                      />
                    )}

                    {chartMode === 'bar' ? (
                      <>
                        {/* Bar 1: Total (Sky) */}
                        <rect
                          x={xBase}
                          y={170 - totalH}
                          width="20"
                          height={totalH}
                          rx="4"
                          className={`transition-all ${
                            isSelected
                              ? 'fill-sky-600 stroke-2 stroke-sky-300'
                              : 'fill-sky-400 group-hover:fill-sky-500'
                          }`}
                        />
                        {/* Bar 2: Done (Emerald) */}
                        <rect
                          x={xBase + 24}
                          y={170 - doneH}
                          width="20"
                          height={doneH}
                          rx="4"
                          className={`transition-all ${
                            isSelected
                              ? 'fill-emerald-600 stroke-2 stroke-emerald-300'
                              : 'fill-emerald-400 group-hover:fill-emerald-500'
                          }`}
                        />
                      </>
                    ) : (
                      <>
                        {/* Dot on Line */}
                        <circle
                          cx={xBase + 10}
                          cy={170 - totalH}
                          r={isSelected ? '6' : '4'}
                          className="fill-white stroke-[3] stroke-sky-500 group-hover:scale-125 transition-transform"
                        />
                        <circle
                          cx={xBase + 10}
                          cy={170 - doneH}
                          r={isSelected ? '6' : '4'}
                          className="fill-white stroke-[3] stroke-emerald-500 group-hover:scale-125 transition-transform"
                        />
                      </>
                    )}

                    {/* Value Badge on top */}
                    <text
                      x={xBase + 10}
                      y={162 - totalH}
                      textAnchor="middle"
                      className={`text-[10px] font-bold fill-sky-700 transition-opacity ${
                        isSelected ? 'opacity-100 font-black' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {item.total}
                    </text>
                    <text
                      x={xBase + 34}
                      y={162 - doneH}
                      textAnchor="middle"
                      className={`text-[10px] font-bold fill-emerald-700 transition-opacity ${
                        isSelected ? 'opacity-100 font-black' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {item.done}
                    </text>

                    {/* Month Label */}
                    <text
                      x={xBase + 22}
                      y="190"
                      textAnchor="middle"
                      className={`text-xs font-semibold ${
                        isSelected ? 'fill-sky-600 font-black' : 'fill-slate-600 dark:fill-slate-400'
                      }`}
                    >
                      {item.month}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Month Stats Summary Bar when clicked */}
          {selectedMonth && (
            <div className="mt-3 flex items-center justify-between rounded-xl bg-sky-50 p-3 text-xs dark:bg-sky-950/40">
              <span className="font-bold text-sky-900 dark:text-sky-300">
                ข้อมูลสรุปประจำเดือน {selectedMonth}:
              </span>
              <div className="flex items-center space-x-4">
                <span className="text-slate-600 dark:text-slate-300">
                  คำร้องทั้งหมด:{' '}
                  <b className="text-sky-600">
                    {monthlyStats.find((m) => m.month === selectedMonth)?.total || 0}
                  </b>
                </span>
                <span className="text-slate-600 dark:text-slate-300">
                  ซ่อมเสร็จ:{' '}
                  <b className="text-emerald-600">
                    {monthlyStats.find((m) => m.month === selectedMonth)?.done || 0}
                  </b>
                </span>
                <span className="text-slate-600 dark:text-slate-300">
                  อัตราสำเร็จ:{' '}
                  <b className="text-indigo-600">
                    {Math.round(
                      ((monthlyStats.find((m) => m.month === selectedMonth)?.done || 0) /
                        (monthlyStats.find((m) => m.month === selectedMonth)?.total || 1)) *
                        100
                    )}
                    %
                  </b>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Campus Map & Building Filter (5 Cols) */}
        <div className="flex min-w-0 flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:col-span-5 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-sky-500" />
                <h3 className="font-bold text-slate-900 dark:text-white">แผนที่พื้นที่การแจ้งซ่อม</h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">มหาวิทยาลัยศรีปทุม</span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              คลิกอาคารบนแผนที่หรือปุ่มด้านล่าง เพื่อกรองงานซ่อมในพื้นที่ทันที
            </p>

            {/* Interactive Campus SVG Map */}
            <div className="relative mt-4 h-48 w-full overflow-hidden rounded-xl border border-sky-100 bg-gradient-to-br from-sky-50/60 to-indigo-50/40 p-2 dark:border-slate-800 dark:from-slate-800/50 dark:to-slate-900">
              <svg className="h-full w-full" viewBox="0 0 100 80">
                <path d="M 10 40 Q 50 35 90 40" stroke="#cbd5e1" strokeWidth="3" fill="none" />
                <path d="M 50 10 L 50 70" stroke="#cbd5e1" strokeWidth="2.5" fill="none" />

                {spuBuildings.map((b) => {
                  const isSelected = selectedBuilding === b.name;
                  return (
                    <g
                      key={b.id}
                      onClick={() =>
                        setSelectedBuilding(selectedBuilding === b.name ? null : b.name)
                      }
                      className="cursor-pointer group"
                    >
                      <rect
                        x={b.x - 12}
                        y={b.y - 8}
                        width="24"
                        height="16"
                        rx="3"
                        className={`transition-all ${
                          isSelected
                            ? 'fill-sky-500 stroke-2 stroke-white dark:stroke-slate-900 shadow-lg'
                            : 'fill-white stroke-1 stroke-sky-300 hover:fill-sky-50 dark:fill-slate-800 dark:stroke-slate-600'
                        }`}
                      />
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
                  type="button"
                  onClick={() => setSelectedBuilding(null)}
                  className="absolute bottom-2 left-2 flex items-center space-x-1 rounded-md bg-white/95 px-2.5 py-1 text-[11px] font-bold text-sky-600 shadow-md backdrop-blur hover:bg-white dark:bg-slate-800/95 dark:text-sky-400"
                >
                  <X className="h-3 w-3" />
                  <span>ล้างตัวกรอง ({selectedBuilding})</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Building List Pills (All Clickable) */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {spuBuildings.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedBuilding(selectedBuilding === b.name ? null : b.name)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all active:scale-95 ${
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
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 xl:gap-5">
        {/* Recent Requests Table with Interactive Filters & Quick Actions (7 Cols) */}
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:col-span-7 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-slate-900 dark:text-white">รายการคำร้องล่าสุด</h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  พบ {filteredRepairs.length} รายการ
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                คลิกแถวเพื่อดูรายละเอียด หรือกดปุ่มเปลี่ยนสถานะงานซ่อมได้ทันที
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {/* Clear filters badge if active */}
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="flex items-center space-x-1 rounded-lg bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300"
                >
                  <X className="h-3 w-3" />
                  <span>ล้างกรอง ({activeFilterCount})</span>
                </button>
              )}

              {/* View All Button */}
              <button
                type="button"
                onClick={() => setCurrentView('my_requests')}
                className="flex items-center space-x-1 text-xs font-bold text-sky-600 hover:text-sky-700 dark:text-sky-400"
              >
                <span>ดูทั้งหมด ({repairs.length})</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Table Interactive Filters: Search & Status Pills */}
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาชื่อ, รหัส, อาคาร, ห้อง..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs outline-none focus:border-sky-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Status Tabs */}
            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                  statusFilter === 'all'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                ทั้งหมด
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                  statusFilter === 'pending'
                    ? 'bg-rose-500 text-white'
                    : 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-300'
                }`}
              >
                รอดำเนินการ
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('processing')}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                  statusFilter === 'processing'
                    ? 'bg-amber-500 text-white'
                    : 'bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-300'
                }`}
              >
                กำลังซ่อม
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('done')}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                  statusFilter === 'done'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300'
                }`}
              >
                เสร็จสิ้น
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">เลขที่คำร้อง</th>
                  <th className="py-2.5 px-3 font-semibold">รายละเอียด / สถานที่</th>
                  <th className="py-2.5 px-3 font-semibold">สถานะ (คลิกเพื่อเปลี่ยน)</th>
                  <th className="py-2.5 px-3 font-semibold">วันที่แจ้ง</th>
                  <th className="py-2.5 px-3 text-right font-semibold">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRepairs.slice(0, 6).map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => {
                      setSelectedRepairId(item.id);
                      setDetailModalItem(item);
                    }}
                    className="group cursor-pointer hover:bg-sky-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-3 font-bold text-sky-600 dark:text-sky-400 whitespace-nowrap">
                      {item.id}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-sky-700 dark:group-hover:text-sky-400">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center space-x-1.5 mt-0.5">
                        <Building2 className="h-3 w-3" />
                        <span>
                          {item.building} • {item.room}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {/* Clickable Status Button */}
                      <button
                        type="button"
                        onClick={(e) => handleAdvanceStatus(item, e)}
                        title="คลิกเพื่อเปลี่ยนสถานะงานซ่อม"
                        className={`inline-flex items-center space-x-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all hover:scale-105 active:scale-95 ${
                          item.status === 'done'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                            : item.status === 'processing'
                            ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            item.status === 'done'
                              ? 'bg-emerald-500'
                              : item.status === 'processing'
                              ? 'bg-amber-500 animate-pulse'
                              : 'bg-rose-500'
                          }`}
                        />
                        <span>
                          {item.status === 'done'
                            ? 'เสร็จสิ้น'
                            : item.status === 'processing'
                            ? 'กำลังดำเนินการ'
                            : 'รอดำเนินการ'}
                        </span>
                      </button>
                    </td>
                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap text-[11px]">
                      {item.createdAt.split(' ')[0]}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        {/* Detail Modal Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRepairId(item.id);
                            setDetailModalItem(item);
                          }}
                          className="rounded-lg border border-slate-200 p-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300"
                          title="ดูรายละเอียดคำร้อง"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>

                        {/* Track View Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRepairId(item.id);
                            setCurrentView('tracking');
                          }}
                          className="rounded-lg bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-sky-700 hover:bg-sky-100 dark:bg-sky-950 dark:text-sky-300"
                        >
                          ติดตาม
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredRepairs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                      ไม่พบคำร้องที่ตรงกับเงื่อนไขการค้นหา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Donut & Interactive Filter (5 Cols) */}
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:col-span-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">ประเภทงานซ่อม</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                สัดส่วนการแจ้งซ่อม (HDW10 - HDW13)
              </p>
            </div>
            <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
              รวม {registers.HDW1} คำร้อง
            </span>
          </div>

          <p className="text-[11px] text-slate-400 mb-3">
            💡 คลิกเลือกหมวดหมู่อุปกรณ์ เพื่อกรองคำร้องในตารางทันที
          </p>

          {/* SVG Donut Visualizer */}
          <div className="flex items-center justify-center py-2">
            <div className="relative flex h-36 w-36 items-center justify-center">
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
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#38bdf8"
                  strokeWidth="12"
                  strokeDasharray="238.7"
                  strokeDashoffset={238.7 * (1 - 0.35)}
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
                  strokeDashoffset={238.7 * (1 - 0.25)}
                  strokeLinecap="round"
                  className="rotate-[125deg] origin-center"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth="12"
                  strokeDasharray="238.7"
                  strokeDashoffset={238.7 * (1 - 0.22)}
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

          {/* Category Clickable Pills */}
          <div className="space-y-2 mt-2">
            {categories.map((c) => {
              const Icon = c.icon;
              const isSelected = categoryFilter === c.id;
              return (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setCategoryFilter(isSelected ? null : c.id)}
                  className={`w-full flex items-center justify-between rounded-xl p-2.5 text-xs transition-all active:scale-98 ${
                    isSelected
                      ? 'border-2 border-sky-500 bg-sky-50 shadow-sm dark:bg-sky-950/40'
                      : 'border border-transparent bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span
                      className="h-3 w-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: c.color }}
                    />
                    <Icon className="h-4 w-4 text-slate-500 flex-shrink-0" />
                    <div className="text-left">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {c.label}
                      </span>
                      <span className="ml-1 text-[10px] text-slate-400">({c.register})</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {c.count} งาน
                    </span>
                    <span className="w-9 text-right font-semibold text-slate-400">
                      {c.percent}%
                    </span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-sky-600" />}
                  </div>
                </button>
              );
            })}

            {categoryFilter && (
              <button
                type="button"
                onClick={() => setCategoryFilter(null)}
                className="w-full text-center text-[11px] font-semibold text-slate-500 hover:text-slate-800 py-1"
              >
                ล้างการกรองหมวดหมู่
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal / Quick View Dialog */}
      {detailModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="rounded-lg bg-sky-100 px-2 py-0.5 text-xs font-bold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                  {detailModalItem.id}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    detailModalItem.status === 'done'
                      ? 'bg-emerald-100 text-emerald-800'
                      : detailModalItem.status === 'processing'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {detailModalItem.status === 'done'
                    ? 'เสร็จสิ้น'
                    : detailModalItem.status === 'processing'
                    ? 'กำลังดำเนินการ'
                    : 'รอดำเนินการ'}
                </span>
              </div>
              <button
                onClick={() => setDetailModalItem(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-4 space-y-4">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {detailModalItem.title}
                </h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {detailModalItem.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-800/50">
                <div>
                  <span className="text-slate-400">สถานที่:</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    {detailModalItem.building} • ห้อง {detailModalItem.room}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">ผู้แจ้ง:</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    {detailModalItem.reporterName}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">หมวดหมู่:</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                    {detailModalItem.category}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">ความเร่งด่วน:</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                    {detailModalItem.priority}
                  </div>
                </div>
              </div>

              {detailModalItem.technicianNote && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 text-xs dark:border-amber-900/40 dark:bg-amber-950/20">
                  <span className="font-bold text-amber-800 dark:text-amber-300">
                    บันทึกจากช่าง ({detailModalItem.technicianName || 'ทีมช่าง'}):
                  </span>
                  <p className="mt-0.5 text-amber-900 dark:text-amber-200">
                    {detailModalItem.technicianNote}
                  </p>
                </div>
              )}

              {/* Quick Status Control Inside Modal */}
              <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-500">
                  เปลี่ยนสถานะงานซ่อมนี้:
                </span>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      updateRepairStatus(detailModalItem.id, 'pending');
                      setDetailModalItem({ ...detailModalItem, status: 'pending' });
                    }}
                    className={`rounded-xl py-2 text-xs font-bold transition-all ${
                      detailModalItem.status === 'pending'
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                    }`}
                  >
                    รอดำเนินการ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateRepairStatus(detailModalItem.id, 'processing');
                      setDetailModalItem({ ...detailModalItem, status: 'processing' });
                    }}
                    className={`rounded-xl py-2 text-xs font-bold transition-all ${
                      detailModalItem.status === 'processing'
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    กำลังซ่อม
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateRepairStatus(detailModalItem.id, 'done');
                      setDetailModalItem({ ...detailModalItem, status: 'done' });
                    }}
                    className={`rounded-xl py-2 text-xs font-bold transition-all ${
                      detailModalItem.status === 'done'
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    เสร็จสิ้น
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-5 flex items-center justify-end space-x-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDetailModalItem(null)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300"
              >
                ปิด
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedRepairId(detailModalItem.id);
                  setDetailModalItem(null);
                  setCurrentView('tracking');
                }}
                className="flex items-center space-x-1.5 rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white hover:bg-sky-700"
              >
                <span>เปิดดูไทม์ไลน์ติดตาม</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
