// Flow data structure types

export interface FlowMetadata {
	id: string;
	name: string;
	description: string;
	version: string;
	createdAt: string;
	lastModified: string;
	author: string;
}

export interface NFNodeProperties {
	id: string;
	name: string;
	nfType: 'AMF' | 'SMF' | 'UPF' | 'PCF' | 'UDM' | 'AUSF' | 'NEF' | 'NRF' | 'UE';
	instanceId?: string;
	ipAddress?: string;
	port?: number;
	protocol?: 'HTTP2' | 'HTTP1' | 'gRPC';
	status?: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
}

export interface ProcessProperties {
	id: string;
	type: 'sender' | 'receiver' | 'process';
	nodeId: string; // Reference to NF node
	stepId: string; // Reference to step
	label: string;
	position: { x: number; y: number };
	// For API calls
	apiType?: 'request' | 'response';
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
	endpoint?: string;
	timeout?: number;
	retry?: number;
	priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
}

export interface StepProperties {
	id: string;
	stepNumber: number;
	name: string;
	type: 'SEQUENTIAL' | 'PARALLEL' | 'CONDITIONAL';
	timeout?: number;
	errorHandling?: 'CONTINUE' | 'STOP' | 'RETRY';
	description?: string;
	processes: string[]; // Array of process IDs
}

export interface FlowData {
	metadata: FlowMetadata;
	nodes: NFNodeProperties[];
	steps: StepProperties[];
	processes: ProcessProperties[];
}

export interface FlowListItem {
	id: string;
	name: string;
	description: string;
	lastModified: string;
	version: string;
}
