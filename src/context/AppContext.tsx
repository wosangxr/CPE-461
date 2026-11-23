'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import mqtt, { MqttClient } from 'mqtt';
import {
  RepairItem,
  RepairStatus,
  HmiRegisters,
  MQTTConfig,
  MQTTLog,
  NotificationItem,
  ActiveView,
} from '@/types';
import {
  initialRegisters,
  defaultMqttConfig,
  initialRepairs,
  initialNotifications,
} from '@/lib/mockData';

interface AppContextType {
  // Navigation
  currentView: ActiveView;
  setCurrentView: (view: ActiveView) => void;
  selectedRepairId: string | null;
  setSelectedRepairId: (id: string | null) => void;

  // HMI Registers & Stats
  registers: HmiRegisters;
  setRegisters: React.Dispatch<React.SetStateAction<HmiRegisters>>;

  // Repairs
  repairs: RepairItem[];
  addRepair: (item: Omit<RepairItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRepairStatus: (id: string, status: RepairStatus, note?: string, techName?: string) => void;
  deleteRepair: (id: string) => void;

  // MQTT
  mqttConfig: MQTTConfig;
  setMqttConfig: (config: MQTTConfig) => void;
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
  lastError: string | null;
  mqttLogs: MQTTLog[];
  clearLogs: () => void;
  connectMqtt: () => void;
  disconnectMqtt: () => void;
  publishMessage: (topic: string, message: any) => boolean;
  publishCommand: (cmd: Record<string, any>) => boolean;
  publishRequest: (req: Record<string, any>) => boolean;

  // Simulator
  isSimulationMode: boolean;
  setIsSimulationMode: (val: boolean) => void;

  // Notifications
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Navigation State
  const [currentView, setCurrentView] = useState<ActiveView>('dashboard');
  const [selectedRepairId, setSelectedRepairId] = useState<string | null>('FS-20261107-001');

  // HMI Registers
  const [registers, setRegisters] = useState<HmiRegisters>(initialRegisters);

  // Repair List
  const [repairs, setRepairs] = useState<RepairItem[]>(initialRepairs);

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  // MQTT State
  const [mqttConfig, setMqttConfigState] = useState<MQTTConfig>(defaultMqttConfig);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'error'>('disconnected');
  const [lastError, setLastError] = useState<string | null>(null);
  const [mqttLogs, setMqttLogs] = useState<MQTTLog[]>([]);

  // Simulation mode
  const [isSimulationMode, setIsSimulationMode] = useState<boolean>(true);

  const clientRef = useRef<MqttClient | null>(null);

  // Helper to log MQTT
  const logMqtt = useCallback((direction: 'in' | 'out', topic: string, raw: any) => {
    const payloadStr = typeof raw === 'string' ? raw : JSON.stringify(raw, null, 2);
    setMqttLogs((prev) => [
      {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString('th-TH'),
        direction,
        topic,
        payload: payloadStr,
        rawJson: typeof raw === 'object' ? raw : undefined,
      },
      ...prev.slice(0, 99), // keep last 100 logs
    ]);
  }, []);

  // Save config to state and localStorage
  const setMqttConfig = (newCfg: MQTTConfig) => {
    setMqttConfigState(newCfg);
    if (typeof window !== 'undefined') {
      localStorage.setItem('smart_fix_mqtt_config', JSON.stringify(newCfg));
    }
  };

  // Connect to MQTT
  const connectMqtt = useCallback(() => {
    if (clientRef.current) {
      try {
        clientRef.current.end(true);
      } catch (e) {
        console.error(e);
      }
      clientRef.current = null;
    }

    setConnectionStatus('connecting');
    setLastError(null);

    try {
      const opts: mqtt.IClientOptions = {
        clientId: mqttConfig.clientId || `repair_${Math.random().toString(16).slice(2, 8)}`,
        clean: mqttConfig.cleanStart,
        keepalive: mqttConfig.keepAlive || 60,
        reconnectPeriod: 5000,
        connectTimeout: 10000,
      };

      if (mqttConfig.username) opts.username = mqttConfig.username;
      if (mqttConfig.password) opts.password = mqttConfig.password;

      const client = mqtt.connect(mqttConfig.brokerUrl, opts);
      clientRef.current = client;

      client.on('connect', () => {
        setConnectionStatus('connected');
        setLastError(null);

        // Subscribe to configured topics
        const topics = [
          mqttConfig.topics.dashboard,
          mqttConfig.topics.status,
          mqttConfig.topics.command,
          mqttConfig.topics.request,
          mqttConfig.topics.response,
          mqttConfig.topics.other,
        ].filter(Boolean);

        client.subscribe(topics, (err) => {
          if (err) {
            console.error('MQTT subscribe error:', err);
          } else {
            logMqtt('in', 'SYSTEM', `Subscribed to: ${topics.join(', ')}`);
          }
        });
      });

      client.on('message', (topic, payload) => {
        const str = payload.toString();
        logMqtt('in', topic, str);

        try {
          const data = JSON.parse(str);

          // Check if payload contains HMI/register updates
          setRegisters((prev) => {
            const next = { ...prev };
            // Format 1: Direct register keys
            if (data.HDW1 !== undefined) next.HDW1 = Number(data.HDW1);
            if (data.HDW2 !== undefined) next.HDW2 = Number(data.HDW2);
            if (data.HDW3 !== undefined) next.HDW3 = Number(data.HDW3);
            if (data.HDW4 !== undefined) next.HDW4 = Number(data.HDW4);

            if (data.HDW10 !== undefined) next.HDW10 = Number(data.HDW10);
            if (data.HDW11 !== undefined) next.HDW11 = Number(data.HDW11);
            if (data.HDW12 !== undefined) next.HDW12 = Number(data.HDW12);
            if (data.HDW13 !== undefined) next.HDW13 = Number(data.HDW13);

            // Format 2: Named keys from MQTTX screenshot
            if (data.total !== undefined) next.HDW1 = Number(data.total);
            if (data.fix_select !== undefined) next.HDW2 = Number(data.fix_select);
            if (data.processing_select !== undefined) next.HDW3 = Number(data.processing_select);
            if (data.done_select !== undefined) next.HDW4 = Number(data.done_select);

            if (data.computer !== undefined) next.HDW10 = Number(data.computer);
            if (data.printer !== undefined) next.HDW11 = Number(data.printer);
            if (data.network !== undefined) next.HDW12 = Number(data.network);
            if (data.other !== undefined) next.HDW13 = Number(data.other);

            // Format 3: X registers
            if (data.X1 !== undefined) { next.X1 = Number(data.X1); next.HDW1 = next.X1; }
            if (data.X2 !== undefined) { next.X2 = Number(data.X2); next.HDW2 = next.X2; }
            if (data.X3 !== undefined) { next.X3 = Number(data.X3); next.HDW3 = next.X3; }
            if (data.X4 !== undefined) { next.X4 = Number(data.X4); next.HDW4 = next.X4; }
            if (data.X11 !== undefined) { next.X11 = Number(data.X11); next.HDW10 = next.X11; }
            if (data.X12 !== undefined) { next.X12 = Number(data.X12); next.HDW11 = next.X12; }
            if (data.X13 !== undefined) { next.X13 = Number(data.X13); next.HDW12 = next.X13; }
            if (data.X14 !== undefined) { next.X14 = Number(data.X14); next.HDW13 = next.X14; }
            if (data.X24 !== undefined) next.X24 = Number(data.X24);
            if (data.X25 !== undefined) next.X25 = Number(data.X25);
            if (data.X26 !== undefined) next.X26 = Number(data.X26);
            if (data.X27 !== undefined) next.X27 = Number(data.X27);

            return next;
          });

          // Check if payload contains repair item command or status
          if (data.command === 'update_status' && data.id && data.status) {
            setRepairs((prev) =>
              prev.map((r) =>
                r.id === data.id
                  ? { ...r, status: data.status, updatedAt: new Date().toLocaleString('th-TH') }
                  : r
              )
            );
          }
        } catch {
          // not JSON, just raw text
        }
      });

      client.on('error', (err) => {
        console.error('MQTT error:', err);
        setLastError(err.message || 'Connection error');
        setConnectionStatus('error');
      });

      client.on('close', () => {
        setConnectionStatus('disconnected');
      });
    } catch (err: any) {
      setLastError(err.message || 'Failed to initialize MQTT');
      setConnectionStatus('error');
    }
  }, [mqttConfig, logMqtt]);

  // Disconnect MQTT
  const disconnectMqtt = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.end(true);
      clientRef.current = null;
    }
    setConnectionStatus('disconnected');
    logMqtt('out', 'SYSTEM', 'Disconnected from MQTT broker');
  }, [logMqtt]);

  // Publish message helper
  const publishMessage = useCallback(
    (topic: string, message: any): boolean => {
      const payloadStr = typeof message === 'string' ? message : JSON.stringify(message);
      logMqtt('out', topic, message);

      if (clientRef.current && connectionStatus === 'connected') {
        clientRef.current.publish(topic, payloadStr, { qos: 0 });
        return true;
      }
      return false;
    },
    [connectionStatus, logMqtt]
  );

  const publishCommand = useCallback(
    (cmd: Record<string, any>) => {
      return publishMessage(mqttConfig.topics.command, cmd);
    },
    [mqttConfig.topics.command, publishMessage]
  );

  const publishRequest = useCallback(
    (req: Record<string, any>) => {
      return publishMessage(mqttConfig.topics.request, req);
    },
    [mqttConfig.topics.request, publishMessage]
  );

  // Recalculate register counts based on repairs
  const recalculateCounts = useCallback((items: RepairItem[]) => {
    const total = items.length;
    const pending = items.filter((i) => i.status === 'pending').length;
    const processing = items.filter((i) => i.status === 'processing').length;
    const done = items.filter((i) => i.status === 'done').length;

    const comp = items.filter((i) => i.category === 'computer').length;
    const print = items.filter((i) => i.category === 'printer').length;
    const net = items.filter((i) => i.category === 'network').length;
    const oth = items.filter((i) => !['computer', 'printer', 'network'].includes(i.category)).length;

    setRegisters((prev) => ({
      ...prev,
      HDW1: total,
      HDW2: pending,
      HDW3: processing,
      HDW4: done,
      HDW10: comp,
      HDW11: print,
      HDW12: net,
      HDW13: oth,
      X1: total,
      X2: pending,
      X3: processing,
      X4: done,
      X11: comp,
      X12: print,
      X13: net,
      X14: oth,
    }));
  }, []);

  // Add Repair Request
  const addRepair = useCallback(
    (item: Omit<RepairItem, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date();
      const yyyymmdd =
        now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0');
      const seq = String(repairs.length + 1).padStart(3, '0');
      const newId = `FS-${yyyymmdd}-${seq}`;

      const newItem: RepairItem = {
        ...item,
        id: newId,
        createdAt: now.toLocaleString('th-TH'),
        updatedAt: now.toLocaleString('th-TH'),
      };

      const updatedRepairs = [newItem, ...repairs];
      setRepairs(updatedRepairs);
      recalculateCounts(updatedRepairs);

      // Publish to MQTT
      publishRequest({
        action: 'new_request',
        id: newId,
        title: item.title,
        category: item.category,
        building: item.building,
        room: item.room,
        reporterName: item.reporterName,
        priority: item.priority,
        timestamp: new Date().toISOString(),
      });

      // Add Notification
      setNotifications((prev) => [
        {
          id: Math.random().toString(36).substring(2, 9),
          title: 'แจ้งซ่อมใหม่สำเร็จ',
          message: `สร้างคำร้องหมายเลข ${newId} เรียบร้อยแล้ว`,
          time: now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          status: 'success',
          read: false,
        },
        ...prev,
      ]);
    },
    [repairs, recalculateCounts, publishRequest]
  );

  // Update Status
  const updateRepairStatus = useCallback(
    (id: string, newStatus: RepairStatus, note?: string, techName?: string) => {
      const updated = repairs.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            status: newStatus,
            updatedAt: new Date().toLocaleString('th-TH'),
            technicianNote: note !== undefined ? note : r.technicianNote,
            technicianName: techName !== undefined ? techName : r.technicianName,
          };
        }
        return r;
      });

      setRepairs(updated);
      recalculateCounts(updated);

      // Publish to MQTT Command
      const hdwMap = {
        pending: { register: 'HDW2', x: 'X25', val: 1 },
        processing: { register: 'HDW3', x: 'X26', val: 2 },
        done: { register: 'HDW4', x: 'X27', val: 3 },
      }[newStatus];

      publishCommand({
        command: 'set_status',
        id,
        status: newStatus,
        register: hdwMap.register,
        x_code: hdwMap.x,
        value: hdwMap.val,
        updated_at: new Date().toISOString(),
      });

      // Add Notification
      const statusTh =
        newStatus === 'done'
          ? 'เสร็จสิ้นเรียบร้อยแล้ว'
          : newStatus === 'processing'
          ? 'กำลังดำเนินการซ่อม'
          : 'รอดำเนินการ';

      setNotifications((prev) => [
        {
          id: Math.random().toString(36).substring(2, 9),
          title: `อัปเดตสถานะ: ${id}`,
          message: `คำร้องหมายเลข ${id} เปลี่ยนสถานะเป็น ${statusTh}`,
          time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          status: newStatus === 'done' ? 'success' : 'info',
          read: false,
        },
        ...prev,
      ]);
    },
    [repairs, recalculateCounts, publishCommand]
  );

  // Delete Repair
  const deleteRepair = useCallback(
    (id: string) => {
      const updated = repairs.filter((r) => r.id !== id);
      setRepairs(updated);
      recalculateCounts(updated);
    },
    [repairs, recalculateCounts]
  );

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const clearLogs = () => {
    setMqttLogs([]);
  };

  // Initial connect or load saved config
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('smart_fix_mqtt_config');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setMqttConfigState(parsed);
        } catch {
          // ignore
        }
      }
    }
  }, []);

  // Connect on mount
  useEffect(() => {
    connectMqtt();
    return () => {
      if (clientRef.current) {
        clientRef.current.end(true);
      }
    };
  }, [connectMqtt]);

  // Simulation mode loop: simulates periodic MQTT broker updates if enabled
  useEffect(() => {
    if (!isSimulationMode) return;

    const timer = setInterval(() => {
      // Simulate periodic packet like Wecon HMI 4.5s loop
      const simData = {
        total: registers.HDW1,
        fix_select: registers.HDW2,
        processing_select: registers.HDW3,
        done_select: registers.HDW4,
        computer: registers.HDW10,
        printer: registers.HDW11,
        network: registers.HDW12,
        other: registers.HDW13,
        command: 'telemetry_sync',
        result: 'active',
        X1: registers.HDW1,
        X2: registers.HDW2,
        X3: registers.HDW3,
        X4: registers.HDW4,
        X11: registers.HDW10,
        X12: registers.HDW11,
        X13: registers.HDW12,
        X14: registers.HDW13,
        timestamp: new Date().toLocaleTimeString('th-TH'),
      };

      logMqtt('in', mqttConfig.topics.dashboard, simData);
    }, 6000);

    return () => clearInterval(timer);
  }, [isSimulationMode, registers, mqttConfig.topics.dashboard, logMqtt]);

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        selectedRepairId,
        setSelectedRepairId,
        registers,
        setRegisters,
        repairs,
        addRepair,
        updateRepairStatus,
        deleteRepair,
        mqttConfig,
        setMqttConfig,
        connectionStatus,
        lastError,
        mqttLogs,
        clearLogs,
        connectMqtt,
        disconnectMqtt,
        publishMessage,
        publishCommand,
        publishRequest,
        isSimulationMode,
        setIsSimulationMode,
        notifications,
        markNotificationAsRead,
        clearAllNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
