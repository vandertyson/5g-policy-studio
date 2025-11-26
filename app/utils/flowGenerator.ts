/**
 * Flow Generator - Convert FlowTemplate to FlowData
 * Generates executable flow graphs from business templates
 */

import type { FlowData, FlowMetadata, NFNodeProperties, StepProperties, ProcessProperties, PCFConfiguration } from '../types/flow.types';
import type { FlowTemplate } from '../data/pcfFlowCategories';

/**
 * Generate a complete FlowData from a FlowTemplate
 */
export function generateFlowFromTemplate(template: FlowTemplate): FlowData {
	const timestamp = new Date().toISOString();
	
	// Create flow metadata
	const metadata: FlowMetadata = {
		id: `flow_${template.id}_${Date.now()}`,
		name: template.name,
		description: template.description,
		version: '1.0.0',
		createdAt: timestamp,
		lastModified: timestamp,
		author: 'PCF Policy Studio'
	};

	// Generate nodes based on template components
	const nodes = generateNodes(template);
	
	// Generate steps based on trigger type
	const steps = generateSteps(template, nodes);
	
	// Generate processes based on steps
	const processes = generateProcesses(template, nodes, steps);
	
	// Generate edges showing message flows between nodes
	const edges = generateEdges(template, nodes, steps, processes);

	return {
		metadata,
		nodes,
		steps,
		processes,
		edges // Add edges to flow data
	};
}

/**
 * Generate NF nodes based on template components
 */
function generateNodes(template: FlowTemplate): NFNodeProperties[] {
	const nodes: NFNodeProperties[] = [];
	let pcfXPosition = 100; // Track X position for PCF lane
	let nfYPosition = 100;  // Track Y position for NF lane
	const NODE_SPACING_X = 280; // Horizontal spacing
	const NODE_SPACING_Y = 150; // Vertical spacing

	// Always add PCF node
	if (template.components.pcf) {
		nodes.push({
			id: 'pcf-main',
			name: 'PCF Core',
			nfType: 'PCF',
			status: 'ACTIVE',
			nodeRole: 'PCF_LOGIC',
			isMock: false,
			pcfConfig: generatePCFConfig(template),
			state: {
				currentState: 'IDLE',
				stateData: {},
				lastTransition: new Date().toISOString(),
				transitionHistory: []
			}
		});
		pcfXPosition += NODE_SPACING_X;
	}

	// Add Rating Engine if needed (in PCF lane, next to PCF Core)
	if (template.components.ratingEngine) {
		nodes.push({
			id: 'rating-engine',
			name: 'Rating Engine',
			nfType: 'PCF', // Part of PCF logic
			status: 'ACTIVE',
			nodeRole: 'PCF_LOGIC',
			isMock: false,
			state: {
				currentState: 'IDLE',
				stateData: {},
				lastTransition: new Date().toISOString(),
				transitionHistory: []
			}
		});
		pcfXPosition += NODE_SPACING_X;
	}

	// Add Subscription Manager nodes (in NF lane)
	if (template.components.subscriptionManager === 'ABM') {
		nodes.push(createMockNFNode('abm', 'ABM', 'UDM'));
	} else if (template.components.subscriptionManager === 'UDR') {
		nodes.push(createMockNFNode('udr', 'UDR', 'UDM'));
	} else if (template.components.subscriptionManager === 'Both') {
		nodes.push(createMockNFNode('abm', 'ABM', 'UDM'));
		nodes.push(createMockNFNode('udr', 'UDR', 'UDM'));
	}

	// Add external NF nodes (mock)
	template.components.externalNFs.forEach((nfName) => {
		const nfType = mapNFNameToType(nfName);
		nodes.push(createMockNFNode(
			nfName.toLowerCase().replace(/\s/g, '-'),
			nfName,
			nfType
		));
	});

	return nodes;
}

/**
 * Create a mock NF node
 */
function createMockNFNode(
	id: string,
	name: string,
	nfType: NFNodeProperties['nfType']
): NFNodeProperties {
	return {
		id,
		name,
		nfType,
		status: 'ACTIVE',
		nodeRole: 'MOCK_NF',
		isMock: true,
		messageConfig: {
			headers: { 'Content-Type': 'application/json' },
			body: {}
		},
		state: {
			currentState: 'IDLE',
			stateData: {},
			lastTransition: new Date().toISOString(),
			transitionHistory: []
		}
	};
}

/**
 * Map NF name to NF type enum
 */
function mapNFNameToType(nfName: string): NFNodeProperties['nfType'] {
	const mapping: Record<string, NFNodeProperties['nfType']> = {
		'UE': 'UE',
		'AMF': 'AMF',
		'SMF': 'SMF',
		'UPF': 'UPF',
		'PCF': 'PCF',
		'UDM': 'UDM',
		'UDR': 'UDM', // Map to UDM type
		'ABM': 'UDM', // Map to UDM type
		'AUSF': 'AUSF',
		'NEF': 'NEF',
		'NRF': 'NRF'
	};
	return mapping[nfName] || 'PCF';
}

/**
 * Generate PCF configuration based on template
 */
function generatePCFConfig(template: FlowTemplate): PCFConfiguration {
	const policyRules = generatePolicyRules(template);
	
	return {
		policyRules,
		defaultActions: [
			{
				type: 'ALLOW',
				parameters: { reason: 'Default policy' }
			}
		],
		qosConfig: template.policyType === 'SM' ? {
			maxBitrate: 100000000, // 100 Mbps
			guaranteedBitrate: 10000000, // 10 Mbps
			priorityLevel: 5,
			qci: 9
		} : undefined,
		chargingConfig: template.policyType === 'SM' ? {
			chargingMethod: 'ONLINE',
			rate: 0.01,
			currency: 'USD',
			unit: 'MB'
		} : undefined
	};
}

/**
 * Generate policy rules based on template type
 */
function generatePolicyRules(template: FlowTemplate): PCFConfiguration['policyRules'] {
	const rules: PCFConfiguration['policyRules'] = [];

	// Subscription-based rules
	if (template.trigger === 'subscription') {
		rules.push({
			id: 'rule-subscription-tier',
			name: 'Subscription Tier Policy',
			description: 'Apply QoS based on subscription tier',
			conditions: [
				{
					type: 'SUBSCRIBER_PROFILE',
					operator: 'EQUALS',
					value: 'premium'
				}
			],
			actions: [
				{
					type: 'MODIFY_QOS',
					parameters: { qci: 5, maxBitrate: 200000000 }
				}
			],
			priority: 1,
			enabled: true
		});
	}

	// On-demand rules
	if (template.trigger === 'on-demand') {
		rules.push({
			id: 'rule-on-demand-qos',
			name: 'On-Demand QoS Boost',
			description: 'Apply temporary QoS boost from external request',
			conditions: [
				{
					type: 'SERVICE_TYPE',
					operator: 'EQUALS',
					value: 'video-streaming'
				}
			],
			actions: [
				{
					type: 'MODIFY_QOS',
					parameters: { qci: 3, guaranteedBitrate: 50000000 }
				},
				{
					type: 'CHARGE',
					parameters: { rate: 0.05, unit: 'MB' }
				}
			],
			priority: 2,
			enabled: true
		});
	}

	// Periodic rules
	if (template.trigger === 'periodic') {
		rules.push({
			id: 'rule-quota-renewal',
			name: 'Quota Renewal Policy',
			description: 'Renew data quotas at scheduled intervals',
			conditions: [
				{
					type: 'TIME_OF_DAY',
					operator: 'EQUALS',
					value: '00:00'
				}
			],
			actions: [
				{
					type: 'MODIFY_QOS',
					parameters: { resetQuota: true, newQuota: 10000000000 }
				},
				{
					type: 'NOTIFY',
					parameters: { message: 'Quota renewed' }
				}
			],
			priority: 3,
			enabled: true
		});
	}

	return rules;
}

/**
 * Generate steps based on trigger type
 */
function generateSteps(template: FlowTemplate, nodes: NFNodeProperties[]): StepProperties[] {
	const steps: StepProperties[] = [];

	switch (template.trigger) {
		case 'subscription':
			return generateSubscriptionSteps(template, nodes);
		case 'on-demand':
			return generateOnDemandSteps(template, nodes);
		case 'periodic':
			return generatePeriodicSteps(template, nodes);
		default:
			return steps;
	}
}

/**
 * Generate subscription-based flow steps
 */
function generateSubscriptionSteps(template: FlowTemplate, nodes: NFNodeProperties[]): StepProperties[] {
	const steps: StepProperties[] = [];

	// Step 1: UE triggers request
	steps.push({
		id: 'step-1',
		stepNumber: 1,
		name: 'UE Trigger',
		type: 'SEQUENTIAL',
		description: 'UE initiates attach or PDU session request',
		processes: ['proc-ue-trigger'],
		timeout: 5000
	});

	// Step 2: Query Subscription Manager
	steps.push({
		id: 'step-2',
		stepNumber: 2,
		name: 'Query Subscription Data',
		type: 'SEQUENTIAL',
		description: 'PCF queries ABM or UDR for subscriber profile',
		processes: ['proc-query-subscription'],
		timeout: 3000
	});

	// Step 3: Rating Engine (if applicable)
	if (template.components.ratingEngine) {
		steps.push({
			id: 'step-3',
			stepNumber: 3,
			name: 'Rating Engine Processing',
			type: 'SEQUENTIAL',
			description: 'Rating Engine processes subscriber profile',
			processes: ['proc-rating-engine'],
			timeout: 2000
		});
	}

	// Step 4: PCF Policy Evaluation
	steps.push({
		id: `step-${template.components.ratingEngine ? 4 : 3}`,
		stepNumber: template.components.ratingEngine ? 4 : 3,
		name: 'PCF Policy Evaluation',
		type: 'SEQUENTIAL',
		description: 'PCF evaluates policy rules and generates decision',
		processes: ['proc-pcf-evaluation'],
		timeout: 1000
	});

	// Step 5: Policy Decision & Delivery
	steps.push({
		id: `step-${template.components.ratingEngine ? 5 : 4}`,
		stepNumber: template.components.ratingEngine ? 5 : 4,
		name: 'Policy Delivery',
		type: 'SEQUENTIAL',
		description: 'PCF delivers policy to network functions',
		processes: ['proc-policy-delivery'],
		timeout: 2000
	});

	return steps;
}

/**
 * Generate on-demand flow steps
 */
function generateOnDemandSteps(template: FlowTemplate, nodes: NFNodeProperties[]): StepProperties[] {
	const steps: StepProperties[] = [];

	// Step 1: External trigger
	steps.push({
		id: 'step-1',
		stepNumber: 1,
		name: 'External Trigger',
		type: 'SEQUENTIAL',
		description: 'NEF/AF/NWDAF/SMF/AMF sends on-demand request',
		processes: ['proc-external-trigger'],
		timeout: 5000
	});

	// Step 2: PCF receives request
	steps.push({
		id: 'step-2',
		stepNumber: 2,
		name: 'PCF Receives Request',
		type: 'SEQUENTIAL',
		description: 'PCF processes on-demand policy request',
		processes: ['proc-pcf-receive'],
		timeout: 1000
	});

	// Step 3: Update Subscription Manager
	steps.push({
		id: 'step-3',
		stepNumber: 3,
		name: 'Update Subscription Data',
		type: 'SEQUENTIAL',
		description: 'PCF updates ABM or receives UDR notification',
		processes: ['proc-update-subscription'],
		timeout: 2000
	});

	// Step 4: Build policy immediately (no Rating Engine)
	steps.push({
		id: 'step-4',
		stepNumber: 4,
		name: 'Build On-Demand Policy',
		type: 'SEQUENTIAL',
		description: 'PCF builds policy directly without Rating Engine',
		processes: ['proc-build-policy'],
		timeout: 1000
	});

	// Step 5: Apply policy
	steps.push({
		id: 'step-5',
		stepNumber: 5,
		name: 'Apply Policy',
		type: 'SEQUENTIAL',
		description: 'PCF applies policy to active session',
		processes: ['proc-apply-policy'],
		timeout: 2000
	});

	return steps;
}

/**
 * Generate periodic flow steps
 */
function generatePeriodicSteps(template: FlowTemplate, nodes: NFNodeProperties[]): StepProperties[] {
	const steps: StepProperties[] = [];

	// Step 1: Timer expires
	steps.push({
		id: 'step-1',
		stepNumber: 1,
		name: 'Timer Trigger',
		type: 'SEQUENTIAL',
		description: 'Scheduled timer expires (daily/weekly/monthly)',
		processes: ['proc-timer-trigger'],
		timeout: 1000
	});

	// Step 2: Query updated subscription data
	steps.push({
		id: 'step-2',
		stepNumber: 2,
		name: 'Query Updated Data',
		type: 'SEQUENTIAL',
		description: 'PCF queries updated subscription information',
		processes: ['proc-query-updated'],
		timeout: 3000
	});

	// Step 3: Rating Engine recalculation
	if (template.components.ratingEngine) {
		steps.push({
			id: 'step-3',
			stepNumber: 3,
			name: 'Recalculate Policies',
			type: 'SEQUENTIAL',
			description: 'Rating Engine recalculates quotas and policies',
			processes: ['proc-recalculate'],
			timeout: 2000
		});
	}

	// Step 4: Update active policies
	steps.push({
		id: `step-${template.components.ratingEngine ? 4 : 3}`,
		stepNumber: template.components.ratingEngine ? 4 : 3,
		name: 'Update Policies',
		type: 'SEQUENTIAL',
		description: 'PCF updates all active policies',
		processes: ['proc-update-policies'],
		timeout: 2000
	});

	// Step 5: Send notifications
	steps.push({
		id: `step-${template.components.ratingEngine ? 5 : 4}`,
		stepNumber: template.components.ratingEngine ? 5 : 4,
		name: 'Notify Network Functions',
		type: 'SEQUENTIAL',
		description: 'Send notifications to affected NFs',
		processes: ['proc-notify-nfs'],
		timeout: 3000
	});

	return steps;
}

/**
 * Generate processes based on steps
 */
function generateProcesses(
	template: FlowTemplate,
	nodes: NFNodeProperties[],
	steps: StepProperties[]
): ProcessProperties[] {
	const processes: ProcessProperties[] = [];
	let processCounter = 0;

	steps.forEach((step, stepIndex) => {
		step.processes.forEach((procId) => {
			const process = generateProcess(procId, step, nodes, template, processCounter++);
			if (process) {
				processes.push(process);
			}
		});
	});

	return processes;
}

/**
 * Generate a single process
 */
function generateProcess(
	procId: string,
	step: StepProperties,
	nodes: NFNodeProperties[],
	template: FlowTemplate,
	counter: number
): ProcessProperties | null {
	const pcfNode = nodes.find(n => n.nodeRole === 'PCF_LOGIC');
	if (!pcfNode) return null;

	const baseProcess: ProcessProperties = {
		id: procId,
		type: 'process',
		nodeId: pcfNode.id,
		stepId: step.id,
		label: step.name,
		position: { x: 400, y: 100 + counter * 80 },
		priority: 'NORMAL'
	};

	// Add PCF-specific process data for evaluation steps
	if (procId.includes('pcf-evaluation') || procId.includes('build-policy') || procId.includes('rating-engine')) {
		baseProcess.type = 'pcf_evaluation';
		baseProcess.pcfProcessData = {
			evaluationType: 'POLICY_CONTROL',
			inputContext: {
				subscriberProfile: 'premium',
				requestType: template.policyType
			},
			evaluationTrace: [
				{
					timestamp: new Date().toISOString(),
					ruleId: 'rule-1',
					ruleName: 'Sample Policy Rule',
					conditionsMet: true,
					actionsExecuted: ['MODIFY_QOS'],
					executionTime: 5,
					decision: 'ALLOW'
				}
			]
		};
	}

	return baseProcess;
}

/**
 * Generate edges showing message flows between nodes
 */
function generateEdges(
	template: FlowTemplate,
	nodes: NFNodeProperties[],
	steps: StepProperties[],
	processes: ProcessProperties[]
): any[] {
	const edges: any[] = [];
	const pcfNode = nodes.find(n => n.id === 'pcf-main');
	if (!pcfNode) return edges;

	let sequenceCounter = 1;

	switch (template.trigger) {
		case 'subscription':
			return generateSubscriptionEdges(nodes, sequenceCounter);
		case 'on-demand':
			return generateOnDemandEdges(nodes, sequenceCounter);
		case 'periodic':
			return generatePeriodicEdges(nodes, sequenceCounter);
		default:
			return edges;
	}
}

/**
 * Generate edges for subscription-based flows
 * PCF-centric: Single bidirectional edges representing procedures
 */
function generateSubscriptionEdges(nodes: NFNodeProperties[], startSeq: number): any[] {
	const edges: any[] = [];
	let seq = startSeq;

	// Find key nodes
	const amfNode = nodes.find(n => n.id.includes('amf'));
	const smfNode = nodes.find(n => n.id.includes('smf'));
	const pcfNode = nodes.find(n => n.id === 'pcf-main');
	const udrNode = nodes.find(n => n.id.includes('udr'));
	const abmNode = nodes.find(n => n.id.includes('abm'));
	const ratingNode = nodes.find(n => n.id === 'rating-engine');

	if (!pcfNode) return edges;

	// Procedure 1: AMF/SMF ↔ PCF (Subscription Creation)
	if (amfNode || smfNode) {
		const nfNode = amfNode || smfNode;
		edges.push({
			id: `edge-${seq}`,
			source: nfNode!.id,
			target: pcfNode.id,
			label: `${seq}. Subscription Creation`,
			sequence: seq++,
			procedureName: 'Subscription Creation',
			animated: false,
			style: { stroke: '#10B981', strokeWidth: 2 },
			markerEnd: { type: 'arrowclosed', color: '#10B981' },
			type: 'smoothstep'
		});
	}

	// Procedure 2: PCF ↔ UDR/ABM (Profile Retrieval)
	if (udrNode || abmNode) {
		const dataNode = udrNode || abmNode;
		edges.push({
			id: `edge-${seq}`,
			source: pcfNode.id,
			target: dataNode!.id,
			label: `${seq}. Profile Retrieval`,
			sequence: seq++,
			procedureName: 'Profile Retrieval',
			animated: false,
			style: { stroke: '#8B5CF6', strokeWidth: 2 },
			markerEnd: { type: 'arrowclosed', color: '#8B5CF6' },
			type: 'smoothstep'
		});
	}

	// Procedure 3: PCF ↔ Rating Engine (Policy Evaluation)
	if (ratingNode) {
		edges.push({
			id: `edge-${seq}`,
			source: pcfNode.id,
			target: ratingNode.id,
			label: `${seq}. Policy Evaluation`,
			sequence: seq++,
			procedureName: 'Policy Evaluation',
			animated: false,
			style: { stroke: '#F59E0B', strokeWidth: 2 },
			markerEnd: { type: 'arrowclosed', color: '#F59E0B' },
			type: 'smoothstep'
		});
	}

	return edges;
}

/**
 * Generate edges for on-demand flows
 * PCF-centric: Single bidirectional edges representing procedures
 */
function generateOnDemandEdges(nodes: NFNodeProperties[], startSeq: number): any[] {
	const edges: any[] = [];
	let seq = startSeq;

	const pcfNode = nodes.find(n => n.id === 'pcf-main');
	const nefNode = nodes.find(n => n.id.includes('nef'));
	const afNode = nodes.find(n => n.id.includes('af'));
	const nwdafNode = nodes.find(n => n.id.includes('nwdaf'));
	const smfNode = nodes.find(n => n.id.includes('smf'));
	const abmNode = nodes.find(n => n.id.includes('abm'));
	const udrNode = nodes.find(n => n.id.includes('udr'));

	if (!pcfNode) return edges;

	// Procedure 1: External Trigger ↔ PCF (On-Demand Request)
	const triggerNode = nefNode || afNode || nwdafNode || smfNode;
	if (triggerNode) {
		edges.push({
			id: `edge-${seq}`,
			source: triggerNode.id,
			target: pcfNode.id,
			label: `${seq}. On-Demand Request`,
			sequence: seq++,
			procedureName: 'On-Demand Request',
			animated: false,
			style: { stroke: '#EF4444', strokeWidth: 2 },
			markerEnd: { type: 'arrowclosed', color: '#EF4444' },
			type: 'smoothstep'
		});
	}

	// Procedure 2: PCF ↔ ABM/UDR (Profile Update)
	if (abmNode || udrNode) {
		const dataNode = abmNode || udrNode;
		edges.push({
			id: `edge-${seq}`,
			source: pcfNode.id,
			target: dataNode!.id,
			label: `${seq}. Profile Update`,
			sequence: seq++,
			procedureName: 'Profile Update',
			animated: false,
			style: { stroke: '#8B5CF6', strokeWidth: 2 },
			markerEnd: { type: 'arrowclosed', color: '#8B5CF6' },
			type: 'smoothstep'
		});
	}

	// Procedure 3: PCF ↔ SMF (Policy Application)
	if (smfNode) {
		edges.push({
			id: `edge-${seq}`,
			source: pcfNode.id,
			target: smfNode.id,
			label: `${seq}. Policy Application`,
			sequence: seq++,
			procedureName: 'Policy Application',
			animated: false,
			style: { stroke: '#10B981', strokeWidth: 2 },
			markerEnd: { type: 'arrowclosed', color: '#10B981' },
			type: 'smoothstep'
		});
	}

	return edges;
}

/**
 * Generate edges for periodic flows
 * PCF-centric: Single bidirectional edges representing procedures
 */
function generatePeriodicEdges(nodes: NFNodeProperties[], startSeq: number): any[] {
	const edges: any[] = [];
	let seq = startSeq;

	const pcfNode = nodes.find(n => n.id === 'pcf-main');
	const abmNode = nodes.find(n => n.id.includes('abm'));
	const udrNode = nodes.find(n => n.id.includes('udr'));
	const ratingNode = nodes.find(n => n.id === 'rating-engine');
	const smfNode = nodes.find(n => n.id.includes('smf'));
	const chfNode = nodes.find(n => n.id.includes('chf'));

	if (!pcfNode) return edges;

	// Procedure 1: PCF ↔ UDR/ABM (Data Synchronization)
	if (udrNode || abmNode) {
		const dataNode = udrNode || abmNode;
		edges.push({
			id: `edge-${seq}`,
			source: pcfNode.id,
			target: dataNode!.id,
			label: `${seq}. Data Synchronization`,
			sequence: seq++,
			procedureName: 'Data Synchronization',
			animated: false,
			style: { stroke: '#8B5CF6', strokeWidth: 2 },
			markerEnd: { type: 'arrowclosed', color: '#8B5CF6' },
			type: 'smoothstep'
		});
	}

	// Procedure 2: PCF ↔ Rating Engine (Quota Recalculation)
	if (ratingNode) {
		edges.push({
			id: `edge-${seq}`,
			source: pcfNode.id,
			target: ratingNode.id,
			label: `${seq}. Quota Recalculation`,
			sequence: seq++,
			procedureName: 'Quota Recalculation',
			animated: false,
			style: { stroke: '#F59E0B', strokeWidth: 2 },
			markerEnd: { type: 'arrowclosed', color: '#F59E0B' },
			type: 'smoothstep'
		});
	}

	// Procedure 3: PCF ↔ SMF (Policy Notification)
	if (smfNode) {
		edges.push({
			id: `edge-${seq}`,
			source: pcfNode.id,
			target: smfNode.id,
			label: `${seq}. Policy Notification`,
			sequence: seq++,
			procedureName: 'Policy Notification',
			animated: false,
			style: { stroke: '#10B981', strokeWidth: 2 },
			markerEnd: { type: 'arrowclosed', color: '#10B981' },
			type: 'smoothstep'
		});
	}

	// Procedure 4: PCF ↔ CHF (Charging Update)
	if (chfNode) {
		edges.push({
			id: `edge-${seq}`,
			source: pcfNode.id,
			target: chfNode.id,
			label: `${seq}. Charging Update`,
			sequence: seq++,
			procedureName: 'Charging Update',
			animated: false,
			style: { stroke: '#06B6D4', strokeWidth: 2 },
			markerEnd: { type: 'arrowclosed', color: '#06B6D4' },
			type: 'smoothstep'
		});
	}

	return edges;
}

