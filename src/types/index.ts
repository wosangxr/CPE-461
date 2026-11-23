export type RepairStatus = 'pending' | 'processing' | 'done';

export type RepairCategory =
  | 'computer'
  | 'printer'
  | 'network'
  | 'air'
  | 'plumbing'
  | 'electric'
  | 'other';

export type RepairPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface RepairItem {
  id: string; // e.g. "FS-20261107-001"
  title: string;
  category: RepairCategory;
  categoryLabel: string;
  building: string;
  floor: string;
  room: string;
  reporterName: string;
  reporterPhone: string;
  description: string;
  status: RepairStatus;
  priority: RepairPriority;
  createdAt: string;
  updatedAt: string;
  technicianName?: string;
  technicianNote?: string;
  hmiRegister?: string;
}

export interface HmiRegisters {
  // Specsheet mapping:
  // HDW1: total requests (เชื่อม XY PLOT)
  // HDW2: pending requests (รอดำเนินการ)
  // HDW3: processing requests (กำลังดำเนินการ)
  // HDW4: completed requests (สำเร็จ)
  HDW1: number;
  HDW2: number;
  HDW3: number;
  HDW4: number;

  // Equipment / Category Registers:
  HDW10: number; // Computer
  HDW11: number; // Printer
  HDW12: number; // Network
  HDW13: number; // Other
  HDW14: number; // Total Read Register

  // Status Action Registers:
  HDW21: number; // In-progress item 1
  HDW22: number; // In-progress item 2
  HDW23: number; // In-progress item 3
  HDW24: number; // In-progress item 4
  HDW25: number; // Pending trigger
  HDW26: number; // Processing trigger
  HDW27: number; // Completed trigger

  // X Registers for MQTT payload
  X1: number;
  X2: number;
  X3: number;
  X4: number;
  X11: number;
  X12: number;
  X13: number;
  X14: number;
  X21: number;
  X22: number;
  X23: number;
  X24: number;
  X25: number;
  X26: number;
  X27: number;
}

export interface MQTTConfig {
  brokerUrl: string; // e.g. wss://broker.emqx.io:8084/mqtt or ws://broker.emqx.io:8083/mqtt
  clientId: string;
  username?: string;
  password?: string;
  keepAlive: number;
  cleanStart: boolean;
  topics: {
    dashboard: string; // default: "repair/dashboard"
    status: string;    // default: "repair/status"
    request: string;   // default: "repair/request"
    command: string;   // default: "repair/command"
    response: string;  // default: "repair/response"
    other: string;     // default: "OtherConection"
  };
}

export interface MQTTLog {
  id: string;
  timestamp: string;
  direction: 'in' | 'out';
  topic: string;
  payload: string;
  rawJson?: any;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  status: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
}

export type ActiveView =
  | 'dashboard'
  | 'new_request'
  | 'my_requests'
  | 'tracking'
  | 'reports'
  | 'settings';
