# Hướng Dẫn Message Flow Visualization

## 🎯 Mục Đích
Hiển thị rõ ràng:
1. **Tương tác bên trong PCF**: PCF Core ↔ Rating Engine
2. **Tương tác với NF bên ngoài**: PCF ↔ UDR/ABM/SMF/AMF/NEF...
3. **Thứ tự xử lý**: Số thứ tự từng bước (1, 2, 3...)
4. **Loại message**: Request/Response/Trigger/Notification

---

## 📊 Cách Xem Message Flow

### 1. Trên Graph Canvas
Mỗi mũi tên hiển thị:
- **Số thứ tự**: 1, 2, 3...
- **Tên message**: "1. Attach Request", "2. Policy Request"...
- **Màu sắc**:
  - 🔵 Xanh dương: UE ↔ AMF/SMF
  - 🟢 Xanh lá: NF ↔ PCF
  - 🟣 Tím: PCF ↔ UDR/ABM (Subscription Manager)
  - 🟠 Cam: PCF ↔ Rating Engine
  - 🔴 Đỏ: External triggers (NEF/AF)

- **Kiểu đường**:
  - `━━━` Solid: Request/Trigger
  - `- - -` Dashed: Response

### 2. Panel "Flow Steps" (Tab bên phải)
Timeline các bước xử lý:
```
1️⃣ UE Trigger
   UE initiates attach request
   [SEQUENTIAL] [5000ms timeout]

2️⃣ Query Subscription Data  
   PCF queries UDR for profile
   [SEQUENTIAL] [3000ms timeout]
   
3️⃣ Rating Engine Processing
   Calculate policy rules
   [SEQUENTIAL] [2000ms timeout]
```

### 3. Panel "Message Flow"
Danh sách messages theo thứ tự:
```
1️⃣ Attach/PDU Request
   UE → AMF [request]

2️⃣ Policy Request
   AMF → PCF [request]
   
3️⃣ Query Profile
   PCF → UDR [request]
   
4️⃣ Profile Data
   UDR → PCF [response]
```

---

## 📋 Message Flow theo Loại Policy

### A. Subscription-Based (UE Attach, PDU Session)
**8 bước xử lý:**
1. UE → AMF/SMF: Attach/PDU Request
2. AMF/SMF → PCF: Policy Request  
3. PCF → UDR/ABM: Query Profile
4. UDR/ABM → PCF: Profile Data
5. PCF → Rating Engine: Rate Request
6. Rating Engine → PCF: Policy Rules
7. PCF → AMF/SMF: Policy Decision
8. AMF/SMF → UE: Accept

**Đặc điểm:**
- ✅ Có Rating Engine
- ✅ Query Subscription Manager (ABM hoặc UDR)
- ✅ Process subscriber profile

---

### B. On-Demand (NEF/AF triggered)
**5 bước xử lý:**
1. NEF/AF/NWDAF → PCF: On-Demand Request
2. PCF → ABM/UDR: Update Profile
3. ABM/UDR → PCF: ACK
4. PCF → SMF: Policy Update
5. PCF → NEF/AF: Success

**Đặc điểm:**
- ❌ Không có Rating Engine
- ✅ Build policy trực tiếp
- ✅ Update Subscription Manager
- 🔴 External trigger

---

### C. Periodic (Daily/Weekly/Monthly Renewal)
**7 bước xử lý:**
1. PCF → PCF: Timer Trigger (self-loop)
2. PCF → UDR/ABM: Query Updates
3. UDR/ABM → PCF: Updated Data
4. PCF → Rating Engine: Recalculate
5. Rating Engine → PCF: New Quotas
6. PCF → SMF: Policy Update
7. PCF → CHF: Quota Renewed

**Đặc điểm:**
- 🔄 Timer tự động trigger
- ✅ Có Rating Engine
- 📢 Multi-cast notifications

---

## 🎨 Color Code

| Màu | Hex | Ý nghĩa |
|-----|-----|---------|
| 🔵 Blue | #3B82F6 | UE ↔ AMF/SMF |
| 🟢 Green | #10B981 | NF ↔ PCF policy |
| 🟣 Purple | #8B5CF6 | PCF ↔ UDR/ABM |
| 🟠 Orange | #F59E0B | PCF ↔ Rating Engine |
| 🔴 Red | #EF4444 | External triggers |
| 🔷 Cyan | #06B6D4 | Charging (CHF) |

---

## ⚡ Cách Sử Dụng

### Bước 1: Tạo Flow
1. Vào **Flow Collection** (panel trái)
2. Chọn một template (VD: "UE Attach - SM Policy")
3. Click **"Create Flow from Template"**

### Bước 2: Xem Graph
- Graph tự động hiển thị nodes và message flows
- Mỗi mũi tên có số thứ tự và label
- Animated arrows chạy từ source → target

### Bước 3: Xem Chi Tiết
**Tab "Flow Steps":**
- Timeline các bước xử lý
- Timeout và type của mỗi step

**Tab "Message Flow":**
- Danh sách messages sorted by sequence
- Source → Target với message type

**Tab "Execution Timeline":**
- Click "Test Flow" để chạy simulation
- Xem policy evaluation traces
- Xem execution time

**Tab "PCF Metrics":**
- Số lượng policy evaluations
- Rules triggered
- QoS decisions
- Charging events

---

## 🔍 Ví Dụ: UE Attach Flow

### Graph View:
```
PCF Lane:    [PCF Core] ←──5──→ [Rating Engine]
                 ↓ 3             6 ↑
                 ↓                 ↑
                 ↓ 7               ↑
                 ↓                 ↑
NF Lane:   [UE] → [AMF] → [UDR] → [SMF]
            1      2        4        8
```

### Message Sequence:
```
1. UE → AMF: Attach Request [blue, request]
2. AMF → PCF: Policy Request [green, request]  
3. PCF → UDR: Query Profile [purple, request]
4. UDR → PCF: Profile Data [purple, response, dashed]
5. PCF → Rating: Rate Request [orange, request]
6. Rating → PCF: Policy Rules [orange, response, dashed]
7. PCF → AMF: Policy Decision [green, response, dashed]
8. AMF → UE: Accept [blue, response, dashed]
```

### Flow Steps Timeline:
```
Step 1: UE Trigger (5000ms)
Step 2: Query Subscription Data (3000ms)
Step 3: Rating Engine Processing (2000ms)  
Step 4: PCF Policy Evaluation (1000ms)
Step 5: Policy Delivery (2000ms)
```

---

## 📝 Lưu Ý

### Message Types:
- **request**: Yêu cầu từ client → server
- **response**: Phản hồi từ server → client  
- **trigger**: Kích hoạt flow (external hoặc timer)
- **notification**: Thông báo một chiều

### Arrow Styles:
- **Solid (━)**: Request/Trigger
- **Dashed (- -)**: Response
- **Animated**: Flow đang active

### Layout:
- **PCF Logic Lane** (trên): PCF Core, Rating Engine
- **Network Function Lane** (dưới): Mock NFs (UE, AMF, SMF, UDR...)
- **Divider**: Đường kẻ ngang phân cách 2 lanes

---

## 🚀 Tính Năng Sắp Tới

- [ ] Click vào edge để xem request/response body
- [ ] Auto-play sequence animation
- [ ] Error handling paths visualization
- [ ] Latency metrics cho từng message
- [ ] Export sequence diagram (PlantUML/Mermaid)
- [ ] Real-time live monitoring

---

**Version**: 1.0.0  
**Ngày cập nhật**: 26/11/2025
