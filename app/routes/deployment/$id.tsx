import React, { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { Descriptions, Form, Input, Button, Card, Tabs as AntTabs, Collapse, Space } from "antd";
import { PlatformConfig } from "../../components/platforms/PlatformConfig";
import FeatureAccordion, { type FeaturesConfig } from "../../components/features/FeatureAccordion";
import ExportImportControls from "../../components/ExportImportControls";

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

	const tabs = [
		{
			id: "metadata" as const,
			title: "Metadata",
			content: (
				<Card>
					<div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
						{editingMeta ? (
							<Space>
								<Button onClick={cancelMeta}>Cancel</Button>
								<Button type="primary" onClick={saveMeta}>Save</Button>
							</Space>
						) : (
							<Button onClick={() => setEditingMeta(true)}>Edit</Button>
						)}
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
			id: "platform" as const,
			title: "Platform Configuration",
			content: (
				<Card>
					<div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
						{/* Export / Import + Edit controls for Platform (reusable) */}
						<ExportImportControls
							data={platformCfg}
							onImport={(d) => {
								// basic assignment; validate in real app
								setPlatformCfg(d as Record<string, string>);
							}}
							filenamePrefix={`${details?.name ?? "deployment"}-platform`}
							className="mr-4"
						/>

						{editingPlatform ? (
							<Space>
								<Button onClick={cancelPlatform}>Cancel</Button>
								<Button type="primary" onClick={() => metaForm.validateFields().then(() => {})}>Save</Button>
							</Space>
						) : (
							<Button onClick={() => setEditingPlatform(true)}>Edit</Button>
						)}
					</div>

					<PlatformConfig
						platform={details.platform}
						initial={platformCfg}
						mode={editingPlatform ? "edit" : "view"}
						onChange={(cfg) => setPlatformCfg(cfg)}
						onSave={savePlatform}
						onCancel={cancelPlatform}
					/>
				</Card>
			),
		},
		{
			id: "features" as const,
			title: "Features Configuration",
			content: (
				<Card>
					<div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
						{/* Export / Import + Edit controls for Features (reusable) */}
						<ExportImportControls
							data={featureConfig}
							onImport={(d) => {
								setFeatureConfig(d as FeaturesConfig);
							}}
							filenamePrefix={`${details?.name ?? "deployment"}-features`}
							className="mr-4"
						/>

						{editingFeatures ? (
							<Space>
								<Button onClick={cancelFeatures}>Cancel</Button>
								<Button type="primary" onClick={saveFeatures}>Save</Button>
							</Space>
						) : (
							<Button onClick={() => setEditingFeatures(true)}>Edit</Button>
						)}
					</div>

					<FeatureAccordion
						mode={editingFeatures ? "edit" : "view"}
						initial={featureConfig}
						onChange={(next) => setFeatureConfig(next as FeaturesConfig)}
					/>
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
