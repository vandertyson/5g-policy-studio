import React, { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Descriptions, Form, Input, Button, Card, Tabs as AntTabs, Collapse, Space } from "antd";
import { PlatformConfig } from "../../components/platforms/PlatformConfig";

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
	const [featureConfig, setFeatureConfig] = useState({
		pcfRadio: { enabled: true, paramA: "default" },
		pcfCore: { enabled: false, paramX: "val" },
	});

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
						{editingPlatform ? (
							<Space>
								<Button onClick={cancelPlatform}>Cancel</Button>
								<Button type="primary" onClick={() => metaForm.validateFields().then(() => {})}> {/* placeholder to keep layout */}Save</Button>
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
						{editingFeatures ? (
							<Space>
								<Button onClick={cancelFeatures}>Cancel</Button>
								<Button type="primary" onClick={saveFeatures}>Save</Button>
							</Space>
						) : (
							<Button onClick={() => setEditingFeatures(true)}>Edit</Button>
						)}
					</div>

					{editingFeatures ? (
						<Collapse accordion>
							<Panel header="PCF Radio" key="1">
								<Form layout="vertical">
									<Form.Item label="Enable PCF Radio">
										<Input value={featureConfig.pcfRadio.enabled ? "on" : "off"} onChange={(e) => setFeatureConfig((s) => ({ ...s, pcfRadio: { ...s.pcfRadio, enabled: e.target.value === "on" } }))} />
									</Form.Item>
									<Form.Item label="Param A">
										<Input value={featureConfig.pcfRadio.paramA} onChange={(e) => setFeatureConfig((s) => ({ ...s, pcfRadio: { ...s.pcfRadio, paramA: e.target.value } }))} />
									</Form.Item>
								</Form>
							</Panel>

							<Panel header="PCF Core" key="2">
								<Form layout="vertical">
									<Form.Item label="Enable PCF Core">
										<Input value={featureConfig.pcfCore.enabled ? "on" : "off"} onChange={(e) => setFeatureConfig((s) => ({ ...s, pcfCore: { ...s.pcfCore, enabled: e.target.value === "on" } }))} />
									</Form.Item>
									<Form.Item label="Param X">
										<Input value={featureConfig.pcfCore.paramX} onChange={(e) => setFeatureConfig((s) => ({ ...s, pcfCore: { ...s.pcfCore, paramX: e.target.value } }))} />
									</Form.Item>
								</Form>
							</Panel>
						</Collapse>
					) : (
						<Collapse accordion>
							<Panel header="PCF Radio" key="1">
								<div>Enabled: {featureConfig.pcfRadio.enabled ? "Yes" : "No"}</div>
								<div>Param A: {featureConfig.pcfRadio.paramA}</div>
							</Panel>
							<Panel header="PCF Core" key="2">
								<div>Enabled: {featureConfig.pcfCore.enabled ? "Yes" : "No"}</div>
								<div>Param X: {featureConfig.pcfCore.paramX}</div>
							</Panel>
						</Collapse>
					)}
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
