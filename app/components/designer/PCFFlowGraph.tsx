import React, { useCallback, useState, useRef, useEffect } from 'react';
import ReactFlow, {
	Background,
	BackgroundVariant,
	Controls,
	MiniMap,
	useNodesState,
	useEdgesState,
	MarkerType,
	Handle,
	Position,
	type Node,
	type Edge,
	type NodeProps,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
	CloseOutlined,
	ThunderboltOutlined,
	ExperimentOutlined,
	PlayCircleOutlined,
	StopOutlined,
	CheckCircleOutlined,
	ClockCircleOutlined,
	WarningOutlined,
} from '@ant-design/icons';
import { Card, Button, Tabs, Tag, Progress, Timeline, Collapse } from 'antd';
import type { 
	FlowData, 
	NFNodeProperties, 
	PolicyEvaluationTrace,
	PCFTestMetrics,
	ViewMode,
	FlowViewConfig 
} from '~/types/flow.types';

interface PCFFlowGraphProps {
	policyId: number;
	flowData?: FlowData;
	onNodeSelect?: (node: Node | null) => void;
}

const PCF_LANE_HEIGHT = 350;
const NETWORK_LANE_HEIGHT = 250;
const LANE_SPACING = 60;
const NODE_WIDTH = 180;
const NODE_HEIGHT = 80;
const NODE_SPACING = 250;

// PCF Logic Node - Enhanced with inline rule info
const PCFLogicNode = ({ data, selected }: NodeProps) => {
	const [expanded, setExpanded] = useState(false);
	
	return (
		<div
			className={`relative transition-all duration-200 ${
				selected ? 'ring-4 ring-blue-500 ring-offset-2 scale-105' : ''
			}`}
			style={{
				background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
				border: '3px solid #5a67d8',
				color: 'white',
				padding: '16px',
				borderRadius: 12,
				fontSize: 14,
				fontWeight: 600,
				minWidth: NODE_WIDTH,
				minHeight: NODE_HEIGHT,
				boxShadow: selected ? '0 8px 24px rgba(102, 126, 234, 0.4)' : '0 4px 12px rgba(102, 126, 234, 0.2)',
			}}
		>
			<Handle type="target" position={Position.Left} style={{ background: '#fff' }} />
			<Handle type="source" position={Position.Right} style={{ background: '#fff' }} />
			
			{selected && (
				<button
					className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg"
					onClick={(e) => {
						e.stopPropagation();
						data.onDelete?.();
					}}
				>
					<CloseOutlined style={{ fontSize: 12 }} />
				</button>
			)}

			<div className="flex items-center gap-2 mb-2">
				<ThunderboltOutlined style={{ fontSize: 18 }} />
				<div className="flex-1">
					<div className="font-bold text-sm">{data.label}</div>
					<div className="text-xs opacity-80">{data.processType || 'Policy Evaluation'}</div>
				</div>
			</div>

			{data.ruleCount > 0 && (
				<div className="mt-2 text-xs bg-white bg-opacity-20 rounded px-2 py-1">
					{data.ruleCount} rules configured
				</div>
			)}

			{data.evaluationTrace && (
				<div className="mt-2">
					<Tag color="success" className="text-xs">
						Last: {data.evaluationTrace.decision}
					</Tag>
				</div>
			)}
		</div>
	);
};

// Mock NF Node - Simplified, read-only
const MockNFNode = ({ data, selected }: NodeProps) => {
	return (
		<div
			className={`relative transition-all duration-200 ${
				selected ? 'ring-2 ring-gray-400' : ''
			}`}
			style={{
				background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
				border: '2px solid #9ca3af',
				color: '#374151',
				padding: '12px 16px',
				borderRadius: 8,
				fontSize: 12,
				fontWeight: 500,
				minWidth: 140,
				minHeight: 60,
				boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
				opacity: data.collapsed ? 0.5 : 1,
			}}
		>
			<Handle type="target" position={Position.Top} style={{ background: '#9ca3af' }} />
			<Handle type="source" position={Position.Bottom} style={{ background: '#9ca3af' }} />
			
			<div className="flex items-center justify-between">
				<div>
					<div className="font-semibold text-xs">{data.label}</div>
					<div className="text-xs text-gray-500 mt-1">{data.nfType}</div>
				</div>
				<Tag color="default" className="text-xs">Mock</Tag>
			</div>
		</div>
	);
};

// Decision Node
const DecisionNode = ({ data, selected }: NodeProps) => {
	return (
		<div
			className={`relative transition-all ${selected ? 'ring-4 ring-orange-500' : ''}`}
			style={{
				background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
				border: '3px solid #d97706',
				color: 'white',
				padding: '14px',
				borderRadius: 12,
				fontSize: 13,
				fontWeight: 600,
				minWidth: 160,
				minHeight: 70,
				boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
			}}
		>
			<Handle type="target" position={Position.Left} style={{ background: '#fff' }} />
			<Handle type="source" position={Position.Right} id="allow" style={{ background: '#10b981', top: '30%' }} />
			<Handle type="source" position={Position.Right} id="deny" style={{ background: '#ef4444', top: '70%' }} />
			
			<div className="text-center">
				<div className="font-bold">{data.label}</div>
				<div className="text-xs mt-1 opacity-90">{data.decisionType || 'Policy Decision'}</div>
			</div>
		</div>
	);
};

const nodeTypes = {
	pcfLogic: PCFLogicNode,
	mockNF: MockNFNode,
	decision: DecisionNode,
};

// Convert FlowData to dual-lane PCF-centric layout
const convertToPCFCentricLayout = (flowData: FlowData, viewConfig: FlowViewConfig) => {
	const nodes: Node[] = [];
	const edges: Edge[] = [];

	const pcfNodes = flowData.nodes.filter(n => n.nfType === 'PCF' || n.nodeRole === 'PCF_LOGIC');
	const mockNodes = flowData.nodes.filter(n => n.isMock || (n.nfType !== 'PCF' && n.nodeRole !== 'PCF_LOGIC'));

	// PCF Logic Lane (top)
	pcfNodes.forEach((nfNode, index) => {
		const pcfProcesses = flowData.processes.filter(p => 
			p.nodeId === nfNode.id && 
			(p.type === 'pcf_evaluation' || p.type === 'pcf_decision' || p.type === 'pcf_action')
		);

		pcfProcesses.forEach((process, pIndex) => {
			nodes.push({
				id: process.id,
				type: process.type === 'pcf_decision' ? 'decision' : 'pcfLogic',
				position: { 
					x: 100 + (index * NODE_SPACING) + (pIndex * (NODE_SPACING / 2)), 
					y: 100 
				},
				data: {
					label: process.label,
					processType: process.type,
					ruleCount: nfNode.pcfConfig?.policyRules?.length || 0,
					evaluationTrace: process.pcfProcessData?.evaluationTrace?.[0],
					onDelete: () => console.log('Delete', process.id),
				},
			});
		});
	});

	// Network Function Lane (bottom)
	if (!viewConfig.collapseMockNodes) {
		mockNodes.forEach((nfNode, index) => {
			nodes.push({
				id: nfNode.id,
				type: 'mockNF',
				position: { 
					x: 100 + (index * NODE_SPACING), 
					y: PCF_LANE_HEIGHT + LANE_SPACING 
				},
				data: {
					label: nfNode.name,
					nfType: nfNode.nfType,
					collapsed: viewConfig.mode === 'pcf_focus',
				},
			});
		});
	}

	// Create edges based on process connections
	flowData.processes.forEach((process) => {
		if (process.apiType === 'request') {
			const targetProcess = flowData.processes.find(p => 
				p.apiType === 'response' && p.stepId === process.stepId
			);
			
			if (targetProcess) {
				edges.push({
					id: `${process.id}-${targetProcess.id}`,
					source: process.id,
					target: targetProcess.id,
					type: 'smoothstep',
					animated: true,
					style: { stroke: '#667eea', strokeWidth: 3 },
					markerEnd: { type: MarkerType.ArrowClosed, color: '#667eea' },
				});
			}
		}
	});

	return { nodes, edges };
};

export default function PCFFlowGraph({ policyId, flowData, onNodeSelect }: PCFFlowGraphProps) {
	const [nodes, setNodes, onNodesChange] = useNodesState([]);
	const [edges, setEdges, onEdgesChange] = useEdgesState([]);
	const [viewConfig, setViewConfig] = useState<FlowViewConfig>({
		mode: 'full',
		showTimeline: true,
		showPCFMetrics: true,
		collapseMockNodes: false,
	});
	const [testMode, setTestMode] = useState(false);
	const [testRunning, setTestRunning] = useState(false);
	const [pcfMetrics, setPCFMetrics] = useState<PCFTestMetrics | null>(null);
	const [evaluationTraces, setEvaluationTraces] = useState<PolicyEvaluationTrace[]>([]);

	// Initialize layout
	useEffect(() => {
		if (flowData) {
			const layout = convertToPCFCentricLayout(flowData, viewConfig);
			setNodes(layout.nodes);
			setEdges(layout.edges);
		}
	}, [flowData, viewConfig]);

	const startTest = useCallback(async () => {
		setTestRunning(true);
		setTestMode(true);
		
		// Simulate PCF evaluation
		const traces: PolicyEvaluationTrace[] = [];
		
		// Mock evaluation traces
		setTimeout(() => {
			traces.push({
				timestamp: new Date().toISOString(),
				ruleId: 'rule-1',
				ruleName: 'QoS Premium Service',
				conditionsMet: true,
				actionsExecuted: ['MODIFY_QOS', 'CHARGE'],
				executionTime: 12,
				decision: 'ALLOW',
			});
			
			setEvaluationTraces(traces);
			setPCFMetrics({
				totalPolicyEvaluations: 5,
				rulesTriggered: { 'rule-1': 3, 'rule-2': 2 },
				averageEvaluationTime: 15,
				qosDecisions: 3,
				chargingEvents: 2,
				policyDenials: 0,
				evaluationTraces: traces,
			});
			
			setTestRunning(false);
		}, 2000);
	}, []);

	const stopTest = useCallback(() => {
		setTestRunning(false);
		setTestMode(false);
		setEvaluationTraces([]);
		setPCFMetrics(null);
	}, []);

	return (
		<div className="h-full flex flex-col bg-gray-50">
			{/* Header Controls */}
			<div className="bg-white border-b border-gray-200 p-3 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Tag color="purple" className="text-sm font-semibold">PCF Flow Designer</Tag>
					
					{/* View Mode Toggle */}
					<div className="flex gap-1 ml-4">
						<Button
							size="small"
							type={viewConfig.mode === 'full' ? 'primary' : 'default'}
							onClick={() => setViewConfig(prev => ({ ...prev, mode: 'full' }))}
						>
							Full Stack
						</Button>
						<Button
							size="small"
							type={viewConfig.mode === 'pcf_focus' ? 'primary' : 'default'}
							onClick={() => setViewConfig(prev => ({ ...prev, mode: 'pcf_focus' }))}
						>
							PCF Focus
						</Button>
					</div>
				</div>

				<div className="flex items-center gap-2">
					{!testRunning && !testMode && (
						<Button
							type="primary"
							icon={<PlayCircleOutlined />}
							onClick={startTest}
						>
							Test Flow
						</Button>
					)}
					{testRunning && (
						<Button
							danger
							icon={<StopOutlined />}
							onClick={stopTest}
						>
							Stop Test
						</Button>
					)}
					{testMode && !testRunning && (
						<Tag color="success" icon={<CheckCircleOutlined />}>
							Test Complete
						</Tag>
					)}
				</div>
			</div>

			<div className="flex-1 flex">
				{/* Main Flow Canvas */}
				<div className="flex-1 relative">
					{/* Lane Labels */}
					<div className="absolute top-4 left-4 z-10 space-y-2">
						<div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg shadow-lg font-semibold text-sm">
							PCF Logic Lane
						</div>
						{!viewConfig.collapseMockNodes && (
							<div 
								className="bg-gradient-to-r from-gray-400 to-gray-500 text-white px-4 py-2 rounded-lg shadow-lg font-semibold text-sm"
								style={{ marginTop: PCF_LANE_HEIGHT - 40 }}
							>
								Network Functions (Mock)
							</div>
						)}
					</div>

					<ReactFlow
						nodes={nodes}
						edges={edges}
						onNodesChange={onNodesChange}
						onEdgesChange={onEdgesChange}
						nodeTypes={nodeTypes}
						fitView
						className="bg-gradient-to-br from-gray-50 to-gray-100"
					>
						<Background variant={BackgroundVariant.Dots} gap={20} size={1} />
						<Controls className="bg-white shadow-lg rounded-lg" />
						<MiniMap
							nodeColor={(node) => {
								if (node.type === 'pcfLogic') return '#667eea';
								if (node.type === 'decision') return '#f59e0b';
								return '#9ca3af';
							}}
							className="bg-white shadow-lg rounded-lg"
						/>
					</ReactFlow>

					{/* Lane Divider */}
					{!viewConfig.collapseMockNodes && (
						<div 
							className="absolute left-0 right-0 border-t-2 border-dashed border-gray-300"
							style={{ top: PCF_LANE_HEIGHT + LANE_SPACING / 2 }}
						/>
					)}
				</div>

				{/* Timeline & Metrics Sidebar */}
				{viewConfig.showTimeline && (
					<div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
						<Tabs defaultActiveKey="timeline" className="h-full">
							<Tabs.TabPane tab="Execution Timeline" key="timeline">
								<div className="p-4">
									{evaluationTraces.length === 0 ? (
										<div className="text-center py-8 text-gray-400">
											<ClockCircleOutlined style={{ fontSize: 48 }} />
											<div className="mt-2">Run a test to see timeline</div>
										</div>
									) : (
										<Timeline
											items={evaluationTraces.map((trace) => ({
												color: trace.decision === 'ALLOW' ? 'green' : trace.decision === 'DENY' ? 'red' : 'blue',
												children: (
													<div>
														<div className="font-semibold text-sm">{trace.ruleName}</div>
														<div className="text-xs text-gray-500">
															{new Date(trace.timestamp).toLocaleTimeString()}
														</div>
														<Tag color={trace.conditionsMet ? 'success' : 'default'} className="mt-1">
															{trace.decision}
														</Tag>
														<div className="text-xs mt-1">
															{trace.actionsExecuted.join(', ')}
														</div>
														<div className="text-xs text-gray-400">
															{trace.executionTime}ms
														</div>
													</div>
												),
											}))}
										/>
									)}
								</div>
							</Tabs.TabPane>

							<Tabs.TabPane tab="PCF Metrics" key="metrics">
								<div className="p-4 space-y-4">
									{!pcfMetrics ? (
										<div className="text-center py-8 text-gray-400">
											<ExperimentOutlined style={{ fontSize: 48 }} />
											<div className="mt-2">No metrics available</div>
										</div>
									) : (
										<>
											<Card size="small" title="Policy Evaluation Stats">
												<div className="space-y-2 text-sm">
													<div className="flex justify-between">
														<span>Total Evaluations:</span>
														<span className="font-semibold">{pcfMetrics.totalPolicyEvaluations}</span>
													</div>
													<div className="flex justify-between">
														<span>Avg Time:</span>
														<span className="font-semibold">{pcfMetrics.averageEvaluationTime}ms</span>
													</div>
													<div className="flex justify-between">
														<span>QoS Decisions:</span>
														<span className="font-semibold">{pcfMetrics.qosDecisions}</span>
													</div>
													<div className="flex justify-between">
														<span>Charging Events:</span>
														<span className="font-semibold">{pcfMetrics.chargingEvents}</span>
													</div>
													<div className="flex justify-between">
														<span>Denials:</span>
														<span className="font-semibold text-red-500">{pcfMetrics.policyDenials}</span>
													</div>
												</div>
											</Card>

											<Card size="small" title="Rules Triggered">
												{Object.entries(pcfMetrics.rulesTriggered).map(([ruleId, count]) => (
													<div key={ruleId} className="mb-2">
														<div className="flex justify-between text-xs mb-1">
															<span>{ruleId}</span>
															<span className="font-semibold">{count}x</span>
														</div>
														<Progress 
															percent={(count / pcfMetrics.totalPolicyEvaluations) * 100} 
															size="small"
															showInfo={false}
														/>
													</div>
												))}
											</Card>
										</>
									)}
								</div>
							</Tabs.TabPane>
						</Tabs>
					</div>
				)}
			</div>
		</div>
	);
}
