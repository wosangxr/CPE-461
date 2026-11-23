'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  PlusCircle,
  Building2,
  MapPin,
  Monitor,
  Printer,
  Wifi,
  Wrench,
  Zap,
  Droplets,
  Wind,
  Phone,
  User,
  AlertTriangle,
  CheckCircle2,
  Send,
} from 'lucide-react';
import { RepairCategory, RepairPriority } from '@/types';

export default function NewRequestView() {
  const { addRepair, setCurrentView, setSelectedRepairId } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<RepairCategory>('computer');
  const [building, setBuilding] = useState('อาคาร 11 (เฉลิมพระเกียรติ)');
  const [floor, setFloor] = useState('ชั้น 5');
  const [room, setRoom] = useState('');
  const [reporterName, setReporterName] = useState('ธนวัฒน์ ประสาทเขตรการ');
  const [reporterPhone, setReporterPhone] = useState('081-234-5678');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<RepairPriority>('medium');
  const [isSuccess, setIsSuccess] = useState(false);

  const categoryOptions: { id: RepairCategory; label: string; register: string; icon: any }[] = [
    { id: 'computer', label: 'คอมพิวเตอร์', register: 'HDW10', icon: Monitor },
    { id: 'printer', label: 'เครื่องพิมพ์', register: 'HDW11', icon: Printer },
    { id: 'network', label: 'ระบบเครือข่าย', register: 'HDW12', icon: Wifi },
    { id: 'electric', label: 'ระบบไฟฟ้า', register: 'HDW13', icon: Zap },
    { id: 'air', label: 'เครื่องปรับอากาศ', register: 'HDW13', icon: Wind },
    { id: 'plumbing', label: 'ระบบประปา', register: 'HDW13', icon: Droplets },
    { id: 'other', label: 'อื่น ๆ / อาคาร', register: 'HDW13', icon: Wrench },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !room || !description) return;

    const catObj = categoryOptions.find((c) => c.id === category);

    addRepair({
      title,
      category,
      categoryLabel: `${catObj?.label || 'งานซ่อม'} (${catObj?.register || 'HDW'})`,
      building,
      floor,
      room,
      reporterName,
      reporterPhone,
      description,
      status: 'pending',
      priority,
      hmiRegister: catObj?.register || 'HDW2',
    });

    setIsSuccess(true);
    setTimeout(() => {
      setCurrentView('dashboard');
    }, 1500);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          แจ้งซ่อมใหม่ (New Repair Request)
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          กรอกรายละเอียดปัญหาเพื่อส่งคำร้องไปยังระบบศูนย์ซ่อมบำรุง และส่งข้อมูลเข้า MQTT Broker
        </p>
      </div>

      {isSuccess && (
        <div className="flex items-center space-x-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          <div>
            <h4 className="font-bold">ส่งคำร้องแจ้งซ่อมเรียบร้อยแล้ว!</h4>
            <p className="text-xs">
              ระบบได้ส่งข้อมูลไปยัง MQTT Topic <code className="font-mono">repair/request</code> และอัปเดต HMI Registers แล้ว กำลังกลับสู่หน้า Dashboard...
            </p>
          </div>
        </div>
      )}

      {/* Form Container */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        {/* Section 1: ข้อมูลผู้แจ้ง */}
        <div>
          <h3 className="flex items-center space-x-2 text-sm font-bold text-slate-900 dark:text-white">
            <User className="h-4 w-4 text-sky-500" />
            <span>1. ข้อมูลผู้แจ้งคำร้อง</span>
          </h3>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                ชื่อ-นามสกุล ผู้แจ้ง
              </label>
              <input
                type="text"
                required
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                เบอร์โทรศัพท์ติดต่อ
              </label>
              <input
                type="text"
                required
                value={reporterPhone}
                onChange={(e) => setReporterPhone(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
        </div>

        <hr className="border-slate-100 dark:border-slate-800" />

        {/* Section 2: สถานที่เกิดเหตุ */}
        <div>
          <h3 className="flex items-center space-x-2 text-sm font-bold text-slate-900 dark:text-white">
            <Building2 className="h-4 w-4 text-sky-500" />
            <span>2. สถานที่ / อาคารที่พบปัญหา</span>
          </h3>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                อาคาร
              </label>
              <select
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="อาคาร 11 (เฉลิมพระเกียรติ)">อาคาร 11 (เฉลิมพระเกียรติ)</option>
                <option value="อาคาร 5">อาคาร 5</option>
                <option value="อาคาร 1">อาคาร 1</option>
                <option value="อาคาร 9">อาคาร 9</option>
                <option value="อาคาร 40 ปี ศรีปทุม">อาคาร 40 ปี ศรีปทุม</option>
                <option value="โรงอาหารและพื้นที่ส่วนกลาง">โรงอาหารและพื้นที่ส่วนกลาง</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                ชั้น
              </label>
              <select
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="ชั้น 1">ชั้น 1</option>
                <option value="ชั้น 2">ชั้น 2</option>
                <option value="ชั้น 3">ชั้น 3</option>
                <option value="ชั้น 4">ชั้น 4</option>
                <option value="ชั้น 5">ชั้น 5</option>
                <option value="ชั้น 6">ชั้น 6</option>
                <option value="ชั้น 7">ชั้น 7</option>
                <option value="ชั้น 8">ชั้น 8</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                เลขห้อง / จุดสังเกต
              </label>
              <input
                type="text"
                required
                placeholder="เช่น ห้อง 11-502 หรือ โถงบันได"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
        </div>

        <hr className="border-slate-100 dark:border-slate-800" />

        {/* Section 3: ประเภทอุปกรณ์ (เชื่อม HMI Registers) */}
        <div>
          <h3 className="flex items-center space-x-2 text-sm font-bold text-slate-900 dark:text-white">
            <Wrench className="h-4 w-4 text-sky-500" />
            <span>3. ประเภทอุปกรณ์และปัญหา (เชื่อมต่อ HMI Registers)</span>
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            เลือกประเภทงานซ่อมเพื่อปรับค่าตัวนับ Register ในระบบ HMI (HDW10 - HDW13)
          </p>

          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {categoryOptions.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.id;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex flex-col items-center justify-center rounded-xl border p-3.5 text-center transition-all ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50/80 text-sky-700 ring-2 ring-sky-500/20 dark:border-sky-500 dark:bg-sky-950/60 dark:text-sky-300'
                      : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className={`h-6 w-6 ${isSelected ? 'text-sky-600' : 'text-slate-400'}`} />
                  <span className="mt-2 text-xs font-bold">{cat.label}</span>
                  <span className="text-[10px] text-slate-400">{cat.register}</span>
                </button>
              );
            })}
          </div>
        </div>

        <hr className="border-slate-100 dark:border-slate-800" />

        {/* Section 4: รายละเอียดอาการ */}
        <div>
          <h3 className="flex items-center space-x-2 text-sm font-bold text-slate-900 dark:text-white">
            <AlertTriangle className="h-4 w-4 text-sky-500" />
            <span>4. รายละเอียดและอาการเสีย</span>
          </h3>

          <div className="mt-3 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                หัวข้อปัญหา
              </label>
              <input
                type="text"
                required
                placeholder="เช่น จอคอมพิวเตอร์เปิดไม่ติด, เครื่องพิมพ์กระดาษติด"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                อธิบายอาการโดยละเอียด
              </label>
              <textarea
                required
                rows={3}
                placeholder="ระบุอาการผิดปกติ สิ่งที่เกิดขึ้น รหัสเครื่อง หรือข้อความ error ที่แสดง..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                ระดับความเร่งด่วน
              </label>
              <div className="mt-1.5 flex gap-3">
                {(
                  [
                    { id: 'low', label: 'ปกติ (Low)' },
                    { id: 'medium', label: 'ปานกลาง (Medium)' },
                    { id: 'high', label: 'ด่วน (High)' },
                    { id: 'urgent', label: 'ด่วนที่สุด (Urgent)' },
                  ] as const
                ).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      priority === p.id
                        ? 'bg-sky-500 text-white shadow-sm'
                        : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => setCurrentView('dashboard')}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            className="flex items-center space-x-2 rounded-xl bg-sky-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-500/25 transition-all hover:bg-sky-600 active:scale-95"
          >
            <Send className="h-4 w-4" />
            <span>ส่งคำร้องแจ้งซ่อม (Publish to MQTT)</span>
          </button>
        </div>
      </form>
    </div>
  );
}
