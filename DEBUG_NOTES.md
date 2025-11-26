# Debug Notes - Message Flow Issue

## Vấn đề
- Không thấy mũi tên (edges) trên graph
- PCF nodes đang đè lên nhau

## Root Causes Identified

### 1. **Node Positioning**
❌ **Before**: Tất cả PCF nodes có cùng position (x: 100, y: 100)
✅ **Fixed**: PCF nodes được position theo horizontal spacing (x: 100, 280, 560...)

### 2. **Edge Generation**
- Edges được generate trong `flowGenerator.ts`
- Nhưng old mockFlowsData không có edges
- Chỉ có flows được tạo từ template mới có edges

## Solutions Applied

### Fix 1: Node Positioning
```typescript
// flowGenerator.ts - generateNodes()
let pcfX = 100;
pcfNodes.forEach(() => {
  nodes.push({
    id: 'pcf-main',
    position: { x: pcfX, y: 50 } // Different X for each
  });
  pcfX += NODE_SPACING; // 280px spacing
});
```

### Fix 2: Layout Logic
```typescript
// PolicyFlowGraphV2.tsx - convertToPCFCentricLayout()
// PCF Lane: y = 50 (fixed)
// NF Lane: y = PCF_LANE_HEIGHT + LANE_SPACING (fixed)
// X position: incremental with NODE_SPACING
```

### Fix 3: Debug Logging
Added console.logs to track:
- flowData.nodes
- flowData.edges
- Generated layout

## Testing Steps

1. **Create new flow from template:**
   - Click "UE Attach - SM Policy" template
   - Click "Create Flow from Template"
   - Should see:
     - PCF Core and Rating Engine side-by-side (PCF lane)
     - UE, AMF, SMF, UDR, ABM spread out (NF lane)
     - 8 animated arrows with sequence numbers

2. **Check console for:**
   ```
   FlowData.nodes: [PCF, Rating, UE, AMF...]
   FlowData.edges: [8 edges with labels]
   Generated layout.nodes: [positioned nodes]
   Generated layout.edges: [ReactFlow edges]
   ```

3. **Expected visualization:**
   ```
   PCF Lane:  [PCF Core]  →5→  [Rating Engine]
                  ↓3                 ↑6
                                     
   NF Lane:   [UE] →1→ [AMF] →2→ [SMF]  [UDR]
                                         ↑4
   ```

## Next Steps if Still Issues

1. Check if `flowData.edges` exists and has data
2. Verify node IDs match between edges and nodes
3. Check if ReactFlow is rendering edges (inspect DOM)
4. Verify markerEnd and style are valid ReactFlow props
