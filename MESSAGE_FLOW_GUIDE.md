# Message Flow Visualization Guide

## Tổng Quan
Hệ thống PCF Policy Studio hiện đã tích hợp **Message Flow Visualization** để thể hiện rõ ràng:
- ✅ Tương tác giữa các module bên trong PCF (PCF Core ↔ Rating Engine)
- ✅ Tương tác giữa PCF với các NF bên ngoài (PCF ↔ UDR/ABM/SMF/AMF/NEF...)
- ✅ Thứ tự các bước xử lý trên graph
- ✅ Loại message (Request/Response/Trigger/Notification)

---

## Các Thành Phần Visualization

### 1. **Flow Graph với Message Arrows**
Mỗi edge (mũi tên) trên graph hiển thị:
- **Sequence Number**: Số thứ tự bước (1, 2, 3...)
- **Message Label**: Tên message (e.g., "1. Attach/PDU Request")
- **Color Coding**: Màu sắc theo loại message
- **Animation**: Animated arrows cho luồng đang chạy
- **Arrow Style**: 
  - Solid line (━━━) = Request/Trigger
  - Dashed line (- - -) = Response

### 2. **Flow Steps Panel** (Tab bên phải)
Timeline hiển thị toàn bộ các bước xử lý:
```
1️⃣ UE Trigger
   UE initiates attach or PDU session request
   [SEQUENTIAL] [5000ms timeout]

2️⃣ Query Subscription Data
   PCF queries ABM or UDR for subscriber profile
   [SEQUENTIAL] [3000ms timeout]

3️⃣ Rating Engine Processing
   Rating Engine processes subscriber profile
   [SEQUENTIAL] [2000ms timeout]
   
...
```

### 3. **Message Flow Panel** (Tab Message Flow)
Danh sách chi tiết từng message:
```
┌─────────────────────────────────────────────┐
│ 1  Attach/PDU Request                       │
│    UE → AMF                      [request]  │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 2  Policy Request                           │
│    AMF → PCF                     [request]  │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 3  Query Profile                            │
│    PCF → UDR                     [request]  │
└─────────────────────────────────────────────┘
...
```

---

## Message Flow theo Trigger Type

### A. **Subscription-Based Flow** (UE Attach, PDU Session)

**Sequence:**
1. **UE → AMF/SMF**: Attach/PDU Request _(blue, request)_
2. **AMF/SMF → PCF**: Policy Request _(green, request)_
3. **PCF → UDR/ABM**: Query Profile _(purple, request)_
4. **UDR/ABM → PCF**: Profile Data _(purple, response, dashed)_
5. **PCF → Rating Engine**: Rate Request _(orange, request)_
6. **Rating Engine → PCF**: Policy Rules _(orange, response, dashed)_
7. **PCF → AMF/SMF**: Policy Decision _(green, response, dashed)_
8. **AMF/SMF → UE**: Accept _(blue, response, dashed)_

**Color Legend:**
- 🔵 Blue (#3B82F6): UE ↔ AMF/SMF communication
- 🟢 Green (#10B981): NF ↔ PCF policy requests
- 🟣 Purple (#8B5CF6): PCF ↔ Subscription Manager (UDR/ABM)
- 🟠 Orange (#F59E0B): PCF ↔ Rating Engine
- 🔴 Red (#EF4444): External triggers (NEF/AF)

**Node Layout:**
```
PCF Logic Lane:  [PCF Core] ←→ [Rating Engine]
                      ↓              ↓
NF Lane:         [UE] → [AMF] → [SMF] → [UDR] → [ABM]
```

---

### B. **On-Demand Flow** (NEF/AF/NWDAF triggered)

**Sequence:**
1. **NEF/AF/NWDAF → PCF**: On-Demand Request _(red, trigger)_
2. **PCF → ABM/UDR**: Update Profile _(purple, request)_
3. **ABM/UDR → PCF**: ACK _(purple, response, dashed)_
4. **PCF → SMF**: Policy Update _(green, notification)_
5. **PCF → NEF/AF**: Success _(red, response, dashed)_

**Đặc điểm:**
- ❌ **Không có** Rating Engine (build policy directly)
- ✅ Update Subscription Manager (ABM or UDR notification)
- ✅ External trigger từ 3rd party services

**Node Layout:**
```
PCF Logic Lane:  [PCF Core]
                      ↓
NF Lane:         [NEF] → [AF] → [NWDAF] → [SMF] → [ABM/UDR]
```

---

### C. **Periodic Flow** (Daily/Weekly/Monthly Quota Renewal)

**Sequence:**
1. **PCF → PCF**: Timer Trigger _(orange, trigger, self-loop)_
2. **PCF → UDR/ABM**: Query Updates _(purple, request)_
3. **UDR/ABM → PCF**: Updated Data _(purple, response, dashed)_
4. **PCF → Rating Engine**: Recalculate _(orange, request)_
5. **Rating Engine → PCF**: New Quotas _(orange, response, dashed)_
6. **PCF → SMF**: Policy Update _(green, notification)_
7. **PCF → CHF**: Quota Renewed _(cyan, notification)_

**Đặc điểm:**
- 🔄 Self-loop timer trigger
- ✅ Rating Engine recalculation
- 📢 Multiple notifications (SMF, CHF, etc.)

**Node Layout:**
```
PCF Logic Lane:  [PCF Core] ←→ [Rating Engine]
                      ↓              ↓
NF Lane:         [ABM] → [UDR] → [SMF] → [CHF]
```

---

## Message Types

### 1. **Request** (Solid Line)
- PCF → UDR/ABM: Query subscriber profile
- PCF → Rating Engine: Rate request
- AMF/SMF → PCF: Policy request
- NEF/AF → PCF: On-demand service request

**Visual:**
```
[Source] ━━━━━━━━━━━━━> [Target]
         Sequence. Label
```

### 2. **Response** (Dashed Line)
- UDR/ABM → PCF: Profile data
- Rating Engine → PCF: Policy rules
- PCF → AMF/SMF: Policy decision

**Visual:**
```
[Source] - - - - - - - > [Target]
         Sequence. Label
```

### 3. **Trigger** (Special)
- External: NEF/AF/NWDAF → PCF
- Internal: Timer → PCF (self-loop)

**Visual:**
```
[Trigger] ━━━━━━━━━━━━━> [PCF]
          Sequence. Label
          (Red/Orange color)
```

### 4. **Notification** (One-way)
- PCF → SMF: Policy update
- PCF → CHF: Quota notification
- PCF → AMF: Policy change

**Visual:**
```
[PCF] ━━━━━━━━━━━━━> [NF]
      Sequence. Label
      (Purple color)
```

---

## Edge Styling Guide

### Color Meanings:
| Color | Hex | Usage |
|-------|-----|-------|
| 🔵 Blue | `#3B82F6` | UE ↔ Access NF (AMF/SMF) |
| 🟢 Green | `#10B981` | NF ↔ PCF policy control |
| 🟣 Purple | `#8B5CF6` | PCF ↔ Data Repository (UDR/ABM) |
| 🟠 Orange | `#F59E0B` | PCF ↔ Rating Engine |
| 🔴 Red | `#EF4444` | External triggers (NEF/AF/NWDAF) |
| 🔷 Cyan | `#06B6D4` | Charging-related (CHF) |

### Stroke Styles:
- **strokeWidth: 2**: Standard message
- **strokeDasharray: '5,5'**: Response messages
- **animated: true**: Active flow (arrows move along path)

### Arrow Markers:
- **type: 'arrowclosed'**: Standard directional arrow
- **color**: Matches stroke color
- **type: 'smoothstep'**: For self-loops (timer triggers)

---

## Cách Sử Dụng

### 1. Tạo Flow từ Template
```tsx
// User clicks "Create Flow from Template"
const newFlow = generateFlowFromTemplate(selectedTemplate);

// newFlow contains:
// - nodes: All PCF and NF nodes
// - steps: Sequenced processing steps
// - edges: Message flows with sequence numbers
```

### 2. Xem Message Sequence
**Option 1: Trên Graph**
- Nhìn vào graph canvas
- Mỗi mũi tên có label: "1. Attach Request", "2. Policy Request"...
- Animation chạy theo thứ tự

**Option 2: Flow Steps Panel**
- Click tab "Flow Steps" (bên phải)
- Xem timeline từng bước với description
- Thấy timeout và type của mỗi step

**Option 3: Message Flow Panel**
- Click tab "Message Flow"
- Xem danh sách message sorted by sequence
- Mỗi message hiển thị: number, label, source → target, type

### 3. Test Flow Execution
```tsx
// Click "Test Flow" button
// → Simulation chạy qua từng step
// → Edges được highlight theo sequence
// → Execution Timeline hiển thị policy evaluation
```

---

## Technical Implementation

### Edge Generation
```typescript
// In flowGenerator.ts
function generateSubscriptionEdges(nodes, startSeq) {
  const edges = [];
  let seq = startSeq;
  
  // Step 1: UE → AMF
  edges.push({
    id: `edge-${seq}`,
    source: ueNode.id,
    target: amfNode.id,
    label: `${seq}. Attach/PDU Request`,
    sequence: seq++,
    messageType: 'request',
    animated: true,
    style: { stroke: '#3B82F6', strokeWidth: 2 },
    markerEnd: { type: 'arrowclosed', color: '#3B82F6' }
  });
  
  // Step 2: AMF → PCF
  edges.push({
    id: `edge-${seq}`,
    source: amfNode.id,
    target: pcfNode.id,
    label: `${seq}. Policy Request`,
    sequence: seq++,
    messageType: 'request',
    animated: true,
    style: { stroke: '#10B981', strokeWidth: 2 },
    markerEnd: { type: 'arrowclosed', color: '#10B981' }
  });
  
  // ... continue for all steps
}
```

### Edge Display
```typescript
// In PolicyFlowGraphV2.tsx
flowData.edges.forEach((edge) => {
  edges.push({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label, // "1. Attach Request"
    animated: edge.animated,
    style: edge.style,
    labelStyle: { 
      fill: '#1F2937', 
      fontWeight: 600,
      fontSize: 12,
      background: 'white'
    }
  });
});
```

---

## Examples

### Example 1: UE Attach - SM Policy
```
Subscription-based flow with 8 message steps:

Graph View:
┌───┐  1   ┌─────┐  2   ┌─────┐  3   ┌─────┐
│UE │ ───> │ AMF │ ───> │ PCF │ ───> │ UDR │
└───┘      └─────┘      └─────┘      └─────┘
                           │  5         ↑ 4
                           v            │
                      ┌─────────┐       │
                      │ Rating  │───────┘ 6
                      │ Engine  │
                      └─────────┘
```

**Message Flow Panel:**
1. Attach/PDU Request (UE → AMF) [request]
2. Policy Request (AMF → PCF) [request]
3. Query Profile (PCF → UDR) [request]
4. Profile Data (UDR → PCF) [response]
5. Rate Request (PCF → Rating Engine) [request]
6. Policy Rules (Rating Engine → PCF) [response]
7. Policy Decision (PCF → AMF) [response]
8. Accept (AMF → UE) [response]

---

### Example 2: NEF QoS On-Demand
```
On-demand flow with 5 message steps:

Graph View:
┌─────┐  1   ┌─────┐  2   ┌─────┐
│ NEF │ ───> │ PCF │ ───> │ ABM │
└─────┘      └─────┘      └─────┘
    ↑ 5         │ 4          │ 3
    └───────────┴────────────┘
```

**Message Flow Panel:**
1. On-Demand Request (NEF → PCF) [trigger]
2. Update Profile (PCF → ABM) [request]
3. ACK (ABM → PCF) [response]
4. Policy Update (PCF → SMF) [notification]
5. Success (PCF → NEF) [response]

---

## Best Practices

### 1. **Đọc Flow từ Trái sang Phải, Trên xuống Dưới**
- PCF Logic Lane ở trên
- Network Functions Lane ở dưới
- Messages chạy theo chiều ngang và dọc

### 2. **Chú ý Message Types**
- Request: Solid arrows (━)
- Response: Dashed arrows (- -)
- Sequences luôn tăng dần (1, 2, 3...)

### 3. **Sử dụng Tabs bên phải**
- **Flow Steps**: Xem tổng quan workflow
- **Message Flow**: Xem chi tiết từng message
- **Execution Timeline**: Xem policy evaluation results (khi test)
- **PCF Metrics**: Xem performance metrics (khi test)

### 4. **Testing**
- Click "Test Flow" để simulate execution
- Xem edges được highlight theo sequence
- Check timeline để verify logic

---

## Future Enhancements

### Planned Features:
- [ ] **Message Body Inspector**: Click vào edge để xem request/response body
- [ ] **Sequence Animation**: Auto-play animation theo thứ tự messages
- [ ] **Error Handling Paths**: Hiển thị error flows (retry, fallback)
- [ ] **Performance Metrics**: Latency cho từng message hop
- [ ] **Live Monitoring**: Real-time message flow tracking
- [ ] **Export Sequence Diagram**: Export as PlantUML or Mermaid

---

**Version**: 1.0.0  
**Updated**: November 26, 2025  
**Author**: PCF Policy Studio Team
