import React, { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button, Card, Form, Input, Select, Collapse, Descriptions, List, Dropdown, Modal, Tabs, Tree } from "antd";
import { ArrowLeftOutlined, SaveOutlined, PlayCircleOutlined, PlusOutlined, FileTextOutlined, SettingOutlined } from "@ant-design/icons";
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
	const [selectedFlowId, setSelectedFlowId] = useState<string>('sm-policy-association');
	const [currentFlowData, setCurrentFlowData] = useState<FlowData | null>(mockFlowsData['sm-policy-association']);
	
	// Selection states for properties panel
	const [selectedProcessNode, setSelectedProcessNode] = useState<any>(null);
	const [selectedNFNode, setSelectedNFNode] = useState<any>(null);
	const [selectedStep, setSelectedStep] = useState<any>(null);

	// Modal state
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [newFlowName, setNewFlowName] = useState('');
	const [selectedFolder, setSelectedFolder] = useState('');

	// Active tab state
	const [activeTab, setActiveTab] = useState('flow-design');

	// Procedures tree state
	const [selectedProcedureNode, setSelectedProcedureNode] = useState<string>('');

	// Chat state
	const [chatMessages, setChatMessages] = useState<Array<{id: string, text: string, sender: 'user' | 'ai', timestamp: Date}>>([
		{
			id: '1',
			text: 'Hello! I\'m your AI assistant. I can help you with flow design, policy configuration, and answer questions about your 5G network policies.',
			sender: 'ai',
			timestamp: new Date()
		}
	]);
	const [chatInput, setChatInput] = useState('');
	const [isTyping, setIsTyping] = useState(false);

	// Build tree data from current flow
	const buildProceduresTree = () => {
		if (!currentFlowData) return [];

		const treeData: any[] = [];

		currentFlowData.steps.forEach(step => {
			const stepNode = {
				title: `Step ${step.stepNumber}: ${step.name}`,
				key: `step-${step.id}`,
				children: [] as any[],
			};

			// Add processes for this step
			const stepProcesses = currentFlowData.processes.filter(process => process.stepId === step.id);
			stepProcesses.forEach(process => {
				const processNode = {
					title: process.label,
					key: `process-${process.id}`,
					children: [] as any[],
				};

				// Add related NF nodes for this process
				const relatedNodes = currentFlowData.nodes.filter(node => node.id === process.nodeId);
				relatedNodes.forEach(node => {
					processNode.children.push({
						title: `${node.nfType}: ${node.name}`,
						key: `node-${node.id}`,
						isLeaf: true,
					});
				});

				stepNode.children.push(processNode);
			});

			treeData.push(stepNode);
		});

		return treeData;
	};

	// Handle tree node selection
	const handleTreeSelect = (selectedKeys: React.Key[], info: any) => {
		setSelectedProcedureNode(selectedKeys[0] as string || '');
		// TODO: Add logic to highlight corresponding elements in flow graph
	};

	// Handle chat message send
	const handleSendMessage = () => {
		if (!chatInput.trim()) return;

		const userMessage = {
			id: Date.now().toString(),
			text: chatInput,
			sender: 'user' as const,
			timestamp: new Date()
		};

		setChatMessages(prev => [...prev, userMessage]);
		setChatInput('');
		setIsTyping(true);

		// Simulate AI response
		setTimeout(() => {
			const aiResponse = {
				id: (Date.now() + 1).toString(),
				text: generateAIResponse(chatInput),
				sender: 'ai' as const,
				timestamp: new Date()
			};
			setChatMessages(prev => [...prev, aiResponse]);
			setIsTyping(false);
		}, 1000 + Math.random() * 2000); // Random delay 1-3 seconds
	};

	// Generate mock AI responses based on user input
	const generateAIResponse = (userInput: string): string => {
		const input = userInput.toLowerCase();
		
		if (input.includes('flow') || input.includes('policy')) {
			return 'I can help you with flow design and policy configuration. What specific aspect would you like to know about?';
		}
		if (input.includes('node') || input.includes('nf')) {
			return 'The network has several NF nodes including AMF, SMF, UPF, and PCF. Each serves different functions in the 5G core network.';
		}
		if (input.includes('step') || input.includes('process')) {
			return 'Steps define the sequence of operations, while processes handle the actual API calls and data transformations within each step.';
		}
		if (input.includes('api') || input.includes('endpoint')) {
			return 'APIs in this system use REST/HTTP protocols. You can configure endpoints, methods (GET/POST/PUT/DELETE), and timeout settings.';
		}
		if (input.includes('help') || input.includes('how')) {
			return 'I can assist with:\n• Flow design and configuration\n• Policy management\n• Network function explanations\n• API configuration\n• Troubleshooting issues\n\nWhat would you like help with?';
		}
		
		return 'That\'s an interesting question! I\'m here to help with your 5G policy studio. Could you provide more details about what you\'re working on?';
	};

	// Folders state
	const [folders, setFolders] = useState({
		session: [
			{ id: 'sm-policy-association', name: '1.1. SM Policy Association' },
			{ id: 'qos-on-demand', name: '1.2. QoS on Demand' },
			{ id: 'vonr-call', name: '1.3. VoNR Call' }
		],
		access: [
			{ id: 'am-policy-association', name: '2.1. AM Policy Association' },
			{ id: 'am-policy-authorization', name: '2.2. AM Policy Authorization' }
		],
		ue: [
			{ id: 'ue-policy-association', name: '3.1. UE Policy Association' },
			{ id: 'ue-policy-delivery', name: '3.2. UE Policy Delivery' },
			{ id: 'af-guidance-ursp', name: '3.3. AF guidance on URSP' }
		]
	});

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
		setIsModalVisible(true);
	};

	// Create new folder
	const handleCreateFolder = () => {
		console.log('Create new folder');
		// TODO: Implement folder creation
	};

	const handleModalOk = () => {
		if (!newFlowName.trim() || !selectedFolder) return;

		const newFlowId = `flow-${Date.now()}`;
		const newFlow: FlowData = {
			metadata: {
				id: newFlowId,
				name: newFlowName,
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
			name: newFlowName,
			description: '',
			lastModified: new Date().toISOString().split('T')[0],
			version: '1.0.0',
		});

		// Add to selected folder
		const folderFlows = folders[selectedFolder as keyof typeof folders];
		const mainNumber = selectedFolder === 'session' ? 1 : selectedFolder === 'access' ? 2 : 3;
		const subNumber = folderFlows.length + 1;
		const newFlowItem = {
			id: newFlowId,
			name: `${mainNumber}.${subNumber}. ${newFlowName}`
		};
		setFolders(prev => ({
			...prev,
			[selectedFolder as keyof typeof folders]: [...prev[selectedFolder as keyof typeof folders], newFlowItem]
		}));

		handleFlowSelect(newFlowId);
		setIsModalVisible(false);
		setNewFlowName('');
		setSelectedFolder('');
	};

	const menuItems = [
		{
			key: 'new-flow',
			label: 'New flow',
			onClick: handleCreateFlow,
		},
		{
			key: 'new-folder',
			label: 'New folder',
			onClick: handleCreateFolder,
		},
	];

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

			{/* Tab Bar */}
			<div className="bg-white border-b border-gray-200">
				<Tabs
					activeKey={activeTab}
					onChange={setActiveTab}
					className="policy-tabs w-full"
					items={[
						{
							key: 'general',
							label: 'General',
						},
						{
							key: 'flow-design',
							label: 'Flow Design',
						},
						{
							key: 'deployment',
							label: 'Deployment',
						},
						{
							key: 'history',
							label: 'History',
						},
					]}
				/>
			</div>

			{/* Main Content */}
			<div className="flex-1 flex overflow-hidden">
				{activeTab === 'general' && (
					<div className="flex-1 p-6">
						<Card>
							<h3 className="text-lg font-semibold mb-4">General Information</h3>
							<Form layout="vertical">
								<Form.Item label="Policy Name">
									<Input value={policy.name} />
								</Form.Item>
								<Form.Item label="Description">
									<Input.TextArea value={policy.description} rows={3} />
								</Form.Item>
								<Form.Item label="Type">
									<Select value={policy.type}>
										<Select.Option value="QoS">QoS</Select.Option>
										<Select.Option value="Bandwidth">Bandwidth</Select.Option>
									</Select>
								</Form.Item>
								<Form.Item label="Status">
									<Select value={policy.status}>
										<Select.Option value="Active">Active</Select.Option>
										<Select.Option value="Draft">Draft</Select.Option>
										<Select.Option value="Inactive">Inactive</Select.Option>
									</Select>
								</Form.Item>
								<Button type="primary">Save Changes</Button>
							</Form>
						</Card>
					</div>
				)}

				{activeTab === 'flow-design' && (
					<>
						{/* Flow List Sidebar - Left */}
						<div className="w-80 bg-white border-r border-gray-200 flex flex-col">
							{/* Flow Collection - Top Half */}
							<div className="flex-1 flex flex-col min-h-0">
								{/* Header */}
								<div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
									<div className="flex items-center justify-between">
										<h3 className="text-sm font-medium text-gray-700">Flow Collection</h3>
										<Button
											type="text"
											size="small"
											icon={<PlusOutlined className="text-gray-600" />}
											onClick={handleCreateFlow}
											className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 border-0"
											title="New Flow"
										/>
									</div>
								</div>

								{/* Flow List */}
								<div className="flex-1 overflow-y-auto">
									<Collapse
										ghost
										defaultActiveKey={['session']}
										className="flow-collection-accordion"
									>
										{/* Session Management */}
										<Panel
											header={
												<span className="text-sm font-medium text-gray-700">Session Management</span>
											}
											key="session"
											className="custom-panel"
										>
											<div className="space-y-1">
												{folders.session.map(flow => (
													<div
														key={flow.id}
														className={`text-sm px-3 py-2 hover:bg-gray-50 cursor-pointer rounded-md transition-colors ml-4 ${
															selectedFlowId === flow.id ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-500' : 'text-gray-600'
														}`}
														onClick={() => handleFlowSelect(flow.id)}
													>
														{flow.name.replace(/^\d+\.\d+\.\s*/, '')}
													</div>
												))}
											</div>
										</Panel>

										{/* Access & Mobility Policy */}
										<Panel
											header={
												<span className="text-sm font-medium text-gray-700">Access & Mobility</span>
											}
											key="access"
											className="custom-panel"
										>
											<div className="space-y-1">
												{folders.access.map(flow => (
													<div
														key={flow.id}
														className={`text-sm px-3 py-2 hover:bg-gray-50 cursor-pointer rounded-md transition-colors ml-4 ${
															selectedFlowId === flow.id ? 'bg-green-50 text-green-700 border-l-2 border-green-500' : 'text-gray-600'
														}`}
														onClick={() => handleFlowSelect(flow.id)}
													>
														{flow.name.replace(/^\d+\.\d+\.\s*/, '')}
													</div>
												))}
											</div>
										</Panel>

										{/* UE Policy */}
										<Panel
											header={
												<span className="text-sm font-medium text-gray-700">UE Policy</span>
											}
											key="ue"
											className="custom-panel"
										>
											<div className="space-y-1">
												{folders.ue.map(flow => (
													<div
														key={flow.id}
														className={`text-sm px-3 py-2 hover:bg-gray-50 cursor-pointer rounded-md transition-colors ml-4 ${
															selectedFlowId === flow.id ? 'bg-purple-50 text-purple-700 border-l-2 border-purple-500' : 'text-gray-600'
														}`}
														onClick={() => handleFlowSelect(flow.id)}
													>
														{flow.name.replace(/^\d+\.\d+\.\s*/, '')}
													</div>
												))}
											</div>
										</Panel>
									</Collapse>
								</div>
							</div>

							{/* Procedures - Bottom Half */}
							<div className="flex-1 flex flex-col min-h-0 border-t border-gray-200">
								{/* Header */}
								<div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
									<h3 className="text-sm font-medium text-gray-700">Procedures</h3>
								</div>

								{/* Procedures Tree */}
								<div className="flex-1 overflow-y-auto p-4">
									{currentFlowData ? (
										<Tree
											treeData={buildProceduresTree()}
											selectedKeys={[selectedProcedureNode]}
											onSelect={handleTreeSelect}
											defaultExpandAll={false}
											className="procedures-tree"
										/>
									) : (
										<div className="text-center text-gray-400 py-8">
											<p className="text-sm">No flow selected</p>
										</div>
									)}
								</div>
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
						<div className="w-96 bg-white border-l border-gray-200 flex flex-col">
							{/* Properties - Top Half */}
							<div className="flex-1 flex flex-col min-h-0">
								<div className="p-4 border-b border-gray-200">
									<h3 className="text-lg font-semibold mb-4">Properties</h3>
								</div>
								<div className="flex-1 overflow-y-auto p-4">
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
											<div className="space-y-3 text-sm">
												<div>
													<span className="text-gray-500">Flow Name:</span>
													<span className="ml-2 text-gray-900">{currentFlowData?.metadata.name || 'No flow selected'}</span>
												</div>
												<div>
													<span className="text-gray-500">Description:</span>
													<span className="ml-2 text-gray-900">{currentFlowData?.metadata.description || '-'}</span>
												</div>
												<div>
													<span className="text-gray-500">Version:</span>
													<span className="ml-2 text-gray-900">{currentFlowData?.metadata.version || '-'}</span>
												</div>
												<div>
													<span className="text-gray-500">Created:</span>
													<span className="ml-2 text-gray-900">{currentFlowData?.metadata.createdAt || '-'}</span>
												</div>
												<div>
													<span className="text-gray-500">Last Modified:</span>
													<span className="ml-2 text-gray-900">{currentFlowData?.metadata.lastModified || '-'}</span>
												</div>
												<div>
													<span className="text-gray-500">Author:</span>
													<span className="ml-2 text-gray-900">{currentFlowData?.metadata.author || '-'}</span>
												</div>
												<div className="pt-4 border-t border-gray-200">
													<div className="text-gray-500 mb-2">Statistics:</div>
													<div className="space-y-1 text-xs">
														<div>Nodes: {currentFlowData?.nodes.length || 0}</div>
														<div>Steps: {currentFlowData?.steps.length || 0}</div>
														<div>Processes: {currentFlowData?.processes.length || 0}</div>
													</div>
												</div>
											</div>
										</>
									)}
								</div>
							</div>

							{/* AI Chat - Bottom Half */}
							<div className="flex-1 flex flex-col min-h-0 border-t border-gray-200">
								<div className="p-4 border-b border-gray-200">
									<h3 className="text-lg font-semibold">AI Assistant</h3>
								</div>
								<div className="flex-1 flex flex-col min-h-0">
									{/* Chat Messages */}
									<div className="flex-1 overflow-y-auto p-4 space-y-3 chat-messages">
										{chatMessages.map(message => (
											<div
												key={message.id}
												className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
											>
												<div
													className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${
														message.sender === 'user'
															? 'chat-message-user text-white'
															: 'chat-message-ai text-gray-800'
													}`}
												>
													<p className="text-sm whitespace-pre-line">{message.text}</p>
													<p className={`text-xs mt-1 ${
														message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
													}`}>
														{message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
													</p>
												</div>
											</div>
										))}
										{isTyping && (
											<div className="flex justify-start">
												<div className="chat-message-ai px-4 py-2 rounded-lg shadow-sm">
													<div className="chat-typing-indicator">
														<div className="chat-typing-dot"></div>
														<div className="chat-typing-dot"></div>
														<div className="chat-typing-dot"></div>
														<span className="text-xs text-gray-500 ml-2">AI is typing...</span>
													</div>
												</div>
											</div>
										)}
									</div>

									{/* Chat Input */}
									<div className="p-4 border-t border-gray-200">
										<div className="flex space-x-2">
											<Input
												value={chatInput}
												onChange={e => setChatInput(e.target.value)}
												onPressEnter={handleSendMessage}
												placeholder="Ask me anything about your flow..."
												className="flex-1"
											/>
											<Button
												type="primary"
												onClick={handleSendMessage}
												disabled={!chatInput.trim() || isTyping}
												icon={<span>💬</span>}
											>
												Send
											</Button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</>
				)}

				{activeTab === 'deployment' && (
					<div className="flex-1 p-6">
						<Card>
							<h3 className="text-lg font-semibold mb-4">Deployment Configuration</h3>
							<div className="space-y-4">
								<div>
									<h4 className="font-medium mb-2">Deployment Status</h4>
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 bg-green-500 rounded-full"></div>
										<span className="text-sm text-gray-600">Active</span>
									</div>
								</div>
								<div>
									<h4 className="font-medium mb-2">Target Environments</h4>
									<div className="space-y-2">
										<div className="flex items-center gap-2">
											<input type="checkbox" defaultChecked />
											<span className="text-sm">Development</span>
										</div>
										<div className="flex items-center gap-2">
											<input type="checkbox" defaultChecked />
											<span className="text-sm">Staging</span>
										</div>
										<div className="flex items-center gap-2">
											<input type="checkbox" />
											<span className="text-sm">Production</span>
										</div>
									</div>
								</div>
								<Button type="primary">Deploy Changes</Button>
							</div>
						</Card>
					</div>
				)}

				{activeTab === 'history' && (
					<div className="flex-1 p-6">
						<Card>
							<h3 className="text-lg font-semibold mb-4">Version History</h3>
							<div className="space-y-4">
								<div className="border-l-2 border-blue-500 pl-4">
									<div className="flex items-center justify-between">
										<div>
											<h4 className="font-medium">Version 1.2.0</h4>
											<p className="text-sm text-gray-600">Updated QoS parameters</p>
										</div>
										<span className="text-xs text-gray-500">2025-11-10</span>
									</div>
								</div>
								<div className="border-l-2 border-gray-300 pl-4">
									<div className="flex items-center justify-between">
										<div>
											<h4 className="font-medium">Version 1.1.0</h4>
											<p className="text-sm text-gray-600">Added bandwidth controls</p>
										</div>
										<span className="text-xs text-gray-500">2025-11-05</span>
									</div>
								</div>
								<div className="border-l-2 border-gray-300 pl-4">
									<div className="flex items-center justify-between">
										<div>
											<h4 className="font-medium">Version 1.0.0</h4>
											<p className="text-sm text-gray-600">Initial release</p>
										</div>
										<span className="text-xs text-gray-500">2025-10-28</span>
									</div>
								</div>
							</div>
						</Card>
					</div>
				)}
			</div>
			<Modal
				title="Create New Flow"
				open={isModalVisible}
				onOk={handleModalOk}
				onCancel={() => setIsModalVisible(false)}
			>
				<Form layout="vertical">
					<Form.Item label="Flow Name" required>
						<Input 
							value={newFlowName} 
							onChange={e => setNewFlowName(e.target.value)} 
							placeholder="Enter flow name"
						/>
					</Form.Item>
					<Form.Item label="Folder" required>
						<Select 
							value={selectedFolder} 
							onChange={setSelectedFolder}
							placeholder="Select a folder"
						>
							<Select.Option value="session">Session Management</Select.Option>
							<Select.Option value="access">Access & Mobility Policy</Select.Option>
							<Select.Option value="ue">UE Policy</Select.Option>
						</Select>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
}