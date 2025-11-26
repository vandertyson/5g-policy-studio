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
	// Node role classification
	nodeRole?: 'PCF_LOGIC' | 'MOCK_NF' | 'INTEGRATION';
	isMock?: boolean;
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
	type: 'sender' | 'receiver' | 'process' | 'pcf_evaluation' | 'pcf_decision' | 'pcf_action';
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
	// PCF-specific process data
	pcfProcessData?: PCFProcessData;
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

export interface FlowEdge {
	id: string;
	source: string; // Node ID
	target: string; // Node ID
	label?: string; // Display label with sequence and procedure name
	sequence?: number; // Step number in flow
	procedureName?: string; // Name of the procedure (e.g., "Subscription Creation")
	protocol?: string; // HTTP2, gRPC, etc.
	animated?: boolean;
	style?: Record<string, any>;
	markerEnd?: any;
	type?: string; // Edge type for ReactFlow
}

export interface FlowData {
	metadata: FlowMetadata;
	nodes: NFNodeProperties[];
	steps: StepProperties[];
	processes: ProcessProperties[];
	edges?: FlowEdge[]; // Message flows between nodes
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
	// PCF-specific test results
	pcfMetrics?: PCFTestMetrics;
}

export interface PCFProcessData {
	ruleSetId?: string;
	evaluationType?: 'POLICY_CONTROL' | 'QOS_DECISION' | 'CHARGING_DECISION';
	inputContext?: Record<string, any>;
	outputDecision?: Record<string, any>;
	evaluationTrace?: PolicyEvaluationTrace[];
}

export interface PolicyEvaluationTrace {
	timestamp: string;
	ruleId: string;
	ruleName: string;
	conditionsMet: boolean;
	actionsExecuted: string[];
	executionTime: number;
	decision: 'ALLOW' | 'DENY' | 'MODIFY';
}

export interface PCFTestMetrics {
	totalPolicyEvaluations: number;
	rulesTriggered: Record<string, number>;
	averageEvaluationTime: number;
	qosDecisions: number;
	chargingEvents: number;
	policyDenials: number;
	evaluationTraces: PolicyEvaluationTrace[];
}

export type ViewMode = 'full' | 'pcf_focus' | 'network_focus';

export interface FlowViewConfig {
	mode: ViewMode;
	showTimeline: boolean;
	showPCFMetrics: boolean;
	collapseMockNodes: boolean;
}
