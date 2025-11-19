import React, { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button, Card, Form, Input, Select, Collapse, Descriptions, List } from "antd";
import { ArrowLeftOutlined, SaveOutlined, PlayCircleOutlined, PlusOutlined, FileTextOutlined } from "@ant-design/icons";
import PolicyFlowGraph from "../../components/designer/PolicyFlowGraph";
import { mockFlows, mockFlowsData } from "../../data/mockFlows";
import type { FlowData } from "../../types/flow.types";

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
	
	// Flow management state
	const [selectedFlowId, setSelectedFlowId] = useState<string>('flow-1');
	const [currentFlowData, setCurrentFlowData] = useState<FlowData | null>(mockFlowsData['flow-1']);
	
	// Selection states for properties panel
	const [selectedProcessNode, setSelectedProcessNode] = useState<any>(null);
	const [selectedNFNode, setSelectedNFNode] = useState<any>(null);
	const [selectedStep, setSelectedStep] = useState<any>(null);

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
	
	// Load flow data when selected
	const handleFlowSelect = (flowId: string) => {
		setSelectedFlowId(flowId);
		setCurrentFlowData(mockFlowsData[flowId] || null);
		// Clear selections
		setSelectedProcessNode(null);
		setSelectedNFNode(null);
		setSelectedStep(null);
	};
	
	// Create new flow
	const handleCreateFlow = () => {
		const newFlowId = `flow-${Date.now()}`;
		const newFlow: FlowData = {
			metadata: {
				id: newFlowId,
				name: 'New Flow',
				description: '',
				version: '1.0.0',
				createdAt: new Date().toISOString().split('T')[0],
				lastModified: new Date().toISOString().split('T')[0],
				author: 'Admin',
			},
			nodes: [],
			steps: [],
			processes: [],
		};
		mockFlowsData[newFlowId] = newFlow;
		mockFlows.push({
			id: newFlowId,
			name: 'New Flow',
			description: '',
			lastModified: new Date().toISOString().split('T')[0],
			version: '1.0.0',
		});
		handleFlowSelect(newFlowId);
	};

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
				{/* Flow List Sidebar - Left */}
				<div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
					<div className="p-4">
						<div className="flex items-center justify-between mb-4">
							<h3 className="font-semibold text-gray-900">Flows</h3>
							<Button
								type="primary"
								size="small"
								icon={<PlusOutlined />}
								onClick={handleCreateFlow}
							>
								New
							</Button>
						</div>
						
						<List
							size="small"
							dataSource={mockFlows}
							renderItem={(flow) => (
								<List.Item
									className={`cursor-pointer transition-all rounded-lg mb-2 ${
										selectedFlowId === flow.id
											? 'bg-blue-50 border-2 border-blue-400'
											: 'hover:bg-gray-50 border-2 border-transparent'
									}`}
									onClick={() => handleFlowSelect(flow.id)}
									style={{ padding: '12px' }}
								>
									<div className="w-full">
										<div className="flex items-start gap-2">
											<FileTextOutlined className={selectedFlowId === flow.id ? 'text-blue-600' : 'text-gray-400'} />
											<div className="flex-1 min-w-0">
												<div className={`font-medium text-sm truncate ${
													selectedFlowId === flow.id ? 'text-blue-900' : 'text-gray-900'
												}`}>
													{flow.name}
												</div>
												<div className="text-xs text-gray-500 mt-1 line-clamp-2">
													{flow.description}
												</div>
												<div className="text-xs text-gray-400 mt-1">
													v{flow.version} • {flow.lastModified}
												</div>
											</div>
										</div>
									</div>
								</List.Item>
							)}
						/>
					</div>
				</div>

				{/* Policy Flow Graph - Center */}
				<div className="flex-1 p-6">
					<Card className="h-full" bodyStyle={{ height: '100%', padding: 0 }}>
						{currentFlowData ? (
							<PolicyFlowGraph 
								policyId={policy.id}
								flowData={currentFlowData}
								onProcessNodeSelect={setSelectedProcessNode}
								onNFNodeSelect={setSelectedNFNode}
								onStepSelect={setSelectedStep}
							/>
						) : (
							<div className="flex items-center justify-center h-full text-gray-400">
								<div className="text-center">
									<FileTextOutlined style={{ fontSize: 48 }} />
									<p className="mt-4">No flow selected</p>
								</div>
							</div>
						)}
					</Card>
				</div>

				{/* Properties Panel - Right */}
				<div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
					<div className="p-4">
						{selectedProcessNode ? (
							// Process Node Properties
							<>
								<div className="flex items-center justify-between mb-4">
									<div>
										<h3 className="text-lg font-semibold text-indigo-600">Process Properties</h3>
										<p className="text-xs text-gray-500 mt-1">{selectedProcessNode.data.label}</p>
									</div>
									<Button
										size="small"
										type="text"
										onClick={() => setSelectedProcessNode(null)}
									>
										✕
									</Button>
								</div>

								<Form layout="vertical" className="space-y-4">
									{/* Node Type */}
									<Form.Item label="Type">
										<Input
											value={
												selectedProcessNode.id.includes('sender') ? 'Sender' :
												selectedProcessNode.id.includes('receiver') ? 'Receiver' :
												'Process'
											}
											disabled
										/>
									</Form.Item>

									{/* For API Sender/Receiver */}
									{(selectedProcessNode.id.includes('sender') || selectedProcessNode.id.includes('receiver')) && (
										<>
											<Form.Item label="API Type">
												<Select defaultValue="HTTP">
													<Select.Option value="HTTP">HTTP/REST</Select.Option>
													<Select.Option value="gRPC">gRPC</Select.Option>
													<Select.Option value="SOAP">SOAP</Select.Option>
													<Select.Option value="GraphQL">GraphQL</Select.Option>
												</Select>
											</Form.Item>

											<Form.Item label="Method">
												<Select defaultValue="GET">
													<Select.Option value="GET">GET</Select.Option>
													<Select.Option value="POST">POST</Select.Option>
													<Select.Option value="PUT">PUT</Select.Option>
													<Select.Option value="DELETE">DELETE</Select.Option>
													<Select.Option value="PATCH">PATCH</Select.Option>
												</Select>
											</Form.Item>

											<Form.Item label="Endpoint">
												<Input placeholder="/api/v1/resource" />
											</Form.Item>

											<Form.Item label="Timeout (ms)">
												<Input type="number" defaultValue="5000" />
											</Form.Item>

											<Form.Item label="Retry Count">
												<Input type="number" defaultValue="3" />
											</Form.Item>
										</>
									)}

									{/* For Regular Process */}
									{!selectedProcessNode.id.includes('sender') && !selectedProcessNode.id.includes('receiver') && (
										<>
											<Form.Item label="Process Type">
												<Select defaultValue="VALIDATION">
													<Select.Option value="VALIDATION">Validation</Select.Option>
													<Select.Option value="TRANSFORMATION">Transformation</Select.Option>
													<Select.Option value="ENRICHMENT">Enrichment</Select.Option>
													<Select.Option value="FILTERING">Filtering</Select.Option>
													<Select.Option value="ROUTING">Routing</Select.Option>
												</Select>
											</Form.Item>

											<Form.Item label="Description">
												<Input.TextArea rows={3} placeholder="Enter process description" />
											</Form.Item>
										</>
									)}

									{/* Common Properties */}
									<Form.Item label="Priority">
										<Select defaultValue="NORMAL">
											<Select.Option value="LOW">Low</Select.Option>
											<Select.Option value="NORMAL">Normal</Select.Option>
											<Select.Option value="HIGH">High</Select.Option>
											<Select.Option value="CRITICAL">Critical</Select.Option>
										</Select>
									</Form.Item>

									<Button type="primary" block>
										Save Properties
									</Button>
								</Form>
							</>
						) : selectedNFNode ? (
							// NF Node Properties
							<>
								<div className="flex items-center justify-between mb-4">
									<div>
										<h3 className="text-lg font-semibold text-blue-600">NF Node Properties</h3>
										<p className="text-xs text-gray-500 mt-1">{selectedNFNode.data.label}</p>
									</div>
									<Button
										size="small"
										type="text"
										onClick={() => setSelectedNFNode(null)}
									>
										✕
									</Button>
								</div>

								<Form layout="vertical" className="space-y-4">
									<Form.Item label="Node Name">
										<Input defaultValue={selectedNFNode.data.label} />
									</Form.Item>

									<Form.Item label="NF Type">
										<Select defaultValue="AMF">
											<Select.Option value="AMF">AMF (Access and Mobility Management Function)</Select.Option>
											<Select.Option value="SMF">SMF (Session Management Function)</Select.Option>
											<Select.Option value="UPF">UPF (User Plane Function)</Select.Option>
											<Select.Option value="PCF">PCF (Policy Control Function)</Select.Option>
											<Select.Option value="UDM">UDM (Unified Data Management)</Select.Option>
											<Select.Option value="AUSF">AUSF (Authentication Server Function)</Select.Option>
											<Select.Option value="NEF">NEF (Network Exposure Function)</Select.Option>
											<Select.Option value="NRF">NRF (Network Repository Function)</Select.Option>
										</Select>
									</Form.Item>

									<Form.Item label="Instance ID">
										<Input placeholder="instance-001" defaultValue="instance-001" />
									</Form.Item>

									<Form.Item label="IP Address">
										<Input placeholder="192.168.1.100" />
									</Form.Item>

									<Form.Item label="Port">
										<Input type="number" placeholder="8080" defaultValue="8080" />
									</Form.Item>

									<Form.Item label="Protocol">
										<Select defaultValue="HTTP2">
											<Select.Option value="HTTP2">HTTP/2</Select.Option>
											<Select.Option value="HTTP1">HTTP/1.1</Select.Option>
											<Select.Option value="gRPC">gRPC</Select.Option>
										</Select>
									</Form.Item>

									<Form.Item label="Status">
										<Select defaultValue="ACTIVE">
											<Select.Option value="ACTIVE">Active</Select.Option>
											<Select.Option value="INACTIVE">Inactive</Select.Option>
											<Select.Option value="MAINTENANCE">Maintenance</Select.Option>
										</Select>
									</Form.Item>

									<Button type="primary" block>
										Save Properties
									</Button>
								</Form>
							</>
						) : selectedStep ? (
							// Step Properties
							<>
								<div className="flex items-center justify-between mb-4">
									<div>
										<h3 className="text-lg font-semibold text-purple-600">Step Properties</h3>
										<p className="text-xs text-gray-500 mt-1">{selectedStep.data.label}</p>
									</div>
									<Button
										size="small"
										type="text"
										onClick={() => setSelectedStep(null)}
									>
										✕
									</Button>
								</div>

								<Form layout="vertical" className="space-y-4">
									<Form.Item label="Step Number">
										<Input value={selectedStep.data.stepNumber} disabled />
									</Form.Item>

									<Form.Item label="Step Name">
										<Input defaultValue={selectedStep.data.label} />
									</Form.Item>

									<Form.Item label="Step Type">
										<Select defaultValue="SEQUENTIAL">
											<Select.Option value="SEQUENTIAL">Sequential</Select.Option>
											<Select.Option value="PARALLEL">Parallel</Select.Option>
											<Select.Option value="CONDITIONAL">Conditional</Select.Option>
										</Select>
									</Form.Item>

									<Form.Item label="Timeout (seconds)">
										<Input type="number" placeholder="30" defaultValue="30" />
									</Form.Item>

									<Form.Item label="Error Handling">
										<Select defaultValue="CONTINUE">
											<Select.Option value="CONTINUE">Continue on Error</Select.Option>
											<Select.Option value="STOP">Stop on Error</Select.Option>
											<Select.Option value="RETRY">Retry on Error</Select.Option>
										</Select>
									</Form.Item>

									<Form.Item label="Description">
										<Input.TextArea rows={3} placeholder="Enter step description" />
									</Form.Item>

									<Button type="primary" block>
										Save Properties
									</Button>
								</Form>
							</>
						) : (
							// Flow Properties (Default)
							<>
								<h3 className="text-lg font-semibold mb-4">Flow Properties</h3>
						
								{currentFlowData && (
									<div className="space-y-3 text-sm">
										<div>
											<span className="text-gray-500">Flow Name:</span>
											<span className="ml-2 text-gray-900">{currentFlowData.metadata.name}</span>
										</div>
										<div>
											<span className="text-gray-500">Description:</span>
											<span className="ml-2 text-gray-900">{currentFlowData.metadata.description}</span>
										</div>
										<div>
											<span className="text-gray-500">Version:</span>
											<span className="ml-2 text-gray-900">{currentFlowData.metadata.version}</span>
										</div>
										<div>
											<span className="text-gray-500">Created:</span>
											<span className="ml-2 text-gray-900">{currentFlowData.metadata.createdAt}</span>
										</div>
										<div>
											<span className="text-gray-500">Last Modified:</span>
											<span className="ml-2 text-gray-900">{currentFlowData.metadata.lastModified}</span>
										</div>
										<div>
											<span className="text-gray-500">Author:</span>
											<span className="ml-2 text-gray-900">{currentFlowData.metadata.author}</span>
										</div>
										<div className="pt-4 border-t border-gray-200">
											<div className="text-gray-500 mb-2">Statistics:</div>
											<div className="space-y-1 text-xs">
												<div>Nodes: {currentFlowData.nodes.length}</div>
												<div>Steps: {currentFlowData.steps.length}</div>
												<div>Processes: {currentFlowData.processes.length}</div>
											</div>
										</div>
									</div>
								)}
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
