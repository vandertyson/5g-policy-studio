# PCF Policy Studio - Redesigned Architecture

## Overview
The 5G Policy Studio has been redesigned with a **PCF-centric, business-oriented approach** aligned with 3GPP standards and real-world PCF operations.

## Business Flow Organization

### 1. Subscription-Based Policies (📱 Blue)
**Trigger**: UE attach, PDU session establishment
**Processing**: Profile → Rating Engine → Policy Decision

**Flows:**
- UE Attach - SM Policy Provisioning (TS 29.512)
- PDU Session Establishment with QoS (TS 29.512)
- UE Attach - AM Policy Provisioning (TS 29.507)
- UE Attach - UE Policy Provisioning (TS 29.525)
- Charging Policy Activation (TS 29.512)

**Components:**
- PCF Core Engine
- Subscription Manager (ABM/UDR)
- Rating Engine
- External NFs: UE, AMF, SMF, UPF, UDR, ABM

**Process Flow:**
```
1. UE triggers (attach/PDU session request)
2. PCF queries Subscription Manager (ABM or UDR)
3. Rating Engine processes subscriber profile
4. PCF generates policy
5. Policy delivered to NFs (SMF/AMF)
```

---

### 2. On-Demand Policies (⚡ Green)
**Trigger**: External requests (NEF, AF, NWDAF, SMF, AMF events)
**Processing**: Direct policy build (no Rating Engine)

**Flows:**
- NEF-triggered QoS On-Demand (TS 29.512)
- AF Influence on Traffic Routing (TS 29.512)
- Usage Report - Policy Update (TS 29.512)
- Location Change - Policy Adjustment (TS 29.507)
- NWDAF Analytics - Policy Optimization (TS 29.512)
- Emergency QoS Override (TS 29.512)

**Components:**
- PCF Core Engine
- Subscription Manager (ABM/UDR) - Store on-demand policy
- External NFs: NEF, AF, NWDAF, SMF, AMF

**Process Flow:**
```
1. External trigger (NEF/AF/NWDAF/SMF/AMF)
2. PCF receives on-demand request
3. PCF updates subscriber profile (ABM) OR UDR notifies
4. PCF builds policy immediately
5. Policy delivered to affected NFs
```

---

### 3. Periodic Policies (🔄 Orange)
**Trigger**: Scheduled timers (daily, weekly, monthly)
**Processing**: Profile renewal → Policy refresh

**Flows:**
- Daily Data Quota Renewal (TS 29.512)
- Weekly Plan Renewal (TS 29.512)
- Monthly Plan Renewal (TS 29.512)
- Policy Audit & Refresh (TS 29.512)
- Time-based QoS Adjustment (TS 29.512)

**Components:**
- PCF Core Engine
- Subscription Manager (ABM/UDR)
- Rating Engine (for renewals)
- External NFs: ABM, CHF, SMF, UDR

**Process Flow:**
```
1. Timer expires (daily/weekly/monthly)
2. PCF queries updated subscription data
3. Rating Engine recalculates quotas/policies
4. PCF updates active policies
5. Notifications sent to affected NFs
```

---

### 4. Policy Management Operations (⚙️ Purple)
**Standard lifecycle operations**

**Flows:**
- Create Policy Association
- Update Policy Association
- Delete Policy Association
- Policy Change Notification

---

### 5. Advanced Policy Scenarios (🎯 Red)
**Complex multi-step workflows**

**Flows:**
- VoNR Call Setup with Priority QoS
- Network Slice-based Policy
- Roaming Policy Handover
- Multi-Access PDU Session

---

## PCF Processing Architecture

### Subscription-Based Flow
```
┌─────────────────────────────────────────────────────────────┐
│                    PCF CORE ENGINE                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Receive trigger (UE attach/PDU session)                 │
│     ↓                                                       │
│  2. Query Subscription Manager                              │
│     ├── Option A: ABM (OCS) → Subscriber profile           │
│     └── Option B: UDR → 3GPP policy data                   │
│     ↓                                                       │
│  3. Pass to Rating Engine                                   │
│     • Process profile + context                             │
│     • Calculate appropriate policy                          │
│     ↓                                                       │
│  4. Generate policy decision                                │
│     • QoS parameters                                        │
│     • Charging rules                                        │
│     • Traffic control                                       │
│     ↓                                                       │
│  5. Deliver policy to NFs (SMF/AMF/UE)                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### On-Demand Flow
```
┌─────────────────────────────────────────────────────────────┐
│                    PCF CORE ENGINE                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Receive on-demand request                               │
│     • NEF/AF: 3rd party service request                     │
│     • SMF: Usage report trigger                             │
│     • AMF: Location change trigger                          │
│     • NWDAF: Network analytics                              │
│     ↓                                                       │
│  2. Update subscription data                                │
│     ├── ABM: Store on-demand policy in profile             │
│     └── UDR: Notify PCF of new policy                      │
│     ↓                                                       │
│  3. Build policy immediately (NO Rating Engine)             │
│     ↓                                                       │
│  4. Apply policy to active session                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Policy Types (3GPP Standards)

### SM Policy (Session Management) - TS 29.512
- QoS control for PDU sessions
- Traffic routing
- Charging control
- Usage monitoring

### AM Policy (Access & Mobility) - TS 29.507
- RAT type restrictions
- RFSP index
- Access control
- Mobility restrictions

### UE Policy (UE-level) - TS 29.525
- Traffic steering
- URSP rules
- Application routing
- UE-side traffic control

---

## Component Architecture

### Core Components
1. **PCF Core Engine** (Purple)
   - Main policy decision logic
   - Rule evaluation
   - Policy lifecycle management

2. **Subscription Manager** (Blue)
   - **ABM (Account Balance Management)**: OCS subscriber profiles
   - **UDR (Unified Data Repository)**: 3GPP standard policy data
   - Supports both or either

3. **Rating Engine** (Orange)
   - Profile processing
   - Policy calculation
   - Quota management
   - Required for subscription-based flows
   - NOT required for on-demand flows

### External Network Functions (Green - Mock)
Simplified simulation for:
- UE (User Equipment)
- AMF (Access and Mobility Management)
- SMF (Session Management)
- UPF (User Plane Function)
- NEF (Network Exposure Function)
- AF (Application Function)
- NWDAF (Network Data Analytics)
- UDR (Unified Data Repository)
- CHF (Charging Function)
- IMS (IP Multimedia Subsystem)

---

## User Interface Layout

### Flow Collection Panel (Left Top)
- **Categorized by trigger type**
- Each flow shows:
  - Trigger badge (subscription/on-demand/periodic)
  - Policy type (SM/AM/UE)
  - 3GPP standard reference
- Color-coded by category
- Click to select template

### Procedures Panel (Left Bottom)
When flow template selected, shows:
- **Flow Components**
  - PCF Core Processing
  - Subscription Data Manager (ABM/UDR/Both)
  - Rating Engine (if applicable)
  - External NFs list
- **Flow Details**
  - Trigger mechanism
  - Policy type
  - 3GPP standard
  - Description

### Flow Graph Canvas (Center)
- **PCF-Centric Design** (new architecture)
- Dual-lane layout:
  - **PCF Logic Lane** (top): Policy evaluation, decisions, actions
  - **Network Function Lane** (bottom): Mock NF interactions
- View modes:
  - Full Stack View
  - PCF Focus View

### Properties Panel (Right Top)
Shows selected flow template details:
- Name and description
- Policy type badge
- Trigger mechanism badge
- 3GPP standard
- Core components checklist
- Network functions tags
- "Create Flow from Template" button

### Simulation Window (Bottom)
- **Test simulation controls**
- **Message flow debugging**
- **PCF policy evaluation traces**
- **Network function state monitoring**

---

## Key Features

### 1. Business-Oriented Flow Templates
- 25+ pre-defined flows covering real PCF scenarios
- Aligned with 3GPP standards (TS 29.512, 29.507, 29.525)
- Categorized by trigger mechanism
- Clear component visibility

### 2. PCF-Centric Graph Design
- Visual emphasis on PCF policy logic
- Simplified mock NF representation
- Execution timeline with policy traces
- PCF metrics dashboard

### 3. Comprehensive Simulation
- Test flow logic
- Debug message exchanges
- Monitor PCF decision-making
- Validate policy rules

### 4. 3GPP Compliance
- All flows mapped to 3GPP specifications
- Standard-compliant terminology
- Proper NF interaction patterns

---

## Usage Workflow

1. **Browse Flow Collection**
   - Navigate categories (Subscription-based, On-demand, Periodic, etc.)
   - Review flow descriptions and components

2. **Select Flow Template**
   - Click on a flow to see details
   - Review trigger mechanism, policy type, and components
   - See which NFs are involved

3. **Create Flow from Template**
   - Click "Create Flow from Template"
   - System generates flow with proper:
     - PCF logic nodes
     - Mock NF nodes
     - Message flows
     - Policy evaluation steps

4. **Design & Configure**
   - Configure PCF policy rules
   - Set up QoS parameters
   - Define charging policies
   - Configure mock NF behaviors

5. **Test & Simulate**
   - Run simulation
   - Monitor execution timeline
   - Debug message flows
   - Review PCF metrics

6. **Export & Deploy**
   - Export to backend code
   - Deploy to target environment

---

## Future Enhancements

### Planned Features
1. **Rating Engine Simulator**
   - Visual rating rule designer
   - Profile-based policy calculation
   - Quota management simulation

2. **ABM Integration**
   - Mock ABM responses
   - Subscriber profile management
   - Balance and quota tracking

3. **UDR Integration**
   - Policy data repository simulation
   - Subscription data queries
   - Notification mechanisms

4. **Advanced Debugging**
   - Step-by-step policy evaluation
   - Rule condition inspection
   - Action execution traces

5. **Real-time Monitoring**
   - Live policy application stats
   - Performance metrics
   - Error tracking

---

## Standards References

- **TS 29.512**: SM Policy Control (Npcf_SMPolicyControl API)
- **TS 29.507**: AM Policy Control (Npcf_AMPolicyControl API)
- **TS 29.525**: UE Policy Control (Npcf_UEPolicyControl API)
- **TS 23.501**: 5G System Architecture
- **TS 23.503**: Policy and Charging Control Framework

---

**Updated**: November 26, 2025
**Version**: 2.0.0 (PCF-Centric Architecture)
