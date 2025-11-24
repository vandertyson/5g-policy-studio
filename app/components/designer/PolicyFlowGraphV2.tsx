import React, { useCallback, useState, useRef, useEffect } from 'react';
import type { DragEvent } from 'react';
import ReactFlow, {
	Background,
	BackgroundVariant,
	Controls,
	MiniMap,
	addEdge,
	useNodesState,
	useEdgesState,
	MarkerType,
	Handle,
	Position,
	type Connection,
	type Edge,
	type Node,
	type NodeProps,
	type XYPosition,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
	CloseOutlined,
	AppstoreOutlined,
	NodeIndexOutlined,
	BranchesOutlined,
	ApiOutlined,
	PlayCircleOutlined,
	PauseCircleOutlined,
	StopOutlined,
	SettingOutlined,
	MessageOutlined,
	ThunderboltOutlined,
	ExperimentOutlined,
	ExportOutlined,
	ImportOutlined,
    SearchOutlined
} from '@ant-design/icons';
import { Card, Input, Select, Button, Modal, Tabs, Form, Switch, InputNumber, Space, Tag, Alert, Progress } from 'antd';
import { JsonEditor } from 'json-edit-react';
import type { FlowData, NFNodeProperties, PolicyRule, PolicyCondition, PolicyAction, MessageConfiguration, TestFlowResult, MessageFlowData } from '~/types/flow.types';

interface PolicyFlowGraphV2Props {
	policyId: number;
	flowData?: FlowData;
	onProcessNodeSelect?: (node: Node | null) => void;
	onNFNodeSelect?: (node: Node | null) => void;
	onStepSelect?: (node: Node | null) => void;
}

const STEP_HEIGHT = 80;
const STEP_MIN_HEIGHT = 90;
const PROCESS_HEIGHT = 50;
const PROCESS_VERTICAL_GAP = 10;
const NODE_HEIGHT = 60;
const GRID_SIZE = 20;
const NODE_WIDTH = 120;
const NODE_SPACING = 200;
const STEP_LABEL_WIDTH = 150;

// Enhanced Network Node Component with PCF/Message config
const EnhancedNetworkNode = ({ data, selected }: NodeProps) => {
	const isPCF = data.nfType === 'PCF';
	const [showConfig, setShowConfig] = useState(false);

	return (
		<div
			className={`relative transition-all duration-200 ${
				selected ? 'ring-2 ring-blue-500 ring-offset-2 scale-105' : ''
			}`}
			style={{
				background: data.gradient || '#3B82F6',
				border: '2px solid #2563EB',
				color: 'white',
				padding: '12px 24px',
				borderRadius: 8,
				fontSize: 13,
				fontWeight: 600,
				textAlign: 'center',
				minWidth: 100,
				boxShadow: selected ? '0 2px 8px rgba(59, 130, 246, 0.2)' : 'none',
			}}
		>
			{selected && (
				<button
					className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
					onClick={(e) => {
						e.stopPropagation();
						data.onDelete?.();
					}}
				>
					<CloseOutlined style={{ fontSize: 10 }} />
				</button>
			)}

			{/* Config button for PCF and other nodes */}
			<button
				className="absolute -top-2 -left-2 w-5 h-5 bg-purple-500 hover:bg-purple-600 text-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
				onClick={(e) => {
					e.stopPropagation();
					setShowConfig(true);
				}}
				title={isPCF ? "Configure PCF Policy Rules" : "Configure Message Content"}
			>
				<SettingOutlined style={{ fontSize: 10 }} />
			</button>

			<div>{data.label}</div>
			<div style={{ fontSize: 10, opacity: 0.8, marginTop: 4 }}>
				{data.nfType}
			</div>

			{/* Configuration Modal */}
			<Modal
				title={`${isPCF ? 'PCF Policy Configuration' : 'Message Configuration'} - ${data.label}`}
				open={showConfig}
				onCancel={() => setShowConfig(false)}
				width={isPCF ? 800 : 600}
				footer={[
					<Button key="cancel" onClick={() => setShowConfig(false)}>
						Cancel
					</Button>,
					<Button key="save" type="primary" onClick={() => setShowConfig(false)}>
						Save Configuration
					</Button>
				]}
			>
				{isPCF ? <PCFConfigPanel nodeData={data} /> : <MessageConfigPanel nodeData={data} />}
			</Modal>
		</div>
	);
};

// PCF Configuration Panel
const PCFConfigPanel = ({ nodeData }: { nodeData: any }) => {
	const [rules, setRules] = useState<PolicyRule[]>(nodeData.pcfConfig?.policyRules || []);
	const [activeTab, setActiveTab] = useState('rules');

	const addRule = () => {
		const newRule: PolicyRule = {
			id: `rule-${Date.now()}`,
			name: `Policy Rule ${rules.length + 1}`,
			conditions: [],
			actions: [],
			priority: rules.length + 1,
			enabled: true
		};
		setRules([...rules, newRule]);
	};

	return (
		<Tabs activeKey={activeTab} onChange={setActiveTab}>
			<Tabs.TabPane tab="Policy Rules" key="rules">
				<div className="space-y-4">
					<div className="flex justify-between items-center">
						<h3 className="text-lg font-semibold">Policy Rules</h3>
						<Button type="primary" onClick={addRule} icon={<ThunderboltOutlined />}>
							Add Rule
						</Button>
					</div>

					{rules.map((rule, index) => (
						<Card key={rule.id} size="small" className="border-l-4 border-l-blue-500">
							<div className="flex items-center justify-between mb-2">
								<div className="flex items-center gap-2">
									<Switch checked={rule.enabled} size="small" />
									<span className="font-medium">{rule.name}</span>
									<Tag color="blue">Priority: {rule.priority}</Tag>
								</div>
								<Button size="small" danger icon={<CloseOutlined />}>
									Remove
								</Button>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<h4 className="font-medium mb-2">Conditions</h4>
									{rule.conditions.length === 0 ? (
										<div className="text-gray-500 text-sm">No conditions</div>
									) : (
										rule.conditions.map((condition, idx) => (
											<Tag key={idx} className="mb-1">
												{condition.type} {condition.operator} {JSON.stringify(condition.value)}
											</Tag>
										))
									)}
									<Button size="small" className="mt-2">Add Condition</Button>
								</div>

								<div>
									<h4 className="font-medium mb-2">Actions</h4>
									{rule.actions.length === 0 ? (
										<div className="text-gray-500 text-sm">No actions</div>
									) : (
										rule.actions.map((action, idx) => (
											<Tag key={idx} color="green" className="mb-1">
												{action.type}
											</Tag>
										))
									)}
									<Button size="small" className="mt-2">Add Action</Button>
								</div>
							</div>
						</Card>
					))}
				</div>
			</Tabs.TabPane>

			<Tabs.TabPane tab="QoS Settings" key="qos">
				<div className="space-y-4">
					<h3 className="text-lg font-semibold">QoS Configuration</h3>
					<div className="grid grid-cols-2 gap-4">
						<Form.Item label="Max Bitrate (Mbps)">
							<InputNumber min={0} placeholder="100" />
						</Form.Item>
						<Form.Item label="Guaranteed Bitrate (Mbps)">
							<InputNumber min={0} placeholder="50" />
						</Form.Item>
						<Form.Item label="Priority Level">
							<Select placeholder="Select priority">
								<Select.Option value="1">1 (Highest)</Select.Option>
								<Select.Option value="2">2</Select.Option>
								<Select.Option value="3">3</Select.Option>
								<Select.Option value="4">4</Select.Option>
								<Select.Option value="5">5 (Lowest)</Select.Option>
							</Select>
						</Form.Item>
						<Form.Item label="QCI">
							<InputNumber min={1} max={9} placeholder="5" />
						</Form.Item>
					</div>
				</div>
			</Tabs.TabPane>

			<Tabs.TabPane tab="Charging" key="charging">
				<div className="space-y-4">
					<h3 className="text-lg font-semibold">Charging Configuration</h3>
					<div className="grid grid-cols-2 gap-4">
						<Form.Item label="Charging Method">
							<Select placeholder="Select method">
								<Select.Option value="online">Online</Select.Option>
								<Select.Option value="offline">Offline</Select.Option>
								<Select.Option value="prepaid">Prepaid</Select.Option>
							</Select>
						</Form.Item>
						<Form.Item label="Rate">
							<InputNumber min={0} step={0.01} placeholder="0.10" />
						</Form.Item>
						<Form.Item label="Currency">
							<Select placeholder="USD">
								<Select.Option value="USD">USD</Select.Option>
								<Select.Option value="EUR">EUR</Select.Option>
								<Select.Option value="VND">VND</Select.Option>
							</Select>
						</Form.Item>
						<Form.Item label="Unit">
							<Select placeholder="MB">
								<Select.Option value="second">Per Second</Select.Option>
								<Select.Option value="minute">Per Minute</Select.Option>
								<Select.Option value="hour">Per Hour</Select.Option>
								<Select.Option value="mb">Per MB</Select.Option>
								<Select.Option value="gb">Per GB</Select.Option>
							</Select>
						</Form.Item>
					</div>
				</div>
			</Tabs.TabPane>
		</Tabs>
	);
};

// Message Configuration Panel for non-PCF nodes
const MessageConfigPanel = ({ nodeData }: { nodeData: any }) => {
	const [config, setConfig] = useState<MessageConfiguration>(nodeData.messageConfig || {
		headers: {},
		body: {},
		contentType: 'application/json',
		acceptType: 'application/json'
	});

	const [activeTab, setActiveTab] = useState('headers');

	const updateHeaders = (key: string, value: string) => {
		setConfig(prev => ({
			...prev,
			headers: { ...prev.headers, [key]: value }
		}));
	};

	const updateBody = (key: string, value: any) => {
		setConfig(prev => ({
			...prev,
			body: { ...prev.body, [key]: value }
		}));
	};

	return (
		<Tabs activeKey={activeTab} onChange={setActiveTab}>
			<Tabs.TabPane tab="Headers" key="headers">
				<div className="space-y-3">
					<div className="flex justify-between items-center">
						<h4 className="font-medium">HTTP Headers</h4>
						<Button size="small" type="primary">Add Header</Button>
					</div>

					{Object.entries(config.headers).map(([key, value]) => (
						<div key={key} className="flex gap-2 items-center">
							<Input
								placeholder="Header name"
								value={key}
								size="small"
								className="flex-1"
								disabled
							/>
							<Input
								placeholder="Header value"
								value={value as string}
								size="small"
								className="flex-1"
								onChange={(e) => updateHeaders(key, e.target.value)}
							/>
							<Button size="small" danger icon={<CloseOutlined />} />
						</div>
					))}

					{Object.keys(config.headers).length === 0 && (
						<div className="text-gray-500 text-sm text-center py-4">
							No headers configured
						</div>
					)}
				</div>
			</Tabs.TabPane>

			<Tabs.TabPane tab="Body" key="body">
				<div className="space-y-3">
					<div className="flex justify-between items-center">
						<h4 className="font-medium">Message Body</h4>
						<Button size="small" type="primary">Add Field</Button>
					</div>

					<Form.Item label="Content Type">
						<Select
							value={config.contentType}
							onChange={(value) => setConfig(prev => ({ ...prev, contentType: value }))}
							size="small"
						>
							<Select.Option value="application/json">application/json</Select.Option>
							<Select.Option value="application/xml">application/xml</Select.Option>
							<Select.Option value="text/plain">text/plain</Select.Option>
							<Select.Option value="multipart/form-data">multipart/form-data</Select.Option>
						</Select>
					</Form.Item>

					{Object.entries(config.body).map(([key, value]) => (
						<div key={key} className="flex gap-2 items-center">
							<Input
								placeholder="Field name"
								value={key}
								size="small"
								className="flex-1"
								disabled
							/>
							<Input
								placeholder="Field value"
								value={typeof value === 'object' ? JSON.stringify(value) : String(value)}
								size="small"
								className="flex-1"
								onChange={(e) => {
									try {
										const parsed = JSON.parse(e.target.value);
										updateBody(key, parsed);
									} catch {
										updateBody(key, e.target.value);
									}
								}}
							/>
							<Button size="small" danger icon={<CloseOutlined />} />
						</div>
					))}

					{Object.keys(config.body).length === 0 && (
						<div className="text-gray-500 text-sm text-center py-4">
							No body fields configured
						</div>
					)}
				</div>
			</Tabs.TabPane>

			<Tabs.TabPane tab="Settings" key="settings">
				<div className="space-y-4">
					<Form.Item label="Accept Type">
						<Select
							value={config.acceptType}
							onChange={(value) => setConfig(prev => ({ ...prev, acceptType: value }))}
							size="small"
						>
							<Select.Option value="application/json">application/json</Select.Option>
							<Select.Option value="application/xml">application/xml</Select.Option>
							<Select.Option value="text/plain">text/plain</Select.Option>
							<Select.Option value="*/*">*/*</Select.Option>
						</Select>
					</Form.Item>

					<Form.Item label="Query Parameters">
						<Input.TextArea
							placeholder="key1=value1&key2=value2"
							size="small"
							rows={3}
						/>
					</Form.Item>

					<Form.Item label="Path Parameters">
						<Input.TextArea
							placeholder="param1=value1&#10;param2=value2"
							size="small"
							rows={3}
						/>
					</Form.Item>
				</div>
			</Tabs.TabPane>
		</Tabs>
	);
};

// Enhanced Process Node with message flow indicators
const EnhancedProcessNode = ({ data, selected }: NodeProps) => {
	const [showMessage, setShowMessage] = useState(false);

	return (
		<div
			className={`relative transition-all duration-200 ${
				selected ? 'ring-2 ring-blue-500 ring-offset-2 scale-105' : ''
			}`}
			style={{
				background: data.background || '#F3F4F6',
				border: `2px solid ${data.borderColor || '#9CA3AF'}`,
				color: data.color || '#374151',
				padding: '8px 12px',
				borderRadius: 6,
				fontSize: 11,
				fontWeight: 500,
				textAlign: 'center',
				minWidth: 80,
				boxShadow: selected ? '0 2px 6px rgba(59, 130, 246, 0.15)' : 'none',
			}}
		>
			{/* Message indicator */}
			{data.messageData && (
				<div
					className={`absolute -top-1 -right-1 w-3 h-3 rounded-full cursor-pointer ${
						data.messageData.status === 'ERROR' ? 'bg-red-500' :
						data.messageData.status === 'PROCESSED' ? 'bg-green-500' :
						data.messageData.status === 'SENT' ? 'bg-blue-500' : 'bg-yellow-500'
					}`}
					onClick={(e) => {
						e.stopPropagation();
						setShowMessage(true);
					}}
					title={`Message: ${data.messageData.status}`}
				/>
			)}

			<Handle type="target" position={Position.Left} id="left" style={{ opacity: 0, pointerEvents: 'none' }} />
			<Handle type="source" position={Position.Left} id="left" style={{ opacity: 0, pointerEvents: 'none' }} />
			<Handle type="target" position={Position.Right} id="right" style={{ opacity: 0, pointerEvents: 'none' }} />
			<Handle type="source" position={Position.Right} id="right" style={{ opacity: 0, pointerEvents: 'none' }} />
			<Handle type="target" position={Position.Top} id="top" style={{ opacity: 0, pointerEvents: 'none' }} />
			<Handle type="source" position={Position.Top} id="top" style={{ opacity: 0, pointerEvents: 'none' }} />
			<Handle type="target" position={Position.Bottom} id="bottom" style={{ opacity: 0, pointerEvents: 'none' }} />
			<Handle type="source" position={Position.Bottom} id="bottom" style={{ opacity: 0, pointerEvents: 'none' }} />

			{selected && (
				<button
					className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
					onClick={(e) => {
						e.stopPropagation();
						data.onDelete?.();
					}}
				>
					<CloseOutlined style={{ fontSize: 10 }} />
				</button>
			)}
			<div>{data.label}</div>

			{/* Message details modal */}
			<Modal
				title="Message Details"
				open={showMessage}
				onCancel={() => setShowMessage(false)}
				width={500}
				footer={null}
			>
				{data.messageData && (
					<div className="space-y-3">
						<div className="flex justify-between">
							<span className="font-medium">Message ID:</span>
							<Tag>{data.messageData.messageId}</Tag>
						</div>
						<div className="flex justify-between">
							<span className="font-medium">Status:</span>
							<Tag color={
								data.messageData.status === 'ERROR' ? 'red' :
								data.messageData.status === 'PROCESSED' ? 'green' :
								data.messageData.status === 'SENT' ? 'blue' : 'yellow'
							}>
								{data.messageData.status}
							</Tag>
						</div>
						<div className="flex justify-between">
							<span className="font-medium">From:</span>
							<span>{data.messageData.fromNode}</span>
						</div>
						<div className="flex justify-between">
							<span className="font-medium">To:</span>
							<span>{data.messageData.toNode}</span>
						</div>
						<div className="flex justify-between">
							<span className="font-medium">Timestamp:</span>
							<span>{new Date(data.messageData.timestamp).toLocaleString()}</span>
						</div>
						{data.messageData.responseTime && (
							<div className="flex justify-between">
								<span className="font-medium">Response Time:</span>
								<span>{data.messageData.responseTime}ms</span>
							</div>
						)}
						<div>
							<div className="font-medium mb-2">Content:</div>
							<pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
								{JSON.stringify(data.messageData.content, null, 2)}
							</pre>
						</div>
						{data.messageData.errorMessage && (
							<Alert
								message="Error"
								description={data.messageData.errorMessage}
								type="error"
								showIcon
							/>
						)}
					</div>
				)}
			</Modal>
		</div>
	);
};

// Enhanced Step Lane with test indicators
const EnhancedStepLane = ({ data, selected }: NodeProps) => {
	const dynamicWidth = data.lastNodeX ? data.lastNodeX - 50 + NODE_WIDTH + 100 : 600;
	const maxProcessesInColumn = data.maxProcessesInColumn || 0;
	const dynamicHeight = maxProcessesInColumn > 0
		? 32 + maxProcessesInColumn * PROCESS_HEIGHT + (maxProcessesInColumn - 1) * PROCESS_VERTICAL_GAP + 8
		: STEP_MIN_HEIGHT;

	return (
		<div
			className={`relative transition-all duration-200 ${
				selected ? 'ring-2 ring-blue-400 ring-offset-2' : ''
			}`}
			style={{
				background: data.testMode ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.05)',
				border: data.testMode ? '2px solid rgba(34, 197, 94, 0.3)' : '2px solid rgba(59, 130, 246, 0.2)',
				borderRadius: 8,
				paddingLeft: 16,
				paddingRight: 16,
				paddingTop: 32,
				paddingBottom: 8,
				fontSize: 13,
				fontWeight: 600,
				color: data.testMode ? '#16A34A' : '#6B21A8',
				minWidth: dynamicWidth,
				width: dynamicWidth,
				height: dynamicHeight,
				display: 'flex',
				alignItems: 'center',
				boxShadow: selected ? '0 2px 6px rgba(59, 130, 246, 0.2)' : 'none',
			}}
		>
			{selected && (
				<button
					className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
					onClick={(e) => {
						e.stopPropagation();
						data.onDelete?.();
					}}
				>
					<CloseOutlined style={{ fontSize: 10 }} />
				</button>
			)}

			{/* Test mode indicator */}
			{data.testMode && (
				<div className="absolute top-2 right-2">
					<Tag color="green" icon={<ExperimentOutlined />}>
						Testing
					</Tag>
				</div>
			)}

			<div
				style={{
					position: 'absolute',
					left: 16,
					top: 8,
					fontWeight: 600,
					fontSize: 11,
					color: data.testMode ? '#16A34A' : '#3B82F6',
				}}
			>
				Step {data.stepNumber}: {data.label}
			</div>
		</div>
	);
};

// Enhanced API Edge with message flow animation
const EnhancedApiEdge = ({ data, selected }: NodeProps) => {
	const [isAnimating, setIsAnimating] = useState(data.isAnimating || false);

	useEffect(() => {
		setIsAnimating(data.isAnimating || false);
	}, [data.isAnimating]);

	return (
		<div
			className={`relative ${selected ? 'ring-2 ring-orange-500' : ''} ${
				isAnimating ? 'animate-pulse' : ''
			}`}
			style={{
				background: data.testMode ? '#ECFDF5' : '#FFF7ED',
				border: `2px solid ${data.testMode ? '#10B981' : '#6B7280'}`,
				borderRadius: 6,
				padding: '4px 8px',
				fontSize: 10,
				fontWeight: 500,
				color: data.testMode ? '#065F46' : '#374151',
				textAlign: 'center',
				whiteSpace: 'nowrap',
				boxShadow: selected ? '0 2px 6px rgba(249, 115, 22, 0.3)' : 'none rgba(0, 0, 0, 0.1)',
				transition: 'all 0.3s ease',
			}}
		>
			{data.showDelete && (
				<button
					className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
					onClick={(e) => {
						e.stopPropagation();
						data.onDelete?.();
					}}
				>
					<CloseOutlined style={{ fontSize: 8 }} />
				</button>
			)}
			<div className="flex items-center gap-1">
				{isAnimating && <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />}
				<span>{data.label}</span>
				{data.testMode && <MessageOutlined style={{ fontSize: 10 }} />}
			</div>
		</div>
	);
};

const VerticalNodeLine = ({ data }: NodeProps) => {
	return (
		<div
			style={{
				width: 0,
				height: data.height || 600,
				borderLeft: `2px dashed ${data.color || 'rgba(100, 116, 139, 0.4)'}`,
				position: 'absolute',
				left: '0',
			}}
		/>
	);
};

const nodeTypes = {
	networkNode: EnhancedNetworkNode,
	processNode: EnhancedProcessNode,
	stepLane: EnhancedStepLane,
	remoteCall: EnhancedApiEdge,
	verticalLine: VerticalNodeLine,
};

// Convert FlowData to ReactFlow with enhanced features
const convertFlowDataToReactFlowV2 = (
	flowData: FlowData,
	testMode: boolean = false,
	messageFlows: MessageFlowData[] = [],
	onDeleteNode: ((nodeId: string) => void) | null = null,
	onMoveStepUp: ((stepId: string) => void) | null = null,
	onMoveStepDown: ((stepId: string) => void) | null = null
) => {
	const nodes: Node[] = [];
	const edges: Edge[] = [];
	const startX = 250;

	// Create node positions map
	const nodePositions = flowData.nodes.map((nfNode, index) => ({
		id: nfNode.id,
		x: startX + (index * NODE_SPACING),
		label: nfNode.name,
		nfType: nfNode.nfType,
		gradient: nfNode.nfType === 'PCF' ? '#7C3AED' : '#3B82F6',
		lineColor: nfNode.nfType === 'PCF' ? 'rgba(124, 58, 237, 0.15)' : 'rgba(59, 130, 246, 0.15)',
		messageConfig: nfNode.messageConfig,
		pcfConfig: nfNode.pcfConfig,
	}));

	// Create Network Nodes with enhanced features
	nodePositions.forEach((nodePos) => {
		nodes.push({
			id: nodePos.id,
			type: 'networkNode',
			position: { x: nodePos.x, y: 20 },
			data: {
				label: nodePos.label,
				nfType: nodePos.nfType,
				gradient: nodePos.gradient,
				messageConfig: nodePos.messageConfig,
				pcfConfig: nodePos.pcfConfig,
				onDelete: onDeleteNode ? () => onDeleteNode(nodePos.id) : undefined,
			},
			draggable: false,
		});

		nodes.push({
			id: `${nodePos.id}-line`,
			type: 'verticalLine',
			position: { x: nodePos.x + NODE_WIDTH / 2 - 1, y: 90 },
			data: {
				height: 100 + flowData.steps.length * 100,
				color: nodePos.lineColor,
			},
			selectable: false,
			draggable: false,
		});
	});

	// Create Steps with test mode indicators
	flowData.steps.forEach((step, index) => {
		const stepY = 120 + (index * 100);

		const processesInStep = flowData.processes.filter(p => p.stepId === step.id);
		const maxProcessesInColumn = Math.max(1, Math.ceil(processesInStep.length / nodePositions.length));

		nodes.push({
			id: step.id,
			type: 'stepLane',
			position: { x: 50, y: stepY },
			data: {
				stepNumber: step.stepNumber,
				label: step.name,
				nodeCount: nodePositions.length,
				lastNodeX: nodePositions[nodePositions.length - 1]?.x || startX,
				maxProcessesInColumn,
				testMode,
				onDelete: onDeleteNode ? () => onDeleteNode(step.id) : undefined,
				onMoveUp: onMoveStepUp ? () => onMoveStepUp(step.id) : undefined,
				onMoveDown: onMoveStepDown ? () => onMoveStepDown(step.id) : undefined,
			},
			draggable: false,
		});
	});

	// Create Processes with message flow data
	flowData.processes.forEach((process) => {
		const nodePos = nodePositions.find(np => np.id === process.nodeId);
		if (!nodePos) return;

		const stepIndex = flowData.steps.findIndex(s => s.id === process.stepId);
		if (stepIndex === -1) return;

		const stepY = 120 + (stepIndex * 100);
		const adjustedY = process.position.y < stepY + 40 ? stepY + 40 : process.position.y;

		// Find message flow data for this process
		const messageData = messageFlows.find(mf =>
			mf.fromNode === process.nodeId || mf.toNode === process.nodeId
		);

		nodes.push({
			id: process.id,
			type: 'processNode',
			position: { x: process.position.x, y: adjustedY },
			data: {
				label: process.label,
				background: process.type === 'sender' ? '#BFDBFE' : process.type === 'receiver' ? '#E5E7EB' : '#F3F4F6',
				borderColor: process.type === 'sender' ? '#3B82F6' : process.type === 'receiver' ? '#6B7280' : '#9CA3AF',
				color: process.type === 'sender' ? '#1E40AF' : process.type === 'receiver' ? '#374151' : '#374151',
				messageData,
				onDelete: onDeleteNode ? () => onDeleteNode(process.id) : undefined,
			},
			draggable: false,
		});
	});

	// Create edges with enhanced features
	const apiCallsByStep = new Map<string, any[]>();

	flowData.processes.forEach((process) => {
		if (process.apiType === 'request') {
			const stepProcesses = apiCallsByStep.get(process.stepId) || [];
			stepProcesses.push(process);
			apiCallsByStep.set(process.stepId, stepProcesses);
		}
	});

	apiCallsByStep.forEach((processes, stepId) => {
		const senders = processes.filter(p => p.type === 'sender');
		const receivers = processes.filter(p => p.type === 'receiver');

		senders.forEach((sender, index) => {
			const receiver = receivers[index];

			if (receiver) {
				const senderNode = nodes.find(n => n.id === sender.id);
				const receiverNode = nodes.find(n => n.id === receiver.id);

				if (senderNode && receiverNode) {
					const senderPos = { x: senderNode.position.x, y: senderNode.position.y };
					const receiverPos = { x: receiverNode.position.x, y: receiverNode.position.y };

					const dx = receiverPos.x - senderPos.x;
					const dy = receiverPos.y - senderPos.y;

					let sourceHandle = 'right';
					let targetHandle = 'left';

					if (Math.abs(dx) < Math.abs(dy)) {
						if (dy > 0) {
							sourceHandle = 'bottom';
							targetHandle = 'top';
						} else {
							sourceHandle = 'top';
							targetHandle = 'bottom';
						}
					} else {
						if (dx > 0) {
							sourceHandle = 'right';
							targetHandle = 'left';
						} else {
							sourceHandle = 'left';
							targetHandle = 'right';
						}
					}

					// Check if this edge has active message flow
					const hasActiveMessage = messageFlows.some(mf =>
						mf.status === 'SENT' || mf.status === 'PENDING'
					);

					edges.push({
						id: `edge-${sender.id}-${receiver.id}`,
						source: sender.id,
						target: receiver.id,
						sourceHandle,
						targetHandle,
						type: 'smoothstep',
						animated: hasActiveMessage,
						style: {
							stroke: testMode ? '#10B981' : '#3B82F6',
							strokeWidth: testMode ? 3 : 2
						},
						markerEnd: {
							type: MarkerType.ArrowClosed,
							color: testMode ? '#10B981' : '#3B82F6'
						},
						label: sender.method || 'API',
						labelStyle: {
							fill: testMode ? '#065F46' : '#3B82F6',
							fontWeight: 600,
							fontSize: 11
						},
						labelBgStyle: {
							fill: testMode ? '#ECFDF5' : '#ffffff',
							fillOpacity: 0.9
						},
						labelBgPadding: [4, 6] as [number, number],
						labelBgBorderRadius: 4,
					});
				}
			}
		});
	});

	return { nodes, edges, nodePositions };
};

export default function PolicyFlowGraphV2({ policyId, flowData, onProcessNodeSelect, onNFNodeSelect, onStepSelect }: PolicyFlowGraphV2Props) {
	const reactFlowWrapper = useRef<HTMLDivElement>(null);
	const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
	const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
	const [selectedProcessNode, setSelectedProcessNode] = useState<Node | null>(null);
	const [showProcessMenu, setShowProcessMenu] = useState(false);
	const [showApiRequestForm, setShowApiRequestForm] = useState(false);
	const [showApiResponseForm, setShowApiResponseForm] = useState(false);
	const [fromNodeId, setFromNodeId] = useState<string>('');
	const [toNodeId, setToNodeId] = useState<string>('');
	const [selectedRequestId, setSelectedRequestId] = useState<string>('');

	const [nodes, setNodes, onNodesChange] = useNodesState([]);
	const [edges, setEdges, onEdgesChange] = useEdgesState([]);
	const [nodePositions, setNodePositions] = useState<any[]>([]);
	const [stepCounter, setStepCounter] = useState(4);
	const [showStepForm, setShowStepForm] = useState(false);
	const [newStepName, setNewStepName] = useState('');
	const [nodeCounter, setNodeCounter] = useState(6);
	const [showNodeForm, setShowNodeForm] = useState(false);
	const [newNodeName, setNewNodeName] = useState('');
	const [newNodeType, setNewNodeType] = useState('');
	const [processCounter, setProcessCounter] = useState(4);
	const [apiRequestCounter, setApiRequestCounter] = useState(1);

	// Test flow state
	const [testMode, setTestMode] = useState(false);
	const [testRunning, setTestRunning] = useState(false);
	const [testProgress, setTestProgress] = useState(0);
	const [messageFlows, setMessageFlows] = useState<MessageFlowData[]>([]);
	const [testResult, setTestResult] = useState<TestFlowResult | null>(null);

	const [apiRequests, setApiRequests] = useState<Record<string, { requestEdgeId: string, responseEdgeId: string | null, fromNodeId: string, toNodeId: string, stepId: string }>>({});
	const [nodeProcessCounters, setNodeProcessCounters] = useState<Record<string, number>>({});

	// View mode state
	const [viewMode, setViewMode] = useState<'graph' | 'editor'>('graph');
	const [jsonEditorValue, setJsonEditorValue] = useState<string>('');
	const [jsonData, setJsonData] = useState<any>(null);
	const [jsonSearchText, setJsonSearchText] = useState<string>('');

	// Test flow functionality with enhanced state management
	const startTestFlow = useCallback(async () => {
		if (!flowData) return;

		setTestMode(true);
		setTestRunning(true);
		setTestProgress(0);
		setMessageFlows([]);

		const testMessages: MessageFlowData[] = [];
		let messageCounter = 1;

		// Initialize NF states
		const nfStates: Record<string, any> = {};
		flowData.nodes.forEach(node => {
			nfStates[node.id] = {
				currentState: 'IDLE',
				stateData: {},
				lastTransition: new Date().toISOString(),
				transitionHistory: []
			};
		});

		// Simulate message flow through the network with state management
		for (const step of flowData.steps) {
			const stepProcesses = flowData.processes.filter(p => p.stepId === step.id);
			const apiRequests = stepProcesses.filter(p => p.apiType === 'request');

			for (const apiReq of apiRequests) {
				const senderNode = flowData.nodes.find(n => n.id === apiReq.nodeId);
				const receiverProcess = stepProcesses.find(p =>
					p.type === 'receiver' && p.apiType === 'request'
				);
				const receiverNode = receiverProcess ? flowData.nodes.find(n => n.id === receiverProcess.nodeId) : null;

				if (senderNode && receiverNode) {
					// Update sender state to PROCESSING
					nfStates[senderNode.id].currentState = 'PROCESSING';
					nfStates[senderNode.id].transitionHistory.push({
						fromState: 'IDLE',
						toState: 'PROCESSING',
						timestamp: new Date().toISOString(),
						trigger: 'START_SEND_MESSAGE'
					});

					// Create request message
					const requestMessage: MessageFlowData = {
						messageId: `msg-${messageCounter++}`,
						timestamp: new Date().toISOString(),
						fromNode: senderNode.name,
						toNode: receiverNode.name,
						content: {
							method: apiReq.method || 'POST',
							endpoint: apiReq.endpoint || '/api/request',
							headers: senderNode.messageConfig?.headers || {},
							body: senderNode.messageConfig?.body || {}
						},
						status: 'SENT'
					};

					testMessages.push(requestMessage);
					setMessageFlows([...testMessages]);

					// Simulate network delay
					await new Promise(resolve => setTimeout(resolve, 800));

					// Update sender state to WAITING_RESPONSE
					nfStates[senderNode.id].currentState = 'WAITING_RESPONSE';
					nfStates[senderNode.id].transitionHistory.push({
						fromState: 'PROCESSING',
						toState: 'WAITING_RESPONSE',
						timestamp: new Date().toISOString(),
						trigger: 'MESSAGE_SENT'
					});

					// Update receiver state to PROCESSING
					nfStates[receiverNode.id].currentState = 'PROCESSING';
					nfStates[receiverNode.id].transitionHistory.push({
						fromState: 'IDLE',
						toState: 'PROCESSING',
						timestamp: new Date().toISOString(),
						trigger: 'MESSAGE_RECEIVED'
					});

					// Update to received
					requestMessage.status = 'RECEIVED';
					setMessageFlows([...testMessages]);

					// Simulate PCF processing if receiver is PCF
					if (receiverNode.nfType === 'PCF') {
						await new Promise(resolve => setTimeout(resolve, 1200));

						// Apply PCF rules (simplified)
						const pcfrules = receiverNode.pcfConfig?.policyRules || [];
						let decision = 'ALLOW';

						// Simple rule evaluation
						for (const rule of pcfrules) {
							if (rule.enabled && rule.conditions.length > 0) {
								const conditionMet = rule.conditions.some(cond =>
									cond.type === 'SERVICE_TYPE' &&
									requestMessage.content.body?.serviceType === cond.value
								);

								if (conditionMet) {
									decision = rule.actions[0]?.type === 'DENY' ? 'DENY' : 'ALLOW';
									break;
								}
							}
						}

						// Update PCF state based on decision
						nfStates[receiverNode.id].currentState = decision === 'ALLOW' ? 'COMPLETED' : 'ERROR';
						nfStates[receiverNode.id].transitionHistory.push({
							fromState: 'PROCESSING',
							toState: nfStates[receiverNode.id].currentState,
							timestamp: new Date().toISOString(),
							trigger: `POLICY_DECISION_${decision}`
						});

						requestMessage.status = decision === 'ALLOW' ? 'PROCESSED' : 'ERROR';
						requestMessage.errorMessage = decision === 'DENY' ? 'Request denied by PCF policy' : undefined;
					} else {
						// Other nodes just process normally
						await new Promise(resolve => setTimeout(resolve, 600));

						nfStates[receiverNode.id].currentState = 'COMPLETED';
						nfStates[receiverNode.id].transitionHistory.push({
							fromState: 'PROCESSING',
							toState: 'COMPLETED',
							timestamp: new Date().toISOString(),
							trigger: 'PROCESSING_COMPLETE'
						});

						requestMessage.status = 'PROCESSED';
					}

					// Update sender state to COMPLETED
					nfStates[senderNode.id].currentState = 'COMPLETED';
					nfStates[senderNode.id].transitionHistory.push({
						fromState: 'WAITING_RESPONSE',
						toState: 'COMPLETED',
						timestamp: new Date().toISOString(),
						trigger: 'RESPONSE_RECEIVED'
					});

					setMessageFlows([...testMessages]);
				}
			}

			setTestProgress(((flowData.steps.indexOf(step) + 1) / flowData.steps.length) * 100);
		}

		// Complete test
		setTestRunning(false);
		setTestResult({
			flowId: flowData.metadata.id,
			startTime: new Date().toISOString(),
			endTime: new Date().toISOString(),
			status: 'COMPLETED',
			messageFlows: testMessages,
			performanceMetrics: {
				totalMessages: testMessages.length,
				averageResponseTime: 1000, // simulated
				successRate: (testMessages.filter(m => m.status === 'PROCESSED').length / testMessages.length) * 100,
				errorCount: testMessages.filter(m => m.status === 'ERROR').length
			}
		});

		// Auto-disable test mode after 5 seconds
		setTimeout(() => {
			setTestMode(false);
			setMessageFlows([]);
		}, 5000);

	}, [flowData]);

	const stopTestFlow = useCallback(() => {
		setTestRunning(false);
		setTestMode(false);
		setTestProgress(0);
		setMessageFlows([]);
		setTestResult(null);
	}, []);

	// Export flow to JSON for backend processing
	const exportFlowToJSON = useCallback(() => {
		try {
			// Use the edited JSON if in editor mode, otherwise use original flowData
			const dataToExport = viewMode === 'editor' ? JSON.parse(jsonEditorValue) : flowData;

			if (!dataToExport) return;

			const exportData = {
				...dataToExport,
				exportConfig: {
					version: '1.0.0',
					targetPlatform: 'JAVA_SPRING',
					outputFormat: 'JSON',
					codeGeneration: {
						basePackage: 'com.example.nfpolicy',
						mainClass: `${dataToExport.metadata?.name?.replace(/\s+/g, '') || 'Flow'}FlowHandler`,
						dependencies: [
							'spring-boot-starter-web',
							'spring-boot-starter-data-jpa',
							'spring-kafka',
							'com.fasterxml.jackson.core:jackson-databind'
						],
						buildConfig: {
							buildTool: 'MAVEN',
							javaVersion: '17',
							springBootVersion: '3.2.0'
						}
					}
				}
			};

			// Create and download JSON file
			const dataStr = JSON.stringify(exportData, null, 2);
			const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

			const exportFileDefaultName = `${dataToExport.metadata?.id || 'flow'}-flow-export.json`;

			const linkElement = document.createElement('a');
			linkElement.setAttribute('href', dataUri);
			linkElement.setAttribute('download', exportFileDefaultName);
			linkElement.click();
		} catch (error) {
			console.error('Error exporting JSON:', error);
			// Fallback to original flowData if JSON parsing fails
			if (flowData) {
				const exportData = {
					...flowData,
					exportConfig: {
						version: '1.0.0',
						targetPlatform: 'JAVA_SPRING',
						outputFormat: 'JSON',
						codeGeneration: {
							basePackage: 'com.example.nfpolicy',
							mainClass: `${flowData.metadata.name.replace(/\s+/g, '')}FlowHandler`,
							dependencies: [
								'spring-boot-starter-web',
								'spring-boot-starter-data-jpa',
								'spring-kafka',
								'com.fasterxml.jackson.core:jackson-databind'
							],
							buildConfig: {
								buildTool: 'MAVEN',
								javaVersion: '17',
								springBootVersion: '3.2.0'
							}
						}
					}
				};

				const dataStr = JSON.stringify(exportData, null, 2);
				const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

				const exportFileDefaultName = `${flowData.metadata.id}-flow-export.json`;

				const linkElement = document.createElement('a');
				linkElement.setAttribute('href', dataUri);
				linkElement.setAttribute('download', exportFileDefaultName);
				linkElement.click();
			}
		}
	}, [flowData, jsonEditorValue, viewMode]);

	// Initialize flow data
	React.useEffect(() => {
		if (flowData) {
			const reactFlowData = convertFlowDataToReactFlowV2(flowData, testMode, messageFlows);
			setNodes(reactFlowData.nodes);
			setEdges(reactFlowData.edges);
			setNodePositions(reactFlowData.nodePositions);
		} else {
			setNodes([]);
			setEdges([]);
			setNodePositions([]);
		}
	}, [policyId, flowData, testMode, messageFlows]);

	// Update JSON editor when flowData changes
	React.useEffect(() => {
		if (flowData) {
			setJsonEditorValue(JSON.stringify(flowData, null, 2));
			setJsonData(flowData);
		}
	}, [flowData]);

	const onSelectionChange = useCallback((params: any) => {
		const selectedNodes = params.nodes || [];
		const stepNode = selectedNodes.find((n: Node) => n.type === 'stepLane');
		const processNode = selectedNodes.find((n: Node) => n.type === 'processNode');
		const nfNode = selectedNodes.find((n: Node) => n.type === 'networkNode');

		setSelectedStepId(stepNode ? stepNode.id : null);
		setSelectedProcessNode(processNode || null);

		if (processNode && onProcessNodeSelect) {
			onProcessNodeSelect(processNode);
		} else if (nfNode && onNFNodeSelect) {
			onNFNodeSelect(nfNode);
		} else if (stepNode && onStepSelect) {
			onStepSelect(stepNode);
		} else {
			if (onProcessNodeSelect) onProcessNodeSelect(null);
			if (onNFNodeSelect) onNFNodeSelect(null);
			if (onStepSelect) onStepSelect(null);
		}
	}, [onProcessNodeSelect, onNFNodeSelect, onStepSelect]);

	return (
		<div className="relative w-full h-full flex flex-col">
			{/* Flow Graph Section (2/3 height) */}
			<div className="flex-1 relative" style={{ flex: '2 1 0%' }}>
				{viewMode === 'graph' ? (
					<div ref={reactFlowWrapper} className="w-full h-full relative">
						{/* Toggle Button in Graph Mode */}
						<div className="absolute top-4 right-4 z-20">
							<Button
								type="primary"
								size="small"
								onClick={() => setViewMode('editor')}
								className="shadow-lg font-medium"
								style={{
									background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
									border: 'none',
									borderRadius: '8px',
									padding: '6px 16px',
									transition: 'all 0.3s ease'
								}}
							>
								✏️ Editor Mode
							</Button>
						</div>
						<ReactFlow
							nodes={nodes}
							edges={edges}
							onNodesChange={onNodesChange}
							onEdgesChange={onEdgesChange}
							onInit={setReactFlowInstance}
							onSelectionChange={onSelectionChange}
							nodeTypes={nodeTypes}
							nodesDraggable={false}
							nodesConnectable={false}
							elementsSelectable={true}
							fitView
							attributionPosition="bottom-right"
							className={`bg-gradient-to-br ${testMode ? 'from-green-50 to-blue-50' : 'from-gray-50 to-gray-100'}`}
						>
							<Background
								variant={BackgroundVariant.Dots}
								gap={GRID_SIZE}
								size={1.5}
								color={testMode ? "#10b981" : "#94a3b8"}
								style={{ opacity: testMode ? 0.2 : 0.3 }}
							/>
							<Controls className="bg-white border border-gray-200 rounded-lg shadow-lg" />
							<MiniMap
								nodeColor={(node) => {
									if (node.type === 'networkNode') {
										const nfType = node.data?.nfType;
										if (nfType === 'PCF') return '#7C3AED';
										return '#667eea';
									}
									if (node.type === 'stepLane') return testMode ? '#10B981' : '#8B5CF6';
									if (node.type === 'processNode') return '#10B981';
									return '#94A3B8';
								}}
								maskColor="rgba(0, 0, 0, 0.05)"
								className="bg-white border border-gray-200 rounded-lg shadow-lg"
							/>
						</ReactFlow>
					</div>
				) : (
					<div className="w-full h-full p-4 bg-gray-50">
						<div className="h-full flex flex-col">
							<div className="flex justify-between items-center mb-4">
								<div>
									<h3 className="text-lg font-semibold text-gray-800">JSON Editor</h3>
									<p className="text-sm text-gray-500">Changes are not automatically saved. Use Export to save your changes.</p>
								</div>
								<div className="flex items-center gap-2">
									<Button
										type="primary"
										size="small"
										onClick={() => setViewMode('graph')}
										className="shadow-lg font-medium"
										style={{
											background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
											border: 'none',
											borderRadius: '8px',
											padding: '6px 16px',
											transition: 'all 0.3s ease'
										}}
									>
										📊 Graph Mode
									</Button>
									<Button
										type="default"
										size="small"
										icon={<ImportOutlined />}
										onClick={() => {
											// Import functionality will be implemented here
											console.log('Import clicked');
										}}
										title="Import flow from JSON file"
									>
										Import
									</Button>
									<Button
										type="primary"
										size="small"
										icon={<ExportOutlined />}
										onClick={exportFlowToJSON}
										title="Export flow to JSON for backend processing"
										style={{
											background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
											border: 'none',
											borderRadius: '6px'
										}}
									>
										Export
									</Button>
								</div>
							</div>
							<div className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
								{/* Search input for JSON editor */}
								<div className="p-3 border-b border-gray-200 bg-blue-50">
									<div className="flex items-center gap-2">
										<SearchOutlined style={{ color: '#3B82F6' }} />
										<Input
											placeholder="Search JSON data (keys, values, or both)..."
											value={jsonSearchText}
											onChange={(e) => setJsonSearchText(e.target.value)}
											size="small"
											allowClear
											className="flex-1"
											style={{ borderColor: '#3B82F6' }}
										/>
										{jsonSearchText && (
											<span className="text-xs text-blue-600 font-medium">
												Searching: "{jsonSearchText}"
											</span>
										)}
									</div>
								</div>
								<div style={{ width: '100%', height: 'calc(100% - 60px)' }}>
									<JsonEditor
										data={flowData || {}}
                                        minWidth="100%"
										searchText={jsonSearchText}
										searchFilter="all"
										onUpdate={({ newData }) => {
											// Update the JSON editor value for export
											setJsonEditorValue(JSON.stringify(newData, null, 2));
										}}
									/>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Toolbox - only show in graph mode */}
				{viewMode === 'graph' && (
					<div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
					<div className="flex gap-4">
						{/* Flows Section */}
						<Card
							className="shadow-2xl border-2 border-blue-400 bg-white transition-all"
							bodyStyle={{ padding: '12px 16px' }}
						>
							<div className="flex flex-col gap-2">
								<div className="text-xs font-bold text-blue-600 mb-1">FLOWS</div>
								<div className="flex gap-2">
									{/* Add Step */}
									<div className="relative">
										<div
											onClick={() => setShowStepForm(!showStepForm)}
											className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg border-2 border-blue-300 hover:bg-blue-50 cursor-pointer hover:scale-105 transition-all"
											style={{ minWidth: 90 }}
										>
											<div style={{ fontSize: 24, color: '#8B5CF6' }}>
												<AppstoreOutlined />
											</div>
											<span className="text-xs font-medium text-gray-700">Step</span>
										</div>

										{/* Add Step Form */}
										{showStepForm && (
											<div className="absolute bottom-full left-0 mb-2 bg-white border-2 border-blue-300 rounded-lg shadow-xl z-50 min-w-[280px] p-4">
												<div className="text-xs font-bold text-gray-500 mb-3">Create New Step</div>
												<div className="space-y-3">
													<div>
														<label className="block text-xs font-medium text-gray-700 mb-1">Step Name</label>
														<Input
															placeholder="Enter step name"
															value={newStepName}
															onChange={(e) => setNewStepName(e.target.value)}
															onPressEnter={() => {
																if (newStepName.trim()) {
																	// Add step logic here
																	setShowStepForm(false);
																	setNewStepName('');
																}
															}}
															autoFocus
															size="small"
														/>
													</div>
													<div className="flex gap-2 pt-2">
														<button className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 rounded transition-colors">
															Add
														</button>
														<button
															onClick={() => {
																setShowStepForm(false);
																setNewStepName('');
															}}
															className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
														>
															Cancel
														</button>
													</div>
												</div>
											</div>
										)}
									</div>

									{/* Add Node */}
									<div className="relative">
										<div
											onClick={() => setShowNodeForm(!showNodeForm)}
											className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg border-2 border-blue-300 hover:bg-blue-50 cursor-pointer hover:scale-105 transition-all"
											style={{ minWidth: 90 }}
										>
											<div style={{ fontSize: 24, color: '#3B82F6' }}>
												<NodeIndexOutlined />
											</div>
											<span className="text-xs font-medium text-gray-700">Node</span>
										</div>

										{/* Add Node Form */}
										{showNodeForm && (
											<div className="absolute bottom-full left-0 mb-2 bg-white border-2 border-blue-300 rounded-lg shadow-xl z-50 min-w-[280px] p-4">
												<div className="text-xs font-bold text-gray-500 mb-3">Create New Node</div>
												<div className="space-y-3">
													<div>
														<label className="block text-xs font-medium text-gray-700 mb-1">Node Name</label>
														<Input
															placeholder="Enter node name"
															value={newNodeName}
															onChange={(e) => setNewNodeName(e.target.value)}
															autoFocus
															size="small"
														/>
													</div>
													<div>
														<label className="block text-xs font-medium text-gray-700 mb-1">NF Type</label>
														<Select
															value={newNodeType || undefined}
															onChange={(value) => setNewNodeType(value)}
															style={{ width: '100%' }}
															size="small"
															options={[
																{ value: 'AMF', label: 'AMF - Access and Mobility Management' },
																{ value: 'SMF', label: 'SMF - Session Management' },
																{ value: 'UPF', label: 'UPF - User Plane Function' },
																{ value: 'PCF', label: 'PCF - Policy Control' },
																{ value: 'UDM', label: 'UDM - Unified Data Management' },
																{ value: 'AUSF', label: 'AUSF - Authentication Server' },
																{ value: 'NEF', label: 'NEF - Network Exposure' },
																{ value: 'NRF', label: 'NRF - Network Repository' },
																{ value: 'UE', label: 'UE - User Equipment' },
															]}
														/>
													</div>
													<div className="flex gap-2 pt-2">
														<button className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 rounded transition-colors">
															Add
														</button>
														<button
															onClick={() => {
																setShowNodeForm(false);
																setNewNodeName('');
																setNewNodeType('');
															}}
															className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
														>
															Cancel
														</button>
													</div>
												</div>
											</div>
										)}
									</div>
								</div>
							</div>
						</Card>

						{/* Steps Section */}
						<Card
							className={`shadow-2xl border-2 transition-all ${
								selectedStepId !== null
									? 'border-green-400 bg-white'
									: 'border-gray-200 bg-gray-50 opacity-50'
							}`}
							bodyStyle={{ padding: '12px 16px' }}
						>
							<div className="flex flex-col gap-2">
								<div className="text-xs font-bold text-green-600 mb-1">STEPS</div>
								<div className="flex gap-2">
									{/* Add Process */}
									<div className="relative">
										<div
											onClick={() => {
												if (selectedStepId !== null) {
													setShowProcessMenu(!showProcessMenu);
												}
											}}
											className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg border-2 transition-all ${
												selectedStepId !== null
													? 'border-green-300 hover:bg-green-50 cursor-pointer hover:scale-105'
													: 'border-gray-200 cursor-not-allowed opacity-50'
											}`}
											style={{ minWidth: 90 }}
										>
											<div style={{ fontSize: 24, color: selectedStepId !== null ? '#10B981' : '#9CA3AF' }}>
												<BranchesOutlined />
											</div>
											<span className="text-xs font-medium" style={{ color: selectedStepId !== null ? '#374151' : '#9CA3AF' }}>
												Process
											</span>
										</div>

										{/* Process menu */}
										{showProcessMenu && selectedStepId !== null && (
											<div className="absolute bottom-full left-0 mb-2 bg-white border-2 border-green-300 rounded-lg shadow-xl z-50 min-w-[120px]">
												<div className="text-xs font-bold text-gray-500 px-3 py-2 border-b">Select NF</div>
												<div className="py-1">
													{nodePositions.map((nodePos) => (
														<button
															key={nodePos.id}
															onClick={() => {
																// Add process logic here
																setShowProcessMenu(false);
															}}
															className="w-full px-3 py-2 text-left text-sm hover:bg-green-50 transition-colors flex items-center gap-2"
														>
															<div
																className="w-3 h-3 rounded-full"
																style={{ background: nodePos.gradient }}
															/>
															<span style={{ color: '#374151', fontWeight: 600 }}>{nodePos.label}</span>
														</button>
													))}
												</div>
											</div>
										)}
									</div>

									{/* API Request */}
									<div className="relative">
										<div
											onClick={() => {
												if (selectedStepId !== null) {
													setShowApiRequestForm(!showApiRequestForm);
												}
											}}
											className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg border-2 transition-all ${
												selectedStepId !== null
													? 'border-orange-300 hover:bg-orange-50 cursor-pointer hover:scale-105'
													: 'border-gray-200 cursor-not-allowed opacity-50'
											}`}
											style={{ minWidth: 90 }}
										>
											<div style={{ fontSize: 24, color: selectedStepId !== null ? '#6B7280' : '#9CA3AF' }}>
												<ApiOutlined />
											</div>
											<span className="text-xs font-medium" style={{ color: selectedStepId !== null ? '#374151' : '#9CA3AF' }}>
												Request
											</span>
										</div>

										{/* API Request Form */}
										{showApiRequestForm && selectedStepId !== null && (
											<div className="absolute bottom-full left-0 mb-2 bg-white border-2 border-orange-300 rounded-lg shadow-xl z-50 min-w-[200px] p-4">
												<div className="text-xs font-bold text-gray-500 mb-3">Create API Request</div>
												<div className="space-y-3">
													<div>
														<label className="block text-xs font-medium text-gray-700 mb-1">From NF</label>
														<select
															value={fromNodeId}
															onChange={(e) => setFromNodeId(e.target.value)}
															className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-300"
														>
															<option value="">Select...</option>
															{nodePositions.map((nodePos) => (
																<option key={nodePos.id} value={nodePos.id}>
																	{nodePos.label}
																</option>
															))}
														</select>
													</div>
													<div>
														<label className="block text-xs font-medium text-gray-700 mb-1">To NF</label>
														<select
															value={toNodeId}
															onChange={(e) => setToNodeId(e.target.value)}
															className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-300"
														>
															<option value="">Select...</option>
															{nodePositions
																.filter(np => np.id !== fromNodeId)
																.map((nodePos) => (
																	<option key={nodePos.id} value={nodePos.id}>
																		{nodePos.label}
																	</option>
																))}
														</select>
													</div>
													<div className="flex gap-2 pt-2">
														<button className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-orange-500 hover:bg-orange-600 rounded transition-colors">
															Add
														</button>
														<button
															onClick={() => {
																setShowApiRequestForm(false);
																setFromNodeId('');
																setToNodeId('');
															}}
															className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
														>
															Cancel
														</button>
													</div>
												</div>
											</div>
										)}
									</div>

									{/* API Response */}
									<div className="relative">
										<div
											onClick={() => {
												if (selectedStepId !== null) {
													setShowApiResponseForm(!showApiResponseForm);
												}
											}}
											className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg border-2 transition-all ${
												selectedStepId !== null
													? 'border-green-300 hover:bg-green-50 cursor-pointer hover:scale-105'
													: 'border-gray-200 cursor-not-allowed opacity-50'
											}`}
											style={{ minWidth: 90 }}
										>
											<div style={{ fontSize: 24, color: selectedStepId !== null ? '#10B981' : '#9CA3AF' }}>
												<ApiOutlined />
											</div>
											<span className="text-xs font-medium" style={{ color: selectedStepId !== null ? '#374151' : '#9CA3AF' }}>
												Response
											</span>
										</div>

										{/* API Response Form */}
										{showApiResponseForm && selectedStepId !== null && (
											<div className="absolute bottom-full left-0 mb-2 bg-white border-2 border-green-300 rounded-lg shadow-xl z-50 min-w-[200px] p-4">
												<div className="text-xs font-bold text-gray-500 mb-3">Create API Response</div>
												<div className="space-y-3">
													<div>
														<label className="block text-xs font-medium text-gray-700 mb-1">API Request</label>
														<select
															value={selectedRequestId}
															onChange={(e) => setSelectedRequestId(e.target.value)}
															className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-300"
														>
															<option value="">Select...</option>
															{/* Request options would go here */}
														</select>
													</div>
													<div className="flex gap-2 pt-2">
														<button className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-green-500 hover:bg-green-600 rounded transition-colors">
															Add
														</button>
														<button
															onClick={() => {
																setShowApiResponseForm(false);
																setSelectedRequestId('');
															}}
															className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
														>
															Cancel
														</button>
													</div>
												</div>
											</div>
										)}
									</div>
								</div>
							</div>
						</Card>
					</div>
				</div>
				)}
			</div>

			{/* Simulation Window Section (1/3 height) */}
			<div className="border-t border-gray-300 bg-white overflow-hidden" style={{ flex: '1 1 0%', minHeight: '150px', maxHeight: '25vh' }}>
				<Tabs
					defaultActiveKey="simulation"
					className="h-full"
					style={{ paddingLeft: '16px' }}
					tabBarExtraContent={
						<div className="flex items-center gap-2 mr-4">
							{!testRunning && !testMode && (
								<Button
									type="primary"
									size="small"
									icon={<PlayCircleOutlined />}
									onClick={startTestFlow}
								>
									Start Test
								</Button>
							)}

							{testRunning && (
								<Button
									danger
									size="small"
									icon={<StopOutlined />}
									onClick={stopTestFlow}
								>
									Stop Test
								</Button>
							)}

							{testMode && !testRunning && (
								<Button
									size="small"
									onClick={() => setTestMode(false)}
								>
									Exit Test
								</Button>
							)}
						</div>
					}
				>
					<Tabs.TabPane tab="Simulation Monitor" key="simulation">
						<div className="overflow-y-auto" style={{ height: 'calc(25vh - 80px)' }}>
							<div className="p-4 space-y-4">
								{/* Test Status */}
								<div className="flex items-center justify-between">
									<h3 className="text-lg font-semibold text-gray-800">Simulation Status</h3>
									<div className="flex items-center gap-2">
										<div className={`w-3 h-3 rounded-full ${testMode ? 'bg-green-500' : 'bg-gray-400'}`}></div>
										<span className="text-sm font-medium">{testMode ? 'Active' : 'Inactive'}</span>
									</div>
								</div>

								{/* Progress Bar */}
								{testRunning && (
									<div className="space-y-2">
										<div className="flex justify-between text-sm">
											<span>Test Progress</span>
											<span>{Math.round(testProgress)}%</span>
										</div>
										<Progress percent={testProgress} status="active" />
									</div>
								)}

								{/* Test Results */}
								{testResult && (
									<Card size="small" className="border-green-200 bg-green-50">
										<div className="text-sm font-medium text-green-800 mb-2">Test Results</div>
										<div className="grid grid-cols-2 gap-4 text-sm">
											<div>
												<span className="text-gray-600">Total Messages:</span>
												<span className="ml-2 font-medium">{testResult.performanceMetrics?.totalMessages}</span>
											</div>
											<div>
												<span className="text-gray-600">Success Rate:</span>
												<span className="ml-2 font-medium">{testResult.performanceMetrics?.successRate.toFixed(1)}%</span>
											</div>
											<div>
												<span className="text-gray-600">Avg Response:</span>
												<span className="ml-2 font-medium">{testResult.performanceMetrics?.averageResponseTime}ms</span>
											</div>
											<div>
												<span className="text-gray-600">Errors:</span>
												<span className="ml-2 font-medium text-red-600">{testResult.performanceMetrics?.errorCount}</span>
											</div>
										</div>
									</Card>
								)}

								{/* NF States */}
								{flowData && (
									<div>
										<h4 className="text-md font-semibold text-gray-700 mb-3">Network Function States</h4>
										<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
											{flowData.nodes.map((node) => (
												<Card key={node.id} size="small" className="border-l-4 border-l-blue-500">
													<div className="flex items-center justify-between mb-2">
														<span className="font-medium text-sm">{node.name}</span>
														<Tag color={
															node.state?.currentState === 'IDLE' ? 'default' :
															node.state?.currentState === 'PROCESSING' ? 'processing' :
															node.state?.currentState === 'WAITING_RESPONSE' ? 'warning' :
															node.state?.currentState === 'COMPLETED' ? 'success' :
															node.state?.currentState === 'ERROR' ? 'error' : 'default'
														}>
															{node.state?.currentState || 'UNKNOWN'}
														</Tag>
													</div>
													<div className="text-xs text-gray-500">
														Last Transition: {node.state?.lastTransition ?
															new Date(node.state.lastTransition).toLocaleTimeString() :
															'N/A'
														}
													</div>
													{node.state?.transitionHistory && node.state.transitionHistory.length > 0 && (
														<div className="mt-2">
															<div className="text-xs text-gray-600 mb-1">Recent Transitions:</div>
															<div className="max-h-16 overflow-y-auto">
																{node.state.transitionHistory.slice(-3).map((transition, idx) => (
																	<div key={idx} className="text-xs text-gray-500">
																		{transition.fromState} → {transition.toState}
																	</div>
																))}
															</div>
														</div>
													)}
												</Card>
											))}
										</div>
									</div>
								)}
							</div>
						</div>
					</Tabs.TabPane>

					<Tabs.TabPane tab="Message Flows" key="messages">
						<div className="overflow-y-auto" style={{ height: 'calc(25vh - 80px)' }}>
							<div className="p-4 space-y-3">
								<h3 className="text-lg font-semibold text-gray-800">Message Flow Log</h3>

								{messageFlows.length === 0 ? (
									<div className="text-center py-8 text-gray-500">
										<MessageOutlined style={{ fontSize: 48, opacity: 0.3 }} />
										<div className="mt-2">No messages to display</div>
										<div className="text-sm">Start a test to see message flows</div>
									</div>
								) : (
									<div className="space-y-2">
										{messageFlows.map((message, index) => (
											<Card key={index} size="small" className={`border-l-4 ${
												message.status === 'ERROR' ? 'border-l-red-500 bg-red-50' :
												message.status === 'PROCESSED' ? 'border-l-green-500 bg-red-50' :
												message.status === 'SENT' ? 'border-l-blue-500 bg-blue-50' :
												'border-l-yellow-500 bg-yellow-50'
											}`}>
												<div className="flex items-start justify-between">
													<div className="flex-1">
														<div className="flex items-center gap-2 mb-1">
															<Tag color={
																message.status === 'ERROR' ? 'red' :
																message.status === 'PROCESSED' ? 'green' :
																message.status === 'SENT' ? 'blue' : 'yellow'
															}>
																{message.status}
															</Tag>
															<span className="text-xs font-medium">{message.messageId}</span>
														</div>
														<div className="text-sm text-gray-700 mb-1">
															<span className="font-medium">{message.fromNode}</span>
															<span className="mx-2">→</span>
															<span className="font-medium">{message.toNode}</span>
														</div>
														<div className="text-xs text-gray-500">
															{new Date(message.timestamp).toLocaleString()}
															{message.responseTime && (
																<span className="ml-2">• {message.responseTime}ms</span>
															)}
														</div>
													</div>
													<Button size="small" type="text" icon={<SettingOutlined />} />
												</div>

												{message.errorMessage && (
													<Alert
														message={message.errorMessage}
														type="error"
														showIcon
														className="mt-2"
													/>
												)}
											</Card>
										))}
									</div>
								)}
							</div>
						</div>
					</Tabs.TabPane>

					<Tabs.TabPane tab="PCF Policy Engine" key="pcf">
						<div className="overflow-y-auto" style={{ height: 'calc(25vh - 80px)' }}>
							<div className="p-4 space-y-4">
								<h3 className="text-lg font-semibold text-gray-800">PCF Policy Evaluation</h3>

								{flowData?.nodes.find(n => n.nfType === 'PCF')?.pcfConfig ? (
									<div className="space-y-4">
										{/* Policy Rules */}
										<div>
											<h4 className="text-md font-semibold text-gray-700 mb-3">Active Policy Rules</h4>
											<div className="space-y-2">
												{flowData.nodes.find(n => n.nfType === 'PCF')?.pcfConfig?.policyRules?.map((rule) => (
													<Card key={rule.id} size="small" className="border-l-4 border-l-purple-500">
														<div className="flex items-center justify-between mb-2">
															<span className="font-medium">{rule.name}</span>
															<div className="flex items-center gap-2">
																<Switch checked={rule.enabled} size="small" disabled />
																<Tag color="purple">Priority: {rule.priority}</Tag>
															</div>
														</div>
														<div className="text-sm text-gray-600 mb-2">{rule.description}</div>

														{/* Conditions */}
														{rule.conditions.length > 0 && (
															<div className="mb-2">
																<div className="text-xs font-medium text-gray-700 mb-1">Conditions:</div>
																<div className="flex flex-wrap gap-1">
																	{rule.conditions.map((condition, idx) => (
																		<Tag key={idx} >
																			{condition.type} {condition.operator} {JSON.stringify(condition.value)}
																		</Tag>
																	))}
																</div>
															</div>
														)}

														{/* Actions */}
														{rule.actions.length > 0 && (
															<div>
																<div className="text-xs font-medium text-gray-700 mb-1">Actions:</div>
																<div className="flex flex-wrap gap-1">
																	{rule.actions.map((action, idx) => (
																		<Tag key={idx} color="blue" >
																			{action.type}
																		</Tag>
																	))}
																</div>
															</div>
														)}
													</Card>
												)) || (
													<div className="text-gray-500 text-sm text-center py-4">
														No policy rules configured
													</div>
												)}
											</div>
										</div>

										{/* QoS Configuration */}
										<Card size="small" title="QoS Configuration" className="border-l-4 border-l-green-500">
											<div className="grid grid-cols-2 gap-4 text-sm">
												<div>
													<span className="text-gray-600">Max Bitrate:</span>
													<span className="ml-2 font-medium">
														{flowData.nodes.find(n => n.nfType === 'PCF')?.pcfConfig?.qosConfig?.maxBitrate} Mbps
													</span>
												</div>
												<div>
													<span className="text-gray-600">Guaranteed Bitrate:</span>
													<span className="ml-2 font-medium">
														{flowData.nodes.find(n => n.nfType === 'PCF')?.pcfConfig?.qosConfig?.guaranteedBitrate} Mbps
													</span>
												</div>
												<div>
													<span className="text-gray-600">Priority Level:</span>
													<span className="ml-2 font-medium">
														{flowData.nodes.find(n => n.nfType === 'PCF')?.pcfConfig?.qosConfig?.priorityLevel}
													</span>
												</div>
												<div>
													<span className="text-gray-600">QCI:</span>
													<span className="ml-2 font-medium">
														{flowData.nodes.find(n => n.nfType === 'PCF')?.pcfConfig?.qosConfig?.qci}
													</span>
												</div>
											</div>
										</Card>
									</div>
								) : (
									<div className="text-center py-8 text-gray-500">
										<ThunderboltOutlined style={{ fontSize: 48, opacity: 0.3 }} />
										<div className="mt-2">PCF not configured</div>
										<div className="text-sm">Configure PCF policies to see evaluation details</div>
									</div>
								)}
							</div>
						</div>
					</Tabs.TabPane>
				</Tabs>
			</div>
		</div>
	);
}