// Mock flow data
import type { FlowData, FlowListItem } from '../types/flow.types';

export const mockFlows: FlowListItem[] = [
	{
		id: 'sm-policy-association',
		name: 'SM Policy Association',
		description: 'Session Management policy association flow',
		lastModified: '2025-11-19',
		version: '1.0.0',
	},
	{
		id: 'qos-on-demand',
		name: 'QoS on Demand',
		description: 'Dynamic QoS allocation flow',
		lastModified: '2025-11-18',
		version: '1.1.0',
	},
	{
		id: 'vonr-call',
		name: 'VoNR Call',
		description: 'Voice over NR call setup flow',
		lastModified: '2025-11-17',
		version: '1.0.0',
	},
	{
		id: 'am-policy-association',
		name: 'AM Policy Association',
		description: 'Access and Mobility policy association',
		lastModified: '2025-11-16',
		version: '1.0.0',
	},
	{
		id: 'am-policy-authorization',
		name: 'AM Policy Authorization',
		description: 'Access and Mobility policy authorization',
		lastModified: '2025-11-15',
		version: '1.0.0',
	},
	{
		id: 'ue-policy-association',
		name: 'UE Policy Association',
		description: 'UE-level policy association',
		lastModified: '2025-11-14',
		version: '1.0.0',
	},
	{
		id: 'ue-policy-delivery',
		name: 'UE Policy Delivery',
		description: 'UE policy delivery flow',
		lastModified: '2025-11-13',
		version: '1.0.0',
	},
	{
		id: 'af-guidance-ursp',
		name: 'AF guidance on URSP',
		description: 'Application Function guidance for URSP',
		lastModified: '2025-11-12',
		version: '1.0.0',
	},
];

export const mockFlowsData: Record<string, FlowData> = {
	'sm-policy-association': {
		metadata: {
			id: 'sm-policy-association',
			name: 'SM Policy Association',
			description: 'Session Management policy association flow between SMF and PCF',
			version: '1.0.0',
			createdAt: '2025-11-01',
			lastModified: '2025-11-19',
			author: 'Admin',
		},
		nodes: [
			{ 
				id: 'node-ue', 
				name: 'UE', 
				nfType: 'UE', 
				status: 'ACTIVE',
				messageConfig: {
					headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/json',
						'X-UE-ID': 'ue-12345'
					},
					body: {
						ueId: 'ue-12345',
						serviceType: 'data',
						requestedQoS: 'standard'
					},
					contentType: 'application/json',
					acceptType: 'application/json'
				}
			},
			{ 
				id: 'node-amf', 
				name: 'AMF', 
				nfType: 'AMF', 
				status: 'ACTIVE',
				messageConfig: {
					headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/json',
						'X-AMF-ID': 'amf-001'
					},
					body: {
						amfId: 'amf-001',
						registrationType: 'initial',
						requestedFeatures: ['emergency-services', 'location-services']
					},
					contentType: 'application/json',
					acceptType: 'application/json'
				}
			},
			{ 
				id: 'node-smf', 
				name: 'SMF', 
				nfType: 'SMF', 
				status: 'ACTIVE',
				messageConfig: {
					headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/json',
						'X-SMF-ID': 'smf-001'
					},
					body: {
						smfId: 'smf-001',
						sessionType: 'pdu-session',
						dnn: 'internet',
						snssai: '1-0x01010203'
					},
					contentType: 'application/json',
					acceptType: 'application/json'
				}
			},
			{ 
				id: 'node-pcf', 
				name: 'PCF', 
				nfType: 'PCF', 
				status: 'ACTIVE',
				state: {
					currentState: 'IDLE',
					stateData: {},
					lastTransition: '2025-11-19T10:00:00Z',
					transitionHistory: []
				},
				pcfConfig: {
					policyRules: [
						{
							id: 'rule-1',
							name: 'Standard Data Traffic',
							description: 'Default policy for standard data sessions',
							conditions: [
								{
									type: 'SERVICE_TYPE',
									operator: 'EQUALS',
									value: 'data',
									logicalOperator: 'AND'
								}
							],
							actions: [
								{
									type: 'MODIFY_QOS',
									parameters: {
										qosProfile: 'QCI-9',
										arp: 9,
										maxBitrate: '50Mbps',
										guaranteedBitrate: '1Mbps'
									}
								},
								{
									type: 'ALLOW',
									parameters: {}
								}
							],
							priority: 1,
							enabled: true
						}
					],
					defaultActions: [
						{
							type: 'ALLOW',
							parameters: {}
						}
					],
					qosConfig: {
						maxBitrate: 100,
						guaranteedBitrate: 10,
						priorityLevel: 5,
						arp: 6,
						qci: 9
					},
					chargingConfig: {
						chargingMethod: 'OFFLINE',
						rate: 0.0005,
						currency: 'USD',
						unit: 'MB'
					}
				}
			},
			{ 
				id: 'node-upf', 
				name: 'UPF', 
				nfType: 'UPF', 
				status: 'ACTIVE',
				messageConfig: {
					headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/json',
						'X-UPF-ID': 'upf-001'
					},
					body: {
						upfId: 'upf-001',
						interfaceType: 'N3',
						tunnelInfo: {
							localFTEID: 'fteid-123',
							remoteFTEID: 'fteid-456'
						}
					},
					contentType: 'application/json',
					acceptType: 'application/json'
				}
			},
		],
		steps: [
			{ id: 'step-1', stepNumber: 1, name: 'PDU Session Request', type: 'SEQUENTIAL', processes: ['proc-1-1', 'proc-1-2'] },
			{ id: 'step-2', stepNumber: 2, name: 'SM Policy Create', type: 'SEQUENTIAL', processes: ['proc-2-1', 'proc-2-2', 'proc-2-3'] },
			{ id: 'step-3', stepNumber: 3, name: 'Session Establishment', type: 'SEQUENTIAL', processes: ['proc-3-1'] },
		],
		processes: [
			{
				id: 'proc-1-1',
				type: 'sender',
				nodeId: 'node-ue',
				stepId: 'step-1',
				label: 'UE Sender',
				position: { x: 250, y: 120 },
				apiType: 'request',
				method: 'POST',
				endpoint: '/pdu-session-request',
				timeout: 5000,
				priority: 'HIGH',
			},
			{
				id: 'proc-1-2',
				type: 'receiver',
				nodeId: 'node-smf',
				stepId: 'step-1',
				label: 'SMF Receiver',
				position: { x: 650, y: 120 },
				apiType: 'request',
			},
			{
				id: 'proc-2-1',
				type: 'sender',
				nodeId: 'node-smf',
				stepId: 'step-2',
				label: 'SMF Sender',
				position: { x: 650, y: 220 },
				apiType: 'request',
				method: 'POST',
				endpoint: '/sm-policies',
				timeout: 8000,
				priority: 'CRITICAL',
			},
			{
				id: 'proc-2-2',
				type: 'receiver',
				nodeId: 'node-pcf',
				stepId: 'step-2',
				label: 'PCF Receiver',
				position: { x: 850, y: 220 },
				apiType: 'request',
			},
			{
				id: 'proc-2-3',
				type: 'process',
				nodeId: 'node-pcf',
				stepId: 'step-2',
				label: 'PCF Process 1',
				position: { x: 850, y: 280 },
			},
			{
				id: 'proc-3-1',
				type: 'process',
				nodeId: 'node-upf',
				stepId: 'step-3',
				label: 'UPF Process 1',
				position: { x: 1050, y: 320 },
			},
		],
	},
	'qos-on-demand': {
		metadata: {
			id: 'qos-on-demand',
			name: 'QoS on Demand',
			description: 'Dynamic QoS resource allocation based on application requirements',
			version: '1.1.0',
			createdAt: '2025-10-20',
			lastModified: '2025-11-18',
			author: 'Admin',
		},
		nodes: [
			{ 
				id: 'node-ue', 
				name: 'UE', 
				nfType: 'UE', 
				status: 'ACTIVE',
				messageConfig: {
					headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/json',
						'X-UE-ID': 'ue-12345'
					},
					body: {
						ueId: 'ue-12345',
						serviceType: 'streaming',
						requestedQoS: 'high-priority'
					},
					contentType: 'application/json',
					acceptType: 'application/json'
				}
			},
			{ 
				id: 'node-amf', 
				name: 'AMF', 
				nfType: 'AMF', 
				status: 'ACTIVE',
				messageConfig: {
					headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/json',
						'X-AMF-ID': 'amf-001'
					},
					body: {
						amfId: 'amf-001',
						registrationType: 'initial',
						requestedFeatures: ['qos-negotiation', 'location-services']
					},
					contentType: 'application/json',
					acceptType: 'application/json'
				}
			},
			{ 
				id: 'node-smf', 
				name: 'SMF', 
				nfType: 'SMF', 
				status: 'ACTIVE',
				messageConfig: {
					headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/json',
						'X-SMF-ID': 'smf-001'
					},
					body: {
						smfId: 'smf-001',
						sessionType: 'pdu-session',
						dnn: 'streaming',
						snssai: '2-0x01020304'
					},
					contentType: 'application/json',
					acceptType: 'application/json'
				}
			},
			{ 
				id: 'node-pcf', 
				name: 'PCF', 
				nfType: 'PCF', 
				status: 'ACTIVE',
				pcfConfig: {
					policyRules: [
						{
							id: 'rule-1',
							name: 'Streaming QoS Priority',
							description: 'High priority QoS for streaming services',
							conditions: [
								{
									type: 'SERVICE_TYPE',
									operator: 'EQUALS',
									value: 'streaming',
									logicalOperator: 'AND'
								},
								{
									type: 'SUBSCRIBER_PROFILE',
									operator: 'CONTAINS',
									value: 'premium',
									logicalOperator: 'OR'
								}
							],
							actions: [
								{
									type: 'MODIFY_QOS',
									parameters: {
										qosProfile: 'QCI-2',
										arp: 2,
										maxBitrate: '100Mbps',
										guaranteedBitrate: '20Mbps'
									}
								},
								{
									type: 'ALLOW',
									parameters: {}
								}
							],
							priority: 1,
							enabled: true
						},
						{
							id: 'rule-2',
							name: 'Dynamic QoS Adjustment',
							description: 'Adjust QoS based on network conditions',
							conditions: [
								{
									type: 'NETWORK_CONGESTION',
									operator: 'GREATER_THAN',
									value: '80%'
								}
							],
							actions: [
								{
									type: 'MODIFY_QOS',
									parameters: {
										qosProfile: 'QCI-6',
										arp: 6,
										maxBitrate: '50Mbps',
										guaranteedBitrate: '5Mbps'
									}
								},
								{
									type: 'LOG',
									parameters: {
										level: 'INFO',
										message: 'QoS adjusted due to high network load'
									}
								}
							],
							priority: 2,
							enabled: true
						}
					],
					defaultActions: [
						{
							type: 'ALLOW',
							parameters: {}
						}
					],
					qosConfig: {
						maxBitrate: 100,
						guaranteedBitrate: 20,
						priorityLevel: 2,
						arp: 2,
						qci: 2
					},
					chargingConfig: {
						chargingMethod: 'ONLINE',
						rate: 0.002,
						currency: 'USD',
						unit: 'MB'
					}
				}
			},
			{ 
				id: 'node-upf', 
				name: 'UPF', 
				nfType: 'UPF', 
				status: 'ACTIVE',
				messageConfig: {
					headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/json',
						'X-UPF-ID': 'upf-001'
					},
					body: {
						upfId: 'upf-001',
						interfaceType: 'N3',
						tunnelInfo: {
							localFTEID: 'fteid-789',
							remoteFTEID: 'fteid-012'
						}
					},
					contentType: 'application/json',
					acceptType: 'application/json'
				}
			},
		],
		steps: [
			{ id: 'step-1', stepNumber: 1, name: 'QoS Request', type: 'SEQUENTIAL', processes: ['proc-1-1', 'proc-1-2'] },
			{ id: 'step-2', stepNumber: 2, name: 'Policy Decision', type: 'SEQUENTIAL', processes: ['proc-2-1', 'proc-2-2', 'proc-2-3', 'proc-2-4'] },
			{ id: 'step-3', stepNumber: 3, name: 'QoS Enforcement', type: 'SEQUENTIAL', processes: ['proc-3-1', 'proc-3-2'] },
		],
		processes: [
			{
				id: 'proc-1-1',
				type: 'sender',
				nodeId: 'node-ue',
				stepId: 'step-1',
				label: 'UE Sender',
				position: { x: 250, y: 120 },
				method: 'POST',
				endpoint: '/qos-request',
			},
			{
				id: 'proc-1-2',
				type: 'receiver',
				nodeId: 'node-amf',
				stepId: 'step-1',
				label: 'AMF Receiver',
				position: { x: 450, y: 120 },
			},
			{
				id: 'proc-2-1',
				type: 'sender',
				nodeId: 'node-amf',
				stepId: 'step-2',
				label: 'AMF Sender',
				position: { x: 450, y: 220 },
				method: 'POST',
				endpoint: '/qos-policy-request',
			},
			{
				id: 'proc-2-2',
				type: 'receiver',
				nodeId: 'node-pcf',
				stepId: 'step-2',
				label: 'PCF Receiver',
				position: { x: 850, y: 220 },
			},
			{
				id: 'proc-2-3',
				type: 'sender',
				nodeId: 'node-pcf',
				stepId: 'step-2',
				label: 'PCF Sender',
				position: { x: 850, y: 280 },
				method: 'POST',
				endpoint: '/qos-decision',
			},
			{
				id: 'proc-2-4',
				type: 'receiver',
				nodeId: 'node-smf',
				stepId: 'step-2',
				label: 'SMF Receiver',
				position: { x: 650, y: 280 },
			},
			{
				id: 'proc-3-1',
				type: 'sender',
				nodeId: 'node-smf',
				stepId: 'step-3',
				label: 'SMF Sender',
				position: { x: 650, y: 380 },
				method: 'PUT',
				endpoint: '/qos-enforcement',
			},
			{
				id: 'proc-3-2',
				type: 'receiver',
				nodeId: 'node-upf',
				stepId: 'step-3',
				label: 'UPF Receiver',
				position: { x: 1050, y: 380 },
			},
		],
	},
	'vonr-call': {
		metadata: {
			id: 'vonr-call',
			name: 'VoNR Call',
			description: 'Voice over New Radio call establishment and maintenance',
			version: '1.0.0',
			createdAt: '2025-10-10',
			lastModified: '2025-11-17',
			author: 'Admin',
		},
		nodes: [
			{ id: 'node-ue', name: 'UE', nfType: 'UE', status: 'ACTIVE', messageConfig: { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-UE-ID': 'ue-12345' }, body: { ueId: 'ue-12345', serviceType: 'data', requestedQoS: 'standard' }, contentType: 'application/json', acceptType: 'application/json' } },
			{ id: 'node-amf', name: 'AMF', nfType: 'AMF', status: 'ACTIVE', messageConfig: { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-AMF-ID': 'amf-001' }, body: { amfId: 'amf-001', registrationType: 'initial', requestedFeatures: ['emergency-services', 'location-services'] }, contentType: 'application/json', acceptType: 'application/json' } },
			{ id: 'node-smf', name: 'SMF', nfType: 'SMF', status: 'ACTIVE', messageConfig: { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-SMF-ID': 'smf-001' }, body: { smfId: 'smf-001', sessionType: 'pdu-session', dnn: 'internet', snssai: '1-0x01010203' }, contentType: 'application/json', acceptType: 'application/json' } },
			{ id: 'node-pcf', name: 'PCF', nfType: 'PCF', status: 'ACTIVE', pcfConfig: { policyRules: [{ id: 'rule-1', name: 'Default Policy', description: 'Default policy configuration', conditions: [{ type: 'SERVICE_TYPE', operator: 'EQUALS', value: 'data', logicalOperator: 'AND' }], actions: [{ type: 'ALLOW', parameters: {} }], priority: 1, enabled: true }], defaultActions: [{ type: 'ALLOW', parameters: {} }], qosConfig: { maxBitrate: 100, guaranteedBitrate: 10, priorityLevel: 5, arp: 6, qci: 9 }, chargingConfig: { chargingMethod: 'OFFLINE', rate: 0.0005, currency: 'USD', unit: 'MB' } } },
			{ id: 'node-upf', name: 'UPF', nfType: 'UPF', status: 'ACTIVE', messageConfig: { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-UPF-ID': 'upf-001' }, body: { upfId: 'upf-001', interfaceType: 'N3', tunnelInfo: { localFTEID: 'fteid-123', remoteFTEID: 'fteid-456' } }, contentType: 'application/json', acceptType: 'application/json' } },
		],
		steps: [
			{ id: 'step-1', stepNumber: 1, name: 'Call Setup', type: 'SEQUENTIAL', processes: ['proc-1-1', 'proc-1-2', 'proc-1-3'] },
			{ id: 'step-2', stepNumber: 2, name: 'Voice Bearer Establishment', type: 'SEQUENTIAL', processes: ['proc-2-1', 'proc-2-2'] },
		],
		processes: [
			{
				id: 'proc-1-1',
				type: 'sender',
				nodeId: 'node-ue',
				stepId: 'step-1',
				label: 'UE Sender',
				position: { x: 250, y: 120 },
				method: 'POST',
				endpoint: '/voice-call-setup',
			},
			{
				id: 'proc-1-2',
				type: 'receiver',
				nodeId: 'node-amf',
				stepId: 'step-1',
				label: 'AMF Receiver',
				position: { x: 450, y: 120 },
			},
			{
				id: 'proc-1-3',
				type: 'process',
				nodeId: 'node-amf',
				stepId: 'step-1',
				label: 'AMF Process 1',
				position: { x: 450, y: 180 },
			},
			{
				id: 'proc-2-1',
				type: 'sender',
				nodeId: 'node-smf',
				stepId: 'step-2',
				label: 'SMF Sender',
				position: { x: 650, y: 280 },
				method: 'POST',
				endpoint: '/voice-bearer-setup',
			},
			{
				id: 'proc-2-2',
				type: 'receiver',
				nodeId: 'node-upf',
				stepId: 'step-2',
				label: 'UPF Receiver',
				position: { x: 1050, y: 280 },
			},
		],
	},
	'am-policy-association': {
		metadata: {
			id: 'am-policy-association',
			name: 'AM Policy Association',
			description: 'Access and Mobility management policy association with PCF',
			version: '1.0.0',
			createdAt: '2025-10-05',
			lastModified: '2025-11-16',
			author: 'Admin',
		},
		nodes: [
			{ id: 'node-ue', name: 'UE', nfType: 'UE', status: 'ACTIVE', messageConfig: { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-UE-ID': 'ue-12345' }, body: { ueId: 'ue-12345', serviceType: 'data', requestedQoS: 'standard' }, contentType: 'application/json', acceptType: 'application/json' } },
			{ id: 'node-amf', name: 'AMF', nfType: 'AMF', status: 'ACTIVE', messageConfig: { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-AMF-ID': 'amf-001' }, body: { amfId: 'amf-001', registrationType: 'initial', requestedFeatures: ['emergency-services', 'location-services'] }, contentType: 'application/json', acceptType: 'application/json' } },
			{ id: 'node-smf', name: 'SMF', nfType: 'SMF', status: 'ACTIVE', messageConfig: { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-SMF-ID': 'smf-001' }, body: { smfId: 'smf-001', sessionType: 'pdu-session', dnn: 'internet', snssai: '1-0x01010203' }, contentType: 'application/json', acceptType: 'application/json' } },
			{ id: 'node-pcf', name: 'PCF', nfType: 'PCF', status: 'ACTIVE', pcfConfig: { policyRules: [{ id: 'rule-1', name: 'Default Policy', description: 'Default policy configuration', conditions: [{ type: 'SERVICE_TYPE', operator: 'EQUALS', value: 'data', logicalOperator: 'AND' }], actions: [{ type: 'ALLOW', parameters: {} }], priority: 1, enabled: true }], defaultActions: [{ type: 'ALLOW', parameters: {} }], qosConfig: { maxBitrate: 100, guaranteedBitrate: 10, priorityLevel: 5, arp: 6, qci: 9 }, chargingConfig: { chargingMethod: 'OFFLINE', rate: 0.0005, currency: 'USD', unit: 'MB' } } },
			{ id: 'node-upf', name: 'UPF', nfType: 'UPF', status: 'ACTIVE', messageConfig: { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-UPF-ID': 'upf-001' }, body: { upfId: 'upf-001', interfaceType: 'N3', tunnelInfo: { localFTEID: 'fteid-123', remoteFTEID: 'fteid-456' } }, contentType: 'application/json', acceptType: 'application/json' } },
		],
		steps: [
			{ id: 'step-1', stepNumber: 1, name: 'Registration Complete', type: 'SEQUENTIAL', processes: ['proc-1-1'] },
			{ id: 'step-2', stepNumber: 2, name: 'AM Policy Create', type: 'SEQUENTIAL', processes: ['proc-2-1', 'proc-2-2'] },
		],
		processes: [
			{
				id: 'proc-1-1',
				type: 'process',
				nodeId: 'node-amf',
				stepId: 'step-1',
				label: 'AMF Process 1',
				position: { x: 450, y: 120 },
			},
			{
				id: 'proc-2-1',
				type: 'sender',
				nodeId: 'node-amf',
				stepId: 'step-2',
				label: 'AMF Sender',
				position: { x: 450, y: 220 },
				method: 'POST',
				endpoint: '/am-policies',
			},
			{
				id: 'proc-2-2',
				type: 'receiver',
				nodeId: 'node-pcf',
				stepId: 'step-2',
				label: 'PCF Receiver',
				position: { x: 850, y: 220 },
			},
		],
	},
	'am-policy-authorization': {
		metadata: {
			id: 'am-policy-authorization',
			name: 'AM Policy Authorization',
			description: 'Authorization check for Access and Mobility policies',
			version: '1.0.0',
			createdAt: '2025-09-28',
			lastModified: '2025-11-15',
			author: 'Admin',
		},
		nodes: [
			{ id: 'node-ue', name: 'UE', nfType: 'UE', status: 'ACTIVE', messageConfig: { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-UE-ID': 'ue-12345' }, body: { ueId: 'ue-12345', serviceType: 'data', requestedQoS: 'standard' }, contentType: 'application/json', acceptType: 'application/json' } },
			{ id: 'node-amf', name: 'AMF', nfType: 'AMF', status: 'ACTIVE', messageConfig: { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-AMF-ID': 'amf-001' }, body: { amfId: 'amf-001', registrationType: 'initial', requestedFeatures: ['emergency-services', 'location-services'] }, contentType: 'application/json', acceptType: 'application/json' } },
			{ id: 'node-smf', name: 'SMF', nfType: 'SMF', status: 'ACTIVE', messageConfig: { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-SMF-ID': 'smf-001' }, body: { smfId: 'smf-001', sessionType: 'pdu-session', dnn: 'internet', snssai: '1-0x01010203' }, contentType: 'application/json', acceptType: 'application/json' } },
			{ id: 'node-pcf', name: 'PCF', nfType: 'PCF', status: 'ACTIVE', pcfConfig: { policyRules: [{ id: 'rule-1', name: 'Default Policy', description: 'Default policy configuration', conditions: [{ type: 'SERVICE_TYPE', operator: 'EQUALS', value: 'data', logicalOperator: 'AND' }], actions: [{ type: 'ALLOW', parameters: {} }], priority: 1, enabled: true }], defaultActions: [{ type: 'ALLOW', parameters: {} }], qosConfig: { maxBitrate: 100, guaranteedBitrate: 10, priorityLevel: 5, arp: 6, qci: 9 }, chargingConfig: { chargingMethod: 'OFFLINE', rate: 0.0005, currency: 'USD', unit: 'MB' } } },
			{ id: 'node-upf', name: 'UPF', nfType: 'UPF', status: 'ACTIVE', messageConfig: { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-UPF-ID': 'upf-001' }, body: { upfId: 'upf-001', interfaceType: 'N3', tunnelInfo: { localFTEID: 'fteid-123', remoteFTEID: 'fteid-456' } }, contentType: 'application/json', acceptType: 'application/json' } },
		],
		steps: [
			{ id: 'step-1', stepNumber: 1, name: 'Authorization Request', type: 'SEQUENTIAL', processes: ['proc-1-1', 'proc-1-2', 'proc-1-3'] },
		],
		processes: [
			{
				id: 'proc-1-1',
				type: 'process',
				nodeId: 'node-amf',
				stepId: 'step-1',
				label: 'AMF Process 1',
				position: { x: 450, y: 120 },
			},
			{
				id: 'proc-1-2',
				type: 'sender',
				nodeId: 'node-amf',
				stepId: 'step-1',
				label: 'AMF Sender',
				position: { x: 450, y: 180 },
				method: 'POST',
				endpoint: '/am-policy-authorization',
			},
			{
				id: 'proc-1-3',
				type: 'receiver',
				nodeId: 'node-pcf',
				stepId: 'step-1',
				label: 'PCF Receiver',
				position: { x: 850, y: 180 },
			},
		],
	},
	'ue-policy-association': {
		metadata: {
			id: 'ue-policy-association',
			name: 'UE Policy Association',
			description: 'UE-specific policy association with PCF',
			version: '1.0.0',
			createdAt: '2025-09-20',
			lastModified: '2025-11-14',
			author: 'Admin',
		},
		nodes: [
			{ id: 'node-ue', name: 'UE', nfType: 'UE', status: 'ACTIVE', messageConfig: { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-UE-ID': 'ue-12345' }, body: { ueId: 'ue-12345', serviceType: 'data', requestedQoS: 'standard' }, contentType: 'application/json', acceptType: 'application/json' } },
			{ id: 'node-amf', name: 'AMF', nfType: 'AMF', status: 'ACTIVE', messageConfig: { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-AMF-ID': 'amf-001' }, body: { amfId: 'amf-001', registrationType: 'initial', requestedFeatures: ['emergency-services', 'location-services'] }, contentType: 'application/json', acceptType: 'application/json' } },
			{ id: 'node-smf', name: 'SMF', nfType: 'SMF', status: 'ACTIVE', messageConfig: { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-SMF-ID': 'smf-001' }, body: { smfId: 'smf-001', sessionType: 'pdu-session', dnn: 'internet', snssai: '1-0x01010203' }, contentType: 'application/json', acceptType: 'application/json' } },
			{ id: 'node-pcf', name: 'PCF', nfType: 'PCF', status: 'ACTIVE', pcfConfig: { policyRules: [{ id: 'rule-1', name: 'Default Policy', description: 'Default policy configuration', conditions: [{ type: 'SERVICE_TYPE', operator: 'EQUALS', value: 'data', logicalOperator: 'AND' }], actions: [{ type: 'ALLOW', parameters: {} }], priority: 1, enabled: true }], defaultActions: [{ type: 'ALLOW', parameters: {} }], qosConfig: { maxBitrate: 100, guaranteedBitrate: 10, priorityLevel: 5, arp: 6, qci: 9 }, chargingConfig: { chargingMethod: 'OFFLINE', rate: 0.0005, currency: 'USD', unit: 'MB' } } },
			{ id: 'node-upf', name: 'UPF', nfType: 'UPF', status: 'ACTIVE', messageConfig: { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-UPF-ID': 'upf-001' }, body: { upfId: 'upf-001', interfaceType: 'N3', tunnelInfo: { localFTEID: 'fteid-123', remoteFTEID: 'fteid-456' } }, contentType: 'application/json', acceptType: 'application/json' } },
		],
		steps: [
			{ id: 'step-1', stepNumber: 1, name: 'UE Context Request', type: 'SEQUENTIAL', processes: ['proc-1-1', 'proc-1-2'] },
			{ id: 'step-2', stepNumber: 2, name: 'Policy Association', type: 'SEQUENTIAL', processes: ['proc-2-1', 'proc-2-2'] },
		],
		processes: [
			{
				id: 'proc-1-1',
				type: 'sender',
				nodeId: 'node-ue',
				stepId: 'step-1',
				label: 'UE Sender',
				position: { x: 250, y: 120 },
				method: 'POST',
				endpoint: '/ue-context',
			},
			{
				id: 'proc-1-2',
				type: 'receiver',
				nodeId: 'node-amf',
				stepId: 'step-1',
				label: 'AMF Receiver',
				position: { x: 450, y: 120 },
			},
			{
				id: 'proc-2-1',
				type: 'sender',
				nodeId: 'node-amf',
				stepId: 'step-2',
				label: 'AMF Sender',
				position: { x: 450, y: 220 },
				method: 'POST',
				endpoint: '/ue-policies',
			},
			{
				id: 'proc-2-2',
				type: 'receiver',
				nodeId: 'node-pcf',
				stepId: 'step-2',
				label: 'PCF Receiver',
				position: { x: 850, y: 220 },
			},
		],
	},
	'ue-policy-delivery': {
		metadata: {
			id: 'ue-policy-delivery',
			name: 'UE Policy Delivery',
			description: 'Delivery of UE policies from PCF to UE via AMF',
			version: '1.0.0',
			createdAt: '2025-09-15',
			lastModified: '2025-11-13',
			author: 'Admin',
		},
		nodes: [
			{ id: 'node-ue', name: 'UE', nfType: 'UE', status: 'ACTIVE', messageConfig: { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-UE-ID': 'ue-12345' }, body: { ueId: 'ue-12345', serviceType: 'data', requestedQoS: 'standard' }, contentType: 'application/json', acceptType: 'application/json' } },
			{ id: 'node-amf', name: 'AMF', nfType: 'AMF', status: 'ACTIVE', messageConfig: { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-AMF-ID': 'amf-001' }, body: { amfId: 'amf-001', registrationType: 'initial', requestedFeatures: ['emergency-services', 'location-services'] }, contentType: 'application/json', acceptType: 'application/json' } },
			{ id: 'node-smf', name: 'SMF', nfType: 'SMF', status: 'ACTIVE', messageConfig: { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-SMF-ID': 'smf-001' }, body: { smfId: 'smf-001', sessionType: 'pdu-session', dnn: 'internet', snssai: '1-0x01010203' }, contentType: 'application/json', acceptType: 'application/json' } },
			{ id: 'node-pcf', name: 'PCF', nfType: 'PCF', status: 'ACTIVE', pcfConfig: { policyRules: [{ id: 'rule-1', name: 'Default Policy', description: 'Default policy configuration', conditions: [{ type: 'SERVICE_TYPE', operator: 'EQUALS', value: 'data', logicalOperator: 'AND' }], actions: [{ type: 'ALLOW', parameters: {} }], priority: 1, enabled: true }], defaultActions: [{ type: 'ALLOW', parameters: {} }], qosConfig: { maxBitrate: 100, guaranteedBitrate: 10, priorityLevel: 5, arp: 6, qci: 9 }, chargingConfig: { chargingMethod: 'OFFLINE', rate: 0.0005, currency: 'USD', unit: 'MB' } } },
			{ id: 'node-upf', name: 'UPF', nfType: 'UPF', status: 'ACTIVE', messageConfig: { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-UPF-ID': 'upf-001' }, body: { upfId: 'upf-001', interfaceType: 'N3', tunnelInfo: { localFTEID: 'fteid-123', remoteFTEID: 'fteid-456' } }, contentType: 'application/json', acceptType: 'application/json' } },
		],
		steps: [
			{ id: 'step-1', stepNumber: 1, name: 'Policy Notification', type: 'SEQUENTIAL', processes: ['proc-1-1', 'proc-1-2'] },
			{ id: 'step-2', stepNumber: 2, name: 'UE Policy Update', type: 'SEQUENTIAL', processes: ['proc-2-1', 'proc-2-2'] },
		],
		processes: [
			{
				id: 'proc-1-1',
				type: 'sender',
				nodeId: 'node-pcf',
				stepId: 'step-1',
				label: 'PCF Sender',
				position: { x: 850, y: 120 },
				method: 'POST',
				endpoint: '/policy-notification',
			},
			{
				id: 'proc-1-2',
				type: 'receiver',
				nodeId: 'node-amf',
				stepId: 'step-1',
				label: 'AMF Receiver',
				position: { x: 450, y: 120 },
			},
			{
				id: 'proc-2-1',
				type: 'sender',
				nodeId: 'node-amf',
				stepId: 'step-2',
				label: 'AMF Sender',
				position: { x: 450, y: 220 },
				method: 'PUT',
				endpoint: '/ue-policy-update',
			},
			{
				id: 'proc-2-2',
				type: 'receiver',
				nodeId: 'node-ue',
				stepId: 'step-2',
				label: 'UE Receiver',
				position: { x: 250, y: 220 },
			},
		],
	},
	'af-guidance-ursp': {
		metadata: {
			id: 'af-guidance-ursp',
			name: 'AF guidance on URSP',
			description: 'Application Function provides guidance for UE Route Selection Policy',
			version: '1.0.0',
			createdAt: '2025-09-10',
			lastModified: '2025-11-12',
			author: 'Admin',
		},
		nodes: [
			{ id: 'node-ue', name: 'UE', nfType: 'UE', status: 'ACTIVE', messageConfig: { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-UE-ID': 'ue-12345' }, body: { ueId: 'ue-12345', serviceType: 'data', requestedQoS: 'standard' }, contentType: 'application/json', acceptType: 'application/json' } },
			{ id: 'node-amf', name: 'AMF', nfType: 'AMF', status: 'ACTIVE', messageConfig: { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-AMF-ID': 'amf-001' }, body: { amfId: 'amf-001', registrationType: 'initial', requestedFeatures: ['emergency-services', 'location-services'] }, contentType: 'application/json', acceptType: 'application/json' } },
			{ id: 'node-smf', name: 'SMF', nfType: 'SMF', status: 'ACTIVE', messageConfig: { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-SMF-ID': 'smf-001' }, body: { smfId: 'smf-001', sessionType: 'pdu-session', dnn: 'internet', snssai: '1-0x01010203' }, contentType: 'application/json', acceptType: 'application/json' } },
			{ id: 'node-pcf', name: 'PCF', nfType: 'PCF', status: 'ACTIVE', pcfConfig: { policyRules: [{ id: 'rule-1', name: 'Default Policy', description: 'Default policy configuration', conditions: [{ type: 'SERVICE_TYPE', operator: 'EQUALS', value: 'data', logicalOperator: 'AND' }], actions: [{ type: 'ALLOW', parameters: {} }], priority: 1, enabled: true }], defaultActions: [{ type: 'ALLOW', parameters: {} }], qosConfig: { maxBitrate: 100, guaranteedBitrate: 10, priorityLevel: 5, arp: 6, qci: 9 }, chargingConfig: { chargingMethod: 'OFFLINE', rate: 0.0005, currency: 'USD', unit: 'MB' } } },
			{ id: 'node-upf', name: 'UPF', nfType: 'UPF', status: 'ACTIVE', messageConfig: { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-UPF-ID': 'upf-001' }, body: { upfId: 'upf-001', interfaceType: 'N3', tunnelInfo: { localFTEID: 'fteid-123', remoteFTEID: 'fteid-456' } }, contentType: 'application/json', acceptType: 'application/json' } },
		],
		steps: [
			{ id: 'step-1', stepNumber: 1, name: 'AF Request', type: 'SEQUENTIAL', processes: ['proc-1-1'] },
			{ id: 'step-2', stepNumber: 2, name: 'URSP Update', type: 'SEQUENTIAL', processes: ['proc-2-1', 'proc-2-2', 'proc-2-3', 'proc-2-4'] },
		],
		processes: [
			{
				id: 'proc-1-1',
				type: 'process',
				nodeId: 'node-pcf',
				stepId: 'step-1',
				label: 'PCF Process 1',
				position: { x: 850, y: 120 },
			},
			{
				id: 'proc-2-1',
				type: 'sender',
				nodeId: 'node-pcf',
				stepId: 'step-2',
				label: 'PCF Sender',
				position: { x: 850, y: 220 },
				method: 'PUT',
				endpoint: '/ursp-guidance',
			},
			{
				id: 'proc-2-2',
				type: 'receiver',
				nodeId: 'node-amf',
				stepId: 'step-2',
				label: 'AMF Receiver',
				position: { x: 450, y: 220 },
			},
			{
				id: 'proc-2-3',
				type: 'sender',
				nodeId: 'node-amf',
				stepId: 'step-2',
				label: 'AMF Sender',
				position: { x: 450, y: 280 },
				method: 'PUT',
				endpoint: '/ursp-update',
			},
			{
				id: 'proc-2-4',
				type: 'receiver',
				nodeId: 'node-ue',
				stepId: 'step-2',
				label: 'UE Receiver',
				position: { x: 250, y: 280 },
			},
		],
	},
};
