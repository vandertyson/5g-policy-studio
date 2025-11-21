import React, { useCallback, useState, useRef } from 'react';
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
import { CloseOutlined, AppstoreOutlined, NodeIndexOutlined, BranchesOutlined, ApiOutlined, ArrowUpOutlined, ArrowDownOutlined, ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Card, Input, Select } from 'antd';
import type { FlowData } from '~/types/flow.types';

interface PolicyFlowGraphProps {
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
const NODE_SPACING = 200; // Horizontal spacing between NF nodes
const STEP_LABEL_WIDTH = 150; // Width reserved for step label on left

// Custom Node Component (Network Function)
const NetworkNode = ({ data, selected }: NodeProps) => {
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
			{data.label}
		</div>
	);
};

// Custom Process Component
const ProcessNode = ({ data, selected }: NodeProps) => {
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
			{/* Handles for connecting edges - all 4 sides (hidden from user) */}
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
		</div>
	);
};

// Custom Step Lane Component (horizontal swim lane)
const StepLane = ({ data, selected }: NodeProps) => {
	// Calculate dynamic width based on actual node positions
	// Width should extend from step start (x=50) to the rightmost node + node width + padding
	// If we have lastNodeX, use it; otherwise estimate
	const lastNodeX = data.lastNodeX || (250 + (data.nodeCount - 1) * 150); // First node at 250, then +150 per node
	const dynamicWidth = lastNodeX - 50 + NODE_WIDTH + 100; // From step position to last node + node width + padding
	
	// Calculate dynamic height based on max processes in any column
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
				background: 'rgba(59, 130, 246, 0.05)',
				border: '2px solid rgba(59, 130, 246, 0.2)',
				borderRadius: 8,
				paddingLeft: 16,
				paddingRight: 16,
				paddingTop: 32,
				paddingBottom: 8,
				fontSize: 13,
				fontWeight: 600,
				color: '#6B21A8',
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
			{/* Step label - positioned at top left */}
			<div
				style={{
					position: 'absolute',
					left: 16,
					top: 8,
					fontWeight: 600,
					fontSize: 11,
					color: '#3B82F6',
				}}
			>
				Step {data.stepNumber}: {data.label}
			</div>
		</div>
	);
};

// API Request Edge (custom edge with label)
const RemoteCallEdge = ({ data, selected }: NodeProps) => {
	return (
		<div
			className={`relative ${selected ? 'ring-2 ring-orange-500' : ''}`}
			style={{
				background: '#FFF7ED',
				border: '2px solid #6B7280',
				borderRadius: 6,
				padding: '4px 8px',
				fontSize: 10,
				fontWeight: 500,
				color: '#374151',
				textAlign: 'center',
				whiteSpace: 'nowrap',
				boxShadow: selected ? '0 2px 6px rgba(249, 115, 22, 0.3)' : 'none rgba(0, 0, 0, 0.1)',
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
			{data.label}
		</div>
	);
};

// Vertical Line from Node (thin dashed line extending down from each node)
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
	networkNode: NetworkNode,
	processNode: ProcessNode,
	stepLane: StepLane,
	remoteCall: RemoteCallEdge,
	verticalLine: VerticalNodeLine,
};

// Function to convert FlowData to ReactFlow nodes and edges
const convertFlowDataToReactFlow = (
	flowData: FlowData,
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
		gradient: '#3B82F6',
		lineColor: 'rgba(59, 130, 246, 0.15)',
	}));
	
	// Create Network Nodes (top row) and their vertical lines
	nodePositions.forEach((nodePos) => {
		nodes.push({
			id: nodePos.id,
			type: 'networkNode',
			position: { x: nodePos.x, y: 20 },
			data: {
				label: nodePos.label,
				gradient: nodePos.gradient,
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
	
	// Create Steps
	flowData.steps.forEach((step, index) => {
		const stepY = 120 + (index * 100);
		
		// Calculate max processes in this step
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
				onDelete: onDeleteNode ? () => onDeleteNode(step.id) : undefined,
				onMoveUp: onMoveStepUp ? () => onMoveStepUp(step.id) : undefined,
				onMoveDown: onMoveStepDown ? () => onMoveStepDown(step.id) : undefined,
			},
			draggable: false,
		});
	});
	
	// Create Processes
	flowData.processes.forEach((process) => {
		const nodePos = nodePositions.find(np => np.id === process.nodeId);
		if (!nodePos) return;
		
		const stepIndex = flowData.steps.findIndex(s => s.id === process.stepId);
		if (stepIndex === -1) return;
		
		const stepY = 120 + (stepIndex * 100);
		
		// Adjust process position to account for step label padding (32px top + 8px gap)
		const adjustedY = process.position.y < stepY + 40 ? stepY + 40 : process.position.y;
		
		nodes.push({
			id: process.id,
			type: 'processNode',
			position: { x: process.position.x, y: adjustedY },
			data: {
				label: process.label,
				background: process.type === 'sender' ? '#BFDBFE' : process.type === 'receiver' ? '#E5E7EB' : '#F3F4F6',
				borderColor: process.type === 'sender' ? '#3B82F6' : process.type === 'receiver' ? '#6B7280' : '#9CA3AF',
				color: process.type === 'sender' ? '#1E40AF' : process.type === 'receiver' ? '#374151' : '#374151',
				onDelete: onDeleteNode ? () => onDeleteNode(process.id) : undefined,
			},
			draggable: false,
		});
	});
	
	// Create edges for API calls - group by step and find sender-receiver pairs
	const apiCallsByStep = new Map<string, any[]>();
	
	flowData.processes.forEach((process) => {
		if (process.apiType === 'request') {
			const stepProcesses = apiCallsByStep.get(process.stepId) || [];
			stepProcesses.push(process);
			apiCallsByStep.set(process.stepId, stepProcesses);
		}
	});
	
	// Create edges for each sender-receiver pair in each step
	apiCallsByStep.forEach((processes, stepId) => {
		const senders = processes.filter(p => p.type === 'sender');
		const receivers = processes.filter(p => p.type === 'receiver');
		
		// Pair each sender with receiver (simple pairing by index for now)
		senders.forEach((sender, index) => {
			const receiver = receivers[index]; // Pair by index in same step
			
			if (receiver) {
				// Get actual node positions
				const senderNode = nodes.find(n => n.id === sender.id);
				const receiverNode = nodes.find(n => n.id === receiver.id);
				
				if (senderNode && receiverNode) {
					const senderPos = { x: senderNode.position.x, y: senderNode.position.y };
					const receiverPos = { x: receiverNode.position.x, y: receiverNode.position.y };
					
					// Determine best handles based on positions
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
					
					edges.push({
						id: `edge-${sender.id}-${receiver.id}`,
						source: sender.id,
						target: receiver.id,
						sourceHandle,
						targetHandle,
						type: 'smoothstep',
						animated: true,
						style: { stroke: '#3B82F6', strokeWidth: 2 },
						markerEnd: { type: MarkerType.ArrowClosed, color: '#3B82F6' },
						label: sender.method || 'API',
						labelStyle: { fill: '#3B82F6', fontWeight: 600, fontSize: 11 },
						labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9 },
						labelBgPadding: [4, 6] as [number, number],
						labelBgBorderRadius: 4,
					});
				}
			}
		});
	});
	
	return { nodes, edges, nodePositions };
};

export default function PolicyFlowGraph({ policyId, flowData, onProcessNodeSelect, onNFNodeSelect, onStepSelect }: PolicyFlowGraphProps) {
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
	// Track API requests and their responses
	const [apiRequests, setApiRequests] = useState<Record<string, { requestEdgeId: string, responseEdgeId: string | null, fromNodeId: string, toNodeId: string, stepId: string }>>({});
	// Track process count per NF node
	const [nodeProcessCounters, setNodeProcessCounters] = useState<Record<string, number>>({});

	// Update step lane widths when nodes change
	const updateStepLaneWidths = useCallback((currentNodes: Node[]) => {
		const networkNodes = currentNodes.filter(n => n.type === 'networkNode');
		const networkNodeCount = networkNodes.length;
		
		// Find the rightmost node's X position
		const lastNodeX = networkNodes.length > 0 
			? Math.max(...networkNodes.map(n => n.position.x))
			: 250;
		
		setNodes((nds) =>
			nds.map((node) => {
				if (node.type === 'stepLane') {
					return {
						...node,
						data: {
							...node.data,
							nodeCount: networkNodeCount,
							lastNodeX: lastNodeX,
						},
					};
				}
				return node;
			})
		);
	}, [setNodes]);

	// Update step lane heights based on max processes in any column
	const updateStepLaneHeights = useCallback((currentNodes: Node[]) => {
		const networkNodes = currentNodes.filter(n => n.type === 'networkNode');
		const stepLanes = currentNodes.filter(n => n.type === 'stepLane').sort((a, b) => a.position.y - b.position.y);
		
		// Calculate max processes for each step
		const stepHeights = new Map<string, { height: number; maxProcesses: number }>();
		stepLanes.forEach((step, index) => {
			let maxProcessesInColumn = 0;
			
			networkNodes.forEach(networkNode => {
				const nodeX = networkNode.position.x;
				
				// Count processes in this column for this step (using parentId)
				const processesInColumn = currentNodes.filter(n => {
					if (n.type !== 'processNode' || n.parentId !== step.id) return false;
					const absoluteX = n.position.x + step.position.x;
					return Math.abs(absoluteX - nodeX) < 20; // Same column
				}).length;
				
				maxProcessesInColumn = Math.max(maxProcessesInColumn, processesInColumn);
			});
			
			const calculatedHeight = maxProcessesInColumn > 0
				? 20 + maxProcessesInColumn * PROCESS_HEIGHT + (maxProcessesInColumn - 1) * PROCESS_VERTICAL_GAP + 20 + 20
				: STEP_MIN_HEIGHT + 20;
			stepHeights.set(step.id, { height: calculatedHeight, maxProcesses: maxProcessesInColumn });
		});
		
		// Calculate cumulative Y positions for steps
		let cumulativeY = stepLanes.length > 0 ? stepLanes[0].position.y : 120;
		const stepPositions = new Map<string, number>();
		
		stepLanes.forEach((step, index) => {
			if (index === 0) {
				stepPositions.set(step.id, step.position.y);
			} else {
				const prevStepId = stepLanes[index - 1].id;
				const prevHeightInfo = stepHeights.get(prevStepId);
				const prevHeight = prevHeightInfo ? prevHeightInfo.height : STEP_MIN_HEIGHT;
				cumulativeY = cumulativeY + prevHeight + 20; // 20px gap between steps
				stepPositions.set(step.id, cumulativeY);
			}
		});
		
		setNodes((nds) => {
			return nds.map((node) => {
				if (node.type === 'stepLane') {
					const newY = stepPositions.get(node.id);
					const heightInfo = stepHeights.get(node.id);
					
					return {
						...node,
						position: {
							...node.position,
							y: newY !== undefined ? newY : node.position.y,
						},
						data: {
							...node.data,
							maxProcessesInColumn: heightInfo ? heightInfo.maxProcesses : 0,
						},
					};
				}
				// Process nodes with parentId will automatically move with their parent
				return node;
			});
		});
	}, [setNodes]);

	const handleDeleteNode = useCallback((nodeId: string) => {
		setNodes((nds) => {
			// Check if deleting a process node
			const deletedProcess = nds.find(n => n.id === nodeId && n.type === 'processNode');
			if (deletedProcess) {
				// Check if this is part of an API request/response pair
				const nodesToDelete = new Set<string>([nodeId]);
				
				// Find associated API request/response
				for (const [requestId, apiRequest] of Object.entries(apiRequests)) {
					const senderId = `sender-${requestId}`;
					const receiverId = `receiver-${requestId}`;
					const responseSenderId = `sender-${requestId}-resp`;
					const responseReceiverId = `receiver-${requestId}-resp`;
					
					// If deleting request sender or receiver, delete entire request and response
					if (nodeId === senderId || nodeId === receiverId) {
						nodesToDelete.add(senderId);
						nodesToDelete.add(receiverId);
						if (apiRequest.responseEdgeId) {
							nodesToDelete.add(responseSenderId);
							nodesToDelete.add(responseReceiverId);
						}
						// Also delete from apiRequests state
						setApiRequests(prev => {
							const newReqs = { ...prev };
							delete newReqs[requestId];
							return newReqs;
						});
						// Delete edges
						setEdges(eds => eds.filter(e => 
							e.id !== apiRequest.requestEdgeId && e.id !== apiRequest.responseEdgeId
						));
						break;
					}
					
					// If deleting response sender or receiver, delete only response
					if (nodeId === responseSenderId || nodeId === responseReceiverId) {
						nodesToDelete.add(responseSenderId);
						nodesToDelete.add(responseReceiverId);
						// Update apiRequests to remove responseEdgeId
						setApiRequests(prev => ({
							...prev,
							[requestId]: { ...prev[requestId], responseEdgeId: null }
						}));
						// Delete response edge and update request edge back to red
						setEdges(eds => {
							const updatedEdges = eds.filter(e => e.id !== apiRequest.responseEdgeId)
								.map(e => {
									if (e.id === apiRequest.requestEdgeId) {
										return {
											...e,
											style: { stroke: '#EF4444', strokeWidth: 2.5 },
											markerEnd: { type: MarkerType.ArrowClosed, color: '#EF4444', width: 20, height: 20 },
											labelStyle: { fill: '#EF4444', fontWeight: 600, fontSize: 11 },
											labelBgStyle: { fill: '#FEF2F2', fillOpacity: 0.9 },
										};
									}
									return e;
								});
							return updatedEdges;
						});
						break;
					}
				}
				
				// Process node deletion - need to restack remaining processes
				const deletedX = deletedProcess.position.x;
				const deletedY = deletedProcess.position.y;
				
				// Find the step this process belongs to
				const allSteps = nds.filter(n => n.type === 'stepLane').sort((a, b) => a.position.y - b.position.y);
				const parentStepIndex = allSteps.findIndex((step, index) => {
					const stepY = step.position.y;
					const nextStepY = index < allSteps.length - 1 ? allSteps[index + 1].position.y : stepY + 500;
					return deletedY >= stepY + 10 && deletedY < nextStepY;
				});
				
				if (parentStepIndex >= 0) {
					const parentStep = allSteps[parentStepIndex];
					const stepY = parentStep.position.y;
					const nextStepY = parentStepIndex < allSteps.length - 1 
						? allSteps[parentStepIndex + 1].position.y 
					: stepY + 500;
				
				// Remove the process(es)
				let newNodes = nds.filter((node) => !nodesToDelete.has(node.id));
				
				// Find all processes in the same column below the deleted process in the same step
				const processesToShift = newNodes.filter(n => {
					if (n.type !== 'processNode' || n.parentId !== parentStep.id) return false;
					const absoluteX = n.position.x + parentStep.position.x;
					const absoluteY = n.position.y + parentStep.position.y;
					return Math.abs(absoluteX - deletedX) < 20 && absoluteY > deletedY;
				});
				
				// Shift them up by one process height + gap
				if (processesToShift.length > 0) {
					newNodes = newNodes.map(node => {
						if (processesToShift.some(p => p.id === node.id)) {
							return {
								...node,
								position: {
									...node.position,
									y: node.position.y - (PROCESS_HEIGHT + PROCESS_VERTICAL_GAP)
								}
							};
						}
						return node;
					});
				}
					
					// Update step heights
					setTimeout(() => updateStepLaneHeights(newNodes), 0);
					return newNodes;
			}
			
			// If no parent step found, just delete
			const newNodes = nds.filter((node) => !nodesToDelete.has(node.id));
			setTimeout(() => updateStepLaneHeights(newNodes), 0);
			return newNodes;
		}			// Find the node being deleted (network node)
			const deletedNode = nds.find(n => n.id === nodeId && n.type === 'networkNode');
			if (!deletedNode) {
				// Not a network node or process node, check if step
				const isStep = nds.find(n => n.id === nodeId && n.type === 'stepLane');
				if (isStep) {
					// Delete step and all processes in it
					const allSteps = nds.filter(n => n.type === 'stepLane').sort((a, b) => a.position.y - b.position.y);
					const stepIndex = allSteps.findIndex(s => s.id === nodeId);
					
					if (stepIndex >= 0) {
						const stepY = allSteps[stepIndex].position.y;
						const nextStepY = stepIndex < allSteps.length - 1 
							? allSteps[stepIndex + 1].position.y 
							: stepY + 500;
						
						// Delete step label, background, and all processes
						const newNodes = nds.filter((node) => {
							// Delete step background and label
							if (node.id === nodeId || node.id === `${nodeId}-bg`) {
								return false;
							}
							// Delete processes in this step
							if (node.type === 'processNode' && 
								node.position.y >= stepY + 10 && 
								node.position.y < nextStepY) {
								return false;
							}
							return true;
						});
						setTimeout(() => updateStepLaneHeights(newNodes), 0);
						return newNodes;
					}
				}
				
				// Generic delete
				const newNodes = nds.filter((node) => node.id !== nodeId);
				setTimeout(() => updateStepLaneWidths(newNodes), 0);
				return newNodes;
			}
			
			// Network node deletion is disabled - just return unchanged nodes
			return nds;
		});
	}, [setNodes, updateStepLaneHeights, apiRequests, setApiRequests, setEdges]);

	// Move step up/down
	const handleMoveStep = useCallback((stepId: string, direction: 'up' | 'down') => {
		setNodes((nds) => {
			const steps = nds.filter(n => n.type === 'stepLane').sort((a, b) => a.position.y - b.position.y);
			const stepIndex = steps.findIndex(s => s.id === stepId);
			
			let shouldSwap = false;
			let swapIndex = -1;
			
			if (direction === 'up' && stepIndex > 0) {
				shouldSwap = true;
				swapIndex = stepIndex - 1;
			} else if (direction === 'down' && stepIndex < steps.length - 1) {
				shouldSwap = true;
				swapIndex = stepIndex + 1;
			}
			
			if (!shouldSwap) return nds;
			
			// Get the current step and the step to swap with
			const currentStep = steps[stepIndex];
			const swapStep = steps[swapIndex];
			
			const currentStepY = currentStep.position.y;
			const swapStepY = swapStep.position.y;
			
			// Calculate how much each step will move
			const currentStepDelta = swapStepY - currentStepY;
			const swapStepDelta = currentStepY - swapStepY;
			
			// Collect processes belonging to each step BEFORE making any changes
			const currentStepProcessIds = new Set<string>();
			const swapStepProcessIds = new Set<string>();
			
			nds.forEach(node => {
				if (node.type === 'processNode') {
					const processY = node.position.y;
					
					// Determine which step this process belongs to by checking Y ranges
					for (let i = 0; i < steps.length; i++) {
						const step = steps[i];
						const stepStart = step.position.y;
						const stepEnd = i < steps.length - 1 ? steps[i + 1].position.y : stepStart + 500;
						
						if (processY >= stepStart + 10 && processY < stepEnd) {
							if (step.id === currentStep.id) {
								currentStepProcessIds.add(node.id);
							} else if (step.id === swapStep.id) {
								swapStepProcessIds.add(node.id);
							}
							break;
						}
					}
				}
			});
			
			// Update nodes: swap steps and move their processes by the same delta
			const updatedNodes = nds.map(node => {
				// Move current step
				if (node.id === currentStep.id) {
					return { ...node, position: { ...node.position, y: currentStepY + currentStepDelta } };
				}
				
				// Move swap step
				if (node.id === swapStep.id) {
					return { ...node, position: { ...node.position, y: swapStepY + swapStepDelta } };
				}
				
				// Move processes based on which step they belong to
				if (node.type === 'processNode') {
					if (currentStepProcessIds.has(node.id)) {
						return { 
							...node, 
							position: { 
								...node.position, 
								y: node.position.y + currentStepDelta 
							} 
						};
					}
					
					if (swapStepProcessIds.has(node.id)) {
						return { 
							...node, 
							position: { 
								...node.position, 
								y: node.position.y + swapStepDelta 
							} 
						};
					}
				}
				
				return node;
			});
			
			// After swapping, recalculate all step positions to ensure proper spacing
			setTimeout(() => updateStepLaneHeights(updatedNodes), 0);
			return updatedNodes;
		});
	}, [setNodes, updateStepLaneHeights]);

	// Move node (column) left/right
	const handleMoveNode = useCallback((nodeId: string, direction: 'left' | 'right') => {
		setNodes((nds) => {
			const networkNodes = nds.filter(n => n.type === 'networkNode').sort((a, b) => a.position.x - b.position.x);
			const nodeIndex = networkNodes.findIndex(n => n.id === nodeId);
			
			if (direction === 'left' && nodeIndex > 0) {
				// Swap with node on left
				const currentNode = networkNodes[nodeIndex];
				const leftNode = networkNodes[nodeIndex - 1];
				const currentX = currentNode.position.x;
				const leftX = leftNode.position.x;
				const deltaX = currentX - leftX;
				
				return nds.map(node => {
					// Move current node column (node, line, processes) to left
					if (node.id === nodeId || 
						node.id === `${nodeId}-line` || 
						(node.type === 'processNode' && Math.abs(node.position.x - currentX) < 20)) {
						return { ...node, position: { ...node.position, x: node.position.x - deltaX } };
					}
					// Move left node column to right
					if (node.id === leftNode.id || 
						node.id === `${leftNode.id}-line` || 
						(node.type === 'processNode' && Math.abs(node.position.x - leftX) < 20)) {
						return { ...node, position: { ...node.position, x: node.position.x + deltaX } };
					}
					return node;
				});
			} else if (direction === 'right' && nodeIndex < networkNodes.length - 1) {
				// Swap with node on right
				const currentNode = networkNodes[nodeIndex];
				const rightNode = networkNodes[nodeIndex + 1];
				const currentX = currentNode.position.x;
				const rightX = rightNode.position.x;
				const deltaX = rightX - currentX;
				
				return nds.map(node => {
					// Move current node column to right
					if (node.id === nodeId || 
						node.id === `${nodeId}-line` || 
						(node.type === 'processNode' && Math.abs(node.position.x - currentX) < 20)) {
						return { ...node, position: { ...node.position, x: node.position.x + deltaX } };
					}
					// Move right node column to left
					if (node.id === rightNode.id || 
						node.id === `${rightNode.id}-line` || 
						(node.type === 'processNode' && Math.abs(node.position.x - rightX) < 20)) {
						return { ...node, position: { ...node.position, x: node.position.x - deltaX } };
					}
					return node;
				});
			}
			return nds;
		});
		
		// Update nodePositions state
		setNodePositions((positions) => {
			const sorted = [...positions].sort((a, b) => a.x - b.x);
			const nodeIndex = sorted.findIndex(n => n.id === nodeId);
			
			if (direction === 'left' && nodeIndex > 0) {
				[sorted[nodeIndex], sorted[nodeIndex - 1]] = [sorted[nodeIndex - 1], sorted[nodeIndex]];
				// Swap x positions
				const tempX = sorted[nodeIndex].x;
				sorted[nodeIndex].x = sorted[nodeIndex - 1].x;
				sorted[nodeIndex - 1].x = tempX;
			} else if (direction === 'right' && nodeIndex < sorted.length - 1) {
				[sorted[nodeIndex], sorted[nodeIndex + 1]] = [sorted[nodeIndex + 1], sorted[nodeIndex]];
				// Swap x positions
				const tempX = sorted[nodeIndex].x;
				sorted[nodeIndex].x = sorted[nodeIndex + 1].x;
				sorted[nodeIndex + 1].x = tempX;
			}
			return sorted;
		});
	}, [setNodes, setNodePositions]);

	const onConnect = useCallback(
		(params: Connection) => setEdges((eds) => addEdge(params, eds)),
		[setEdges]
	);

	// Handle selection changes
	const onSelectionChange = useCallback((params: any) => {
		const selectedNodes = params.nodes || [];
		const stepNode = selectedNodes.find((n: Node) => n.type === 'stepLane');
		const processNode = selectedNodes.find((n: Node) => n.type === 'processNode');
		const nfNode = selectedNodes.find((n: Node) => n.type === 'networkNode');
		
		setSelectedStepId(stepNode ? stepNode.id : null);
		setSelectedProcessNode(processNode || null);
		
		// Notify parent component - priority: process > nf > step
		if (processNode && onProcessNodeSelect) {
			onProcessNodeSelect(processNode);
		} else if (nfNode && onNFNodeSelect) {
			onNFNodeSelect(nfNode);
			// Clear other selections
			if (onProcessNodeSelect) onProcessNodeSelect(null);
		} else if (stepNode && onStepSelect) {
			onStepSelect(stepNode);
			// Clear other selections
			if (onProcessNodeSelect) onProcessNodeSelect(null);
			if (onNFNodeSelect) onNFNodeSelect(null);
		} else {
			// Clear all selections
			if (onProcessNodeSelect) onProcessNodeSelect(null);
			if (onNFNodeSelect) onNFNodeSelect(null);
			if (onStepSelect) onStepSelect(null);
		}
	}, [onProcessNodeSelect, onNFNodeSelect, onStepSelect]);

	const onDragOver = useCallback((event: DragEvent) => {
		event.preventDefault();
		event.dataTransfer.dropEffect = 'move';
	}, []);

	// Toggle step form
	const handleAddStepToggle = useCallback(() => {
		setShowStepForm(!showStepForm);
		if (!showStepForm) {
			setNewStepName('');
		}
	}, [showStepForm]);

	// Confirm adding step from modal
	const handleConfirmAddStep = useCallback(() => {
		if (!newStepName.trim()) {
			alert('Please enter a step name');
			return;
		}

		const steps = nodes.filter(n => n.type === 'stepLane').sort((a, b) => a.position.y - b.position.y);
		
		// Calculate Y position for new step based on last step's height
		let newY = 120; // Default starting position
		if (steps.length > 0) {
			const lastStep = steps[steps.length - 1];
			const lastStepHeight = lastStep.data.maxProcessesInColumn > 0
				? 20 + lastStep.data.maxProcessesInColumn * PROCESS_HEIGHT + (lastStep.data.maxProcessesInColumn - 1) * PROCESS_VERTICAL_GAP + 20 + 20
				: STEP_MIN_HEIGHT + 20;
			newY = lastStep.position.y + lastStepHeight + 20; // 20px gap
		}
		
		const newId = `step-${stepCounter}`;
		
		const networkNodes = nodes.filter(n => n.type === 'networkNode');
		const lastNodeX = networkNodes.length > 0 
			? Math.max(...networkNodes.map(n => n.position.x))
			: 250;
		
		const newStepNode: Node = {
			id: newId,
			type: 'stepLane',
			position: { x: 50, y: newY },
			data: {
				stepNumber: stepCounter,
				label: newStepName.trim(),
				nodeCount: networkNodes.length,
				lastNodeX: lastNodeX,
				maxProcessesInColumn: 0, // No processes initially
				onDelete: () => handleDeleteNode(newId),
				onMoveUp: () => handleMoveStepUp(newId),
				onMoveDown: () => handleMoveStepDown(newId),
			},
			draggable: false,
		};
		
		setNodes((nds) => [...nds, newStepNode]);
		setStepCounter(stepCounter + 1);
		setShowStepForm(false);
		setNewStepName('');
	}, [nodes, stepCounter, newStepName, handleDeleteNode, setNodes]);

	// Move step up with validation
	const handleMoveStepUp = useCallback((stepId: string) => {
		const steps = nodes.filter(n => n.type === 'stepLane').sort((a, b) => a.position.y - b.position.y);
		const currentIndex = steps.findIndex(s => s.id === stepId);
		
		if (currentIndex <= 0) return; // Already at top
		
		// Check if any API response in the step above would violate the rule
		const stepAbove = steps[currentIndex - 1];
		const currentStep = steps[currentIndex];
		
		// Find all API requests where response is in step above and request is in current or below
		for (const [requestId, apiRequest] of Object.entries(apiRequests)) {
			if (apiRequest.responseEdgeId) {
				// Find response sender nodes (they have 'sender-' prefix with '-resp' in the middle)
				const responseSenderNodes = nodes.filter(n => 
					n.id.includes(requestId) && n.id.includes('resp') && n.id.includes('sender')
				);
				
				// Check if response is in step above
				const responseInStepAbove = responseSenderNodes.some(n => n.parentId === stepAbove.id);
				
				if (responseInStepAbove && apiRequest.stepId === currentStep.id) {
					alert('Cannot move step up: API Response in the step above must come after its Request!');
					return;
				}
			}
		}
		
		// Swap positions and move all child processes
		const stepAboveY = stepAbove.position.y;
		const currentStepY = currentStep.position.y;
		
		setNodes(nds => {
			return nds.map(n => {
				// Swap the step lanes
				if (n.id === stepId) {
					return { ...n, position: { ...n.position, y: stepAboveY } };
				}
				if (n.id === stepAbove.id) {
					return { ...n, position: { ...n.position, y: currentStepY } };
				}
				
				// Move child processes of current step up
				if (n.parentId === stepId) {
					const deltaY = stepAboveY - currentStepY;
					return { ...n, position: { ...n.position, y: n.position.y + deltaY } };
				}
				
				// Move child processes of step above down
				if (n.parentId === stepAbove.id) {
					const deltaY = currentStepY - stepAboveY;
					return { ...n, position: { ...n.position, y: n.position.y + deltaY } };
				}
				
				return n;
			});
		});
	}, [nodes, apiRequests, setNodes]);

	// Move step down with validation
	const handleMoveStepDown = useCallback((stepId: string) => {
		const steps = nodes.filter(n => n.type === 'stepLane').sort((a, b) => a.position.y - b.position.y);
		const currentIndex = steps.findIndex(s => s.id === stepId);
		
		if (currentIndex < 0 || currentIndex >= steps.length - 1) return; // Already at bottom
		
		// Check if any API request in current step has response in step below
		const currentStep = steps[currentIndex];
		const stepBelow = steps[currentIndex + 1];
		
		// Find all API requests in current step that have responses in step below
		for (const [requestId, apiRequest] of Object.entries(apiRequests)) {
			if (apiRequest.responseEdgeId && apiRequest.stepId === currentStep.id) {
				// Find response sender nodes
				const responseSenderNodes = nodes.filter(n => 
					n.id.includes(requestId) && n.id.includes('resp') && n.id.includes('sender')
				);
				
				// Check if response is in step below
				const responseInStepBelow = responseSenderNodes.some(n => n.parentId === stepBelow.id);
				
				if (responseInStepBelow) {
					alert('Cannot move step down: API Request must come before its Response!');
					return;
				}
			}
		}
		
		// Swap positions and move all child processes
		const currentStepY = currentStep.position.y;
		const stepBelowY = stepBelow.position.y;
		
		setNodes(nds => {
			return nds.map(n => {
				// Swap the step lanes
				if (n.id === stepId) {
					return { ...n, position: { ...n.position, y: stepBelowY } };
				}
				if (n.id === stepBelow.id) {
					return { ...n, position: { ...n.position, y: currentStepY } };
				}
				
				// Move child processes of current step down
				if (n.parentId === stepId) {
					const deltaY = stepBelowY - currentStepY;
					return { ...n, position: { ...n.position, y: n.position.y + deltaY } };
				}
				
				// Move child processes of step below up
				if (n.parentId === stepBelow.id) {
					const deltaY = currentStepY - stepBelowY;
					return { ...n, position: { ...n.position, y: n.position.y + deltaY } };
				}
				
				return n;
			});
		});
	}, [nodes, apiRequests, setNodes]);

	// Initialize flow data
	React.useEffect(() => {
		if (flowData) {
			// Use provided flow data
			const reactFlowData = convertFlowDataToReactFlow(flowData, handleDeleteNode, handleMoveStepUp, handleMoveStepDown);
			setNodes(reactFlowData.nodes);
			setEdges(reactFlowData.edges);
			setNodePositions(reactFlowData.nodePositions);
		} else {
			// Empty flow
			setNodes([]);
			setEdges([]);
			setNodePositions([]);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [policyId, flowData]);

	// Toggle node form
	const handleAddNodeToggle = useCallback(() => {
		setShowNodeForm(!showNodeForm);
		if (!showNodeForm) {
			setNewNodeName('');
			setNewNodeType('');
		}
	}, [showNodeForm]);

	// Confirm adding node from form
	const handleConfirmAddNode = useCallback(() => {
		if (!newNodeName.trim()) {
			alert('Please enter a node name');
			return;
		}
		if (!newNodeType) {
			alert('Please select an NF type');
			return;
		}

		const newX = nodePositions.length > 0 
			? nodePositions[nodePositions.length - 1].x + NODE_SPACING 
			: 250;
		
		const newId = `node-${nodeCounter}`;
		const gradient = '#3B82F6';
		const lineColor = 'rgba(59, 130, 246, 0.15)';
		
		const newNodePos = { id: newId, x: newX, label: newNodeName.trim(), gradient, lineColor };
		setNodePositions([...nodePositions, newNodePos]);
		
		const networkNode: Node = {
			id: newId,
			type: 'networkNode',
			position: { x: newX, y: 20 },
			data: {
				label: newNodeName.trim(),
				nfType: newNodeType,
				gradient,
				onDelete: () => handleDeleteNode(newId),
			},
			draggable: false,
		};
		
		const verticalLine: Node = {
			id: `${newId}-line`,
			type: 'verticalLine',
			position: { x: newX + NODE_WIDTH / 2 - 1, y: 90 },
			data: {
				height: 400,
				color: lineColor,
			},
			selectable: false,
			draggable: false,
		};
		
		setNodes((nds) => {
			const newNodes = [...nds, networkNode, verticalLine];
			setTimeout(() => updateStepLaneWidths(newNodes), 0);
			return newNodes;
		});
		setNodeCounter(nodeCounter + 1);
		setShowNodeForm(false);
		setNewNodeName('');
		setNewNodeType('');
	}, [nodePositions, nodeCounter, newNodeName, newNodeType, handleDeleteNode, updateStepLaneWidths, setNodes, showNodeForm]);

	// Add process at specific node column
	const handleAddProcessAtNode = useCallback((nodeId: string) => {
		if (!selectedStepId) return;
		
		const selectedStep = nodes.find(n => n.id === selectedStepId);
		if (!selectedStep) return;
		
		const targetNode = nodePositions.find(np => np.id === nodeId);
		if (!targetNode) return;
		
		// Center process box on the vertical dashed line (node center - half process width)
		const alignedX = targetNode.x + NODE_WIDTH / 2 - 60; // 60 is half of process box width (120px)
		const stepY = selectedStep.position.y;
		
		// Find next step Y to determine the range
		const allSteps = nodes.filter(n => n.type === 'stepLane').sort((a, b) => a.position.y - b.position.y);
		const currentStepIndex = allSteps.findIndex(s => s.id === selectedStepId);
		const nextStepY = currentStepIndex >= 0 && currentStepIndex < allSteps.length - 1 
			? allSteps[currentStepIndex + 1].position.y 
			: stepY + 500;
		
		// Find existing processes in this step/column to calculate stack position
		const existingProcessesInColumn = nodes.filter(n => {
			if (n.type !== 'processNode' || n.parentId !== selectedStepId) return false;
			const absoluteX = n.position.x + selectedStep.position.x;
			return Math.abs(absoluteX - alignedX) < 20; // Same column (within 20px tolerance)
		});
		
		const stackIndex = existingProcessesInColumn.length;
		// Position relative to parent step (not absolute)
		const relativeX = alignedX - selectedStep.position.x;
		const relativeY = 32 + (stackIndex * (PROCESS_HEIGHT + PROCESS_VERTICAL_GAP));
		
		// Get current counter for this node, default to 1
		const currentCounter = nodeProcessCounters[nodeId] || 1;
		const nfLabel = targetNode.label; // e.g., "UE", "AMF", "PCF"
		
		const newId = `process-${processCounter}`;
		const newNode: Node = {
			id: newId,
			type: 'processNode',
			position: { x: relativeX, y: relativeY },
			draggable: false,
			parentId: selectedStepId,
			extent: 'parent' as const,
			data: {
				label: `${nfLabel} Process ${currentCounter}`,
				background: '#F3F4F6',
				borderColor: '#6B7280',
				color: '#1F2937',
				onDelete: () => handleDeleteNode(newId),
			},
		};
		
		setNodes((nds) => {
			const newNodes = [...nds, newNode];
			// Update step lanes with new process count
			setTimeout(() => updateStepLaneHeights(newNodes), 0);
			return newNodes;
		});
		setProcessCounter(processCounter + 1);
		// Increment counter for this specific node
		setNodeProcessCounters(prev => ({
			...prev,
			[nodeId]: currentCounter + 1
		}));
		setShowProcessMenu(false);
	}, [selectedStepId, nodes, nodePositions, processCounter, nodeProcessCounters, handleDeleteNode, setNodes, updateStepLaneHeights]);

	// Helper function to calculate closest handles between two nodes
	const getClosestHandles = useCallback((sourcePos: { x: number, y: number }, targetPos: { x: number, y: number }) => {
		const dx = targetPos.x - sourcePos.x;
		const dy = targetPos.y - sourcePos.y;
		
		let sourceHandle = 'right';
		let targetHandle = 'left';
		
		// Horizontal distance is greater than vertical
		if (Math.abs(dx) > Math.abs(dy)) {
			if (dx > 0) {
				// Target is to the right
				sourceHandle = 'right';
				targetHandle = 'left';
			} else {
				// Target is to the left
				sourceHandle = 'left';
				targetHandle = 'right';
			}
		} else {
			// Vertical distance is greater
			if (dy > 0) {
				// Target is below
				sourceHandle = 'bottom';
				targetHandle = 'top';
			} else {
				// Target is above
				sourceHandle = 'top';
				targetHandle = 'bottom';
			}
		}
		
		return { sourceHandle, targetHandle };
	}, []);

	const handleAddApiRequest = useCallback(() => {
		if (!selectedStepId || !fromNodeId || !toNodeId || fromNodeId === toNodeId) return;
		
		const selectedStep = nodes.find(n => n.id === selectedStepId);
		if (!selectedStep) return;
		
		const fromNode = nodePositions.find(np => np.id === fromNodeId);
		const toNode = nodePositions.find(np => np.id === toNodeId);
		if (!fromNode || !toNode) return;
		
		// Get NF labels
		const fromNFNode = nodes.find(n => n.id === fromNodeId);
		const toNFNode = nodes.find(n => n.id === toNodeId);
		const fromLabel = fromNFNode?.data?.label || 'NF';
		const toLabel = toNFNode?.data?.label || 'NF';
		
		const stepY = selectedStep.position.y;
		
		// Find next step Y to determine the range
		const allSteps = nodes.filter(n => n.type === 'stepLane').sort((a, b) => a.position.y - b.position.y);
		const currentStepIndex = allSteps.findIndex(s => s.id === selectedStepId);
		const nextStepY = currentStepIndex >= 0 && currentStepIndex < allSteps.length - 1 
			? allSteps[currentStepIndex + 1].position.y 
			: stepY + 500;
		
		// Calculate positions for sender (from node column)
		const senderX = fromNode.x + NODE_WIDTH / 2 - 40; // 40 is half of 80px minWidth
		const senderExistingProcesses = nodes.filter(n => {
			if (n.type !== 'processNode' || n.parentId !== selectedStepId) return false;
			const absoluteX = n.position.x + selectedStep.position.x;
			return Math.abs(absoluteX - senderX) < 20;
		});
		const senderStackIndex = senderExistingProcesses.length;
		const senderY = selectedStep.position.y + 32 + (senderStackIndex * (PROCESS_HEIGHT + PROCESS_VERTICAL_GAP));
		
		// Calculate positions for receiver (to node column)
		const receiverX = toNode.x + NODE_WIDTH / 2 - 40; // 40 is half of 80px minWidth
		const receiverExistingProcesses = nodes.filter(n => {
			if (n.type !== 'processNode' || n.parentId !== selectedStepId) return false;
			const absoluteX = n.position.x + selectedStep.position.x;
			return Math.abs(absoluteX - receiverX) < 20;
		});
		const receiverStackIndex = receiverExistingProcesses.length;
		const receiverY = selectedStep.position.y + 32 + (receiverStackIndex * (PROCESS_HEIGHT + PROCESS_VERTICAL_GAP));
		
		const requestId = `api-req-${apiRequestCounter}`;
		const senderId = `sender-${requestId}`;
		const receiverId = `receiver-${requestId}`;
		const edgeId = `edge-${requestId}`;
		
		// Convert to relative positions
		const senderRelativeX = senderX - selectedStep.position.x;
		const senderRelativeY = senderY - selectedStep.position.y;
		const receiverRelativeX = receiverX - selectedStep.position.x;
		const receiverRelativeY = receiverY - selectedStep.position.y;
		
		// Create Sender process
		const senderNode: Node = {
			id: senderId,
			type: 'processNode',
			position: { x: senderRelativeX, y: senderRelativeY },
			draggable: false,
			parentId: selectedStepId,
			extent: 'parent' as const,
			data: {
				label: `${fromLabel} Sender`,
				background: '#BFDBFE',
				borderColor: '#3B82F6',
				color: '#1E40AF',
				onDelete: () => {
					// Delete both sender and receiver
					const responseSenderId = `sender-${requestId}-resp`;
					const responseReceiverId = `receiver-${requestId}-resp`;
					setNodes((nds) => nds.filter((n) => 
						n.id !== senderId && 
						n.id !== receiverId && 
						n.id !== responseSenderId && 
						n.id !== responseReceiverId
					));
					// Delete request edge and response edge if exists
					setEdges((eds) => eds.filter((e) => {
						const req = apiRequests[requestId];
						return e.id !== edgeId && (!req?.responseEdgeId || e.id !== req.responseEdgeId);
					}));
					setApiRequests(prev => {
						const newReqs = { ...prev };
						delete newReqs[requestId];
						return newReqs;
					});
				},
			},
		};
		
		// Create Receiver process
		const receiverNode: Node = {
			id: receiverId,
			type: 'processNode',
			position: { x: receiverRelativeX, y: receiverRelativeY },
			draggable: false,
			parentId: selectedStepId,
			extent: 'parent' as const,
			data: {
				label: `${toLabel} Receiver`,
				background: '#E5E7EB',
				borderColor: '#6B7280',
				color: '#374151',
				onDelete: () => {
					// Delete both sender and receiver
					const responseSenderId = `sender-${requestId}-resp`;
					const responseReceiverId = `receiver-${requestId}-resp`;
					setNodes((nds) => nds.filter((n) => 
						n.id !== senderId && 
						n.id !== receiverId && 
						n.id !== responseSenderId && 
						n.id !== responseReceiverId
					));
					// Delete request edge and response edge if exists
					setEdges((eds) => eds.filter((e) => {
						const req = apiRequests[requestId];
						return e.id !== edgeId && (!req?.responseEdgeId || e.id !== req.responseEdgeId);
					}));
					setApiRequests(prev => {
						const newReqs = { ...prev };
						delete newReqs[requestId];
						return newReqs;
					});
				},
			},
		};
		
		// Calculate closest handles
		const senderPos = { x: senderX, y: senderY };
		const receiverPos = { x: receiverX, y: receiverY };
		const handles = getClosestHandles(senderPos, receiverPos);
		
		// Create edge (animated arrow) - RED if no response yet
		const newEdge: Edge = {
			id: edgeId,
			source: senderId,
			target: receiverId,
			sourceHandle: handles.sourceHandle,
			targetHandle: handles.targetHandle,
			type: 'smoothstep',
			animated: true,
			style: { stroke: '#EF4444', strokeWidth: 2.5 }, // Red for request without response
			markerEnd: { type: MarkerType.ArrowClosed, color: '#EF4444', width: 20, height: 20 },
			label: `API Req ${apiRequestCounter}`,
			labelStyle: { fill: '#EF4444', fontWeight: 600, fontSize: 11 },
			labelBgStyle: { fill: '#FEF2F2', fillOpacity: 0.9 },
		};
		
		setNodes((nds) => {
			const newNodes = [...nds, senderNode, receiverNode];
			// Update step heights after adding remote call boxes
			setTimeout(() => updateStepLaneHeights(newNodes), 10);
			return newNodes;
		});
		
		// Add edge after nodes are added
		setTimeout(() => {
			setEdges((eds) => [...eds, newEdge]);
		}, 100);
		
		// Track this API request
		setApiRequests(prev => ({
			...prev,
			[requestId]: {
				requestEdgeId: edgeId,
				responseEdgeId: null,
				fromNodeId,
				toNodeId,
				stepId: selectedStepId
			}
		}));
		
		setApiRequestCounter(apiRequestCounter + 1);
		
		// Reset form
		setFromNodeId('');
		setToNodeId('');
		setShowApiRequestForm(false);
	}, [selectedStepId, fromNodeId, toNodeId, nodes, nodePositions, apiRequestCounter, setNodes, setEdges, updateStepLaneHeights]);

	const handleAddApiResponse = useCallback(() => {
		if (!selectedRequestId || !selectedStepId) return;
		
		const apiRequest = apiRequests[selectedRequestId];
		if (!apiRequest || apiRequest.responseEdgeId) return; // Already has response
		
		const selectedStep = nodes.find(n => n.id === selectedStepId);
		if (!selectedStep) return;
		
		// Validate that response step is after request step
		const allSteps = nodes.filter(n => n.type === 'stepLane').sort((a, b) => a.position.y - b.position.y);
		const requestStep = nodes.find(n => n.id === apiRequest.stepId);
		if (!requestStep) return;
		
		if (selectedStep.position.y <= requestStep.position.y) {
			alert('Response step must be after the request step!');
			return;
		}
		
		const fromNode = nodePositions.find(np => np.id === apiRequest.toNodeId); // Response goes reverse direction
		const toNode = nodePositions.find(np => np.id === apiRequest.fromNodeId);
		if (!fromNode || !toNode) return;
		
		// Get NF labels (reversed for response)
		const fromNFNode = nodes.find(n => n.id === apiRequest.toNodeId);
		const toNFNode = nodes.find(n => n.id === apiRequest.fromNodeId);
		const fromLabel = fromNFNode?.data?.label || 'NF';
		const toLabel = toNFNode?.data?.label || 'NF';
		
		const stepY = selectedStep.position.y;
		
		// Find next step Y
		const currentStepIndex = allSteps.findIndex(s => s.id === selectedStepId);
		const nextStepY = currentStepIndex >= 0 && currentStepIndex < allSteps.length - 1 
			? allSteps[currentStepIndex + 1].position.y 
			: stepY + 500;
		
		// Calculate positions for sender (reverse direction)
		const senderX = fromNode.x + NODE_WIDTH / 2 - 40;
		const senderExistingProcesses = nodes.filter(n => {
			if (n.type !== 'processNode' || n.parentId !== selectedStepId) return false;
			const absoluteX = n.position.x + selectedStep.position.x;
			return Math.abs(absoluteX - senderX) < 20;
		});
		const senderStackIndex = senderExistingProcesses.length;
		const senderY = selectedStep.position.y + 32 + (senderStackIndex * (PROCESS_HEIGHT + PROCESS_VERTICAL_GAP));
		
		// Calculate positions for receiver
		const receiverX = toNode.x + NODE_WIDTH / 2 - 40;
		const receiverExistingProcesses = nodes.filter(n => {
			if (n.type !== 'processNode' || n.parentId !== selectedStepId) return false;
			const absoluteX = n.position.x + selectedStep.position.x;
			return Math.abs(absoluteX - receiverX) < 20;
		});
		const receiverStackIndex = receiverExistingProcesses.length;
		const receiverY = selectedStep.position.y + 32 + (receiverStackIndex * (PROCESS_HEIGHT + PROCESS_VERTICAL_GAP));
		
		const responseId = `${selectedRequestId}-resp`;
		const senderId = `sender-${responseId}`;
		const receiverId = `receiver-${responseId}`;
		const edgeId = `edge-${responseId}`;
		
		// Convert to relative positions
		const senderRelativeX = senderX - selectedStep.position.x;
		const senderRelativeY = senderY - selectedStep.position.y;
		const receiverRelativeX = receiverX - selectedStep.position.x;
		const receiverRelativeY = receiverY - selectedStep.position.y;
		
		// Create Sender process
		const senderNode: Node = {
			id: senderId,
			type: 'processNode',
			position: { x: senderRelativeX, y: senderRelativeY },
			draggable: false,
			parentId: selectedStepId,
			extent: 'parent' as const,
			data: {
				label: `${fromLabel} Sender`,
				background: '#BFDBFE',
				borderColor: '#3B82F6',
				color: '#1E40AF',
				onDelete: () => {
					// Delete both sender and receiver of response
					setNodes((nds) => nds.filter((n) => n.id !== senderId && n.id !== receiverId));
					// Delete response edge and update request edge back to red
					setEdges((eds) => eds.filter((e) => e.id !== edgeId).map(e => {
						if (e.id === apiRequest.requestEdgeId) {
							return {
								...e,
								style: { stroke: '#EF4444', strokeWidth: 2.5 },
								markerEnd: { type: MarkerType.ArrowClosed, color: '#EF4444', width: 20, height: 20 },
								labelStyle: { fill: '#EF4444', fontWeight: 600, fontSize: 11 },
								labelBgStyle: { fill: '#FEF2F2', fillOpacity: 0.9 },
							};
						}
						return e;
					}));
					setApiRequests(prev => ({
						...prev,
						[selectedRequestId]: { ...prev[selectedRequestId], responseEdgeId: null }
					}));
				},
			},
		};
		
		// Create Receiver process
		const receiverNode: Node = {
			id: receiverId,
			type: 'processNode',
			position: { x: receiverRelativeX, y: receiverRelativeY },
			draggable: false,
			parentId: selectedStepId,
			extent: 'parent' as const,
			data: {
				label: `${toLabel} Receiver`,
				background: '#E5E7EB',
				borderColor: '#6B7280',
				color: '#374151',
				onDelete: () => {
					// Delete both sender and receiver of response
					setNodes((nds) => nds.filter((n) => n.id !== senderId && n.id !== receiverId));
					// Delete response edge and update request edge back to red
					setEdges((eds) => eds.filter((e) => e.id !== edgeId).map(e => {
						if (e.id === apiRequest.requestEdgeId) {
							return {
								...e,
								style: { stroke: '#EF4444', strokeWidth: 2.5 },
								markerEnd: { type: MarkerType.ArrowClosed, color: '#EF4444', width: 20, height: 20 },
								labelStyle: { fill: '#EF4444', fontWeight: 600, fontSize: 11 },
								labelBgStyle: { fill: '#FEF2F2', fillOpacity: 0.9 },
							};
						}
						return e;
					}));
					setApiRequests(prev => ({
						...prev,
						[selectedRequestId]: { ...prev[selectedRequestId], responseEdgeId: null }
					}));
				},
			},
		};
		
		// Calculate closest handles
		const senderPos = { x: senderX, y: senderY };
		const receiverPos = { x: receiverX, y: receiverY };
		const handles = getClosestHandles(senderPos, receiverPos);
		
		// Create response edge - GREEN
		const newEdge: Edge = {
			id: edgeId,
			source: senderId,
			target: receiverId,
			sourceHandle: handles.sourceHandle,
			targetHandle: handles.targetHandle,
			type: 'smoothstep',
			animated: true,
			style: { stroke: '#10B981', strokeWidth: 2.5 },
			markerEnd: { type: MarkerType.ArrowClosed, color: '#10B981', width: 20, height: 20 },
			label: `API Resp ${selectedRequestId.split('-')[2]}`,
			labelStyle: { fill: '#10B981', fontWeight: 600, fontSize: 11 },
			labelBgStyle: { fill: '#ECFDF5', fillOpacity: 0.9 },
		};
		
		setNodes((nds) => {
			const newNodes = [...nds, senderNode, receiverNode];
			setTimeout(() => updateStepLaneHeights(newNodes), 10);
			return newNodes;
		});
		
		setTimeout(() => {
			setEdges((eds) => {
				// Update request edge to green
				const updatedEdges = eds.map(e => {
					if (e.id === apiRequest.requestEdgeId) {
						return {
							...e,
							style: { stroke: '#10B981', strokeWidth: 2.5 },
							markerEnd: { type: MarkerType.ArrowClosed, color: '#10B981', width: 20, height: 20 },
							labelStyle: { ...e.labelStyle, fill: '#10B981' },
							labelBgStyle: { fill: '#ECFDF5', fillOpacity: 0.9 },
						};
					}
					return e;
				});
				return [...updatedEdges, newEdge];
			});
		}, 100);
		
		// Update API request tracking
		setApiRequests(prev => ({
			...prev,
			[selectedRequestId]: { ...prev[selectedRequestId], responseEdgeId: edgeId }
		}));
		
		// Reset form
		setSelectedRequestId('');
		setShowApiResponseForm(false);
	}, [selectedRequestId, selectedStepId, apiRequests, nodes, nodePositions, setNodes, setEdges, updateStepLaneHeights]);

	const onDrop = useCallback(
		(event: DragEvent) => {
			event.preventDefault();

			const type = event.dataTransfer.getData('application/reactflow');
			if (!type || !reactFlowInstance) return;

			// Only allow Process and API Request drops, and only when a step is selected
			if (!selectedStepId) return;
			if (type !== 'process' && type !== 'remoteCall') return;

			const position = reactFlowInstance.screenToFlowPosition({
				x: event.clientX,
				y: event.clientY,
			});

			// Find the selected step
			const selectedStep = nodes.find(n => n.id === selectedStepId);
			if (!selectedStep) return;

			if (type === 'process') {
				// Find closest vertical line (node column)
				let closestNodePos = nodePositions[0];
				let minNodeDist = Math.abs(position.x - nodePositions[0].x);
				nodePositions.forEach(nodePos => {
					const dist = Math.abs(position.x - nodePos.x);
					if (dist < minNodeDist) {
						minNodeDist = dist;
						closestNodePos = nodePos;
					}
				});
				
				// Center process box on the vertical dashed line (node center - half process width)
				const alignedX = closestNodePos.x + NODE_WIDTH / 2 - 60; // 60 is half of process box width (120px)
				const alignedY = selectedStep.position.y + 32;
				
				const newId = `process-${processCounter}`;
				const newNode: Node = {
					id: newId,
					type: 'processNode',
					position: { x: alignedX, y: alignedY },
					draggable: false,
					data: {
						label: 'New Process',
						background: '#F3F4F6',
						borderColor: '#6B7280',
						color: '#1F2937',
						onDelete: () => handleDeleteNode(newId),
					},
			};
			setProcessCounter(processCounter + 1);
			setNodes((nds) => nds.concat(newNode));
		}
	},
	[reactFlowInstance, nodes, nodePositions, selectedStepId, processCounter, handleDeleteNode, setNodes]
);	const onDragStart = (event: DragEvent, nodeType: string) => {
		event.dataTransfer.setData('application/reactflow', nodeType);
		event.dataTransfer.effectAllowed = 'move';
	};

	return (
		<div className="relative w-full h-full">
			<div ref={reactFlowWrapper} className="w-full h-full">
				<ReactFlow
					nodes={nodes}
					edges={edges}
					onNodesChange={onNodesChange}
					onEdgesChange={onEdgesChange}
					onConnect={onConnect}
					onInit={setReactFlowInstance}
					onDrop={onDrop}
					onDragOver={onDragOver}
					onSelectionChange={onSelectionChange}
					nodeTypes={nodeTypes}
					nodesDraggable={true}
					nodesConnectable={false}
					elementsSelectable={true}
					fitView
					attributionPosition="bottom-right"
					className="bg-gradient-to-br from-gray-50 to-gray-100"
				>
					<Background 
						variant={BackgroundVariant.Dots} 
						gap={GRID_SIZE} 
						size={1.5} 
						color="#94a3b8" 
						style={{ opacity: 0.3 }}
					/>
					<Controls className="bg-white border border-gray-200 rounded-lg shadow-lg" />
					<MiniMap 
						nodeColor={(node) => {
							if (node.type === 'networkNode') return '#667eea';
							if (node.type === 'stepLane') return '#8B5CF6';
							if (node.type === 'processNode') return '#10B981';
							if (node.type === 'verticalLine') return '#94A3B8';
							return '#94A3B8';
						}}
						maskColor="rgba(0, 0, 0, 0.05)"
						className="bg-white border border-gray-200 rounded-lg shadow-lg"
					/>
				</ReactFlow>
			</div>

			{/* Toolbox - anchored at bottom with 2 sections */}
			<div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
				<div className="flex gap-4">
					{/* Flows Section - always enabled */}
					<Card 
						className="shadow-2xl border-2 border-blue-400 bg-white transition-all"
						bodyStyle={{ padding: '12px 16px' }}
					>
						<div className="flex flex-col gap-2">
							<div className="text-xs font-bold text-blue-600 mb-1">FLOWS</div>
							<div className="flex gap-2">
								{/* Add Step with form */}
								<div className="relative">
									<div
										onClick={handleAddStepToggle}
										className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg border-2 border-blue-300 hover:bg-blue-50 cursor-pointer hover:scale-105 transition-all"
										style={{ minWidth: 90 }}
									>
										<div style={{ fontSize: 24, color: '#8B5CF6' }}>
											<AppstoreOutlined />
										</div>
										<span className="text-xs font-medium text-gray-700">
											Step
										</span>
									</div>
									
									{/* Add Step Form */}
									{showStepForm && (
										<div 
											className="absolute bottom-full left-0 mb-2 bg-white border-2 border-blue-300 rounded-lg shadow-xl z-50 min-w-[280px] p-4"
										>
											<div className="text-xs font-bold text-gray-500 mb-3">Create New Step</div>
											
											<div className="space-y-3">
												{/* Step Number */}
												<div>
													<label className="block text-xs font-medium text-gray-700 mb-1">Step Number</label>
													<div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded">
														<span className="text-lg font-bold text-blue-600">{stepCounter}</span>
													</div>
												</div>
												
												{/* Step Name Input */}
												<div>
													<label className="block text-xs font-medium text-gray-700 mb-1">Step Name</label>
													<Input
														placeholder="Enter step name"
														value={newStepName}
														onChange={(e) => setNewStepName(e.target.value)}
														onPressEnter={handleConfirmAddStep}
														autoFocus
														size="small"
													/>
												</div>
												
												{/* Action Buttons */}
												<div className="flex gap-2 pt-2">
													<button
														onClick={handleConfirmAddStep}
														className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 rounded transition-colors"
													>
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
								
								{/* Add Node with form */}
								<div className="relative">
									<div
										onClick={handleAddNodeToggle}
										className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg border-2 border-blue-300 hover:bg-blue-50 cursor-pointer hover:scale-105 transition-all"
										style={{ minWidth: 90 }}
									>
										<div style={{ fontSize: 24, color: '#3B82F6' }}>
											<NodeIndexOutlined />
										</div>
										<span className="text-xs font-medium text-gray-700">
											Node
										</span>
									</div>
									
									{/* Add Node Form */}
									{showNodeForm && (
										<div 
											className="absolute bottom-full left-0 mb-2 bg-white border-2 border-blue-300 rounded-lg shadow-xl z-50 min-w-[280px] p-4"
										>
											<div className="text-xs font-bold text-gray-500 mb-3">Create New Node</div>
											
											<div className="space-y-3">
												{/* Node Name Input */}
												<div>
													<label className="block text-xs font-medium text-gray-700 mb-1">Node Name</label>
													<Input
														placeholder="Enter node name"
														value={newNodeName}
														onChange={(e) => setNewNodeName(e.target.value)}
														onPressEnter={handleConfirmAddNode}
														autoFocus
														size="small"
													/>
												</div>
												
												{/* NF Type Select */}
												<div>
													<label className="block text-xs font-medium text-gray-700 mb-1">NF Type</label>
													<Select
														placeholder="Select NF Type"
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
														]}
													/>
												</div>
												
												{/* Action Buttons */}
												<div className="flex gap-2 pt-2">
													<button
														onClick={handleConfirmAddNode}
														className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 rounded transition-colors"
													>
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

					{/* Steps Section - enabled when a step IS selected */}
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
								{/* Add Process with dropdown menu */}
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
									
									{/* Dropdown menu */}
									{showProcessMenu && selectedStepId !== null && (
										<div 
											className="absolute bottom-full left-0 mb-2 bg-white border-2 border-green-300 rounded-lg shadow-xl z-50 min-w-[120px]"
										>
											<div className="text-xs font-bold text-gray-500 px-3 py-2 border-b">Select NF</div>
											<div className="py-1">
												{nodePositions.map((nodePos) => (
													<button
														key={nodePos.id}
														onClick={() => handleAddProcessAtNode(nodePos.id)}
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
								
								{/* API Request with form */}
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
										<div 
											className="absolute bottom-full left-0 mb-2 bg-white border-2 border-orange-300 rounded-lg shadow-xl z-50 min-w-[200px] p-4"
										>
											<div className="text-xs font-bold text-gray-500 mb-3">Create API Request</div>
											
											<div className="space-y-3">
												{/* From NF Select */}
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
												
												{/* To NF Select */}
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
												
												{/* Action Buttons */}
												<div className="flex gap-2 pt-2">
													<button
														onClick={handleAddApiRequest}
														disabled={!fromNodeId || !toNodeId || fromNodeId === toNodeId}
														className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded transition-colors"
													>
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
								
								{/* API Response with form */}
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
										<div 
											className="absolute bottom-full left-0 mb-2 bg-white border-2 border-green-300 rounded-lg shadow-xl z-50 min-w-[200px] p-4"
										>
											<div className="text-xs font-bold text-gray-500 mb-3">Create API Response</div>
											
											<div className="space-y-3">
												{/* Select API Request */}
												<div>
													<label className="block text-xs font-medium text-gray-700 mb-1">API Request</label>
													<select
														value={selectedRequestId}
														onChange={(e) => setSelectedRequestId(e.target.value)}
														className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-300"
													>
														<option value="">Select...</option>
														{Object.entries(apiRequests)
															.filter(([_, req]) => {
																// Filter: no response yet, and request step is before current step
																if (req.responseEdgeId) return false;
																const requestStep = nodes.find(n => n.id === req.stepId);
																const currentStep = nodes.find(n => n.id === selectedStepId);
																if (!requestStep || !currentStep) return false;
																return requestStep.position.y < currentStep.position.y;
															})
															.map(([id, req]) => (
																<option key={id} value={id}>
																	{id} ({nodePositions.find(n => n.id === req.fromNodeId)?.label} → {nodePositions.find(n => n.id === req.toNodeId)?.label})
																</option>
															))}
													</select>
												</div>
												
												{/* Action Buttons */}
												<div className="flex gap-2 pt-2">
													<button
														onClick={handleAddApiResponse}
														disabled={!selectedRequestId}
														className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded transition-colors"
													>
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
		</div>
	);
}
