/**
 * PCF Flow Categories - Business-oriented flow organization
 * Based on 3GPP standards TS 29.512 (SM), TS 29.507 (AM), TS 29.525 (UE)
 */

export interface FlowCategory {
	id: string;
	name: string;
	description: string;
	icon: string;
	color: string;
	flows: FlowTemplate[];
}

export interface FlowTemplate {
	id: string;
	name: string;
	description: string;
	trigger: 'subscription' | 'on-demand' | 'periodic';
	standard: string; // 3GPP TS reference
	policyType: 'SM' | 'AM' | 'UE';
	components: {
		pcf: boolean;
		subscriptionManager: 'ABM' | 'UDR' | 'Both';
		ratingEngine: boolean;
		externalNFs: string[]; // AMF, SMF, NEF, AF, NWDAF, UDR
	};
}

export const pcfFlowCategories: FlowCategory[] = [
	{
		id: 'subscription-based',
		name: 'Subscription-Based Policies',
		description: 'Policy flows triggered by UE attach and PDU session requests',
		icon: '📱',
		color: '#3B82F6', // Blue
		flows: [
			{
				id: 'ue-attach-sm-policy',
				name: 'UE Attach - SM Policy Provisioning',
				description: 'Subscription-based SM policy provisioning when UE attaches and creates PDU session',
				trigger: 'subscription',
				standard: 'TS 29.512',
				policyType: 'SM',
				components: {
					pcf: true,
					subscriptionManager: 'Both',
					ratingEngine: true,
					externalNFs: ['UE', 'AMF', 'SMF', 'UPF', 'UDR', 'ABM']
				}
			},
			{
				id: 'pdu-session-establishment',
				name: 'PDU Session Establishment with QoS',
				description: 'Complete PDU session setup with QoS policy from subscriber profile',
				trigger: 'subscription',
				standard: 'TS 29.512',
				policyType: 'SM',
				components: {
					pcf: true,
					subscriptionManager: 'UDR',
					ratingEngine: true,
					externalNFs: ['UE', 'SMF', 'UPF', 'UDR']
				}
			},
			{
				id: 'ue-attach-am-policy',
				name: 'UE Attach - AM Policy Provisioning',
				description: 'Access and mobility policy provisioning during UE registration',
				trigger: 'subscription',
				standard: 'TS 29.507',
				policyType: 'AM',
				components: {
					pcf: true,
					subscriptionManager: 'UDR',
					ratingEngine: true,
					externalNFs: ['UE', 'AMF', 'UDR']
				}
			},
			{
				id: 'ue-attach-ue-policy',
				name: 'UE Attach - UE Policy Provisioning',
				description: 'UE-level traffic control policies during UE registration',
				trigger: 'subscription',
				standard: 'TS 29.525',
				policyType: 'UE',
				components: {
					pcf: true,
					subscriptionManager: 'UDR',
					ratingEngine: true,
					externalNFs: ['UE', 'AMF', 'UDR']
				}
			},
			{
				id: 'charging-policy-activation',
				name: 'Charging Policy Activation',
				description: 'Activate charging policies based on subscription tier',
				trigger: 'subscription',
				standard: 'TS 29.512',
				policyType: 'SM',
				components: {
					pcf: true,
					subscriptionManager: 'ABM',
					ratingEngine: true,
					externalNFs: ['SMF', 'ABM', 'CHF']
				}
			}
		]
	},
	{
		id: 'on-demand',
		name: 'On-Demand Policies',
		description: 'Dynamic policy provisioning based on external triggers',
		icon: '⚡',
		color: '#10B981', // Green
		flows: [
			{
				id: 'nef-qos-on-demand',
				name: 'NEF-triggered QoS On-Demand',
				description: '3rd party (via NEF) requests dynamic QoS policy for specific UE',
				trigger: 'on-demand',
				standard: 'TS 29.512',
				policyType: 'SM',
				components: {
					pcf: true,
					subscriptionManager: 'ABM',
					ratingEngine: false,
					externalNFs: ['NEF', 'AF', 'SMF', 'UPF', 'ABM']
				}
			},
			{
				id: 'af-influence-traffic-routing',
				name: 'AF Influence on Traffic Routing',
				description: 'Application Function influences traffic routing policy',
				trigger: 'on-demand',
				standard: 'TS 29.512',
				policyType: 'SM',
				components: {
					pcf: true,
					subscriptionManager: 'UDR',
					ratingEngine: false,
					externalNFs: ['NEF', 'AF', 'SMF', 'UDR']
				}
			},
			{
				id: 'usage-report-policy-update',
				name: 'Usage Report - Policy Update',
				description: 'SMF reports usage threshold, PCF updates policy dynamically',
				trigger: 'on-demand',
				standard: 'TS 29.512',
				policyType: 'SM',
				components: {
					pcf: true,
					subscriptionManager: 'ABM',
					ratingEngine: false,
					externalNFs: ['SMF', 'ABM', 'CHF']
				}
			},
			{
				id: 'location-change-policy-adjustment',
				name: 'Location Change - Policy Adjustment',
				description: 'AMF reports location change, PCF adjusts AM policy',
				trigger: 'on-demand',
				standard: 'TS 29.507',
				policyType: 'AM',
				components: {
					pcf: true,
					subscriptionManager: 'UDR',
					ratingEngine: false,
					externalNFs: ['AMF', 'UDR']
				}
			},
			{
				id: 'nwdaf-network-analytics',
				name: 'NWDAF Analytics - Policy Optimization',
				description: 'NWDAF provides network analytics, PCF optimizes policies',
				trigger: 'on-demand',
				standard: 'TS 29.512',
				policyType: 'SM',
				components: {
					pcf: true,
					subscriptionManager: 'UDR',
					ratingEngine: false,
					externalNFs: ['NWDAF', 'SMF', 'UDR']
				}
			},
			{
				id: 'emergency-qos-override',
				name: 'Emergency QoS Override',
				description: 'Emergency service request overrides normal QoS policies',
				trigger: 'on-demand',
				standard: 'TS 29.512',
				policyType: 'SM',
				components: {
					pcf: true,
					subscriptionManager: 'UDR',
					ratingEngine: false,
					externalNFs: ['AMF', 'SMF', 'UDR']
				}
			}
		]
	},
	{
		id: 'periodic',
		name: 'Periodic Policies',
		description: 'Scheduled policy updates and renewals',
		icon: '🔄',
		color: '#F59E0B', // Orange
		flows: [
			{
				id: 'daily-quota-renewal',
				name: 'Daily Data Quota Renewal',
				description: 'Scheduled daily renewal of data quota for subscription plans',
				trigger: 'periodic',
				standard: 'TS 29.512',
				policyType: 'SM',
				components: {
					pcf: true,
					subscriptionManager: 'ABM',
					ratingEngine: true,
					externalNFs: ['ABM', 'CHF', 'UDR']
				}
			},
			{
				id: 'weekly-plan-renewal',
				name: 'Weekly Plan Renewal',
				description: 'Weekly subscription plan renewal and policy update',
				trigger: 'periodic',
				standard: 'TS 29.512',
				policyType: 'SM',
				components: {
					pcf: true,
					subscriptionManager: 'ABM',
					ratingEngine: true,
					externalNFs: ['ABM', 'CHF', 'SMF', 'UDR']
				}
			},
			{
				id: 'monthly-plan-renewal',
				name: 'Monthly Plan Renewal',
				description: 'Monthly subscription plan renewal with full policy refresh',
				trigger: 'periodic',
				standard: 'TS 29.512',
				policyType: 'SM',
				components: {
					pcf: true,
					subscriptionManager: 'ABM',
					ratingEngine: true,
					externalNFs: ['ABM', 'CHF', 'SMF', 'UDR']
				}
			},
			{
				id: 'policy-audit-refresh',
				name: 'Policy Audit & Refresh',
				description: 'Periodic audit and refresh of active policies',
				trigger: 'periodic',
				standard: 'TS 29.512',
				policyType: 'SM',
				components: {
					pcf: true,
					subscriptionManager: 'UDR',
					ratingEngine: false,
					externalNFs: ['SMF', 'AMF', 'UDR']
				}
			},
			{
				id: 'time-based-qos-adjustment',
				name: 'Time-based QoS Adjustment',
				description: 'Adjust QoS based on time of day (peak/off-peak)',
				trigger: 'periodic',
				standard: 'TS 29.512',
				policyType: 'SM',
				components: {
					pcf: true,
					subscriptionManager: 'UDR',
					ratingEngine: false,
					externalNFs: ['SMF', 'UPF', 'UDR']
				}
			}
		]
	},
	{
		id: 'policy-management',
		name: 'Policy Management Operations',
		description: 'Policy lifecycle management flows',
		icon: '⚙️',
		color: '#8B5CF6', // Purple
		flows: [
			{
				id: 'policy-association-create',
				name: 'Create Policy Association',
				description: 'Establish new policy association for a UE session',
				trigger: 'subscription',
				standard: 'TS 29.512',
				policyType: 'SM',
				components: {
					pcf: true,
					subscriptionManager: 'UDR',
					ratingEngine: true,
					externalNFs: ['SMF', 'UDR']
				}
			},
			{
				id: 'policy-association-update',
				name: 'Update Policy Association',
				description: 'Modify existing policy association',
				trigger: 'on-demand',
				standard: 'TS 29.512',
				policyType: 'SM',
				components: {
					pcf: true,
					subscriptionManager: 'UDR',
					ratingEngine: false,
					externalNFs: ['SMF', 'UDR']
				}
			},
			{
				id: 'policy-association-delete',
				name: 'Delete Policy Association',
				description: 'Remove policy association when session terminates',
				trigger: 'on-demand',
				standard: 'TS 29.512',
				policyType: 'SM',
				components: {
					pcf: true,
					subscriptionManager: 'UDR',
					ratingEngine: false,
					externalNFs: ['SMF', 'UDR']
				}
			},
			{
				id: 'policy-subscription-notify',
				name: 'Policy Change Notification',
				description: 'PCF notifies NFs about policy changes',
				trigger: 'on-demand',
				standard: 'TS 29.512',
				policyType: 'SM',
				components: {
					pcf: true,
					subscriptionManager: 'UDR',
					ratingEngine: false,
					externalNFs: ['SMF', 'AMF']
				}
			}
		]
	},
	{
		id: 'advanced-scenarios',
		name: 'Advanced Policy Scenarios',
		description: 'Complex multi-step policy workflows',
		icon: '🎯',
		color: '#EF4444', // Red
		flows: [
			{
				id: 'voice-call-vonr',
				name: 'VoNR Call Setup with Priority QoS',
				description: 'Voice over NR call with dynamic QoS prioritization',
				trigger: 'subscription',
				standard: 'TS 29.512',
				policyType: 'SM',
				components: {
					pcf: true,
					subscriptionManager: 'UDR',
					ratingEngine: true,
					externalNFs: ['UE', 'AMF', 'SMF', 'UPF', 'IMS', 'UDR']
				}
			},
			{
				id: 'slice-based-policy',
				name: 'Network Slice-based Policy',
				description: 'Policy provisioning based on network slice selection',
				trigger: 'subscription',
				standard: 'TS 29.512',
				policyType: 'SM',
				components: {
					pcf: true,
					subscriptionManager: 'UDR',
					ratingEngine: true,
					externalNFs: ['AMF', 'SMF', 'NSSF', 'UDR']
				}
			},
			{
				id: 'roaming-policy-handover',
				name: 'Roaming Policy Handover',
				description: 'Policy transfer during roaming scenarios',
				trigger: 'on-demand',
				standard: 'TS 29.512',
				policyType: 'SM',
				components: {
					pcf: true,
					subscriptionManager: 'UDR',
					ratingEngine: false,
					externalNFs: ['AMF', 'SMF', 'V-PCF', 'H-PCF', 'UDR']
				}
			},
			{
				id: 'multi-access-pdu-session',
				name: 'Multi-Access PDU Session',
				description: 'Policy for PDU session with multiple access technologies',
				trigger: 'subscription',
				standard: 'TS 29.512',
				policyType: 'SM',
				components: {
					pcf: true,
					subscriptionManager: 'UDR',
					ratingEngine: true,
					externalNFs: ['AMF', 'SMF', 'UPF', 'UDR']
				}
			}
		]
	}
];

// Helper to get total flow count
export const getTotalFlowCount = (): number => {
	return pcfFlowCategories.reduce((total, category) => total + category.flows.length, 0);
};

// Helper to get flows by trigger type
export const getFlowsByTrigger = (trigger: 'subscription' | 'on-demand' | 'periodic'): FlowTemplate[] => {
	return pcfFlowCategories.flatMap(category => 
		category.flows.filter(flow => flow.trigger === trigger)
	);
};

// Helper to get flows by policy type
export const getFlowsByPolicyType = (policyType: 'SM' | 'AM' | 'UE'): FlowTemplate[] => {
	return pcfFlowCategories.flatMap(category => 
		category.flows.filter(flow => flow.policyType === policyType)
	);
};
