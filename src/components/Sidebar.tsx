'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { ActiveView } from '@/types';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Activity,
  BarChart3,
  Settings,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface NavItem {
  id: ActiveView;
  label: string;
  subLabel?: string;
  icon: React.ReactNode;
  badge?: number | string;
}

export default function Sidebar() {
  const { currentView, setCurrentView, registers } = useApp();

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      subLabel: 'ภาพรวมระบบ',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      id: 'new_request',
      label: 'แจ้งซ่อมใหม่',
      subLabel: 'ส่งคำร้อง',
      icon: <PlusCircle className="h-5 w-5" />,
    },
    {
      id: 'my_requests',
      label: 'คำร้องของฉัน',
      subLabel: 'รายการทั้งหมด',
      icon: <FileText className="h-5 w-5" />,
      badge: registers.HDW1,
    },
    {
      id: 'tracking',
      label: 'ติดตามสถานะ',
      subLabel: 'ไทม์ไลน์งานซ่อม',
      icon: <Activity className="h-5 w-5" />,
      badge: registers.HDW3 > 0 ? `${registers.HDW3} ดำเนินการ` : undefined,
    },
    {
      id: 'reports',
      label: 'รายงาน',
      subLabel: 'สถิติและวิเคราะห์',
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      id: 'settings',
      label: 'ตั้งค่าระบบ',
      subLabel: 'MQTT & HMI',
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <aside className="flex h-[calc(100vh-5rem)] w-64 flex-col justify-between border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="space-y-6">
        {/* Navigation list */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25 dark:bg-sky-600'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}>
                    {item.icon}
                  </span>
                  <div>
                    <div className="leading-tight">{item.label}</div>
                    <div
                      className={`text-[10px] ${
                        isActive ? 'text-sky-100' : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {item.subLabel}
                    </div>
                  </div>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* SPU Branding Card at bottom of sidebar (matching PDF mockup) */}
      <div className="space-y-3">
        <div className="rounded-xl border border-sky-100 bg-gradient-to-br from-sky-50 to-indigo-50/50 p-3.5 dark:border-sky-900/50 dark:from-slate-800 dark:to-sky-950/40">
          <div className="flex items-center space-x-2 text-sky-700 dark:text-sky-300">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-xs font-bold">SMART FIX PROMISE</span>
          </div>
          <p className="mt-1 text-xs font-semibold text-slate-800 dark:text-slate-200">
            “แจ้งง่าย ติดตามได้ ตรวจสอบได้”
          </p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            ระบบศูนย์กลางการแจ้งซ่อม มหาวิทยาลัยศรีปทุม
          </p>
        </div>

        <div className="flex items-center justify-between px-2 text-[11px] text-slate-400 dark:text-slate-500">
          <span className="flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            <span>SPU Campus Node</span>
          </span>
          <span>v1.0 (Next+MQTT)</span>
        </div>
      </div>
    </aside>
  );
}
