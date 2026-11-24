'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Bell,
  Wifi,
  WifiOff,
  Activity,
  CheckCircle2,
  AlertTriangle,
  User,
  Settings,
  Sparkles,
} from 'lucide-react';

export default function Header() {
  const {
    connectionStatus,
    mqttConfig,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    isSimulationMode,
    setIsSimulationMode,
    setCurrentView,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between gap-2 border-b border-slate-200 bg-white/95 px-3 backdrop-blur-md sm:h-20 sm:px-6 dark:border-slate-800 dark:bg-slate-900/95">
      {/* Brand & Project Identity */}
      <div className="flex min-w-0 items-center space-x-2 sm:space-x-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-500/20 sm:h-12 sm:w-12">
          <span className="text-base font-black tracking-tight sm:text-xl">SPU</span>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="whitespace-nowrap text-sm font-bold tracking-tight text-slate-900 sm:text-xl dark:text-white">
              Smart Fix Service
            </h1>
            <span className="hidden rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-700 lg:inline dark:bg-sky-950 dark:text-sky-300">
              Sripatum University
            </span>
          </div>
          <p className="hidden text-xs font-medium text-slate-500 sm:block dark:text-slate-400">
            ระบบแจ้งซ่อมและติดตามสถานะงานซ่อม ภายในมหาวิทยาลัยศรีปทุม
          </p>
        </div>
      </div>

      {/* Right Actions: MQTT Status, Simulator toggle, Notifications, User Profile */}
      <div className="flex shrink-0 items-center space-x-1.5 sm:space-x-3">
        {/* Simulation Mode Toggle Button */}
        <button
          onClick={() => setIsSimulationMode(!isSimulationMode)}
          className={`flex min-h-10 items-center space-x-1.5 rounded-lg px-2 sm:px-3 sm:py-1.5 text-xs font-medium transition-all ${
            isSimulationMode
              ? 'border border-amber-300 bg-amber-50 text-amber-800 shadow-sm dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
              : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
          }`}
          title="สลับโหมดจำลองข้อมูล MQTT (เมื่อไม่มี HMI จริงเชื่อมต่อ)"
        >
          <Sparkles className={`h-3.5 w-3.5 ${isSimulationMode ? 'text-amber-600 animate-pulse' : 'text-slate-400'}`} />
          <span className="hidden lg:inline">{isSimulationMode ? 'จำลองข้อมูล (Sim Active)' : 'เชื่อมต่อจริง (Live)'}</span>
        </button>

        {/* MQTT Connection Status Pill */}
        <button
          onClick={() => setCurrentView('settings')}
          className={`flex min-h-10 items-center space-x-1.5 rounded-lg border px-2 sm:space-x-2 sm:px-3 sm:py-1.5 text-xs font-semibold transition-all shadow-sm ${
            connectionStatus === 'connected'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
              : connectionStatus === 'connecting'
              ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
              : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
          }`}
          title="คลิกเพื่อไปที่หน้าตั้งค่า MQTT Broker"
        >
          {connectionStatus === 'connected' ? (
            <>
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              </span>
              <Wifi className="h-3.5 w-3.5 text-emerald-600" />
              <span className="hidden sm:inline">MQTT Connected</span>
            </>
          ) : connectionStatus === 'connecting' ? (
            <>
              <Activity className="h-3.5 w-3.5 animate-spin text-amber-600" />
              <span className="hidden sm:inline">Connecting...</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3.5 w-3.5 text-rose-600" />
              <span className="hidden sm:inline">MQTT Disconnected</span>
            </>
          )}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            title="การแจ้งเตือน"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50">
              <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  การแจ้งเตือนล่าสุด ({unreadCount})
                </span>
                <button
                  onClick={clearAllNotifications}
                  className="text-[11px] text-sky-600 hover:underline dark:text-sky-400"
                >
                  ล้างทั้งหมด
                </button>
              </div>
              <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <p className="py-4 text-center text-xs text-slate-400">ไม่มีการแจ้งเตือนใหม่</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationAsRead(n.id)}
                      className={`cursor-pointer rounded-lg p-2.5 text-xs transition-colors ${
                        n.read
                          ? 'bg-slate-50 text-slate-600 dark:bg-slate-800/40 dark:text-slate-400'
                          : 'bg-sky-50/80 text-slate-900 font-medium dark:bg-sky-950/40 dark:text-sky-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-400">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile matching PDF */}
        <div className="flex items-center space-x-3 border-l border-slate-200 pl-3 dark:border-slate-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 ring-2 ring-sky-500/30 dark:bg-slate-800 dark:text-slate-200">
            <User className="h-5 w-5" />
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              ธนวัฒน์ ประสาทเขตรการ
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              ผู้ใช้งานทั่วไป / SPU Staff
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
