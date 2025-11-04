import React, { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { Descriptions, Form, Input, Button, Card, Tabs as AntTabs, Collapse, Space, Switch, Select } from "antd";
import { PlatformConfig } from "../../components/platforms/PlatformConfig";
import FeatureAccordion, { type FeaturesConfig } from "../../components/features/FeatureAccordion";
import ExportImportControls from "../../components/ExportImportControls";
import DeploymentGraph from "../../components/deployment/DeploymentGraph";
import { CloudOutlined, ClusterOutlined, DeploymentUnitOutlined } from "@ant-design/icons";

const { Panel } = Collapse;

const mockDetails: Record<string, any> = {
	"1": { id: "1", name: "vOCS-testbed", platform: "kubernetes", createdAt: "2025-09-01T10:00:00Z", updatedAt: "2025-10-01T09:12:00Z", version: "1.3.2", stats: { instances: 5, totalRequests: 123456, errors: 12 }, config: { kubeApi: "https://kube.example.com", namespace: "default" } },
	"2": { id: "2", name: "vOCS-1M", platform: "mano", createdAt: "2025-08-15T08:20:00Z", updatedAt: "2025-10-02T11:22:00Z", version: "2.0.0", stats: { instances: 2, totalRequests: 54321, errors: 3 }, config: { serverUrl: "https://mano.example.org", apiKey: "xxxx-xxxx" } },
	"3": { id: "3", name: "BCTTLL", platform: "mano", createdAt: "2025-07-01T01:00:00Z", updatedAt: "2025-09-20T14:00:00Z", version: "1.9.0", stats: { instances: 1, totalRequests: 1234, errors: 0 } },
	"4": { id: "4", name: "Germadept", platform: "aws", createdAt: "2025-09-20T12:00:00Z", updatedAt: "2025-10-10T12:10:00Z", version: "1.4.1", stats: { instances: 8, totalRequests: 999999, errors: 100 }, config: { accessKey: "", secretKey: "", region: "eu-central-1" } },
};

export function meta() {
	return [{ title: "Deployment Detail - 5G Policy Studio" }];
}

export default function DeploymentDetail() {
	const { id } = useParams();
	const navigate = useNavigate();
	const details = id ? mockDetails[id] ?? null : null;

	// metadata edit state
	const [editingMeta, setEditingMeta] = useState(false);
	const [metaForm] = Form.useForm();
	// platform edit state
	const [editingPlatform, setEditingPlatform] = useState(false);
	const [platformCfg, setPlatformCfg] = useState<Record<string, string>>(details?.config ?? {});
	// features edit state
	const [editingFeatures, setEditingFeatures] = useState(false);
	const [featureConfig, setFeatureConfig] = useState<FeaturesConfig>({
		sessionManagement: {},
		nonSessionManagement: {},
	} as unknown as FeaturesConfig);
	// deployment configuration state + edit mode
	const [editingDeployment, setEditingDeployment] = useState(false);
	const [deploymentCfg, setDeploymentCfg] = useState<Record<string, string>>({
		replicas: "3",
		strategy: "Rolling",
		cpu: "500m",
		memory: "512Mi",
	});

	// file input ref for Import
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	// Export current features as JSON (browser download) — demo only
	function exportFeatures() {
		try {
			const data = featureConfig ?? {};
			const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `${details?.name ?? "deployment"}-features.json`;
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
		} catch (e) {
			// placeholder error handling
			alert("Failed to export features");
		}
	}

	// Trigger hidden file input
	function triggerImport() {
		fileInputRef.current?.click();
	}

	// Handle file selected for import (demo: parse JSON and set into state)
	async function onImportFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const f = e.target.files?.[0];
		if (!f) return;
		try {
			const txt = await f.text();
			const parsed = JSON.parse(txt);
			// basic assignment — in real app validate structure
			setFeatureConfig(parsed as FeaturesConfig);
			alert("Imported feature config (demo)");
		} catch {
			alert("Invalid JSON file");
		} finally {
			// reset input so same file can be re-selected
			e.target.value = "";
		}
	}

	React.useEffect(() => {
		if (details) {
			metaForm.setFieldsValue({ createdAt: details.createdAt, updatedAt: details.updatedAt, version: details.version });
			setPlatformCfg(details.config ?? {});
		}
	}, [details, metaForm]);

	if (!details) {
		return (
			<div className="p-6">
				<Card>Deployment not found.</Card>
				<Button style={{ marginTop: 12 }} onClick={() => navigate("/deployment")}>Back to list</Button>
			</div>
		);
	}

	function saveMeta() {
		metaForm.validateFields().then((vals) => {
			// apply locally
			// ...in real app send API...
			details.createdAt = vals.createdAt;
			details.updatedAt = vals.updatedAt;
			details.version = vals.version;
			setEditingMeta(false);
		});
	}

	function cancelMeta() {
		metaForm.setFieldsValue({ createdAt: details.createdAt, updatedAt: details.updatedAt, version: details.version });
		setEditingMeta(false);
	}

	function savePlatform(cfg: Record<string, string>) {
		// update local model
		details.config = cfg;
		setPlatformCfg(cfg);
		setEditingPlatform(false);
	}

	function cancelPlatform() {
		setPlatformCfg(details.config ?? {});
		setEditingPlatform(false);
	}

	function saveFeatures() {
		// apply locally
		setEditingFeatures(false);
	}

	function cancelFeatures() {
		// reset local feature config if needed
		setEditingFeatures(false);
	}

	function saveDeployment() {
		// demo: apply locally (replace with API call in real app)
		setEditingDeployment(false);
	}

	function cancelDeployment() {
		// reset to last saved (in real app reload from source)
		setDeploymentCfg((d) => ({ ...d }));
		setEditingDeployment(false);
	}

	// Small badge for platform label
	const PlatformBadge = ({ platform }: { platform: string }) => {
		const lower = (platform ?? "").toLowerCase();
		const cfg =
			lower === "kubernetes"
				? { Icon: ClusterOutlined, bg: "#EEF2FF", bd: "#A5B4FC", fg: "#3730A3", text: "Kubernetes" }
				: lower === "mano"
				? { Icon: DeploymentUnitOutlined, bg: "#ECFDF5", bd: "#86EFAC", fg: "#065F46", text: "MANO" }
				: lower === "aws"
				? { Icon: CloudOutlined, bg: "#EFF6FF", bd: "#93C5FD", fg: "#1E40AF", text: "AWS" }
				: { Icon: CloudOutlined, bg: "#F1F5F9", bd: "#CBD5E1", fg: "#0F172A", text: platform || "Unknown" };
		const { Icon, bg, bd, fg, text } = cfg;
		return (
			<div
				style={{
					display: "inline-flex",
					alignItems: "center",
					gap: 10,
					padding: "10px 14px",
					borderRadius: 999,
					background: bg,
					border: `1px solid ${bd}`,
					color: fg,
					fontWeight: 800,
					fontSize: 14,
					letterSpacing: 0.3,
					textTransform: "uppercase",
				}}
				title={`Platform: ${text}`}
			>
				<Icon style={{ fontSize: 18, color: fg }} />
				<span>{text}</span>
			</div>
		);
	};

	// NEW: build explorer docs URL for a module key
	// Before: const docUrl = (modKey: string) => `/explorer/${modKey}`;
	const docUrl = (modKey: string) => `/explorer?module=${encodeURIComponent(modKey)}`;

	// Helper to render a module config block (edit or view)
	const integrationTarget = (modId: string): string => {
		switch (modId) {
			case "npcf-sm-policycontrol": return "SMF";
			case "npcf-am-policycontrol": return "AMF";
			case "npcf-ue-policycontrol": return "UE";
			case "npcf-policy-authorization": return "PCF";
			case "nwdaf-analytics-info": return "NWDAF";
			case "nudr-subscription-info": return "UDR";
			default: return "-";
		}
	};
	const processUpstream = (group: string): { label: string; placeholder: string } => {
		if (group === "gateway") return { label: "Engine Endpoint", placeholder: "http(s)://engine.svc.local:8080" };
		if (group === "engine") return { label: "Registry Endpoint", placeholder: "http(s)://registry.svc.local:8080" };
		return { label: "Upstream Endpoint", placeholder: "http(s)://service.svc.local:8080" };
	};

	const ModuleConfig = ({ id, name, group }: { id: string; name: string; group: string }) => {
		const upstream = processUpstream(group);
		const target = integrationTarget(id);
		if (editingDeployment) {
			return (
				<Form layout="vertical" initialValues={deploymentCfg} onValuesChange={(_, all) => setDeploymentCfg(all)}>
					<Collapse defaultActiveKey={["res"]}>
						<Panel key="res" header={<span className="font-semibold">Resource Configuration</span>} collapsible="icon">
							<Form.Item name={`${id}_replicas`} label="Replicas">
								<Input placeholder="e.g. 3" />
							</Form.Item>
							<Form.Item name={`${id}_cpu`} label="CPU">
								<Input placeholder="e.g. 500m" />
							</Form.Item>
							<Form.Item name={`${id}_memory`} label="Memory">
								<Input placeholder="e.g. 512Mi" />
							</Form.Item>
							<Form.Item name={`${id}_network`} label="Network">
								<Input placeholder="e.g. 100Mb/s" />
							</Form.Item>
						</Panel>

						<Panel key="int" header={<span className="font-semibold">Integration Configuration</span>} collapsible="icon">
							<Form.Item label="Connects To">
								<Input value={target} disabled />
							</Form.Item>
							<Form.Item name={`${id}_endpoint`} label="Endpoint URL">
								<Input placeholder={`e.g. https://${target.toLowerCase()}.svc.local:8443`} />
							</Form.Item>

							{/* stop propagation so toggles don't collapse panels on click */}
							<div style={{ display: "flex", gap: 16 }} onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
								<Form.Item name={`${id}_tls`} label="TLS" valuePropName="checked" style={{ marginBottom: 0 }}>
									<Switch />
								</Form.Item>
								<Form.Item name={`${id}_mtls`} label="mTLS" valuePropName="checked" style={{ marginBottom: 0 }}>
									<Switch />
								</Form.Item>
								<Form.Item name={`${id}_oauth2`} label="OAuth2" valuePropName="checked" style={{ marginBottom: 0 }}>
									<Switch />
								</Form.Item>
							</div>

							<Form.Item name={`${id}_ca`} label="CA Certificate (optional)">
								<Input.TextArea rows={3} placeholder="-----BEGIN CERTIFICATE----- ..." />
							</Form.Item>
						</Panel>

						<Panel key="proc" header={<span className="font-semibold">Process Configuration</span>} collapsible="icon">
							<Form.Item name={`${id}_loglevel`} label="Log Level" initialValue="info">
								<Select
									options={[
										{ value: "error", label: "error" },
										{ value: "warn", label: "warn" },
										{ value: "info", label: "info" },
										{ value: "debug", label: "debug" },
									]}
								/>
							</Form.Item>
							<Form.Item name={`${id}_upstream`} label={upstream.label}>
								<Input placeholder={upstream.placeholder} />
							</Form.Item>
						</Panel>
					</Collapse>
				</Form>
			);
		}
		// view mode
		return (
			<Collapse>
				<Panel key="res_v" header={<span className="font-semibold">Resource Configuration</span>} collapsible="icon">
					<Descriptions column={2} bordered size="small">
						<Descriptions.Item label="Module">{name}</Descriptions.Item>
						<Descriptions.Item label="Replicas">{deploymentCfg[`${id}_replicas`] ?? deploymentCfg.replicas}</Descriptions.Item>
						<Descriptions.Item label="CPU">{deploymentCfg[`${id}_cpu`] ?? deploymentCfg.cpu}</Descriptions.Item>
						<Descriptions.Item label="Memory">{deploymentCfg[`${id}_memory`] ?? deploymentCfg.memory}</Descriptions.Item>
						<Descriptions.Item label="Network">{deploymentCfg[`${id}_network`] ?? "-"}</Descriptions.Item>
					</Descriptions>
				</Panel>

				<Panel key="int_v" header={<span className="font-semibold">Integration Configuration</span>} collapsible="icon">
					<Descriptions column={2} bordered size="small">
						<Descriptions.Item label="Connects To">{target}</Descriptions.Item>
						<Descriptions.Item label="Endpoint URL">{deploymentCfg[`${id}_endpoint`] ?? "-"}</Descriptions.Item>
						<Descriptions.Item label="TLS">{(deploymentCfg[`${id}_tls`] ? "Yes" : "No")}</Descriptions.Item>
						<Descriptions.Item label="mTLS">{(deploymentCfg[`${id}_mtls`] ? "Yes" : "No")}</Descriptions.Item>
						<Descriptions.Item label="OAuth2">{(deploymentCfg[`${id}_oauth2`] ? "Yes" : "No")}</Descriptions.Item>
					</Descriptions>
				</Panel>

				<Panel key="proc_v" header={<span className="font-semibold">Process Configuration</span>} collapsible="icon">
					<Descriptions column={2} bordered size="small">
						<Descriptions.Item label="Log Level">{deploymentCfg[`${id}_loglevel`] ?? "info"}</Descriptions.Item>
						<Descriptions.Item label={upstream.label}>{deploymentCfg[`${id}_upstream`] ?? "-"}</Descriptions.Item>
					</Descriptions>
				</Panel>
			</Collapse>
		);
	};

	// Lvl1 groups and lvl2 modules (mirror Overview)
	const appHierarchy = [
		{
			key: "gateway",
			title: "Gateway",
			children: [
				{ key: "npcf-sm-policycontrol", label: "npcf-sm-policycontrol" },
				{ key: "npcf-am-policycontrol", label: "npcf-am-policycontrol" },
				{ key: "npcf-ue-policycontrol", label: "npcf-ue-policycontrol" },
				{ key: "npcf-policy-authorization", label: "npcf-policy-authorization" },
				{ key: "npcf-event-exposure", label: "npcf-event-exposure" },
				{ key: "npcf-pdtq-policycontrol", label: "npcf-pdtq-policycontrol" },
				{ key: "npcf-bdt-policycontrol", label: "npcf-bdt-policycontrol" },
				{ key: "npcf-mbs-policycontrol", label: "npcf-mbs-policycontrol" },
				{ key: "nchf-spending-limit", label: "nchf-spending-limit" },
				{ key: "nwdaf-analytics-info", label: "nwdaf-analytics-info" },
				{ key: "nudr-subscription-info", label: "nudr-subscription-info" },
			],
		},
		{
			key: "engine",
			title: "Policy Control Engine",
			children: [
				{ key: "engine-core", label: "Engine Core" },
				{ key: "ctl-session", label: "Session Policy Controller" },
				{ key: "ctl-ue", label: "UE Policy Controller" },
				{ key: "ctl-config", label: "Configuration Controller" },
				{ key: "ctl-etc", label: "…" },
			],
		},
		{
			key: "registry",
			title: "Policy Registry",
			children: [
				{ key: "reg-cache", label: "AWS ElasticCache" },
				{ key: "reg-codec", label: "vOCS Product Catalog" },
				{ key: "reg-storage", label: "Amazon Aurora" },
			],
		},
		{
			key: "subs",
			title: "Subscription Management",
			children: [
				{ key: "sub-abm", label: "vOCS ABM" },
				{ key: "sub-udr", label: "UDR" },
				{ key: "sub-custom", label: "Custom" },
			],
		},
		{
			key: "intel",
			title: "Intelligence & Analytics",
			children: [
				{ key: "intel-mcp", label: "MCP Server" },
				{ key: "intel-agent", label: "AI Agent" },
			],
		},
	];

	const tabs = [
		{
			id: "metadata" as const,
			title: "Metadata",
			content: (
				<Card>
					{/* CHANGED: add PlatformBadge on the left, controls on the right */}
					<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
						<PlatformBadge platform={details.platform} />
						<div style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "nowrap", whiteSpace: "nowrap" }}>
							{editingMeta ? (
								<Space>
									<Button onClick={cancelMeta}>Cancel</Button>
									<Button type="primary" onClick={saveMeta}>Save</Button>
								</Space>
							) : (
								<Button onClick={() => setEditingMeta(true)}>Edit</Button>
							)}
						</div>
					</div>

					{editingMeta ? (
						<Form form={metaForm} layout="vertical">
							<Form.Item name="createdAt" label="Created">
								<Input />
							</Form.Item>
							<Form.Item name="updatedAt" label="Updated">
								<Input />
							</Form.Item>
							<Form.Item name="version" label="Version">
								<Input />
							</Form.Item>
						</Form>
					) : (
						<Descriptions column={2} bordered>
							<Descriptions.Item label="Name">{details.name}</Descriptions.Item>
							<Descriptions.Item label="Platform">{details.platform}</Descriptions.Item>
							<Descriptions.Item label="Created">{details.createdAt}</Descriptions.Item>
							<Descriptions.Item label="Updated">{details.updatedAt}</Descriptions.Item>
							<Descriptions.Item label="Version">{details.version}</Descriptions.Item>
							<Descriptions.Item label="Instances">{details.stats.instances}</Descriptions.Item>
							<Descriptions.Item label="Total Requests">{details.stats.totalRequests.toLocaleString()}</Descriptions.Item>
							<Descriptions.Item label="Errors">{details.stats.errors}</Descriptions.Item>
						</Descriptions>
					)}
				</Card>
			),
		},
		{
			id: "features" as const,
			title: "Features Configuration",
			content: (
				<Card>
					{/* row: platform badge (left) + export/import/edit (right) */}
					<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
						<PlatformBadge platform={details.platform} />
						<div style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "nowrap", whiteSpace: "nowrap" }}>
							<span style={{ display: "inline-flex" }}>
								<ExportImportControls
									data={featureConfig}
									onImport={(d) => {
										setFeatureConfig(d as FeaturesConfig);
									}}
									filenamePrefix={`${details?.name ?? "deployment"}-features`}
								/>
							</span>
							{editingFeatures ? (
								<Space size={8} wrap={false}>
									<Button onClick={cancelFeatures}>Cancel</Button>
									<Button type="primary" onClick={saveFeatures}>Save</Button>
								</Space>
							) : (
								<Button onClick={() => setEditingFeatures(true)}>Edit</Button>
							)}
						</div>
					</div>
					<FeatureAccordion
						mode={editingFeatures ? "edit" : "view"}
						initial={featureConfig}
						onChange={(next) => setFeatureConfig(next as FeaturesConfig)}
					/>
				</Card>
			),
		},
		{
			id: "deployment-config" as const,
			title: "Deployment Configuration",
			content: (
				<Card>
					{/* row: platform badge (left) + export/import/edit (right) */}
					<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
						<PlatformBadge platform={details.platform} />
						<div style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "nowrap", whiteSpace: "nowrap" }}>
							<span style={{ display: "inline-flex" }}>
								<ExportImportControls
									data={deploymentCfg}
									onImport={(d) => setDeploymentCfg(d as Record<string, string>)}
									filenamePrefix={`${details?.name ?? "deployment"}-deployment-config`}
								/>
							</span>
							{editingDeployment ? (
								<Space size={8} wrap={false}>
									<Button onClick={cancelDeployment}>Cancel</Button>
									<Button type="primary" onClick={saveDeployment}>Save</Button>
								</Space>
							) : (
								<Button onClick={() => setEditingDeployment(true)}>Edit</Button>
							)}
						</div>
					</div>
					{/* Top-level panels: Overview, Platform Configuration, Application Configuration */}
					<Collapse defaultActiveKey={["overview"]}>
						<Panel key="overview" header={<div className="uppercase font-extrabold text-sm">Overview</div>}>
							<div style={{ height: 600, borderRadius: 6, overflow: "hidden", background: "var(--ant-bg-container)" }}>
								{/* Overview graph without System Config overlay */}
								<DeploymentGraph />
							</div>
						</Panel>

						{/* NEW: Platform Configuration panel moved here */}
						<Panel key="platform-configuration" header={<div className="uppercase font-extrabold text-sm">Platform Configuration</div>}>
							{/* PlatformConfig only — remove duplicate Export/Import/Edit controls here */}
							<PlatformConfig
								platform={details.platform}
								initial={platformCfg}
								mode={editingPlatform ? "edit" : "view"}
								onChange={(cfg) => setPlatformCfg(cfg)}
								onSave={savePlatform}
								onCancel={cancelPlatform}
							/>
						</Panel>
						
						{/* renamed: Application Configuration (was "Configuration") */}
						<Panel key="application-configuration" header={<div className="uppercase font-extrabold text-sm">Application Configuration</div>} collapsible="header">
							<Collapse defaultActiveKey={["app-gateway"]} accordion={false}>
								{appHierarchy.map((grp) => (
									<Panel key={`app-${grp.key}`} header={<div className="font-bold">{grp.title}</div>} collapsible="header">
										<Collapse>
											{grp.children.map((mod) => (
												<Panel
													key={`app-${grp.key}-${mod.key}`}
													// CHANGED: custom header with docs "i" icon; header remains clickable
 													header={
 														<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
 															<span>{mod.label}</span>
 															<span
 																title="Open documentation"
 																role="button"
 																tabIndex={0}
 																onClick={(e) => { e.stopPropagation(); window.open(docUrl(mod.key), "_blank", "noopener"); }}
 																onMouseDown={(e) => e.stopPropagation()}
 																style={{
 																	display: "inline-flex",
 																	alignItems: "center",
 																	justifyContent: "center",
 																	width: 18,
 																	height: 18,
 																	borderRadius: 999,
 																	background: "#E2E8F0",
 																	color: "#334155",
 																	fontSize: 11,
 																	fontWeight: 700,
 																	border: "1px solid rgba(0,0,0,0.05)",
 																	cursor: "pointer",
 																}}
 															>
 																i
 															</span>
 														</div>
 													}
 												>
 													<ModuleConfig id={mod.key} name={mod.label} group={grp.key} />
 												</Panel>
 											))}
										</Collapse>
									</Panel>
								))}
							</Collapse>
						</Panel>
					</Collapse>
				</Card>
			),
		},
	];

	return (
		<div className="p-6 space-y-4">
			<header className="flex items-center justify-between">
				<h2 className="text-2xl font-semibold">{details.name}</h2>
				<div>
					<Button style={{ marginRight: 8 }} onClick={() => navigate("/deployment")}>Back</Button>
				</div>
			</header>

			<AntTabs defaultActiveKey="metadata">
				{tabs.map((t) => (
					<AntTabs.TabPane tab={t.title} key={t.id}>
						{t.content}
					</AntTabs.TabPane>
				))}
			</AntTabs>
		</div>
	);
}
