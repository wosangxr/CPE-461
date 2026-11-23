'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  User,
  Calendar,
  Send,
  Wrench,
  FileText,
  Phone,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { RepairStatus } from '@/types';

export default function TrackingView() {
  const {
    repairs,
    selectedRepairId,
    setSelectedRepairId,
    updateRepairStatus,
    connectionStatus,
  } = useApp();

  const currentItem = repairs.find((r) => r.id === selectedRepairId) || repairs[0];
  const [techNote, setTechNote] = useState('');
  const [techName, setTechName] = useState('ช่างวิชัย (ทีมซ่อมบำรุง SPU)');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!currentItem) {
    return (
      <div className="p-8 text-center text-slate-500">
        ยังไม่มีรายการแจ้งซ่อมในระบบ
      </div>
    );
  }

  // Calculate timeline active steps
  // 1: Created -> 2: Assigned -> 3: Processing -> 4: Done
  const getStepStatus = (stepIndex: number) => {
    if (currentItem.status === 'done') return 'done';
    if (currentItem.status === 'processing') {
      if (stepIndex <= 3) return 'done';
      return 'pending';
    }
    // pending
    if (stepIndex <= 1) return 'done';
    return 'pending';
  };

  const handleUpdateStatus = (newStatus: RepairStatus) => {
    updateRepairStatus(
      currentItem.id,
      newStatus,
      techNote || currentItem.technicianNote,
      techName || currentItem.technicianName
    );

    setStatusMessage(`อัปเดตสถานะเป็น "${newStatus}" และส่ง Publish ไปยัง MQTT Topic "repair/command" สำเร็จ!`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {/* Title & Request Selector */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            ติดตามสถานะงานซ่อม (Repair Status Tracking)
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            ตรวจสอบขั้นตอนการทำงาน และควบคุมสถานะเพื่อส่งคำสั่งไปยัง MQTT Broker / HMI
          </p>
        </div>

        {/* Dropdown selector */}
        <div className="relative min-w-[240px]">
          <select
            value={currentItem.id}
            onChange={(e) => setSelectedRepairId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-sky-700 shadow-sm outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-sky-400"
          >
            {repairs.map((r) => (
              <option key={r.id} value={r.id}>
                {r.id} - {r.title.substring(0, 25)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {statusMessage && (
        <div className="flex items-center space-x-3 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sky-800 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300 animate-fadeIn">
          <CheckCircle2 className="h-5 w-5 text-sky-600" />
          <p className="text-xs font-semibold">{statusMessage}</p>
        </div>
      )}

      {/* Main Card */}
      <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* Header of Item */}
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center dark:border-slate-800">
          <div>
            <div className="flex items-center space-x-3">
              <span className="text-lg font-black text-sky-600 dark:text-sky-400">
                {currentItem.id}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {currentItem.categoryLabel}
              </span>
              <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                Register: {currentItem.hmiRegister || 'HDW'}
              </span>
            </div>
            <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
              {currentItem.title}
            </h3>
          </div>

          <div>
            {currentItem.status === 'done' ? (
              <span className="inline-flex items-center rounded-xl bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" />
                ซ่อมเสร็จสิ้น (HDW4)
              </span>
            ) : currentItem.status === 'processing' ? (
              <span className="inline-flex items-center rounded-xl bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                <Clock className="mr-2 h-4 w-4 text-amber-500 animate-spin" />
                กำลังดำเนินการ (HDW3)
              </span>
            ) : (
              <span className="inline-flex items-center rounded-xl bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                <AlertCircle className="mr-2 h-4 w-4 text-rose-500" />
                รอดำเนินการ (HDW2)
              </span>
            )}
          </div>
        </div>

        {/* 4-Step Interactive Visual Timeline (Matching Report Section 5.4) */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            ลำดับขั้นตอนการดำเนินงาน (Status Progress)
          </h4>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-4">
            {/* Step 1 */}
            <div
              className={`rounded-xl border p-4 text-left transition-all ${
                getStepStatus(1) === 'done'
                  ? 'border-emerald-300 bg-emerald-50/60 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
                  : 'border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-[11px] font-bold text-white">
                  ✓
                </span>
                <span className="text-xs font-bold">1. รับเรื่องแจ้งซ่อม</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                บันทึกเข้าสู่ระบบฐานข้อมูล
              </p>
              <span className="mt-1 block text-[10px] text-slate-400">{currentItem.createdAt}</span>
            </div>

            {/* Step 2 */}
            <div
              className={`rounded-xl border p-4 text-left transition-all ${
                getStepStatus(2) === 'done'
                  ? 'border-emerald-300 bg-emerald-50/60 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
                  : 'border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                    getStepStatus(2) === 'done'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-300 text-slate-600 dark:bg-slate-700'
                  }`}
                >
                  {getStepStatus(2) === 'done' ? '✓' : '2'}
                </span>
                <span className="text-xs font-bold">2. มอบหมายช่าง</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                จัดสรรคิวงานและอุปกรณ์
              </p>
              <span className="mt-1 block text-[10px] text-slate-400">
                {currentItem.technicianName ? 'จ่ายงานแล้ว' : 'รอการจ่ายงาน'}
              </span>
            </div>

            {/* Step 3 */}
            <div
              className={`rounded-xl border p-4 text-left transition-all ${
                getStepStatus(3) === 'done'
                  ? 'border-emerald-300 bg-emerald-50/60 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
                  : currentItem.status === 'processing'
                  ? 'border-amber-400 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200'
                  : 'border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                    getStepStatus(3) === 'done'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-amber-500 text-white animate-pulse'
                  }`}
                >
                  {getStepStatus(3) === 'done' ? '✓' : '3'}
                </span>
                <span className="text-xs font-bold">3. กำลังดำเนินการ</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                ช่างกำลังลงพื้นที่แก้ไข
              </p>
              <span className="mt-1 block text-[10px] text-slate-400">HDW3 (Register X26)</span>
            </div>

            {/* Step 4 */}
            <div
              className={`rounded-xl border p-4 text-left transition-all ${
                currentItem.status === 'done'
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
                  : 'border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                    currentItem.status === 'done'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-300 text-slate-600 dark:bg-slate-700'
                  }`}
                >
                  {currentItem.status === 'done' ? '✓' : '4'}
                </span>
                <span className="text-xs font-bold">4. ซ่อมเสร็จสมบูรณ์</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                ทดสอบและส่งมอบงาน
              </p>
              <span className="mt-1 block text-[10px] text-slate-400">HDW4 (Register X27)</span>
            </div>
          </div>
        </div>

        {/* Detailed Information Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Left: รายละเอียดและสถานที่ */}
          <div className="space-y-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
            <h4 className="flex items-center space-x-2 text-xs font-bold text-slate-900 dark:text-white">
              <Building2 className="h-4 w-4 text-sky-500" />
              <span>สถานที่และข้อมูลผู้แจ้ง</span>
            </h4>
            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <div>
                <span className="font-semibold text-slate-500">อาคาร:</span> {currentItem.building}
              </div>
              <div>
                <span className="font-semibold text-slate-500">ชั้น / ห้อง:</span> {currentItem.floor} • {currentItem.room}
              </div>
              <div>
                <span className="font-semibold text-slate-500">ผู้แจ้ง:</span> {currentItem.reporterName} ({currentItem.reporterPhone})
              </div>
              <div className="pt-2">
                <span className="font-semibold text-slate-500">อาการเสีย:</span>
                <p className="mt-1 rounded-lg bg-white p-2.5 text-xs text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                  {currentItem.description}
                </p>
              </div>
            </div>
          </div>

          {/* Right: ข้อมูลช่างและบันทึกการซ่อม */}
          <div className="space-y-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
            <h4 className="flex items-center space-x-2 text-xs font-bold text-slate-900 dark:text-white">
              <Wrench className="h-4 w-4 text-sky-500" />
              <span>ข้อมูลช่างผู้รับผิดชอบงาน</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">ช่างผู้รับผิดชอบ:</label>
                <input
                  type="text"
                  value={techName}
                  onChange={(e) => setTechName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-semibold mb-1">บันทึกการซ่อม / การแก้ไข:</label>
                <textarea
                  rows={2}
                  placeholder={currentItem.technicianNote || 'ระบุการตรวจเช็คหรือผลการซ่อม...'}
                  value={techNote}
                  onChange={(e) => setTechNote(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar (Publish Command to MQTT) */}
        <div className="rounded-xl border border-sky-100 bg-gradient-to-r from-sky-50/50 via-white to-sky-50/50 p-4 dark:border-slate-800 dark:from-slate-800/40 dark:via-slate-900 dark:to-slate-800/40">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                คำสั่งเปลี่ยนสถานะงานซ่อม (MQTT Publish Command)
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                เมื่อคลิกปุ่ม ระบบจะส่งข้อมูลคำสั่งไปยัง Topic <code className="font-mono text-sky-600">repair/command</code> เพื่อสั่งงาน HMI ทันที
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleUpdateStatus('pending')}
                disabled={currentItem.status === 'pending'}
                className="rounded-xl border border-rose-200 bg-white px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-40 dark:border-rose-900 dark:bg-slate-800 dark:text-rose-300"
              >
                รอดำเนินการ (X25)
              </button>
              <button
                onClick={() => handleUpdateStatus('processing')}
                disabled={currentItem.status === 'processing'}
                className="rounded-xl border border-amber-200 bg-amber-500 px-3.5 py-2 text-xs font-bold text-white hover:bg-amber-600 disabled:opacity-40 shadow-sm"
              >
                เริ่มซ่อมบำรุง (X26)
              </button>
              <button
                onClick={() => handleUpdateStatus('done')}
                disabled={currentItem.status === 'done'}
                className="rounded-xl border border-emerald-200 bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-40 shadow-sm"
              >
                ปิดงานสำเร็จ (X27)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
