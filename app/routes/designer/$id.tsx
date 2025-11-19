import React, { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button, Card, Form, Input, Select, Collapse, Descriptions } from "antd";
import { ArrowLeftOutlined, SaveOutlined, PlayCircleOutlined } from "@ant-design/icons";
import PolicyFlowGraph from "../../components/designer/PolicyFlowGraph";

const { Panel } = Collapse;

export function meta() {
	return [{ title: "Policy Detail - 5G Policy Studio" }];
}

// Mock data for policies
const mockPoliciesData: Record<string, any> = {
	"1": {
		id: 1,
		name: "Basic QoS Policy",
		description: "Default quality of service policy for standard users",
		type: "QoS",
		status: "Active",
		lastModified: "2025-11-10",
		version: "1.2.0",
		rules: [
			{ id: "r1", name: "Check Subscription Tier", type: "condition" },
			{ id: "r2", name: "Set QoS Profile", type: "action" },
			{ id: "r3", name: "Apply Rate Limiting", type: "action" },
		],
		configuration: {
			priority: "Normal",
			maxBandwidth: "100Mbps",
			latency: "50ms",
			jitter: "10ms",
		}
	},
	"2": {
		id: 2,
		name: "Premium Bandwidth",
		description: "High bandwidth allocation for premium subscribers",
		type: "Bandwidth",
		status: "Active",
		lastModified: "2025-11-09",
		version: "2.1.0",
		rules: [
			{ id: "r1", name: "Verify Premium Status", type: "condition" },
			{ id: "r2", name: "Allocate High Bandwidth", type: "action" },
		],
		configuration: {
			priority: "High",
			maxBandwidth: "1Gbps",
			latency: "10ms",
			jitter: "2ms",
		}
	},
	"3": {
		id: 3,
		name: "IoT Device Policy",
		description: "Optimized policy for IoT devices with low latency",
		type: "QoS",
		status: "Draft",
		lastModified: "2025-11-08",
		version: "1.0.0",
		rules: [
			{ id: "r1", name: "Identify IoT Device", type: "condition" },
			{ id: "r2", name: "Apply Low Latency QoS", type: "action" },
		],
		configuration: {
			priority: "High",
			maxBandwidth: "10Mbps",
			latency: "5ms",
			jitter: "1ms",
		}
	},
};

export default function PolicyDetail() {
	const { id } = useParams();
	const navigate = useNavigate();
	const policy = id ? mockPoliciesData[id] : null;

	const [form] = Form.useForm();

	React.useEffect(() => {
		if (policy) {
			form.setFieldsValue({
				name: policy.name,
				description: policy.description,
				type: policy.type,
				status: policy.status,
				version: policy.version,
				...policy.configuration,
			});
		}
	}, [policy, form]);

	if (!policy) {
		return (
			<div className="p-6">
				<Card>
					<p className="text-gray-600 mb-4">Policy not found.</p>
					<Button onClick={() => navigate("/designer")}>Back to Designer</Button>
				</Card>
			</div>
		);
	}

	const handleSave = () => {
		form.validateFields().then((values) => {
			console.log("Save policy:", values);
			// TODO: API call
		});
	};

	const handleTest = () => {
		console.log("Test policy");
		// TODO: Test implementation
	};

	return (
		<div className="h-screen flex flex-col bg-gray-50">
			{/* Header */}
			<div className="bg-white border-b border-gray-200 px-6 py-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Button
							icon={<ArrowLeftOutlined />}
							onClick={() => navigate("/designer")}
							size="large"
						/>
						<div>
							<h1 className="text-xl font-bold text-gray-900">{policy.name}</h1>
							<div className="flex items-center gap-3 mt-1">
								<span className="text-sm text-gray-500">Type: {policy.type}</span>
								<span className="text-sm text-gray-400">•</span>
								<span
									className={`px-2 py-0.5 text-xs rounded-full ${
										policy.status === "Active"
											? "bg-green-100 text-green-800"
											: "bg-yellow-100 text-yellow-800"
									}`}
								>
									{policy.status}
								</span>
								<span className="text-sm text-gray-400">•</span>
								<span className="text-sm text-gray-500">v{policy.version}</span>
							</div>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<Button icon={<PlayCircleOutlined />} onClick={handleTest}>
							Test
						</Button>
						<Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
							Save
						</Button>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1 flex overflow-hidden">
				{/* Policy Flow Graph - Center */}
				<div className="flex-1 p-6">
					<Card className="h-full" bodyStyle={{ height: '100%', padding: 0 }}>
						<PolicyFlowGraph policyId={policy.id} />
					</Card>
				</div>

				{/* Properties Panel - Right */}
				<div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
					<div className="p-4">
						<h3 className="text-lg font-semibold mb-4">Properties</h3>
						
						<Form form={form} layout="vertical" className="space-y-4">
							<Collapse defaultActiveKey={['basic', 'qos']} ghost>
								<Panel header={<span className="font-semibold">Basic Information</span>} key="basic">
									<Form.Item name="name" label="Policy Name" rules={[{ required: true }]}>
										<Input />
									</Form.Item>
									
									<Form.Item name="description" label="Description">
										<Input.TextArea rows={3} />
									</Form.Item>
									
									<Form.Item name="type" label="Type">
										<Select>
											<Select.Option value="QoS">QoS</Select.Option>
											<Select.Option value="Bandwidth">Bandwidth</Select.Option>
											<Select.Option value="Priority">Priority</Select.Option>
										</Select>
									</Form.Item>
									
									<Form.Item name="status" label="Status">
										<Select>
											<Select.Option value="Active">Active</Select.Option>
											<Select.Option value="Draft">Draft</Select.Option>
											<Select.Option value="Inactive">Inactive</Select.Option>
										</Select>
									</Form.Item>
									
									<Form.Item name="version" label="Version">
										<Input />
									</Form.Item>
								</Panel>

								<Panel header={<span className="font-semibold">QoS Configuration</span>} key="qos">
									<Form.Item name="priority" label="Priority">
										<Select>
											<Select.Option value="Low">Low</Select.Option>
											<Select.Option value="Normal">Normal</Select.Option>
											<Select.Option value="High">High</Select.Option>
											<Select.Option value="Critical">Critical</Select.Option>
										</Select>
									</Form.Item>
									
									<Form.Item name="maxBandwidth" label="Max Bandwidth">
										<Input placeholder="e.g., 100Mbps" />
									</Form.Item>
									
									<Form.Item name="latency" label="Latency">
										<Input placeholder="e.g., 50ms" />
									</Form.Item>
									
									<Form.Item name="jitter" label="Jitter">
										<Input placeholder="e.g., 10ms" />
									</Form.Item>
								</Panel>

								<Panel header={<span className="font-semibold">Rules ({policy.rules.length})</span>} key="rules">
									<div className="space-y-2">
										{policy.rules.map((rule: any, index: number) => (
											<div
												key={rule.id}
												className="p-3 border border-gray-200 rounded-lg bg-gray-50"
											>
												<div className="font-medium text-sm text-gray-900">
													{index + 1}. {rule.name}
												</div>
												<div className="text-xs text-gray-500 mt-1">
													Type: {rule.type}
												</div>
											</div>
										))}
										<Button type="dashed" block size="small">
											+ Add Rule
										</Button>
									</div>
								</Panel>

								<Panel header={<span className="font-semibold">Metadata</span>} key="metadata">
									<div className="space-y-2 text-sm">
										<div>
											<span className="text-gray-500">Created:</span>
											<span className="ml-2 text-gray-900">{policy.lastModified}</span>
										</div>
										<div>
											<span className="text-gray-500">Last Modified:</span>
											<span className="ml-2 text-gray-900">{policy.lastModified}</span>
										</div>
										<div>
											<span className="text-gray-500">Author:</span>
											<span className="ml-2 text-gray-900">Admin</span>
										</div>
									</div>
								</Panel>
							</Collapse>
						</Form>
					</div>
				</div>
			</div>
		</div>
	);
}
