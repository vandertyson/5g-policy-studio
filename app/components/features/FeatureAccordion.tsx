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

    // second-level subgroup counts for Session Management
    const policyControlCounts = cfg.sessionManagement?.policyControl ? countBooleans(cfg.sessionManagement.policyControl) : { enabled: 0, total: 0 };
    const qosCounts = cfg.sessionManagement?.policyControl?.qosControl ? countBooleans(cfg.sessionManagement.policyControl.qosControl) : { enabled: 0, total: 0 };
    const usageAspectCounts = cfg.sessionManagement?.usageMonitoring?.aspect ? countBooleans(cfg.sessionManagement.usageMonitoring.aspect) : { enabled: 0, total: 0 };
    const usageLevelCounts = cfg.sessionManagement?.usageMonitoring?.level ? countBooleans(cfg.sessionManagement.usageMonitoring.level) : { enabled: 0, total: 0 };
    const applicationDetectionCounts = typeof cfg.sessionManagement?.applicationDetection === "boolean" ? { enabled: cfg.sessionManagement.applicationDetection ? 1 : 0, total: 1 } : { enabled: 0, total: 0 };
    const trafficSteeringCounts = cfg.sessionManagement?.trafficSteering ? countBooleans(cfg.sessionManagement.trafficSteering) : { enabled: 0, total: 0 };
    const exposureSessionCounts = cfg.sessionManagement?.exposureCapability ? countBooleans(cfg.sessionManagement.exposureCapability) : { enabled: 0, total: 0 };

    // second-level subgroup counts for Non-Session Management
    const accessMobilityCounts = typeof cfg.nonSessionManagement?.accessAndMobilityPolicy === "boolean" ? { enabled: cfg.nonSessionManagement.accessAndMobilityPolicy ? 1 : 0, total: 1 } : { enabled: 0, total: 0 };
    const uePolicyCounts = cfg.nonSessionManagement?.uePolicyControl ? countBooleans(cfg.nonSessionManagement.uePolicyControl) : { enabled: 0, total: 0 };
    const multicastCounts = typeof cfg.nonSessionManagement?.multicastBroadcast === "boolean" ? { enabled: cfg.nonSessionManagement.multicastBroadcast ? 1 : 0, total: 1 } : { enabled: 0, total: 0 };
    // exposureCapability is an object with multiple boolean leaves — count them
    const exposureNonSessionCounts = cfg.nonSessionManagement?.exposureCapability ? countBooleans(cfg.nonSessionManagement.exposureCapability) : { enabled: 0, total: 0 };

    // second-level subgroup counts for Intelligence & Optimization
    // counts for AI Policies and Analytics are computed from intelligenceMerged above (avoid redeclaring aiPoliciesCounts/analyticsCounts)

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
        </Collapse>
    );
}
