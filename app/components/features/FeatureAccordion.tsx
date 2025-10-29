import React from "react";
import { Collapse, Switch, Row, Col, Typography, Space } from "antd";
const { Panel } = Collapse;
const { Text } = Typography;

type Mode = "view" | "edit";

export type FeaturesConfig = {
    sessionManagement: {
        policyControl: {
            gatingControl?: boolean;
            qosControl?: {
                serviceDataFlowLevel?: boolean;
                ipType?: boolean;
                ethernetType?: boolean;
                qosFlowLevel?: boolean;
                pduSessionLevel?: boolean;
            };
            spendingLimit?: boolean;
        };
        usageMonitoring: {
            aspect?: { time?: boolean; volume?: boolean };
            level?: { perSession?: boolean; perServiceDataFlow?: boolean; perRAT?: boolean };
        };
        applicationDetection?: boolean;
        trafficSteering?: { atss?: boolean; tsc?: boolean; };
        exposureCapability?: { eventExposure?: boolean; afChargingParameter?: boolean; policyAuthorizationQoD?: boolean };
    };
    nonSessionManagement: {
        accessAndMobilityPolicy?: boolean;
        uePolicyControl?: { andsp?: boolean; ursp?: boolean; v2x?: boolean; a2x?: boolean; prose?: boolean };
        multicastBroadcast?: boolean;
        exposureCapability?: { plannedDataTransfer?: boolean; backgroundDataTransfer?: boolean; afGuidance?: boolean };
    };
    // new top-level group
    intelligenceAndOptimization?: {
        aiPolicies?: {
            modelSelection?: boolean;
            autoTuning?: boolean;
            policyLearning?: boolean;
        };
        analytics?: {
            anomalyDetection?: boolean;
            rootCauseAnalysis?: boolean;
            trending?: boolean;
        };
    };
    // System & Integration group
    systemAndIntegration?: {
        policyEngine?: { mode?: "builtin" | "vocs" | "custom" };
        subscriptionManagement?: { mode?: "builtin" | "vocs" };
        automation?: { recurring?: boolean; cleaning?: boolean; orchestration?: boolean };
        security?: { oauth2?: boolean; tls?: boolean; mtls?: boolean };
    };
};

// add helper to count booleans in a subtree
function countBooleans(obj: any) {
    let enabled = 0;
    let total = 0;
    function walk(v: any) {
        if (typeof v === "boolean") {
            total++;
            if (v) enabled++;
            return;
        }
        if (v && typeof v === "object") {
            for (const k of Object.keys(v)) walk(v[k]);
        }
    }
    walk(obj);
    return { enabled, total };
}

// add helper to count mixed types (boolean + string choices) for system group
function countMixed(obj: any) {
    let enabled = 0;
    let total = 0;
    function walk(v: any) {
        if (typeof v === "boolean") {
            total++;
            if (v) enabled++;
            return;
        }
        if (typeof v === "string") {
            total++;
            // treat 'builtin' as disabled, others as enabled
            if (v && v !== "builtin") enabled++;
            return;
        }
        if (v && typeof v === "object") {
            for (const k of Object.keys(v)) walk(v[k]);
        }
    }
    walk(obj);
    return { enabled, total };
}

export default function FeatureAccordion({
    mode = "view",
    initial = {} as FeaturesConfig,
    onChange,
}: {
    mode?: Mode;
    initial?: FeaturesConfig;
    onChange?: (cfg: FeaturesConfig) => void;
}) {
    // helper: deep merge source into target (source wins)
    function mergeDeep<T>(target: T, source?: Partial<T>): T {
        if (!source) return structuredClone(target);
        const out: any = structuredClone(target) as any;
        const src: any = source as any;
        for (const key of Object.keys(src)) {
            const sVal = src[key];
            const tVal = out[key];
            if (
                sVal &&
                typeof sVal === "object" &&
                !Array.isArray(sVal) &&
                tVal &&
                typeof tVal === "object" &&
                !Array.isArray(tVal)
            ) {
                out[key] = mergeDeep(tVal, sVal);
            } else {
                out[key] = sVal;
            }
        }
        return out;
    }

    const defaultCfg: FeaturesConfig = {
        sessionManagement: {
            policyControl: {
                gatingControl: false,
                qosControl: { serviceDataFlowLevel: true, ipType: true, ethernetType: false, qosFlowLevel: false, pduSessionLevel: false },
                spendingLimit: false,
            },
            usageMonitoring: { aspect: { time: true, volume: true }, level: { perSession: false, perServiceDataFlow: true, perRAT: true } },
            applicationDetection: false,
            trafficSteering: { atss: false, tsc: false },
            exposureCapability: { eventExposure: true, afChargingParameter: false, policyAuthorizationQoD: true },
        },
        nonSessionManagement: {
            accessAndMobilityPolicy: false,
            uePolicyControl: { andsp: false, ursp: true, v2x: false, a2x: false, prose: false },
            multicastBroadcast: false,
            exposureCapability: { plannedDataTransfer: false, backgroundDataTransfer: false, afGuidance: true },
        },
        intelligenceAndOptimization: {
            aiPolicies: { modelSelection: true, autoTuning: false, policyLearning: false },
            analytics: { anomalyDetection: true, rootCauseAnalysis: false, trending: false },
        },
        // defaults for System & Integration
        systemAndIntegration: {
            policyEngine: { mode: "builtin" },
            subscriptionManagement: { mode: "builtin" },
            automation: { recurring: false, cleaning: false, orchestration: false },
            security: { oauth2: true, tls: true, mtls: false },
        },
    };

    const [cfg, setCfg] = React.useState<FeaturesConfig>(() => mergeDeep(defaultCfg, initial));

    React.useEffect(() => {
        setCfg(mergeDeep(defaultCfg, initial));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initial]);

    function update(path: string[], value: boolean) {
        setCfg((prev) => {
            const next = structuredClone(prev) as FeaturesConfig;
            let cur: any = next;
            for (let i = 0; i < path.length - 1; i++) {
                if (!cur[path[i]]) cur[path[i]] = {};
                cur = cur[path[i]];
            }
            cur[path[path.length - 1]] = value;
            onChange?.(next);
            return next;
        });
    }

    // LeafBox: visual container for leaf-level features
    function LeafBox({ indentLevel = 0, children }: { indentLevel?: number; children: React.ReactNode }) {
        return (
            <div style={{ paddingLeft: indentLevel * 16, marginBottom: 8 }}>
                <div className="border rounded-md p-3 bg-white dark:bg-gray-900">
                    {children}
                </div>
            </div>
        );
    }

    // RowSwitch: accepts indentLevel to control left padding (for non-boxed rows)
    const RowSwitch = ({ label, checked, onToggle, indentLevel = 0 }: { label: string; checked?: boolean; onToggle?: (v: boolean) => void; indentLevel?: number }) => (
        <Row justify="space-between" align="middle" style={{ marginBottom: 8, paddingLeft: indentLevel * 8 }}>
            <Col>
                <Text className="font-medium">{label}</Text>
            </Col>
            <Col>
                <Switch checked={!!checked} disabled={mode === "view"} onChange={(v) => onToggle?.(v)} />
            </Col>
        </Row>
    );

    // styled header helpers
    const GroupHeader = ({ children, count }: { children: React.ReactNode; count?: { enabled: number; total: number } }) => (
        <span className="uppercase font-extrabold text-sm">
            {children}
            {count ? <span className="ml-2 text-sm font-semibold">({count.enabled}/{count.total})</span> : null}
        </span>
    );
    const SubGroupHeader = ({ children, count }: { children: React.ReactNode; count?: { enabled: number; total: number } }) => (
        <span className="uppercase font-semibold text-xs">
            {children}
            {count ? <span className="ml-2 text-xs font-medium">({count.enabled}/{count.total})</span> : null}
        </span>
    );

    // indentation strategy (consistent): group -> subgroup -> child
    const groupIndent = 0;
    const subgroupIndent = groupIndent + 1;
    // childIndent equals subgroupIndent so direct children align with subgroup's children/panels
    const childIndent = subgroupIndent;
    const deeperIndent = childIndent + 1; // for deeper nested content

    // compute counts for top-level groups
    const sessionCounts = cfg.sessionManagement ? countBooleans(cfg.sessionManagement) : { enabled: 0, total: 0 };
    const nonSessionCounts = cfg.nonSessionManagement ? countBooleans(cfg.nonSessionManagement) : { enabled: 0, total: 0 };
    // ensure we merge defaults with current cfg so missing keys don't yield 0/0
    const intelligenceDefault = defaultCfg.intelligenceAndOptimization ?? {};
    const intelligenceCurrent = cfg.intelligenceAndOptimization ?? {};
    const intelligenceMerged: any = mergeDeep(intelligenceDefault as any, intelligenceCurrent as any);
    const intelligenceCounts = intelligenceMerged ? countBooleans(intelligenceMerged) : { enabled: 0, total: 0 };
    const aiPoliciesCounts = intelligenceMerged.aiPolicies ? countBooleans(intelligenceMerged.aiPolicies) : { enabled: 0, total: 0 };
    const analyticsCounts = intelligenceMerged.analytics ? countBooleans(intelligenceMerged.analytics) : { enabled: 0, total: 0 };

    // Traffic Steering counts (merge defaults with current to ensure keys present)
    const trafficSteeringDefault = defaultCfg.sessionManagement?.trafficSteering ?? {};
    const trafficSteeringCurrent = cfg.sessionManagement?.trafficSteering ?? {};
    const trafficSteeringMerged: any = mergeDeep(trafficSteeringDefault as any, trafficSteeringCurrent as any);
    const trafficSteeringCounts = trafficSteeringMerged ? countBooleans(trafficSteeringMerged) : { enabled: 0, total: 0 };

    // Policy Control & QoS counts
    const policyControlDefault = defaultCfg.sessionManagement?.policyControl ?? {};
    const policyControlCurrent = cfg.sessionManagement?.policyControl ?? {};
    const policyControlMerged: any = mergeDeep(policyControlDefault as any, policyControlCurrent as any);
    const policyControlCounts = policyControlMerged ? countBooleans(policyControlMerged) : { enabled: 0, total: 0 };

    const qosDefault = defaultCfg.sessionManagement?.policyControl?.qosControl ?? {};
    const qosCurrent = cfg.sessionManagement?.policyControl?.qosControl ?? {};
    const qosMerged: any = mergeDeep(qosDefault as any, qosCurrent as any);
    const qosCounts = qosMerged ? countBooleans(qosMerged) : { enabled: 0, total: 0 };

    // Usage monitoring counts
    const usageAspectDefault = defaultCfg.sessionManagement?.usageMonitoring?.aspect ?? {};
    const usageAspectCurrent = cfg.sessionManagement?.usageMonitoring?.aspect ?? {};
    const usageAspectMerged: any = mergeDeep(usageAspectDefault as any, usageAspectCurrent as any);
    const usageAspectCounts = usageAspectMerged ? countBooleans(usageAspectMerged) : { enabled: 0, total: 0 };

    const usageLevelDefault = defaultCfg.sessionManagement?.usageMonitoring?.level ?? {};
    const usageLevelCurrent = cfg.sessionManagement?.usageMonitoring?.level ?? {};
    const usageLevelMerged: any = mergeDeep(usageLevelDefault as any, usageLevelCurrent as any);
    const usageLevelCounts = usageLevelMerged ? countBooleans(usageLevelMerged) : { enabled: 0, total: 0 };

    // Application Detection
    const applicationDetectionCounts = countBooleans({ applicationDetection: cfg.sessionManagement?.applicationDetection ?? defaultCfg.sessionManagement?.applicationDetection });

    // Exposure capability (session)
    const exposureSessionDefault = defaultCfg.sessionManagement?.exposureCapability ?? {};
    const exposureSessionCurrent = cfg.sessionManagement?.exposureCapability ?? {};
    const exposureSessionMerged: any = mergeDeep(exposureSessionDefault as any, exposureSessionCurrent as any);
    const exposureSessionCounts = exposureSessionMerged ? countBooleans(exposureSessionMerged) : { enabled: 0, total: 0 };

    // Non-session counts
    const accessMobilityCounts = countBooleans({ accessAndMobilityPolicy: cfg.nonSessionManagement?.accessAndMobilityPolicy ?? defaultCfg.nonSessionManagement?.accessAndMobilityPolicy });
    const uePolicyDefault = defaultCfg.nonSessionManagement?.uePolicyControl ?? {};
    const uePolicyCurrent = cfg.nonSessionManagement?.uePolicyControl ?? {};
    const uePolicyMerged: any = mergeDeep(uePolicyDefault as any, uePolicyCurrent as any);
    const uePolicyCounts = uePolicyMerged ? countBooleans(uePolicyMerged) : { enabled: 0, total: 0 };
    const multicastCounts = countBooleans({ multicastBroadcast: cfg.nonSessionManagement?.multicastBroadcast ?? defaultCfg.nonSessionManagement?.multicastBroadcast });
    const exposureNonSessionDefault = defaultCfg.nonSessionManagement?.exposureCapability ?? {};
    const exposureNonSessionCurrent = cfg.nonSessionManagement?.exposureCapability ?? {};
    const exposureNonSessionMerged: any = mergeDeep(exposureNonSessionDefault as any, exposureNonSessionCurrent as any);
    const exposureNonSessionCounts = exposureNonSessionMerged ? countBooleans(exposureNonSessionMerged) : { enabled: 0, total: 0 };

    // counts for System & Integration (merge defaults with current to ensure keys present)
    const systemDefault = defaultCfg.systemAndIntegration ?? {};
    const systemCurrent = cfg.systemAndIntegration ?? {};
    const systemMerged: any = mergeDeep(systemDefault as any, systemCurrent as any);
    const systemCounts = systemMerged ? countMixed(systemMerged) : { enabled: 0, total: 0 };
    const policyEngineCounts = systemMerged?.policyEngine ? countMixed(systemMerged.policyEngine) : { enabled: 0, total: 0 };
    const subscriptionCounts = systemMerged?.subscriptionManagement ? countMixed(systemMerged.subscriptionManagement) : { enabled: 0, total: 0 };
    const automationCounts = systemMerged?.automation ? countBooleans(systemMerged.automation) : { enabled: 0, total: 0 };
    const securityCounts = systemMerged?.security ? countBooleans(systemMerged.security) : { enabled: 0, total: 0 };

    return (
        /* allow multiple top-level panels open */
        <Collapse defaultActiveKey={["session", "non-session"]}>
            <Panel header={<GroupHeader count={sessionCounts}>Session Management</GroupHeader>} key="session">
                <Collapse ghost>
                    {/* Policy Control */}
                    <Panel header={<SubGroupHeader count={policyControlCounts}>Policy Control</SubGroupHeader>} key="policyControl">
                        <div style={{ marginLeft: subgroupIndent * 16 }}>
                            <Space direction="vertical" style={{ width: "100%" }}>
                                {/* Gating control is a leaf: boxed + indented relative to subgroup */}
                                <LeafBox indentLevel={childIndent}>
                                    <RowSwitch label="Gating control" checked={cfg.sessionManagement?.policyControl?.gatingControl} onToggle={(v) => update(["sessionManagement", "policyControl", "gatingControl"], v)} />
                                </LeafBox>

                                {/* QoS Control: subgroup; its leaves are indented deeper relative to Policy Control */}
                                <Collapse ghost>
                                    <Panel header={<SubGroupHeader count={qosCounts}>QoS Control</SubGroupHeader>} key="qos">
                                        <LeafBox indentLevel={deeperIndent}>
                                            <RowSwitch label="Service Data Flow level" checked={cfg.sessionManagement?.policyControl?.qosControl?.serviceDataFlowLevel} onToggle={(v) => update(["sessionManagement", "policyControl", "qosControl", "serviceDataFlowLevel"], v)} />
                                            <RowSwitch label="IP type" checked={cfg.sessionManagement?.policyControl?.qosControl?.ipType} onToggle={(v) => update(["sessionManagement", "policyControl", "qosControl", "ipType"], v)} />
                                            <RowSwitch label="Ethernet type" checked={cfg.sessionManagement?.policyControl?.qosControl?.ethernetType} onToggle={(v) => update(["sessionManagement", "policyControl", "qosControl", "ethernetType"], v)} />
                                            <RowSwitch label="QoS Flow level" checked={cfg.sessionManagement?.policyControl?.qosControl?.qosFlowLevel} onToggle={(v) => update(["sessionManagement", "policyControl", "qosControl", "qosFlowLevel"], v)} />
                                            <RowSwitch label="PDU Session level" checked={cfg.sessionManagement?.policyControl?.qosControl?.pduSessionLevel} onToggle={(v) => update(["sessionManagement", "policyControl", "qosControl", "pduSessionLevel"], v)} />
                                        </LeafBox>
                                    </Panel>
                                </Collapse>

                                {/* Spending Limit - same child indent */}
                                <LeafBox indentLevel={childIndent}>
                                    <RowSwitch label="Spending Limit" checked={cfg.sessionManagement?.policyControl?.spendingLimit} onToggle={(v) => update(["sessionManagement", "policyControl", "spendingLimit"], v)} />
                                </LeafBox>
                            </Space>
                        </div>
                    </Panel>

                    {/* Usage Monitoring */}
                    <Panel header={<SubGroupHeader count={{ enabled: (usageAspectCounts?.enabled ?? 0) + (usageLevelCounts?.enabled ?? 0), total: (usageAspectCounts?.total ?? 0) + (usageLevelCounts?.total ?? 0) }}>Usage Monitoring</SubGroupHeader>} key="usageMonitoring">
                        <div style={{ marginLeft: subgroupIndent * 16 }}>
                            {/* inner collapse with explicit unique keys so both panels render */}
                            <Collapse ghost>
                                <Panel header={<SubGroupHeader count={usageAspectCounts}>Aspect</SubGroupHeader>} key="usage-aspect">
                                    <LeafBox indentLevel={deeperIndent}>
                                        <RowSwitch label="Time" checked={cfg.sessionManagement?.usageMonitoring?.aspect?.time} onToggle={(v) => update(["sessionManagement", "usageMonitoring", "aspect", "time"], v)} />
                                        <RowSwitch label="Volume" checked={cfg.sessionManagement?.usageMonitoring?.aspect?.volume} onToggle={(v) => update(["sessionManagement", "usageMonitoring", "aspect", "volume"], v)} />
                                    </LeafBox>
                                </Panel>
                                <Panel header={<SubGroupHeader count={usageLevelCounts}>Level</SubGroupHeader>} key="usage-level">
                                    <LeafBox indentLevel={deeperIndent}>
                                        <RowSwitch label="Per Session" checked={cfg.sessionManagement?.usageMonitoring?.level?.perSession} onToggle={(v) => update(["sessionManagement", "usageMonitoring", "level", "perSession"], v)} />
                                        <RowSwitch label="Per Service Data Flow" checked={cfg.sessionManagement?.usageMonitoring?.level?.perServiceDataFlow} onToggle={(v) => update(["sessionManagement", "usageMonitoring", "level", "perServiceDataFlow"], v)} />
                                        <RowSwitch label="Per RAT" checked={cfg.sessionManagement?.usageMonitoring?.level?.perRAT} onToggle={(v) => update(["sessionManagement", "usageMonitoring", "level", "perRAT"], v)} />
                                    </LeafBox>
                                </Panel>
                            </Collapse>
                        </div>
                    </Panel>

                    {/* Application Detection */}
                    <Panel header={<SubGroupHeader count={applicationDetectionCounts}>Application Detection</SubGroupHeader>} key="appDetect">
                        <div style={{ marginLeft: subgroupIndent * 16 }}>
                            <LeafBox indentLevel={childIndent}>
                                <RowSwitch label="Application Detection" checked={cfg.sessionManagement?.applicationDetection} onToggle={(v) => update(["sessionManagement", "applicationDetection"], v)} />
                            </LeafBox>
                        </div>
                    </Panel>

                    {/* Traffic Steering */}
                    <Panel header={<SubGroupHeader count={trafficSteeringCounts}>Traffic Steering</SubGroupHeader>} key="trafficSteering">
                        <div style={{ marginLeft: subgroupIndent * 16 }}>
                            <LeafBox indentLevel={childIndent}>
                                <RowSwitch label="AT3S" checked={cfg.sessionManagement?.trafficSteering?.atss} onToggle={(v) => update(["sessionManagement", "trafficSteering", "atss"], v)} />
                                <RowSwitch label="TSC" checked={cfg.sessionManagement?.trafficSteering?.tsc} onToggle={(v) => update(["sessionManagement", "trafficSteering", "tsc"], v)} />
                            </LeafBox>
                        </div>
                    </Panel>

                    {/* Exposure Capability */}
                    <Panel header={<SubGroupHeader count={exposureSessionCounts}>Exposure Capability</SubGroupHeader>} key="exposureCapability">
                        <div style={{ marginLeft: subgroupIndent * 16 }}>
                            <LeafBox indentLevel={childIndent}>
                                <RowSwitch label="Event Exposure" checked={cfg.sessionManagement?.exposureCapability?.eventExposure} onToggle={(v) => update(["sessionManagement", "exposureCapability", "eventExposure"], v)} />
                                <RowSwitch label="AF Charging Parameter" checked={cfg.sessionManagement?.exposureCapability?.afChargingParameter} onToggle={(v) => update(["sessionManagement", "exposureCapability", "afChargingParameter"], v)} />
                                <RowSwitch label="Policy Authorization / QoD" checked={cfg.sessionManagement?.exposureCapability?.policyAuthorizationQoD} onToggle={(v) => update(["sessionManagement", "exposureCapability", "policyAuthorizationQoD"], v)} />
                            </LeafBox>
                        </div>
                    </Panel>
                </Collapse>
            </Panel>

            {/* Non-Session Management */}
            <Panel header={<GroupHeader count={nonSessionCounts}>Non-Session Management</GroupHeader>} key="non-session">
                <Collapse ghost>
                    <Panel header={<SubGroupHeader count={accessMobilityCounts}>Access and Mobility Policy</SubGroupHeader>} key="accessMobility">
                        <div style={{ marginLeft: subgroupIndent * 16 }}>
                            <LeafBox indentLevel={childIndent}>
                                <RowSwitch label="Access and Mobility Policy" checked={cfg.nonSessionManagement?.accessAndMobilityPolicy} onToggle={(v) => update(["nonSessionManagement", "accessAndMobilityPolicy"], v)} />
                            </LeafBox>
                        </div>
                    </Panel>

                    <Panel header={<SubGroupHeader count={uePolicyCounts}>UE Policy Control</SubGroupHeader>} key="uePolicy">
                        <div style={{ marginLeft: subgroupIndent * 16 }}>
                            <LeafBox indentLevel={childIndent}>
                                <RowSwitch label="ANDSP" checked={cfg.nonSessionManagement?.uePolicyControl?.andsp} onToggle={(v) => update(["nonSessionManagement", "uePolicyControl", "andsp"], v)} />
                                <RowSwitch label="URSP" checked={cfg.nonSessionManagement?.uePolicyControl?.ursp} onToggle={(v) => update(["nonSessionManagement", "uePolicyControl", "ursp"], v)} />
                                <RowSwitch label="V2X Policy" checked={cfg.nonSessionManagement?.uePolicyControl?.v2x} onToggle={(v) => update(["nonSessionManagement", "uePolicyControl", "v2x"], v)} />
                                <RowSwitch label="A2X Policy" checked={cfg.nonSessionManagement?.uePolicyControl?.a2x} onToggle={(v) => update(["nonSessionManagement", "uePolicyControl", "a2x"], v)} />
                                <RowSwitch label="ProSe Policy" checked={cfg.nonSessionManagement?.uePolicyControl?.prose} onToggle={(v) => update(["nonSessionManagement", "uePolicyControl", "prose"], v)} />
                            </LeafBox>
                        </div>
                    </Panel>

                    <Panel header={<SubGroupHeader count={multicastCounts}>Multicast / Broadcast</SubGroupHeader>} key="mb">
                        <div style={{ marginLeft: subgroupIndent * 16 }}>
                            <LeafBox indentLevel={childIndent}>
                                <RowSwitch label="Multicast / Broadcast" checked={cfg.nonSessionManagement?.multicastBroadcast} onToggle={(v) => update(["nonSessionManagement", "multicastBroadcast"], v)} />
                            </LeafBox>
                        </div>
                    </Panel>

                    <Panel header={<SubGroupHeader count={exposureNonSessionCounts}>Exposure Capability</SubGroupHeader>} key="ns-exposure">
                        <div style={{ marginLeft: subgroupIndent * 16 }}>
                            <LeafBox indentLevel={childIndent}>
                                <RowSwitch label="Background Data Transfer" checked={cfg.nonSessionManagement?.exposureCapability?.backgroundDataTransfer} onToggle={(v) => update(["nonSessionManagement", "exposureCapability", "backgroundDataTransfer"], v)} />
                                <RowSwitch label="Planned Data Transfer" checked={cfg.nonSessionManagement?.exposureCapability?.plannedDataTransfer} onToggle={(v) => update(["nonSessionManagement", "exposureCapability", "plannedDataTransfer"], v)} />
                                <RowSwitch label="AF Guidance" checked={cfg.nonSessionManagement?.exposureCapability?.afGuidance} onToggle={(v) => update(["nonSessionManagement", "exposureCapability", "afGuidance"], v)} />
                            </LeafBox>
                        </div>
                    </Panel>
                </Collapse>
            </Panel>

            {/* Intelligence & Optimization (new) */}
            <Panel header={<GroupHeader count={intelligenceCounts}>Intelligence & Optimization</GroupHeader>} key="intelligence">
                <Collapse ghost>
                    <Panel header={<SubGroupHeader count={aiPoliciesCounts}>AI Policies</SubGroupHeader>} key="ai-policies">
                        <div style={{ marginLeft: subgroupIndent * 16 }}>
                            <LeafBox indentLevel={childIndent}>
                                <RowSwitch label="Model Selection" checked={cfg.intelligenceAndOptimization?.aiPolicies?.modelSelection} onToggle={(v) => update(["intelligenceAndOptimization", "aiPolicies", "modelSelection"], v)} />
                                <RowSwitch label="Auto-Tuning" checked={cfg.intelligenceAndOptimization?.aiPolicies?.autoTuning} onToggle={(v) => update(["intelligenceAndOptimization", "aiPolicies", "autoTuning"], v)} />
                                <RowSwitch label="Policy Learning" checked={cfg.intelligenceAndOptimization?.aiPolicies?.policyLearning} onToggle={(v) => update(["intelligenceAndOptimization", "aiPolicies", "policyLearning"], v)} />
                            </LeafBox>
                        </div>
                    </Panel>

                    <Panel header={<SubGroupHeader count={analyticsCounts}>Analytics</SubGroupHeader>} key="analytics">
                        <div style={{ marginLeft: subgroupIndent * 16 }}>
                            <LeafBox indentLevel={childIndent}>
                                <RowSwitch label="Anomaly Detection" checked={cfg.intelligenceAndOptimization?.analytics?.anomalyDetection} onToggle={(v) => update(["intelligenceAndOptimization", "analytics", "anomalyDetection"], v)} />
                                <RowSwitch label="Root Cause Analysis" checked={cfg.intelligenceAndOptimization?.analytics?.rootCauseAnalysis} onToggle={(v) => update(["intelligenceAndOptimization", "analytics", "rootCauseAnalysis"], v)} />
                                <RowSwitch label="Trending" checked={cfg.intelligenceAndOptimization?.analytics?.trending} onToggle={(v) => update(["intelligenceAndOptimization", "analytics", "trending"], v)} />
                            </LeafBox>
                        </div>
                    </Panel>
                </Collapse>
            </Panel>

            {/* System & Integration (new) */}
            <Panel header={<GroupHeader count={systemCounts}>System & Integration</GroupHeader>} key="system-integration">
                <Collapse ghost>
                    <Panel header={<SubGroupHeader count={policyEngineCounts}>Policy Engine</SubGroupHeader>} key="policy-engine">
                        <div style={{ marginLeft: subgroupIndent * 16 }}>
                            <LeafBox indentLevel={childIndent}>
                                {/* Radio choices */}
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    <label className="text-sm font-medium">Mode</label>
                                    <div>
                                        <Space direction="vertical">
                                            <label>
                                                <input type="radio" name={`policyMode-${String(Math.random())}`} checked={cfg.systemAndIntegration?.policyEngine?.mode === "builtin"} onChange={() => update(["systemAndIntegration", "policyEngine", "mode"], "builtin" as any)} />
                                                <span className="ml-2">Built-in</span>
                                            </label>
                                            <label>
                                                <input type="radio" name={`policyMode`} checked={cfg.systemAndIntegration?.policyEngine?.mode === "vocs"} onChange={() => update(["systemAndIntegration", "policyEngine", "mode"], "vocs" as any)} />
                                                <span className="ml-2">vOCS Integration</span>
                                            </label>
                                            <label>
                                                <input type="radio" name={`policyMode`} checked={cfg.systemAndIntegration?.policyEngine?.mode === "custom"} onChange={() => update(["systemAndIntegration", "policyEngine", "mode"], "custom" as any)} />
                                                <span className="ml-2">Custom</span>
                                            </label>
                                        </Space>
                                    </div>
                                </div>
                            </LeafBox>
                        </div>
                    </Panel>

                    <Panel header={<SubGroupHeader count={subscriptionCounts}>Subscription Management</SubGroupHeader>} key="subscription-management">
                        <div style={{ marginLeft: subgroupIndent * 16 }}>
                            <LeafBox indentLevel={childIndent}>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    <label className="text-sm font-medium">Mode</label>
                                    <div>
                                        <Space direction="vertical">
                                            <label>
                                                <input type="radio" name={`subMode-${String(Math.random())}`} checked={cfg.systemAndIntegration?.subscriptionManagement?.mode === "builtin"} onChange={() => update(["systemAndIntegration", "subscriptionManagement", "mode"], "builtin" as any)} />
                                                <span className="ml-2">Built-in</span>
                                            </label>
                                            <label>
                                                <input type="radio" name={`subMode`} checked={cfg.systemAndIntegration?.subscriptionManagement?.mode === "vocs"} onChange={() => update(["systemAndIntegration", "subscriptionManagement", "mode"], "vocs" as any)} />
                                                <span className="ml-2">vOCS Integration</span>
                                            </label>
                                        </Space>
                                    </div>
                                </div>
                            </LeafBox>
                        </div>
                    </Panel>

                    <Panel header={<SubGroupHeader count={automationCounts}>Automation</SubGroupHeader>} key="automation">
                        <div style={{ marginLeft: subgroupIndent * 16 }}>
                            <LeafBox indentLevel={childIndent}>
                                <RowSwitch label="Recurring" checked={cfg.systemAndIntegration?.automation?.recurring} onToggle={(v) => update(["systemAndIntegration", "automation", "recurring"], v)} />
                                <RowSwitch label="Cleaning" checked={cfg.systemAndIntegration?.automation?.cleaning} onToggle={(v) => update(["systemAndIntegration", "automation", "cleaning"], v)} />
                                <RowSwitch label="Orchestration" checked={cfg.systemAndIntegration?.automation?.orchestration} onToggle={(v) => update(["systemAndIntegration", "automation", "orchestration"], v)} />
                            </LeafBox>
                        </div>
                    </Panel>

                    <Panel header={<SubGroupHeader count={securityCounts}>Security</SubGroupHeader>} key="security">
                        <div style={{ marginLeft: subgroupIndent * 16 }}>
                            <LeafBox indentLevel={childIndent}>
                                <RowSwitch label="OAuth2" checked={cfg.systemAndIntegration?.security?.oauth2} onToggle={(v) => update(["systemAndIntegration", "security", "oauth2"], v)} />
                                <RowSwitch label="TLS" checked={cfg.systemAndIntegration?.security?.tls} onToggle={(v) => update(["systemAndIntegration", "security", "tls"], v)} />
                                <RowSwitch label="mTLS" checked={cfg.systemAndIntegration?.security?.mtls} onToggle={(v) => update(["systemAndIntegration", "security", "mtls"], v)} />
                            </LeafBox>
                        </div>
                    </Panel>

                    {/* Intelligence & Optimization (if present earlier) */}
                    {/* ...existing code... */}
                </Collapse>
            </Panel>
        </Collapse>
    );
}
