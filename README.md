# SMART FIX SERVICE 🛠️
> **ระบบแจ้งซ่อมและติดตามสถานะงานซ่อม ภายในมหาวิทยาลัยศรีปทุม (SPU)**
> โครงการกลุ่ม 5 Fix and Service (CPE-461)

เว็บแดชบอร์ดติดตามสถานะงานซ่อมบำรุงแบบ Real-time เชื่อมต่อกับระบบจอสัมผัส **Wecon HMI (PIStudio)** ผ่านโพรโทคอล **MQTT (WebSocket / TCP)**

---

## 💻 Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Frontend Library:** React 19
- **Styling:** Tailwind CSS v4
- **Language:** TypeScript
- **IoT / Protocol:** MQTT.js (MQTT over WebSocket)
- **Icons:** Lucide React

---

## 🌟 ฟังก์ชันหลักของระบบ (Features)

1. **Dashboard (ภาพรวมระบบ):**
   - การ์ดสรุปตัวเลข 4 ตัวชี้วัดสำคัญ (คำร้องทั้งหมด, งานเสร็จสิ้น, กำลังดำเนินการ, รอดำเนินการ)
   - สถิติการแจ้งซ่อมรายเดือน (XY Plot)
   - แผนที่พื้นที่แจ้งซ่อมอัจฉริยะ (SPU Campus Interactive Map) แยกตามอาคาร
   - สัดส่วนประเภทงานซ่อม (Donut Chart) คอมพิวเตอร์, เครื่องพิมพ์, เครือข่าย, อื่น ๆ
   - ตารางคำร้องล่าสุดพร้อมปุ่มติดตามสถานะ

2. **แจ้งซ่อมใหม่ (New Repair Request):**
   - แบบฟอร์มระบุสถานที่ (อาคาร, ชั้น, ห้อง), ผู้แจ้ง, หมวดหมู่อุปกรณ์ และความเร่งด่วน
   - ส่งข้อมูล Publish ไปยัง MQTT Topic `repair/request` ทันที

3. **คำร้องของฉัน (All Requests):**
   - ค้นหาคำร้อง กรองตามสถานะ และประเภทอุปกรณ์

4. **ติดตามสถานะ (Status Tracking & Control Action):**
   - แสดง 4-Step Interactive Timeline (รับเรื่อง ➔ มอบหมายช่าง ➔ กำลังซ่อม ➔ ปิดงาน)
   - ปุ่มส่งคำสั่งเปลี่ยนสถานะ Publish ไปยัง MQTT Topic `repair/command`

5. **รายงานและวิเคราะห์ (Reports & Analytics):**
   - อัตราการปิดงานสำเร็จ (Resolution Rate), เวลาเฉลี่ยในการตอบสนอง
   - ส่งออกข้อมูลเป็นไฟล์ CSV และพิมพ์รายงาน

6. **ตั้งค่าระบบ MQTT & HMI Live Monitor (Settings):**
   - กำหนดค่า WebSocket Broker (`wss://broker.emqx.io:8084/mqtt`)
   - HMI Registers Live Monitor Grid (HDW1–HDW4, HDW10–HDW13, X1–X27)
   - MQTT Live Packet Stream Console (Terminal ตรวจสอบแพ็กเก็ตขาเข้า/ขาออกสด)
   - Manual MQTT Publish Tool สำหรับทดสอบส่งข้อมูล
   - สวิตช์เปิด-ปิด Simulation Mode จำลองข้อมูลสด

---

## 📡 MQTT Configuration & Topics

- **Broker WebSocket URL:** `wss://broker.emqx.io:8084/mqtt` (Port: 8084)
- **Broker TCP Host:** `broker.emqx.io` (Port: 1883)
- **Client ID:** `repair_web_dashboard01` (หน้าเว็บ) / `smartfix_pistudio_01` (HMI)

### Topics Mapping
| Topic | การทำงาน |
| :--- | :--- |
| `repair/dashboard` | ส่งข้อมูลสรุปตัวเลขสถิติและสถานะขึ้น Dashboard |
| `repair/status` | ส่งสถานะการทำงานจาก HMI ขึ้นระบบ |
| `repair/command` | ส่งคำสั่งเปลี่ยนสถานะงานซ่อม / อัปเดต Register |
| `repair/request` | ส่งข้อมูลการแจ้งซ่อมใหม่เข้าระบบ |
| `repair/response` | ตอบรับผลการดำเนินงาน |

---

## 📟 HMI Register Mapping (ตาม `specsheet.txt`)

| Register | รหัส X | ความหมาย / รายละเอียด |
| :--- | :--- | :--- |
| **HDW1** | X1 | คำร้องทั้งหมด (Total Requests) |
| **HDW2** | X2, X25 | รอดำเนินการ (Pending Requests) |
| **HDW3** | X3, X26 | กำลังดำเนินการ (Processing Requests) |
| **HDW4** | X4, X27 | ซ่อมเสร็จสิ้น (Completed Requests) |
| **HDW10** | X11 | คอมพิวเตอร์ (Computer) |
| **HDW11** | X12 | เครื่องพิมพ์ (Printer) |
| **HDW12** | X13 | ระบบเครือข่าย (Network) |
| **HDW13** | X14 | อุปกรณ์อื่น ๆ / งานอาคาร (Other) |
| **X30** | - | สถานะการเชื่อมต่อ MQTT (0=Offline, 1=Connecting, 2=Connected) |

---

## 🚀 การติดตั้งและรันในเครื่อง (Getting Started)

1. **Clone repository:**
   ```bash
   git clone https://github.com/wosangxr/CPE-461.git
   cd CPE-461
   ```

2. **ติดตั้ง Dependencies:**
   ```bash
   npm install
   ```

3. **รัน Development Server:**
   ```bash
   npm run dev
   ```

4. เปิดบราวเซอร์ไปที่ [http://localhost:3000](http://localhost:3000)
