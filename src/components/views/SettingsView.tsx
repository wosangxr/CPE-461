'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Settings,
  Wifi,
  WifiOff,
  RefreshCw,
  Send,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  CheckCircle2,
  Trash2,
  Copy,
  Sliders,
} from 'lucide-react';
import { MQTTConfig } from '@/types';

export default function SettingsView() {
  const {
    mqttConfig,
    setMqttConfig,
    connectionStatus,
    connectMqtt,
    disconnectMqtt,
    publishMessage,
    registers,
    setRegisters,
    mqttLogs,
    clearLogs,
    isSimulationMode,
    setIsSimulationMode,
  } = useApp();

  const [formConfig, setFormConfig] = useState<MQTTConfig>(mqttConfig);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Manual Publish state
  const [publishTopic, setPublishTopic] = useState('repair/command');
  const [publishPayload, setPublishPayload] = useState(
    JSON.stringify(
      {
        command: 'set address',
        X24: 4,
        X25: 1,
        X26: 2,
        X27: 3,
      },
      null,
      2
    )
  );
  const [publishSuccess, setPublishSuccess] = useState(false);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setMqttConfig(formConfig);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      connectMqtt();
    }, 1000);
  };

  const handlePublish = () => {
    try {
      const parsed = JSON.parse(publishPayload);
      publishMessage(publishTopic, parsed);
      setPublishSuccess(true);
      setTimeout(() => setPublishSuccess(false), 2500);
    } catch {
      publishMessage(publishTopic, publishPayload);
      setPublishSuccess(true);
      setTimeout(() => setPublishSuccess(false), 2500);
    }
  };

  const setTemplate = (tpl: any) => {
    setPublishPayload(JSON.stringify(tpl, null, 2));
  };

  return (
    <div className="space-y-6 p-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          ตั้งค่าการเชื่อมต่อ MQTT และมอนิเตอร์ HMI
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          กำหนดค่า Broker WebSocket, หัวข้อ Topics, ตรวจสอบสถานะ Register และทดสอบรับส่งข้อมูล
        </p>
      </div>

      {saveSuccess && (
        <div className="flex items-center space-x-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>บันทึกการตั้งค่าแล้ว กำลังเริ่มเชื่อมต่อใหม่...</span>
        </div>
      )}

      {/* Grid: Config Form & Simulation Switch */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Form (7 Cols) */}
        <form
          onSubmit={handleSaveConfig}
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-7 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <h3 className="flex items-center space-x-2 font-bold text-slate-900 dark:text-white">
              <Wifi className="h-4 w-4 text-sky-500" />
              <span>MQTT Broker WebSocket Configuration</span>
            </h3>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                connectionStatus === 'connected'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
              }`}
            >
              {connectionStatus.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                Broker WebSocket URL (WSS / WS)
              </label>
              <input
                type="text"
                required
                value={formConfig.brokerUrl}
                onChange={(e) => setFormConfig({ ...formConfig, brokerUrl: e.target.value })}
                placeholder="wss://broker.emqx.io:8084/mqtt"
                className="mt-1 w-full font-mono rounded-xl border border-slate-200 px-3.5 py-2 text-xs outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <p className="mt-1 text-[10px] text-slate-400">
                สำหรับ EMQX Broker สาธารณะ ให้ใช้ <code className="text-sky-600">wss://broker.emqx.io:8084/mqtt</code>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                Client ID
              </label>
              <input
                type="text"
                required
                value={formConfig.clientId}
                onChange={(e) => setFormConfig({ ...formConfig, clientId: e.target.value })}
                className="mt-1 w-full font-mono rounded-xl border border-slate-200 px-3.5 py-2 text-xs outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                Keep Alive (Seconds)
              </label>
              <input
                type="number"
                value={formConfig.keepAlive}
                onChange={(e) =>
                  setFormConfig({ ...formConfig, keepAlive: Number(e.target.value) })
                }
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                Username (ถ้ามี)
              </label>
              <input
                type="text"
                value={formConfig.username || ''}
                onChange={(e) => setFormConfig({ ...formConfig, username: e.target.value })}
                placeholder="อุปกรณ์ไม่ได้ตั้งค่า = เว้นว่าง"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                Password (ถ้ามี)
              </label>
              <input
                type="password"
                value={formConfig.password || ''}
                onChange={(e) => setFormConfig({ ...formConfig, password: e.target.value })}
                placeholder="••••••••"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Topics Settings */}
          <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
              MQTT Topics Subscription (ตามภาพ MQTTX)
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-500">Dashboard Topic:</label>
                <input
                  type="text"
                  value={formConfig.topics.dashboard}
                  onChange={(e) =>
                    setFormConfig({
                      ...formConfig,
                      topics: { ...formConfig.topics, dashboard: e.target.value },
                    })
                  }
                  className="mt-1 w-full font-mono rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500">Command Topic:</label>
                <input
                  type="text"
                  value={formConfig.topics.command}
                  onChange={(e) =>
                    setFormConfig({
                      ...formConfig,
                      topics: { ...formConfig.topics, command: e.target.value },
                    })
                  }
                  className="mt-1 w-full font-mono rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500">Request Topic:</label>
                <input
                  type="text"
                  value={formConfig.topics.request}
                  onChange={(e) =>
                    setFormConfig({
                      ...formConfig,
                      topics: { ...formConfig.topics, request: e.target.value },
                    })
                  }
                  className="mt-1 w-full font-mono rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500">Status Topic:</label>
                <input
                  type="text"
                  value={formConfig.topics.status}
                  onChange={(e) =>
                    setFormConfig({
                      ...formConfig,
                      topics: { ...formConfig.topics, status: e.target.value },
                    })
                  }
                  className="mt-1 w-full font-mono rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex space-x-2">
              {connectionStatus === 'connected' ? (
                <button
                  type="button"
                  onClick={disconnectMqtt}
                  className="flex items-center space-x-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                >
                  <WifiOff className="h-3.5 w-3.5" />
                  <span>ตัดการเชื่อมต่อ</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={connectMqtt}
                  className="flex items-center space-x-1.5 rounded-xl bg-sky-500 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-sky-600"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>เชื่อมต่อ MQTT ทันที</span>
                </button>
              )}
            </div>

            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white shadow hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              บันทึกการตั้งค่า
            </button>
          </div>
        </form>

        {/* Right Panel: Simulation Mode & Quick Info (5 Cols) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Simulation Mode Toggle Card */}
          <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/60 to-orange-50/40 p-6 shadow-sm dark:border-amber-900/50 dark:from-slate-800 dark:to-amber-950/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-amber-900 dark:text-amber-300">
                <Sparkles className="h-5 w-5 text-amber-600" />
                <h3 className="font-bold text-sm">โหมดจำลองข้อมูล (Simulation Mode)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSimulationMode(!isSimulationMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isSimulationMode ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isSimulationMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <p className="mt-2 text-xs text-amber-900/80 dark:text-amber-300/80">
              เมื่อเปิดโหมดนี้ ระบบจะจำลองข้อมูล Telemetry และ Register ส่งผ่าน MQTT Loop ทุกๆ 6 วินาที เหมาะสำหรับการทดสอบหน้าเว็บและนำเสนอผลงานเมื่อไม่ได้เปิดเชื่อมต่อกับ HMI จริง
            </p>
          </div>

          {/* Quick Preset Brokers */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">
              ตัวเลือก Broker สำเร็จรูป
            </h4>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() =>
                  setFormConfig({
                    ...formConfig,
                    brokerUrl: 'wss://broker.emqx.io:8084/mqtt',
                  })
                }
                className="w-full text-left rounded-xl border border-slate-100 p-2.5 text-xs hover:border-sky-300 hover:bg-sky-50 dark:border-slate-800 dark:hover:bg-slate-800"
              >
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  EMQX Public WSS (แนะนำ)
                </div>
                <div className="font-mono text-[10px] text-slate-400">
                  wss://broker.emqx.io:8084/mqtt
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setFormConfig({
                    ...formConfig,
                    brokerUrl: 'ws://192.168.1.48:1883',
                  })
                }
                className="w-full text-left rounded-xl border border-slate-100 p-2.5 text-xs hover:border-sky-300 hover:bg-sky-50 dark:border-slate-800 dark:hover:bg-slate-800"
              >
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  Local Mosquitto (ตามเอกสาร mqtt.pdf)
                </div>
                <div className="font-mono text-[10px] text-slate-400">
                  ws://192.168.1.48:1883
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* HMI Register Live Monitor (According to specsheet.txt) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Cpu className="h-5 w-5 text-sky-500" />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">
                HMI Registers Live Monitor
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                สถานะค่าใน Register ของบอร์ด HMI / Wecon (อ้างอิงไฟล์ specsheet.txt)
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-3 text-center dark:border-sky-900/50 dark:bg-slate-800">
            <span className="text-[10px] font-bold text-sky-600">HDW1 (X1)</span>
            <div className="text-xl font-black text-slate-900 dark:text-white">{registers.HDW1}</div>
            <span className="text-[10px] text-slate-400">คำร้องทั้งหมด</span>
          </div>

          <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3 text-center dark:border-rose-900/50 dark:bg-slate-800">
            <span className="text-[10px] font-bold text-rose-600">HDW2 (X2)</span>
            <div className="text-xl font-black text-slate-900 dark:text-white">{registers.HDW2}</div>
            <span className="text-[10px] text-slate-400">รอดำเนินการ</span>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 text-center dark:border-amber-900/50 dark:bg-slate-800">
            <span className="text-[10px] font-bold text-amber-600">HDW3 (X3)</span>
            <div className="text-xl font-black text-slate-900 dark:text-white">{registers.HDW3}</div>
            <span className="text-[10px] text-slate-400">กำลังดำเนินการ</span>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-center dark:border-emerald-900/50 dark:bg-slate-800">
            <span className="text-[10px] font-bold text-emerald-600">HDW4 (X4)</span>
            <div className="text-xl font-black text-slate-900 dark:text-white">{registers.HDW4}</div>
            <span className="text-[10px] text-slate-400">งานสำเร็จ</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center dark:border-slate-800 dark:bg-slate-800">
            <span className="text-[10px] font-bold text-slate-500">HDW10 (X11)</span>
            <div className="text-xl font-black text-slate-900 dark:text-white">{registers.HDW10}</div>
            <span className="text-[10px] text-slate-400">Computer</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center dark:border-slate-800 dark:bg-slate-800">
            <span className="text-[10px] font-bold text-slate-500">HDW11 (X12)</span>
            <div className="text-xl font-black text-slate-900 dark:text-white">{registers.HDW11}</div>
            <span className="text-[10px] text-slate-400">Printer</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center dark:border-slate-800 dark:bg-slate-800">
            <span className="text-[10px] font-bold text-slate-500">HDW12 (X13)</span>
            <div className="text-xl font-black text-slate-900 dark:text-white">{registers.HDW12}</div>
            <span className="text-[10px] text-slate-400">Network</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center dark:border-slate-800 dark:bg-slate-800">
            <span className="text-[10px] font-bold text-slate-500">HDW13 (X14)</span>
            <div className="text-xl font-black text-slate-900 dark:text-white">{registers.HDW13}</div>
            <span className="text-[10px] text-slate-400">Other</span>
          </div>
        </div>
      </div>

      {/* Manual Publish & MQTT Logs Console */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Manual Publish Box (5 Cols) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-3">
            <h4 className="flex items-center space-x-2 text-xs font-bold text-slate-900 dark:text-white">
              <Send className="h-4 w-4 text-sky-500" />
              <span>Manual MQTT Publish (ทดสอบส่งข้อมูล)</span>
            </h4>
            {publishSuccess && (
              <span className="text-[11px] font-bold text-emerald-600">Published!</span>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500">Publish Topic:</label>
              <select
                value={publishTopic}
                onChange={(e) => setPublishTopic(e.target.value)}
                className="mt-1 w-full font-mono rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="repair/command">repair/command</option>
                <option value="repair/request">repair/request</option>
                <option value="repair/status">repair/status</option>
                <option value="repair/dashboard">repair/dashboard</option>
              </select>
            </div>

            {/* Quick Templates from screenshot */}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() =>
                  setTemplate({
                    command: 'set address',
                    X24: 4,
                    X25: 1,
                    X26: 2,
                    X27: 3,
                  })
                }
                className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              >
                Template: X24..X27
              </button>
              <button
                type="button"
                onClick={() =>
                  setTemplate({
                    total: 125,
                    fix_select: 9,
                    processing_select: 18,
                    done_select: 98,
                  })
                }
                className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              >
                Template: Counts
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500">JSON Payload:</label>
              <textarea
                rows={6}
                value={publishPayload}
                onChange={(e) => setPublishPayload(e.target.value)}
                className="mt-1 w-full font-mono text-xs rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <button
              type="button"
              onClick={handlePublish}
              className="flex w-full items-center justify-center space-x-2 rounded-xl bg-sky-500 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-500/25 hover:bg-sky-600"
            >
              <Send className="h-3.5 w-3.5" />
              <span>ส่งข้อมูล (Publish)</span>
            </button>
          </div>
        </div>

        {/* Live Logs Stream (7 Cols) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-7 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-3">
            <h4 className="flex items-center space-x-2 text-xs font-bold text-slate-900 dark:text-white">
              <Terminal className="h-4 w-4 text-sky-500" />
              <span>MQTT Live Packet Logs ({mqttLogs.length})</span>
            </h4>
            <button
              onClick={clearLogs}
              className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-rose-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>ล้าง Log</span>
            </button>
          </div>

          <div className="h-80 overflow-y-auto space-y-2 rounded-xl border border-slate-100 bg-slate-900 p-3 font-mono text-[11px] text-slate-300">
            {mqttLogs.length === 0 ? (
              <div className="flex h-full items-center justify-center text-slate-500">
                ยังไม่มีข้อมูลการรับส่ง MQTT (กดปุ่ม Connect หรือเปิด Simulation Mode เพื่อดูตัวอย่าง)
              </div>
            ) : (
              mqttLogs.map((log) => (
                <div key={log.id} className="border-b border-slate-800 pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                          log.direction === 'in'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-sky-950 text-sky-400 border border-sky-800'
                        }`}
                      >
                        {log.direction === 'in' ? 'RECEIVE' : 'PUBLISH'}
                      </span>
                      <span className="text-amber-400">{log.topic}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                  </div>
                  <pre className="mt-1 overflow-x-auto whitespace-pre-wrap text-[10px] text-slate-300">
                    {log.payload}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
