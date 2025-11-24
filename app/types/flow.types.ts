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
	// Message configuration for non-PCF nodes
	messageConfig?: MessageConfiguration;
	// PCF specific configuration
	pcfConfig?: PCFConfiguration;
	// State management for realistic simulation
	state?: NFState;
}

export interface NFState {
	currentState: 'IDLE' | 'INITIALIZING' | 'PROCESSING' | 'WAITING_RESPONSE' | 'ERROR' | 'COMPLETED';
	stateData: Record<string, any>;
	lastTransition: string;
	transitionHistory: StateTransition[];
}

export interface StateTransition {
	fromState: string;
	toState: string;
	timestamp: string;
	trigger: string;
	metadata?: Record<string, any>;
}

export interface MessageConfiguration {
	headers: Record<string, string>;
	body: Record<string, any>;
	queryParams?: Record<string, string>;
	pathParams?: Record<string, string>;
	contentType?: string;
	acceptType?: string;
}

export interface PCFConfiguration {
	policyRules: PolicyRule[];
	defaultActions: PolicyAction[];
	qosConfig?: QoSConfiguration;
	chargingConfig?: ChargingConfiguration;
}

export interface PolicyRule {
	id: string;
	name: string;
	description?: string;
	conditions: PolicyCondition[];
	actions: PolicyAction[];
	priority: number;
	enabled: boolean;
}

export interface PolicyCondition {
	type: 'UE_IDENTITY' | 'LOCATION' | 'SERVICE_TYPE' | 'TIME_OF_DAY' | 'NETWORK_CONGESTION' | 'SUBSCRIBER_PROFILE' | 'APPLICATION_ID';
	operator: 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS' | 'GREATER_THAN' | 'LESS_THAN' | 'IN_RANGE';
	value: any;
	logicalOperator?: 'AND' | 'OR';
}

export interface PolicyAction {
	type: 'ALLOW' | 'DENY' | 'MODIFY_QOS' | 'REDIRECT' | 'CHARGE' | 'LOG' | 'NOTIFY';
	parameters: Record<string, any>;
}

export interface QoSConfiguration {
	maxBitrate?: number;
	guaranteedBitrate?: number;
	priorityLevel?: number;
	arp?: number;
	qci?: number;
}

export interface ChargingConfiguration {
	chargingMethod: 'ONLINE' | 'OFFLINE' | 'PREPAID';
	rate?: number;
	currency?: string;
	unit?: 'SECOND' | 'MINUTE' | 'HOUR' | 'MB' | 'GB';
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
	// Message flow data for testing
	messageData?: MessageFlowData;
}

export interface MessageFlowData {
	messageId: string;
	timestamp: string;
	fromNode: string;
	toNode: string;
	content: any;
	status: 'PENDING' | 'SENT' | 'RECEIVED' | 'PROCESSED' | 'ERROR';
	responseTime?: number;
	errorMessage?: string;
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
	// Conditional logic for decision points
	conditions?: StepCondition[];
	nextSteps?: string[]; // For conditional branching
	// Code generation metadata
	codeMetadata?: StepCodeMetadata;
}

export interface StepCondition {
	id: string;
	name: string;
	expression: string; // e.g., "response.status == 200"
	operator: 'AND' | 'OR';
	nextStepId: string;
}

export interface StepCodeMetadata {
	javaClassName?: string;
	methodName?: string;
	annotations?: string[];
	dependencies?: string[];
}

export interface FlowData {
	metadata: FlowMetadata;
	nodes: NFNodeProperties[];
	steps: StepProperties[];
	processes: ProcessProperties[];
	// Export and code generation
	exportConfig?: ExportConfiguration;
}

export interface ExportConfiguration {
	version: string;
	targetPlatform: 'JAVA_SPRING' | 'JAVA_QUARKUS' | 'NODEJS' | 'PYTHON_FASTAPI';
	outputFormat: 'JSON' | 'YAML' | 'XML';
	codeGeneration: CodeGenerationConfig;
}

export interface CodeGenerationConfig {
	basePackage: string;
	mainClass: string;
	dependencies: string[];
	buildConfig: BuildConfiguration;
}

export interface BuildConfiguration {
	buildTool: 'MAVEN' | 'GRADLE';
	javaVersion: string;
	springBootVersion?: string;
	quarkusVersion?: string;
}

export interface FlowListItem {
	id: string;
	name: string;
	description: string;
	lastModified: string;
	version: string;
}

export interface FlowListItem {
	id: string;
	name: string;
	description: string;
	lastModified: string;
	version: string;
}

export interface TestFlowResult {
	flowId: string;
	startTime: string;
	endTime?: string;
	status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'STOPPED';
	messageFlows: MessageFlowData[];
	performanceMetrics?: {
		totalMessages: number;
		averageResponseTime: number;
		successRate: number;
		errorCount: number;
	};
}
