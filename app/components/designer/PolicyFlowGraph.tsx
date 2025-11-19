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
	type Connection,
	type Edge,
	type Node,
	type NodeProps,
	type XYPosition,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { CloseOutlined, AppstoreOutlined, NodeIndexOutlined, BranchesOutlined, ApiOutlined, ArrowUpOutlined, ArrowDownOutlined, ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Card } from 'antd';

interface PolicyFlowGraphProps {
	policyId: number;
}

const STEP_HEIGHT = 80;
const STEP_MIN_HEIGHT = 80;
const PROCESS_HEIGHT = 50;
const PROCESS_VERTICAL_GAP = 10;
const NODE_HEIGHT = 60;
const GRID_SIZE = 20;
const NODE_WIDTH = 120;
const STEP_LABEL_WIDTH = 150; // Width reserved for step label on left

// Custom Node Component (Network Function)
const NetworkNode = ({ data, selected }: NodeProps) => {
	return (
		<div
			className={`relative transition-all duration-200 ${
				selected ? 'ring-2 ring-blue-500 ring-offset-2 scale-105' : ''
			}`}
			style={{
				background: data.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
				color: 'white',
				padding: '12px 24px',
				borderRadius: 8,
				fontSize: 13,
				fontWeight: 600,
				textAlign: 'center',
				minWidth: 100,
				boxShadow: selected ? '0 8px 16px rgba(59, 130, 246, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
			}}
		>
			{selected && (
				<>
					<button
						className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
						onClick={(e) => {
							e.stopPropagation();
							data.onDelete?.();
						}}
					>
						<CloseOutlined style={{ fontSize: 10 }} />
					</button>
					{/* Move buttons */}
					<div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-1">
						<button
							className="w-6 h-6 bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center justify-center shadow-md transition-all hover:scale-110"
							onClick={(e) => {
								e.stopPropagation();
								data.onMoveLeft?.();
							}}
							title="Move Left"
						>
							<ArrowLeftOutlined style={{ fontSize: 10 }} />
						</button>
						<button
							className="w-6 h-6 bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center justify-center shadow-md transition-all hover:scale-110"
							onClick={(e) => {
								e.stopPropagation();
								data.onMoveRight?.();
							}}
							title="Move Right"
						>
							<ArrowRightOutlined style={{ fontSize: 10 }} />
						</button>
					</div>
				</>
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
				selected ? 'ring-2 ring-green-500 ring-offset-2 scale-105' : ''
			}`}
			style={{
				background: data.background || '#F0FDF4',
				border: `2px solid ${data.borderColor || '#10B981'}`,
				color: data.color || '#14532D',
				padding: '10px 16px',
				borderRadius: 8,
				fontSize: 12,
				fontWeight: 500,
				textAlign: 'center',
				minWidth: 120,
				boxShadow: selected ? '0 8px 16px rgba(16, 185, 129, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.08)',
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
			<div style={{ whiteSpace: 'pre-line' }}>{data.label}</div>
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
		? 15 + maxProcessesInColumn * PROCESS_HEIGHT + (maxProcessesInColumn - 1) * PROCESS_VERTICAL_GAP + 15
		: STEP_MIN_HEIGHT;
	
	return (
		<div
			className={`relative transition-all duration-200 ${
				selected ? 'ring-2 ring-purple-500 ring-offset-2' : ''
			}`}
			style={{
				background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.05) 0%, rgba(139, 92, 246, 0.02) 100%)',
				border: '2px solid rgba(139, 92, 246, 0.2)',
				borderRadius: 8,
				paddingLeft: STEP_LABEL_WIDTH + 16, // Add padding to avoid overlap with label
				paddingRight: 16,
				paddingTop: 8,
				paddingBottom: 8,
				fontSize: 13,
				fontWeight: 600,
				color: '#6B21A8',
				minWidth: dynamicWidth,
				width: dynamicWidth,
				height: dynamicHeight,
				display: 'flex',
				alignItems: 'center',
				boxShadow: selected ? '0 4px 12px rgba(139, 92, 246, 0.2)' : 'none',
			}}
		>
			{selected && (
				<>
					<button
						className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
						onClick={(e) => {
							e.stopPropagation();
							data.onDelete?.();
						}}
					>
						<CloseOutlined style={{ fontSize: 10 }} />
					</button>
					{/* Move buttons at the end of the lane */}
					<div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-1">
						<button
							className="w-6 h-6 bg-purple-500 hover:bg-purple-600 text-white rounded flex items-center justify-center shadow-md transition-all hover:scale-110"
							onClick={(e) => {
								e.stopPropagation();
								data.onMoveUp?.();
							}}
							title="Move Up"
						>
							<ArrowUpOutlined style={{ fontSize: 10 }} />
						</button>
						<button
							className="w-6 h-6 bg-purple-500 hover:bg-purple-600 text-white rounded flex items-center justify-center shadow-md transition-all hover:scale-110"
							onClick={(e) => {
								e.stopPropagation();
								data.onMoveDown?.();
							}}
							title="Move Down"
						>
							<ArrowDownOutlined style={{ fontSize: 10 }} />
						</button>
					</div>
				</>
			)}
			{/* Step label - positioned absolutely on the left */}
			<div
				style={{
					position: 'absolute',
					left: 16,
					top: '50%',
					transform: 'translateY(-50%)',
					width: STEP_LABEL_WIDTH - 32,
					fontWeight: 700,
					fontSize: 12,
					color: '#7C3AED',
				}}
			>
				Step {data.stepNumber}: {data.label}
			</div>
		</div>
	);
};

// Remote Call Edge (custom edge with label)
const RemoteCallEdge = ({ data, selected }: NodeProps) => {
	return (
		<div
			className={`relative ${selected ? 'ring-2 ring-orange-500' : ''}`}
			style={{
				background: '#FFF7ED',
				border: '2px solid #F97316',
				borderRadius: 6,
				padding: '4px 8px',
				fontSize: 10,
				fontWeight: 500,
				color: '#7C2D12',
				textAlign: 'center',
				whiteSpace: 'nowrap',
				boxShadow: selected ? '0 4px 8px rgba(249, 115, 22, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
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

// Vertical Line from Node (thin line extending down from each node)
const VerticalNodeLine = ({ data }: NodeProps) => {
	return (
		<div
			style={{
				width: 2,
				height: data.height || 600,
				background: data.color || 'rgba(100, 116, 139, 0.3)',
				position: 'absolute',
				left: '50%',
				transform: 'translateX(-50%)',
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

// Initial demo data
const getInitialFlowData = (policyId: number, onDeleteNode: ((nodeId: string) => void) | null = null) => {
	// Define node positions for alignment
	const nodePositions = [
		{ id: 'node-ue', x: 250, label: 'UE', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', lineColor: 'rgba(102, 126, 234, 0.3)' },
		{ id: 'node-amf', x: 400, label: 'AMF', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', lineColor: 'rgba(240, 147, 251, 0.3)' },
		{ id: 'node-smf', x: 550, label: 'SMF', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', lineColor: 'rgba(79, 172, 254, 0.3)' },
		{ id: 'node-pcf', x: 700, label: 'PCF', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', lineColor: 'rgba(67, 233, 123, 0.3)' },
		{ id: 'node-upf', x: 850, label: 'UPF', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', lineColor: 'rgba(250, 112, 154, 0.3)' },
	];

	const nodes: Node[] = [];
	
	// Create Network Nodes (top row) and their vertical lines
	nodePositions.forEach((nodePos) => {
		// Network node
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
		
		// Vertical line extending down from node
		nodes.push({
			id: `${nodePos.id}-line`,
			type: 'verticalLine',
			position: { x: nodePos.x + NODE_WIDTH / 2 - 1, y: 90 }, // Position at center of node
			data: {
				height: 400, // Will extend through all steps
				color: nodePos.lineColor,
			},
			selectable: false,
			draggable: false,
		});
	});

	// Step 1
	nodes.push({
		id: 'step-1',
		type: 'stepLane',
		position: { x: 50, y: 120 },
		data: {
			stepNumber: 1,
			label: 'Session Request',
			nodeCount: nodePositions.length,
			lastNodeX: nodePositions[nodePositions.length - 1].x,
			maxProcessesInColumn: 0, // No processes initially
			onDelete: onDeleteNode ? () => onDeleteNode('step-1') : undefined,
		},
		draggable: false,
	});

	// Step 2
	nodes.push({
		id: 'step-2',
		type: 'stepLane',
		position: { x: 50, y: 220 },
		data: {
			stepNumber: 2,
			label: 'Authentication',
			nodeCount: nodePositions.length,
			lastNodeX: nodePositions[nodePositions.length - 1].x,
			maxProcessesInColumn: 0, // No processes initially
			onDelete: onDeleteNode ? () => onDeleteNode('step-2') : undefined,
		},
		draggable: false,
	});

	// Step 3
	nodes.push({
		id: 'step-3',
		type: 'stepLane',
		position: { x: 50, y: 320 },
		data: {
			stepNumber: 3,
			label: 'Policy Decision',
			nodeCount: nodePositions.length,
			lastNodeX: nodePositions[nodePositions.length - 1].x,
			maxProcessesInColumn: 0, // No processes initially
			onDelete: onDeleteNode ? () => onDeleteNode('step-3') : undefined,
		},
		draggable: false,
	});

	const edges: Edge[] = [];

	return { nodes, edges, nodePositions };
};

export default function PolicyFlowGraph({ policyId }: PolicyFlowGraphProps) {
	const reactFlowWrapper = useRef<HTMLDivElement>(null);
	const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
	const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
	const [showProcessMenu, setShowProcessMenu] = useState(false);
	
	const [nodes, setNodes, onNodesChange] = useNodesState([]);
	const [edges, setEdges, onEdgesChange] = useEdgesState([]);
	const [nodePositions, setNodePositions] = useState<any[]>([]);
	const [stepCounter, setStepCounter] = useState(4);
	const [nodeCounter, setNodeCounter] = useState(6);
	const [processCounter, setProcessCounter] = useState(4);
	const [remoteCallCounter, setRemoteCallCounter] = useState(3);
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
			const stepY = step.position.y;
			const nextStepY = index < stepLanes.length - 1 ? stepLanes[index + 1].position.y : stepY + 500;
			
			networkNodes.forEach(networkNode => {
				const nodeX = networkNode.position.x;
				
				// Count processes in this column for this step (between current step and next step)
				const processesInColumn = currentNodes.filter(n =>
					n.type === 'processNode' &&
					Math.abs(n.position.x - nodeX) < 20 && // Same column
					n.position.y >= stepY + 10 && // Below step start
					n.position.y < nextStepY // Above next step
				).length;
				
				maxProcessesInColumn = Math.max(maxProcessesInColumn, processesInColumn);
			});
			
			const calculatedHeight = maxProcessesInColumn > 0
				? 15 + maxProcessesInColumn * PROCESS_HEIGHT + (maxProcessesInColumn - 1) * PROCESS_VERTICAL_GAP + 15
				: STEP_MIN_HEIGHT;
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
				} else if (node.type === 'processNode') {
					// Adjust process positions based on their parent step's new position
					const parentStepIndex = stepLanes.findIndex((step, index) => {
						const stepY = step.position.y;
						const nextStepY = index < stepLanes.length - 1 ? stepLanes[index + 1].position.y : stepY + 500;
						return node.position.y >= stepY + 10 && node.position.y < nextStepY;
					});
					
					if (parentStepIndex >= 0) {
						const parentStep = stepLanes[parentStepIndex];
						const newStepY = stepPositions.get(parentStep.id);
						const oldStepY = parentStep.position.y;
						const yDelta = newStepY !== undefined ? newStepY - oldStepY : 0;
						
						if (yDelta !== 0) {
							return {
								...node,
								position: {
									...node.position,
									y: node.position.y + yDelta,
								},
							};
						}
					}
				}
				return node;
			});
		});
	}, [setNodes]);

	const handleDeleteNode = useCallback((nodeId: string) => {
		setNodes((nds) => {
			// Check if deleting a process node
			const deletedProcess = nds.find(n => n.id === nodeId && n.type === 'processNode');
			if (deletedProcess) {
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
					
					// Remove the process
					let newNodes = nds.filter((node) => node.id !== nodeId);
					
					// Find all processes in the same column below the deleted process
					const processesToShift = newNodes.filter(n =>
						n.type === 'processNode' &&
						Math.abs(n.position.x - deletedX) < 20 && // Same column
						n.position.y > deletedY && // Below deleted process
						n.position.y >= stepY + 10 && // In this step
						n.position.y < nextStepY // Before next step
					);
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
				const newNodes = nds.filter((node) => node.id !== nodeId);
				setTimeout(() => updateStepLaneHeights(newNodes), 0);
				return newNodes;
			}
			
			// Find the node being deleted (network node)
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
						
						const newNodes = nds.filter((node) => {
							if (node.id === nodeId) return false; // Remove step itself
							if (node.type === 'processNode' && 
								node.position.y >= stepY + 10 && 
								node.position.y < nextStepY) {
								return false; // Remove processes in this step
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
			
			const deletedX = deletedNode.position.x;
			
			// Remove the node and its vertical line
			let newNodes = nds.filter((node) => node.id !== nodeId && node.id !== `${nodeId}-line`);
			
			// Find all network nodes to the right of deleted node
			const networkNodes = newNodes.filter(n => n.type === 'networkNode').sort((a, b) => a.position.x - b.position.x);
			const nodesToShift = networkNodes.filter(n => n.position.x > deletedX);
			
			// Shift all nodes to the right by 150px to the left
			if (nodesToShift.length > 0) {
				newNodes = newNodes.map(node => {
					// Check if this node or its line needs to be shifted
					const isNodeToShift = nodesToShift.some(n => n.id === node.id);
					const isLineToShift = nodesToShift.some(n => `${n.id}-line` === node.id);
					
					if (isNodeToShift || isLineToShift) {
						return { ...node, position: { ...node.position, x: node.position.x - 150 } };
					}
					
					// Also shift process nodes that are aligned with shifted columns
					if (node.type === 'processNode') {
						for (const shiftNode of nodesToShift) {
							const originalX = shiftNode.position.x + 150; // X before shift
							if (Math.abs(node.position.x - originalX) < 20) {
								return { ...node, position: { ...node.position, x: node.position.x - 150 } };
							}
						}
					}
					
					return node;
				});
			}
			
			// Update step lane widths after deletion
			setTimeout(() => updateStepLaneWidths(newNodes), 0);
			return newNodes;
		});
		
		// Update nodePositions array (outside of setNodes to avoid mutation)
		setNodePositions((prevPositions) => {
			const deletedNode = prevPositions.find(np => np.id === nodeId);
			if (!deletedNode) return prevPositions;
			
			const deletedX = deletedNode.x;
			
			// Create new array without the deleted node and shift remaining nodes
			return prevPositions
				.filter(np => np.id !== nodeId)
				.map(np => {
					if (np.x > deletedX) {
						return { ...np, x: np.x - 150 };
					}
					return np;
				});
		});
		
		setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
	}, [setNodes, setNodePositions, setEdges, updateStepLaneWidths, updateStepLaneHeights]);

	// Initialize flow data
	React.useEffect(() => {
		const flowData = getInitialFlowData(policyId, handleDeleteNode);
		setNodes(flowData.nodes);
		setEdges(flowData.edges);
		setNodePositions(flowData.nodePositions);
	}, [policyId, handleDeleteNode, setNodes, setEdges]);

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
			
			// Find processes belonging to each step
			const nextStepAfterCurrent = stepIndex < steps.length - 1 ? steps[stepIndex + 1] : null;
			const nextStepAfterSwap = swapIndex < steps.length - 1 ? steps[swapIndex + 1] : null;
			
			const currentStepEnd = nextStepAfterCurrent ? nextStepAfterCurrent.position.y : currentStepY + 500;
			const swapStepEnd = nextStepAfterSwap ? nextStepAfterSwap.position.y : swapStepY + 500;
			
			// Collect processes for each step with their relative positions
			const currentStepProcesses: { node: Node; relativeY: number; columnX: number }[] = [];
			const swapStepProcesses: { node: Node; relativeY: number; columnX: number }[] = [];
			
			nds.forEach(node => {
				if (node.type === 'processNode') {
					const processY = node.position.y;
					const processX = node.position.x;
					
					// Check if process belongs to current step
					if (processY >= currentStepY + 10 && processY < currentStepEnd) {
						currentStepProcesses.push({
							node,
							relativeY: processY - currentStepY,
							columnX: processX
						});
					}
					// Check if process belongs to swap step
					else if (processY >= swapStepY + 10 && processY < swapStepEnd) {
						swapStepProcesses.push({
							node,
							relativeY: processY - swapStepY,
							columnX: processX
						});
					}
				}
			});
			
			// Update nodes: swap steps and move their processes with relative positions
			const updatedNodes = nds.map(node => {
				// Move current step to swap position
				if (node.id === currentStep.id) {
					return { ...node, position: { ...node.position, y: swapStepY } };
				}
				
				// Move swap step to current position
				if (node.id === swapStep.id) {
					return { ...node, position: { ...node.position, y: currentStepY } };
				}
				
				// Move processes with their relative positions preserved
				if (node.type === 'processNode') {
					// Check if this process belongs to current step
					const currentProcess = currentStepProcesses.find(p => p.node.id === node.id);
					if (currentProcess) {
						return {
							...node,
							position: {
								...node.position,
								y: swapStepY + currentProcess.relativeY // New step Y + relative offset
							}
						};
					}
					
					// Check if this process belongs to swap step
					const swapProcess = swapStepProcesses.find(p => p.node.id === node.id);
					if (swapProcess) {
						return {
							...node,
							position: {
								...node.position,
								y: currentStepY + swapProcess.relativeY // New step Y + relative offset
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
		setSelectedStepId(stepNode ? stepNode.id : null);
	}, []);

	const onDragOver = useCallback((event: DragEvent) => {
		event.preventDefault();
		event.dataTransfer.dropEffect = 'move';
	}, []);

	// Add step programmatically (button click)
	const handleAddStep = useCallback(() => {
		const steps = nodes.filter(n => n.type === 'stepLane').sort((a, b) => a.position.y - b.position.y);
		
		// Calculate Y position for new step based on last step's height
		let newY = 120; // Default starting position
		if (steps.length > 0) {
			const lastStep = steps[steps.length - 1];
			const lastStepHeight = lastStep.data.maxProcessesInColumn > 0
				? 15 + lastStep.data.maxProcessesInColumn * PROCESS_HEIGHT + (lastStep.data.maxProcessesInColumn - 1) * PROCESS_VERTICAL_GAP + 15
				: STEP_MIN_HEIGHT;
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
				label: 'New Step',
				nodeCount: networkNodes.length,
				lastNodeX: lastNodeX,
				maxProcessesInColumn: 0, // No processes initially
				onDelete: () => handleDeleteNode(newId),
			},
			draggable: false,
		};
		
		setNodes((nds) => [...nds, newStepNode]);
		setStepCounter(stepCounter + 1);
	}, [nodes, stepCounter, handleDeleteNode, setNodes]);

	// Add node programmatically (button click)
	const handleAddNode = useCallback(() => {
		const newX = nodePositions.length > 0 
			? nodePositions[nodePositions.length - 1].x + 150 
			: 250;
		
		const newId = `node-${nodeCounter}`;
		const gradient = 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)';
		const lineColor = 'rgba(168, 237, 234, 0.3)';
		
		const newNodePos = { id: newId, x: newX, label: `NF${nodeCounter}`, gradient, lineColor };
		setNodePositions([...nodePositions, newNodePos]);
		
		const networkNode: Node = {
			id: newId,
			type: 'networkNode',
			position: { x: newX, y: 20 },
			data: {
				label: `NF${nodeCounter}`,
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
	}, [nodePositions, nodeCounter, handleDeleteNode, updateStepLaneWidths, setNodes]);

	// Add process at specific node column
	const handleAddProcessAtNode = useCallback((nodeId: string) => {
		if (!selectedStepId) return;
		
		const selectedStep = nodes.find(n => n.id === selectedStepId);
		if (!selectedStep) return;
		
		const targetNode = nodePositions.find(np => np.id === nodeId);
		if (!targetNode) return;
		
		const alignedX = targetNode.x;
		const stepY = selectedStep.position.y;
		
		// Find next step Y to determine the range
		const allSteps = nodes.filter(n => n.type === 'stepLane').sort((a, b) => a.position.y - b.position.y);
		const currentStepIndex = allSteps.findIndex(s => s.id === selectedStepId);
		const nextStepY = currentStepIndex >= 0 && currentStepIndex < allSteps.length - 1 
			? allSteps[currentStepIndex + 1].position.y 
			: stepY + 500;
		
		// Find existing processes in this step/column to calculate stack position
		const existingProcessesInColumn = nodes.filter(n => 
			n.type === 'processNode' && 
			Math.abs(n.position.x - alignedX) < 20 && // Same column (within 20px tolerance)
			n.position.y >= stepY + 10 && // Below step start
			n.position.y < nextStepY // Above next step
		);
		
		const stackIndex = existingProcessesInColumn.length;
		const alignedY = selectedStep.position.y + 15 + (stackIndex * (PROCESS_HEIGHT + PROCESS_VERTICAL_GAP));
		
		// Get current counter for this node, default to 1
		const currentCounter = nodeProcessCounters[nodeId] || 1;
		const nfLabel = targetNode.label; // e.g., "UE", "AMF", "PCF"
		
		const newId = `process-${processCounter}`;
		const newNode: Node = {
			id: newId,
			type: 'processNode',
			position: { x: alignedX, y: alignedY },
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

	const onDrop = useCallback(
		(event: DragEvent) => {
			event.preventDefault();

			const type = event.dataTransfer.getData('application/reactflow');
			if (!type || !reactFlowInstance) return;

			// Only allow Process and Remote Call drops, and only when a step is selected
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
				
				// Align to node's vertical line X position and selected step Y
				const alignedX = closestNodePos.x;
				const alignedY = selectedStep.position.y + 15;
				
				const newId = `process-${processCounter}`;
				const newNode: Node = {
					id: newId,
					type: 'processNode',
					position: { x: alignedX, y: alignedY },
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
			} else if (type === 'remoteCall') {
				const alignedY = selectedStep.position.y + 25;
				const baseX = position.x - 100;
				
				const currentCounter = remoteCallCounter;
				const senderId = `sender-${currentCounter}`;
				const receiverId = `receiver-${currentCounter}`;
				const edgeId = `edge-rc-${currentCounter}`;
				
				// Create Sender process (left)
				const senderNode: Node = {
					id: senderId,
					type: 'processNode',
					position: { x: baseX, y: alignedY },
					data: {
						label: 'Sender',
						background: '#FEF3C7',
						borderColor: '#F59E0B',
						color: '#92400E',
						onDelete: () => {
							// Delete sender, receiver and edge together
							setNodes((nds) => nds.filter((n) => 
								n.id !== senderId && n.id !== receiverId
							));
							setEdges((eds) => eds.filter((e) => e.id !== edgeId));
						},
					},
				};
				
				// Create Receiver process (right)
				const receiverNode: Node = {
					id: receiverId,
					type: 'processNode',
					position: { x: baseX + 200, y: alignedY },
					data: {
						label: 'Receiver',
						background: '#DBEAFE',
						borderColor: '#3B82F6',
						color: '#1E3A8A',
						onDelete: () => {
							// Delete sender, receiver and edge together
							setNodes((nds) => nds.filter((n) => 
								n.id !== senderId && n.id !== receiverId
							));
							setEdges((eds) => eds.filter((e) => e.id !== edgeId));
						},
					},
				};
				
				// Create edge (arrow) between them - straight line, no curves
				const newEdge: Edge = {
					id: edgeId,
					source: senderId,
					target: receiverId,
					type: 'straight', // Straight line, no curves
					animated: true,
					style: { stroke: '#F97316', strokeWidth: 2.5 },
					markerEnd: { type: MarkerType.ArrowClosed, color: '#F97316', width: 20, height: 20 },
					label: 'API Call',
					labelStyle: { fontSize: 10, fill: '#F97316', fontWeight: 600 },
					labelBgStyle: { fill: '#fff', fillOpacity: 0.9 },
				};
				
				// Add nodes first, then edge
				setNodes((nds) => [...nds, senderNode, receiverNode]);
				setTimeout(() => {
					setEdges((eds) => [...eds, newEdge]);
				}, 50); // Small delay to ensure nodes are rendered first
				
				setRemoteCallCounter(currentCounter + 1);
			}
		},
		[reactFlowInstance, nodes, nodePositions, selectedStepId, processCounter, remoteCallCounter, handleDeleteNode, setNodes, setEdges]
	);

	const onDragStart = (event: DragEvent, nodeType: string) => {
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
					nodesConnectable={true}
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
					{/* Flows Section - enabled when NO step is selected */}
					<Card 
						className={`shadow-2xl border-2 transition-all ${
							selectedStepId === null 
								? 'border-purple-400 bg-white' 
								: 'border-gray-200 bg-gray-50 opacity-50'
						}`}
						bodyStyle={{ padding: '12px 16px' }}
					>
						<div className="flex flex-col gap-2">
							<div className="text-xs font-bold text-purple-600 mb-1">FLOWS</div>
							<div className="flex gap-2">
								<button
									onClick={handleAddStep}
									disabled={selectedStepId !== null}
									className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg border-2 transition-all ${
										selectedStepId === null
											? 'border-purple-300 hover:bg-purple-50 cursor-pointer hover:scale-105'
											: 'border-gray-200 cursor-not-allowed opacity-50'
									}`}
									style={{ minWidth: 90 }}
								>
									<div style={{ fontSize: 24, color: selectedStepId === null ? '#8B5CF6' : '#9CA3AF' }}>
										<AppstoreOutlined />
									</div>
									<span className="text-xs font-medium" style={{ color: selectedStepId === null ? '#374151' : '#9CA3AF' }}>
										Add Step
									</span>
								</button>
								<button
									onClick={handleAddNode}
									disabled={selectedStepId !== null}
									className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg border-2 transition-all ${
										selectedStepId === null
											? 'border-blue-300 hover:bg-blue-50 cursor-pointer hover:scale-105'
											: 'border-gray-200 cursor-not-allowed opacity-50'
									}`}
									style={{ minWidth: 90 }}
								>
									<div style={{ fontSize: 24, color: selectedStepId === null ? '#3B82F6' : '#9CA3AF' }}>
										<NodeIndexOutlined />
									</div>
									<span className="text-xs font-medium" style={{ color: selectedStepId === null ? '#374151' : '#9CA3AF' }}>
										Add Node
									</span>
								</button>
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
										onMouseEnter={() => selectedStepId !== null && setShowProcessMenu(true)}
										onMouseLeave={() => setShowProcessMenu(false)}
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
											Add Process
										</span>
									</div>
									
									{/* Dropdown menu */}
									{showProcessMenu && selectedStepId !== null && (
										<div 
											className="absolute bottom-full left-0 mb-2 bg-white border-2 border-green-300 rounded-lg shadow-xl z-50 min-w-[120px]"
											onMouseEnter={() => setShowProcessMenu(true)}
											onMouseLeave={() => setShowProcessMenu(false)}
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
								
								<div
									draggable={selectedStepId !== null}
									onDragStart={(e: any) => selectedStepId !== null && onDragStart(e, 'remoteCall')}
									className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg border-2 border-dashed transition-all ${
										selectedStepId !== null
											? 'border-orange-300 hover:bg-orange-50 cursor-move hover:scale-105'
											: 'border-gray-200 cursor-not-allowed opacity-50'
									}`}
									style={{ minWidth: 90 }}
								>
									<div style={{ fontSize: 24, color: selectedStepId !== null ? '#F97316' : '#9CA3AF' }}>
										<ApiOutlined />
									</div>
									<span className="text-xs font-medium" style={{ color: selectedStepId !== null ? '#374151' : '#9CA3AF' }}>
										Remote Call
									</span>
								</div>
							</div>
						</div>
					</Card>
				</div>
			</div>
		</div>
	);
}
