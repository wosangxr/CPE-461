'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Plus,
  Building2,
  Calendar,
  User,
  ArrowUpDown,
} from 'lucide-react';
import { RepairStatus, RepairCategory } from '@/types';

export default function MyRequestsView() {
  const { repairs, setCurrentView, setSelectedRepairId } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | RepairStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | RepairCategory>('all');

  const filtered = repairs.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.building.toLowerCase().includes(search.toLowerCase()) ||
      r.room.toLowerCase().includes(search.toLowerCase()) ||
      r.reporterName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            รายการคำร้องแจ้งซ่อม (All Repair Requests)
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            ตรวจสอบรายการคำร้องทั้งหมด ค้นหา กรองสถานะ และติดตามความคืบหน้า
          </p>
        </div>
        <button
          onClick={() => setCurrentView('new_request')}
          className="flex items-center space-x-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-500/25 transition-all hover:bg-sky-600 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>แจ้งซ่อมใหม่</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between dark:border-slate-800 dark:bg-slate-900">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาตามเลขที่คำร้อง (FS-...), หัวข้อ, อาคาร, ห้อง..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-2 pl-10 pr-4 text-xs outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { id: 'all', label: `ทั้งหมด (${repairs.length})` },
              {
                id: 'pending',
                label: `รอดำเนินการ (${repairs.filter((r) => r.status === 'pending').length})`,
              },
              {
                id: 'processing',
                label: `กำลังดำเนินการ (${repairs.filter((r) => r.status === 'processing').length})`,
              },
              {
                id: 'done',
                label: `เสร็จสิ้น (${repairs.filter((r) => r.status === 'done').length})`,
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                statusFilter === tab.id
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Grid / Table */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <AlertCircle className="h-10 w-10 text-slate-300 dark:text-slate-600" />
            <h4 className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-300">
              ไม่พบรายการคำร้องที่ค้นหา
            </h4>
            <p className="mt-1 text-xs text-slate-400">
              ลองปรับเงื่อนไขการค้นหา หรือกดแจ้งซ่อมใหม่
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-sky-300 hover:shadow-md md:flex-row md:items-center dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sky-800"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-sky-600 dark:text-sky-400 text-sm">
                    {item.id}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {item.categoryLabel}
                  </span>
                  {item.priority === 'urgent' && (
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                      ด่วนที่สุด
                    </span>
                  )}
                  {item.priority === 'high' && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                      ด่วน
                    </span>
                  )}
                </div>

                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h4>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center space-x-1">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    <span>
                      {item.building} • {item.floor} • {item.room}
                    </span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span>ผู้แจ้ง: {item.reporterName}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>วันที่แจ้ง: {item.createdAt}</span>
                  </span>
                </div>
              </div>

              {/* Status and Action */}
              <div className="mt-4 flex items-center justify-between gap-4 border-t border-slate-100 pt-3 md:mt-0 md:border-0 md:pt-0">
                <div>
                  {item.status === 'done' ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
                      ซ่อมเสร็จสิ้น (HDW4)
                    </span>
                  ) : item.status === 'processing' ? (
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                      <Clock className="mr-1.5 h-3.5 w-3.5 text-amber-500 animate-spin" />
                      กำลังดำเนินการ (HDW3)
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                      <AlertCircle className="mr-1.5 h-3.5 w-3.5 text-rose-500" />
                      รอดำเนินการ (HDW2)
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    setSelectedRepairId(item.id);
                    setCurrentView('tracking');
                  }}
                  className="flex items-center space-x-1.5 rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 transition-all hover:bg-sky-50 hover:text-sky-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <span>ไทม์ไลน์ & จัดการ</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
