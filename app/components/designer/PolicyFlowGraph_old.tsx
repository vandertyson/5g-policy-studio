import React, { useCallback, useState } from 'react';
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
} from 'reactflow';
import 'reactflow/dist/style.css';
import { CloseOutlined } from '@ant-design/icons';

interface PolicyFlowGraphProps {
	policyId: number;
}

// Custom node component with delete button
const CustomStepNode = ({ data, selected }: NodeProps) => {
	return (
		<div
			className={`relative transition-all duration-200 ${
				selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
			}`}
			style={{
				background: data.background,
				border: data.border,
				color: data.color,
				padding: '12px 16px',
				borderRadius: 8,
				fontSize: 12,
				fontWeight: 500,
				minWidth: 120,
				textAlign: 'center',
				boxShadow: selected
					? '0 8px 16px rgba(0, 0, 0, 0.15)'
					: '0 2px 4px rgba(0, 0, 0, 0.08)',
			}}
		>
			{data.showDelete && (
				<button
					className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
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

const nodeTypes = {
	customStep: CustomStepNode,
};

// Mock flow data based on policy - sequence diagram / swim lane layout
const getFlowData = (policyId: number, onDeleteNode: (nodeId: string) => void) => {
	if (policyId === 1) {
		// Basic QoS Policy - Sequence diagram with NFs (AMF, SMF, PCF, UPF)
		const swimLaneX = {
			UE: 100,
			AMF: 300,
			SMF: 500,
			PCF: 700,
			UPF: 900,
		};
		
		return {
			nodes: [
				// Swim lane headers (Network Functions)
				{
					id: 'header-ue',
					data: { label: 'UE' },
					position: { x: swimLaneX.UE - 50, y: 20 },
					style: {
						background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
						color: 'white',
						padding: '10px 28px',
						borderRadius: 8,
						fontSize: 13,
						fontWeight: 600,
						border: 'none',
						boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
					},
					draggable: false,
				},
				{
					id: 'header-amf',
					data: { label: 'AMF' },
					position: { x: swimLaneX.AMF - 50, y: 20 },
					style: {
						background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
						color: 'white',
						padding: '10px 28px',
						borderRadius: 8,
						fontSize: 13,
						fontWeight: 600,
						border: 'none',
						boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
					},
					draggable: false,
				},
				{
					id: 'header-smf',
					data: { label: 'SMF' },
					position: { x: swimLaneX.SMF - 50, y: 20 },
					style: {
						background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
						color: 'white',
						padding: '10px 28px',
						borderRadius: 8,
						fontSize: 13,
						fontWeight: 600,
						border: 'none',
						boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
					},
					draggable: false,
				},
				{
					id: 'header-pcf',
					data: { label: 'PCF' },
					position: { x: swimLaneX.PCF - 50, y: 20 },
					style: {
						background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
						color: 'white',
						padding: '10px 28px',
						borderRadius: 8,
						fontSize: 13,
						fontWeight: 600,
						border: 'none',
						boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
					},
					draggable: false,
				},
				{
					id: 'header-upf',
					data: { label: 'UPF' },
					position: { x: swimLaneX.UPF - 50, y: 20 },
					style: {
						background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
						color: 'white',
						padding: '10px 28px',
						borderRadius: 8,
						fontSize: 13,
						fontWeight: 600,
						border: 'none',
						boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
					},
					draggable: false,
				},
				
				// Swim lane vertical lines
				{
					id: 'lane-ue',
					data: { label: '' },
					position: { x: swimLaneX.UE, y: 80 },
					style: {
						width: 2,
						height: 700,
						background: 'rgba(102, 126, 234, 0.2)',
						border: 'none',
						borderRadius: 0,
						pointerEvents: 'none',
					},
					draggable: false,
					selectable: false,
				},
				{
					id: 'lane-amf',
					data: { label: '' },
					position: { x: swimLaneX.AMF, y: 80 },
					style: {
						width: 2,
						height: 700,
						background: 'rgba(245, 87, 108, 0.2)',
						border: 'none',
						borderRadius: 0,
						pointerEvents: 'none',
					},
					draggable: false,
					selectable: false,
				},
				{
					id: 'lane-smf',
					data: { label: '' },
					position: { x: swimLaneX.SMF, y: 80 },
					style: {
						width: 2,
						height: 700,
						background: 'rgba(79, 172, 254, 0.2)',
						border: 'none',
						borderRadius: 0,
						pointerEvents: 'none',
					},
					draggable: false,
					selectable: false,
				},
				{
					id: 'lane-pcf',
					data: { label: '' },
					position: { x: swimLaneX.PCF, y: 80 },
					style: {
						width: 2,
						height: 700,
						background: 'rgba(67, 233, 123, 0.2)',
						border: 'none',
						borderRadius: 0,
						pointerEvents: 'none',
					},
					draggable: false,
					selectable: false,
				},
				{
					id: 'lane-upf',
					data: { label: '' },
					position: { x: swimLaneX.UPF, y: 80 },
					style: {
						width: 2,
						height: 700,
						background: 'rgba(250, 112, 154, 0.2)',
						border: 'none',
						borderRadius: 0,
						pointerEvents: 'none',
					},
					draggable: false,
					selectable: false,
				},
				
				// Step 1: PDU Session Request
				{
					id: 'step1-ue',
					type: 'customStep',
					data: { 
						label: 'PDU Session\nRequest',
						background: '#EFF6FF',
						border: '2px solid #3B82F6',
						color: '#1E3A8A',
						showDelete: true,
						onDelete: () => onDeleteNode('step1-ue'),
					},
					position: { x: swimLaneX.UE - 60, y: 130 },
				},
				
				// Step 2: Session Establishment Request (AMF)
				{
					id: 'step2-amf',
					type: 'customStep',
					data: { 
						label: 'Session\nEstablishment',
						background: '#FDF2F8',
						border: '2px solid #EC4899',
						color: '#831843',
						showDelete: true,
						onDelete: () => onDeleteNode('step2-amf'),
					},
					position: { x: swimLaneX.AMF - 60, y: 230 },
				},
				
				// Step 3: Create SM Context (SMF)
				{
					id: 'step3-smf',
					type: 'customStep',
					data: { 
						label: 'Create SM\nContext',
						background: '#ECFEFF',
						border: '2px solid #06B6D4',
						color: '#164E63',
						showDelete: true,
						onDelete: () => onDeleteNode('step3-smf'),
					},
					position: { x: swimLaneX.SMF - 60, y: 330 },
				},
				
				// Step 4: Get Policy (PCF)
				{
					id: 'step4-pcf',
					type: 'customStep',
					data: { 
						label: 'Policy\nDecision',
						background: '#F0FDF4',
						border: '2px solid #10B981',
						color: '#14532D',
						showDelete: true,
						onDelete: () => onDeleteNode('step4-pcf'),
					},
					position: { x: swimLaneX.PCF - 60, y: 430 },
				},
				
				// Step 5: QoS Rules Response (back to SMF)
				{
					id: 'step5-smf',
					type: 'customStep',
					data: { 
						label: 'Apply QoS\nRules',
						background: '#ECFEFF',
						border: '2px solid #06B6D4',
						color: '#164E63',
						showDelete: true,
						onDelete: () => onDeleteNode('step5-smf'),
					},
					position: { x: swimLaneX.SMF - 60, y: 530 },
				},
				
				// Step 6: N4 Session Establishment (UPF)
				{
					id: 'step6-upf',
					type: 'customStep',
					data: { 
						label: 'N4 Session\nEstablishment',
						background: '#FFF7ED',
						border: '2px solid #F97316',
						color: '#7C2D12',
						showDelete: true,
						onDelete: () => onDeleteNode('step6-upf'),
					},
					position: { x: swimLaneX.UPF - 60, y: 630 },
				},
				
				// Step 7: Session Established (back to UE)
				{
					id: 'step7-ue',
					type: 'customStep',
					data: { 
						label: 'Session\nEstablished',
						background: '#F0FDF4',
						border: '2px solid #059669',
						color: '#14532D',
						showDelete: true,
						onDelete: () => onDeleteNode('step7-ue'),
					},
					position: { x: swimLaneX.UE - 60, y: 730 },
				},
			],
			edges: [
				// UE -> AMF
				{
					id: 'e1',
					source: 'step1-ue',
					target: 'step2-amf',
					label: 'PDU Session Request',
					type: 'smoothstep',
					animated: true,
					style: { stroke: '#667eea', strokeWidth: 2.5 },
					markerEnd: { type: MarkerType.ArrowClosed, color: '#667eea' },
					labelStyle: { fill: '#4c51bf', fontWeight: 600, fontSize: 11 },
					labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9 },
				},
				// AMF -> SMF
				{
					id: 'e2',
					source: 'step2-amf',
					target: 'step3-smf',
					label: 'Create SM Context',
					type: 'smoothstep',
					animated: true,
					style: { stroke: '#f093fb', strokeWidth: 2.5 },
					markerEnd: { type: MarkerType.ArrowClosed, color: '#f093fb' },
					labelStyle: { fill: '#831843', fontWeight: 600, fontSize: 11 },
					labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9 },
				},
				// SMF -> PCF
				{
					id: 'e3',
					source: 'step3-smf',
					target: 'step4-pcf',
					label: 'Get Policy',
					type: 'smoothstep',
					animated: true,
					style: { stroke: '#4facfe', strokeWidth: 2.5 },
					markerEnd: { type: MarkerType.ArrowClosed, color: '#4facfe' },
					labelStyle: { fill: '#164E63', fontWeight: 600, fontSize: 11 },
					labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9 },
				},
				// PCF -> SMF (response)
				{
					id: 'e4',
					source: 'step4-pcf',
					target: 'step5-smf',
					label: 'Policy Response',
					type: 'smoothstep',
					style: { stroke: '#43e97b', strokeWidth: 2.5, strokeDasharray: '8,4' },
					markerEnd: { type: MarkerType.ArrowClosed, color: '#43e97b' },
					labelStyle: { fill: '#14532D', fontWeight: 600, fontSize: 11 },
					labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9 },
				},
				// SMF -> UPF
				{
					id: 'e5',
					source: 'step5-smf',
					target: 'step6-upf',
					label: 'N4 Session Request',
					type: 'smoothstep',
					animated: true,
					style: { stroke: '#4facfe', strokeWidth: 2.5 },
					markerEnd: { type: MarkerType.ArrowClosed, color: '#4facfe' },
					labelStyle: { fill: '#164E63', fontWeight: 600, fontSize: 11 },
					labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9 },
				},
				// UPF -> UE (via AMF - simplified)
				{
					id: 'e6',
					source: 'step6-upf',
					target: 'step7-ue',
					label: 'Session Established',
					type: 'smoothstep',
					animated: true,
					style: { stroke: '#fa709a', strokeWidth: 2.5 },
					markerEnd: { type: MarkerType.ArrowClosed, color: '#fa709a' },
					labelStyle: { fill: '#7C2D12', fontWeight: 600, fontSize: 11 },
					labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9 },
				},
			],
		};
	} else if (policyId === 2) {
		// Basic QoS Policy - Sequence diagram with NFs (AMF, SMF, PCF, UPF)
		const swimLaneX = {
			UE: 100,
			AMF: 300,
			SMF: 500,
			PCF: 700,
			UPF: 900,
		};
		
		return {
			nodes: [
				// Swim lane headers (Network Functions)
				{
					id: 'header-ue',
					data: { label: 'UE' },
					position: { x: swimLaneX.UE - 40, y: 20 },
					style: {
						background: '#1E40AF',
						color: 'white',
						padding: '8px 24px',
						borderRadius: 6,
						fontSize: 14,
						fontWeight: 600,
						border: 'none',
					},
					draggable: false,
				},
				{
					id: 'header-amf',
					data: { label: 'AMF' },
					position: { x: swimLaneX.AMF - 40, y: 20 },
					style: {
						background: '#7C3AED',
						color: 'white',
						padding: '8px 24px',
						borderRadius: 6,
						fontSize: 14,
						fontWeight: 600,
						border: 'none',
					},
					draggable: false,
				},
				{
					id: 'header-smf',
					data: { label: 'SMF' },
					position: { x: swimLaneX.SMF - 40, y: 20 },
					style: {
						background: '#059669',
						color: 'white',
						padding: '8px 24px',
						borderRadius: 6,
						fontSize: 14,
						fontWeight: 600,
						border: 'none',
					},
					draggable: false,
				},
				{
					id: 'header-pcf',
					data: { label: 'PCF' },
					position: { x: swimLaneX.PCF - 40, y: 20 },
					style: {
						background: '#DC2626',
						color: 'white',
						padding: '8px 24px',
						borderRadius: 6,
						fontSize: 14,
						fontWeight: 600,
						border: 'none',
					},
					draggable: false,
				},
				{
					id: 'header-upf',
					data: { label: 'UPF' },
					position: { x: swimLaneX.UPF - 40, y: 20 },
					style: {
						background: '#EA580C',
						color: 'white',
						padding: '8px 24px',
						borderRadius: 6,
						fontSize: 14,
						fontWeight: 600,
						border: 'none',
					},
					draggable: false,
				},
				
				// Step 1: PDU Session Request
				{
					id: 'step1-ue',
					data: { label: 'PDU Session\nRequest' },
					position: { x: swimLaneX.UE - 60, y: 120 },
					style: {
						background: '#DBEAFE',
						border: '2px solid #3B82F6',
						color: '#1E40AF',
						padding: '10px',
						borderRadius: 6,
						fontSize: 12,
						minWidth: 120,
					},
				},
				
				// Step 2: Session Establishment Request (AMF)
				{
					id: 'step2-amf',
					data: { label: 'Session\nEstablishment' },
					position: { x: swimLaneX.AMF - 60, y: 220 },
					style: {
						background: '#F3E8FF',
						border: '2px solid #A855F7',
						color: '#6B21A8',
						padding: '10px',
						borderRadius: 6,
						fontSize: 12,
						minWidth: 120,
					},
				},
				
				// Step 3: Create SM Context (SMF)
				{
					id: 'step3-smf',
					data: { label: 'Create SM\nContext' },
					position: { x: swimLaneX.SMF - 60, y: 320 },
					style: {
						background: '#D1FAE5',
						border: '2px solid #10B981',
						color: '#065F46',
						padding: '10px',
						borderRadius: 6,
						fontSize: 12,
						minWidth: 120,
					},
				},
				
				// Step 4: Get Policy (PCF)
				{
					id: 'step4-pcf',
					data: { label: 'Policy\nDecision' },
					position: { x: swimLaneX.PCF - 60, y: 420 },
					style: {
						background: '#FEE2E2',
						border: '2px solid #EF4444',
						color: '#991B1B',
						padding: '10px',
						borderRadius: 6,
						fontSize: 12,
						minWidth: 120,
					},
				},
				
				// Step 5: QoS Rules Response (back to SMF)
				{
					id: 'step5-smf',
					data: { label: 'Apply QoS\nRules' },
					position: { x: swimLaneX.SMF - 60, y: 520 },
					style: {
						background: '#D1FAE5',
						border: '2px solid #10B981',
						color: '#065F46',
						padding: '10px',
						borderRadius: 6,
						fontSize: 12,
						minWidth: 120,
					},
				},
				
				// Step 6: N4 Session Establishment (UPF)
				{
					id: 'step6-upf',
					data: { label: 'N4 Session\nEstablishment' },
					position: { x: swimLaneX.UPF - 60, y: 620 },
					style: {
						background: '#FED7AA',
						border: '2px solid #F97316',
						color: '#9A3412',
						padding: '10px',
						borderRadius: 6,
						fontSize: 12,
						minWidth: 120,
					},
				},
				
				// Step 7: Session Established (back to UE)
				{
					id: 'step7-ue',
					data: { label: 'Session\nEstablished' },
					position: { x: swimLaneX.UE - 60, y: 720 },
					style: {
						background: '#D1FAE5',
						border: '2px solid #059669',
						color: '#065F46',
						padding: '10px',
						borderRadius: 6,
						fontSize: 12,
						fontWeight: 600,
						minWidth: 120,
					},
				},
			],
			edges: [
				// UE -> AMF
				{
					id: 'e1',
					source: 'step1-ue',
					target: 'step2-amf',
					label: '1. PDU Session Request',
					type: 'smoothstep',
					animated: true,
					style: { stroke: '#3B82F6', strokeWidth: 2 },
					markerEnd: { type: MarkerType.ArrowClosed, color: '#3B82F6' },
					labelStyle: { fill: '#1E40AF', fontWeight: 500, fontSize: 11 },
					labelBgStyle: { fill: '#EFF6FF' },
				},
				// AMF -> SMF
				{
					id: 'e2',
					source: 'step2-amf',
					target: 'step3-smf',
					label: '2. Create SM Context Request',
					type: 'smoothstep',
					animated: true,
					style: { stroke: '#8B5CF6', strokeWidth: 2 },
					markerEnd: { type: MarkerType.ArrowClosed, color: '#8B5CF6' },
					labelStyle: { fill: '#6B21A8', fontWeight: 500, fontSize: 11 },
					labelBgStyle: { fill: '#F3E8FF' },
				},
				// SMF -> PCF
				{
					id: 'e3',
					source: 'step3-smf',
					target: 'step4-pcf',
					label: '3. Get Policy Request',
					type: 'smoothstep',
					animated: true,
					style: { stroke: '#10B981', strokeWidth: 2 },
					markerEnd: { type: MarkerType.ArrowClosed, color: '#10B981' },
					labelStyle: { fill: '#065F46', fontWeight: 500, fontSize: 11 },
					labelBgStyle: { fill: '#D1FAE5' },
				},
				// PCF -> SMF (response)
				{
					id: 'e4',
					source: 'step4-pcf',
					target: 'step5-smf',
					label: '4. Policy Decision Response',
					type: 'smoothstep',
					style: { stroke: '#EF4444', strokeWidth: 2, strokeDasharray: '5,5' },
					markerEnd: { type: MarkerType.ArrowClosed, color: '#EF4444' },
					labelStyle: { fill: '#991B1B', fontWeight: 500, fontSize: 11 },
					labelBgStyle: { fill: '#FEE2E2' },
				},
				// SMF -> UPF
				{
					id: 'e5',
					source: 'step5-smf',
					target: 'step6-upf',
					label: '5. N4 Session Request',
					type: 'smoothstep',
					animated: true,
					style: { stroke: '#10B981', strokeWidth: 2 },
					markerEnd: { type: MarkerType.ArrowClosed, color: '#10B981' },
					labelStyle: { fill: '#065F46', fontWeight: 500, fontSize: 11 },
					labelBgStyle: { fill: '#D1FAE5' },
				},
				// UPF -> UE (via AMF - simplified)
				{
					id: 'e6',
					source: 'step6-upf',
					target: 'step7-ue',
					label: '6. Session Established',
					type: 'smoothstep',
					animated: true,
					style: { stroke: '#059669', strokeWidth: 2 },
					markerEnd: { type: MarkerType.ArrowClosed, color: '#059669' },
					labelStyle: { fill: '#065F46', fontWeight: 500, fontSize: 11 },
					labelBgStyle: { fill: '#D1FAE5' },
				},
			],
		};
	} else if (policyId === 2) {
		// Premium Bandwidth - Sequence with different NFs (UE, NEF, PCF, UPF)
		const swimLaneX = {
			UE: 100,
			NEF: 300,
			PCF: 500,
			SMF: 700,
			UPF: 900,
		};
		
		return {
			nodes: [
				// Headers
				{
					id: 'header-ue',
					data: { label: 'UE' },
					position: { x: swimLaneX.UE - 40, y: 20 },
					style: {
						background: '#1E40AF',
						color: 'white',
						padding: '8px 24px',
						borderRadius: 6,
						fontSize: 14,
						fontWeight: 600,
						border: 'none',
					},
					draggable: false,
				},
				{
					id: 'header-nef',
					data: { label: 'NEF' },
					position: { x: swimLaneX.NEF - 40, y: 20 },
					style: {
						background: '#7C3AED',
						color: 'white',
						padding: '8px 24px',
						borderRadius: 6,
						fontSize: 14,
						fontWeight: 600,
						border: 'none',
					},
					draggable: false,
				},
				{
					id: 'header-pcf',
					data: { label: 'PCF' },
					position: { x: swimLaneX.PCF - 40, y: 20 },
					style: {
						background: '#DC2626',
						color: 'white',
						padding: '8px 24px',
						borderRadius: 6,
						fontSize: 14,
						fontWeight: 600,
						border: 'none',
					},
					draggable: false,
				},
				{
					id: 'header-smf',
					data: { label: 'SMF' },
					position: { x: swimLaneX.SMF - 40, y: 20 },
					style: {
						background: '#059669',
						color: 'white',
						padding: '8px 24px',
						borderRadius: 6,
						fontSize: 14,
						fontWeight: 600,
						border: 'none',
					},
					draggable: false,
				},
				{
					id: 'header-upf',
					data: { label: 'UPF' },
					position: { x: swimLaneX.UPF - 40, y: 20 },
					style: {
						background: '#EA580C',
						color: 'white',
						padding: '8px 24px',
						borderRadius: 6,
						fontSize: 14,
						fontWeight: 600,
						border: 'none',
					},
					draggable: false,
				},
				
				// Steps
				{
					id: 'step1-ue',
					data: { label: 'Bandwidth\nRequest' },
					position: { x: swimLaneX.UE - 60, y: 120 },
					style: {
						background: '#DBEAFE',
						border: '2px solid #3B82F6',
						color: '#1E40AF',
						padding: '10px',
						borderRadius: 6,
						fontSize: 12,
						minWidth: 120,
					},
				},
				{
					id: 'step2-nef',
					data: { label: 'Service\nRequest' },
					position: { x: swimLaneX.NEF - 60, y: 220 },
					style: {
						background: '#F3E8FF',
						border: '2px solid #A855F7',
						color: '#6B21A8',
						padding: '10px',
						borderRadius: 6,
						fontSize: 12,
						minWidth: 120,
					},
				},
				{
					id: 'step3-pcf',
					data: { label: 'Policy\nUpdate' },
					position: { x: swimLaneX.PCF - 60, y: 320 },
					style: {
						background: '#FEE2E2',
						border: '2px solid #EF4444',
						color: '#991B1B',
						padding: '10px',
						borderRadius: 6,
						fontSize: 12,
						minWidth: 120,
					},
				},
				{
					id: 'step4-smf',
					data: { label: 'Update\nQoS Flow' },
					position: { x: swimLaneX.SMF - 60, y: 420 },
					style: {
						background: '#D1FAE5',
						border: '2px solid #10B981',
						color: '#065F46',
						padding: '10px',
						borderRadius: 6,
						fontSize: 12,
						minWidth: 120,
					},
				},
				{
					id: 'step5-upf',
					data: { label: 'Allocate High\nBandwidth' },
					position: { x: swimLaneX.UPF - 60, y: 520 },
					style: {
						background: '#FED7AA',
						border: '2px solid #F97316',
						color: '#9A3412',
						padding: '10px',
						borderRadius: 6,
						fontSize: 12,
						minWidth: 120,
					},
				},
				{
					id: 'step6-ue',
					data: { label: 'Bandwidth\nAllocated' },
					position: { x: swimLaneX.UE - 60, y: 620 },
					style: {
						background: '#D1FAE5',
						border: '2px solid #059669',
						color: '#065F46',
						padding: '10px',
						borderRadius: 6,
						fontSize: 12,
						fontWeight: 600,
						minWidth: 120,
					},
				},
			],
			edges: [
				{
					id: 'e1',
					source: 'step1-ue',
					target: 'step2-nef',
					label: '1. Bandwidth Request',
					type: 'smoothstep',
					animated: true,
					style: { stroke: '#3B82F6', strokeWidth: 2 },
					markerEnd: { type: MarkerType.ArrowClosed, color: '#3B82F6' },
					labelStyle: { fill: '#1E40AF', fontWeight: 500, fontSize: 11 },
					labelBgStyle: { fill: '#EFF6FF' },
				},
				{
					id: 'e2',
					source: 'step2-nef',
					target: 'step3-pcf',
					label: '2. Policy Request',
					type: 'smoothstep',
					animated: true,
					style: { stroke: '#8B5CF6', strokeWidth: 2 },
					markerEnd: { type: MarkerType.ArrowClosed, color: '#8B5CF6' },
					labelStyle: { fill: '#6B21A8', fontWeight: 500, fontSize: 11 },
					labelBgStyle: { fill: '#F3E8FF' },
				},
				{
					id: 'e3',
					source: 'step3-pcf',
					target: 'step4-smf',
					label: '3. Update Policy',
					type: 'smoothstep',
					style: { stroke: '#EF4444', strokeWidth: 2, strokeDasharray: '5,5' },
					markerEnd: { type: MarkerType.ArrowClosed, color: '#EF4444' },
					labelStyle: { fill: '#991B1B', fontWeight: 500, fontSize: 11 },
					labelBgStyle: { fill: '#FEE2E2' },
				},
				{
					id: 'e4',
					source: 'step4-smf',
					target: 'step5-upf',
					label: '4. N4 Update',
					type: 'smoothstep',
					animated: true,
					style: { stroke: '#10B981', strokeWidth: 2 },
					markerEnd: { type: MarkerType.ArrowClosed, color: '#10B981' },
					labelStyle: { fill: '#065F46', fontWeight: 500, fontSize: 11 },
					labelBgStyle: { fill: '#D1FAE5' },
				},
				{
					id: 'e5',
					source: 'step5-upf',
					target: 'step6-ue',
					label: '5. Confirm Allocation',
					type: 'smoothstep',
					animated: true,
					style: { stroke: '#059669', strokeWidth: 2 },
					markerEnd: { type: MarkerType.ArrowClosed, color: '#059669' },
					labelStyle: { fill: '#065F46', fontWeight: 500, fontSize: 11 },
					labelBgStyle: { fill: '#D1FAE5' },
				},
			],
		};
	} else {
		// IoT Device Policy - Sequence diagram
		const swimLaneX = {
			IoT: 100,
			AMF: 300,
			PCF: 500,
			SMF: 700,
			UPF: 900,
		};
		
		return {
			nodes: [
				// Headers
				{
					id: 'header-iot',
					data: { label: 'IoT Device' },
					position: { x: swimLaneX.IoT - 60, y: 20 },
					style: {
						background: '#1E40AF',
						color: 'white',
						padding: '8px 20px',
						borderRadius: 6,
						fontSize: 14,
						fontWeight: 600,
						border: 'none',
					},
					draggable: false,
				},
				{
					id: 'header-amf',
					data: { label: 'AMF' },
					position: { x: swimLaneX.AMF - 40, y: 20 },
					style: {
						background: '#7C3AED',
						color: 'white',
						padding: '8px 24px',
						borderRadius: 6,
						fontSize: 14,
						fontWeight: 600,
						border: 'none',
					},
					draggable: false,
				},
				{
					id: 'header-pcf',
					data: { label: 'PCF' },
					position: { x: swimLaneX.PCF - 40, y: 20 },
					style: {
						background: '#DC2626',
						color: 'white',
						padding: '8px 24px',
						borderRadius: 6,
						fontSize: 14,
						fontWeight: 600,
						border: 'none',
					},
					draggable: false,
				},
				{
					id: 'header-smf',
					data: { label: 'SMF' },
					position: { x: swimLaneX.SMF - 40, y: 20 },
					style: {
						background: '#059669',
						color: 'white',
						padding: '8px 24px',
						borderRadius: 6,
						fontSize: 14,
						fontWeight: 600,
						border: 'none',
					},
					draggable: false,
				},
				{
					id: 'header-upf',
					data: { label: 'UPF' },
					position: { x: swimLaneX.UPF - 40, y: 20 },
					style: {
						background: '#EA580C',
						color: 'white',
						padding: '8px 24px',
						borderRadius: 6,
						fontSize: 14,
						fontWeight: 600,
						border: 'none',
					},
					draggable: false,
				},
				
				// Steps
				{
					id: 'step1-iot',
					data: { label: 'Device\nRegistration' },
					position: { x: swimLaneX.IoT - 60, y: 120 },
					style: {
						background: '#DBEAFE',
						border: '2px solid #3B82F6',
						color: '#1E40AF',
						padding: '10px',
						borderRadius: 6,
						fontSize: 12,
						minWidth: 120,
					},
				},
				{
					id: 'step2-amf',
					data: { label: 'Identify\nDevice Type' },
					position: { x: swimLaneX.AMF - 60, y: 220 },
					style: {
						background: '#F3E8FF',
						border: '2px solid #A855F7',
						color: '#6B21A8',
						padding: '10px',
						borderRadius: 6,
						fontSize: 12,
						minWidth: 120,
					},
				},
				{
					id: 'step3-pcf',
					data: { label: 'Get IoT\nPolicy' },
					position: { x: swimLaneX.PCF - 60, y: 320 },
					style: {
						background: '#FEE2E2',
						border: '2px solid #EF4444',
						color: '#991B1B',
						padding: '10px',
						borderRadius: 6,
						fontSize: 12,
						minWidth: 120,
					},
				},
				{
					id: 'step4-smf',
					data: { label: 'Apply Low\nLatency QoS' },
					position: { x: swimLaneX.SMF - 60, y: 420 },
					style: {
						background: '#D1FAE5',
						border: '2px solid #10B981',
						color: '#065F46',
						padding: '10px',
						borderRadius: 6,
						fontSize: 12,
						minWidth: 120,
					},
				},
				{
					id: 'step5-upf',
					data: { label: 'Configure\nUPF Rules' },
					position: { x: swimLaneX.UPF - 60, y: 520 },
					style: {
						background: '#FED7AA',
						border: '2px solid #F97316',
						color: '#9A3412',
						padding: '10px',
						borderRadius: 6,
						fontSize: 12,
						minWidth: 120,
					},
				},
				{
					id: 'step6-iot',
					data: { label: 'IoT Policy\nActive' },
					position: { x: swimLaneX.IoT - 60, y: 620 },
					style: {
						background: '#D1FAE5',
						border: '2px solid #059669',
						color: '#065F46',
						padding: '10px',
						borderRadius: 6,
						fontSize: 12,
						fontWeight: 600,
						minWidth: 120,
					},
				},
			],
			edges: [
				{
					id: 'e1',
					source: 'step1-iot',
					target: 'step2-amf',
					label: '1. Registration Request',
					type: 'smoothstep',
					animated: true,
					style: { stroke: '#3B82F6', strokeWidth: 2 },
					markerEnd: { type: MarkerType.ArrowClosed, color: '#3B82F6' },
					labelStyle: { fill: '#1E40AF', fontWeight: 500, fontSize: 11 },
					labelBgStyle: { fill: '#EFF6FF' },
				},
				{
					id: 'e2',
					source: 'step2-amf',
					target: 'step3-pcf',
					label: '2. Policy Request',
					type: 'smoothstep',
					animated: true,
					style: { stroke: '#8B5CF6', strokeWidth: 2 },
					markerEnd: { type: MarkerType.ArrowClosed, color: '#8B5CF6' },
					labelStyle: { fill: '#6B21A8', fontWeight: 500, fontSize: 11 },
					labelBgStyle: { fill: '#F3E8FF' },
				},
				{
					id: 'e3',
					source: 'step3-pcf',
					target: 'step4-smf',
					label: '3. IoT Policy Response',
					type: 'smoothstep',
					style: { stroke: '#EF4444', strokeWidth: 2, strokeDasharray: '5,5' },
					markerEnd: { type: MarkerType.ArrowClosed, color: '#EF4444' },
					labelStyle: { fill: '#991B1B', fontWeight: 500, fontSize: 11 },
					labelBgStyle: { fill: '#FEE2E2' },
				},
				{
					id: 'e4',
					source: 'step4-smf',
					target: 'step5-upf',
					label: '4. N4 Session Modify',
					type: 'smoothstep',
					animated: true,
					style: { stroke: '#10B981', strokeWidth: 2 },
					markerEnd: { type: MarkerType.ArrowClosed, color: '#10B981' },
					labelStyle: { fill: '#065F46', fontWeight: 500, fontSize: 11 },
					labelBgStyle: { fill: '#D1FAE5' },
				},
				{
					id: 'e5',
					source: 'step5-upf',
					target: 'step6-iot',
					label: '5. Confirm Active',
					type: 'smoothstep',
					animated: true,
					style: { stroke: '#059669', strokeWidth: 2 },
					markerEnd: { type: MarkerType.ArrowClosed, color: '#059669' },
					labelStyle: { fill: '#065F46', fontWeight: 500, fontSize: 11 },
					labelBgStyle: { fill: '#D1FAE5' },
				},
			],
		};
	}
};

export default function PolicyFlowGraph({ policyId }: PolicyFlowGraphProps) {
	const [selectedNode, setSelectedNode] = useState<string | null>(null);
	
	const handleDeleteNode = useCallback((nodeId: string) => {
		setNodes((nds) => nds.filter((node) => node.id !== nodeId));
		setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
	}, []);

	const flowData = getFlowData(policyId, handleDeleteNode);
	const [nodes, setNodes, onNodesChange] = useNodesState(flowData.nodes as Node[]);
	const [edges, setEdges, onEdgesChange] = useEdgesState(flowData.edges as Edge[]);

	const onConnect = useCallback(
		(params: Connection) => setEdges((eds) => addEdge(params, eds)),
		[setEdges]
	);

	const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
		setSelectedNode(node.id);
	}, []);

	return (
		<ReactFlow
			nodes={nodes}
			edges={edges}
			onNodesChange={onNodesChange}
			onEdgesChange={onEdgesChange}
			onConnect={onConnect}
			onNodeClick={onNodeClick}
			nodeTypes={nodeTypes}
			fitView
			attributionPosition="bottom-right"
			className="bg-gradient-to-br from-gray-50 to-gray-100"
		>
			<Background 
				variant={BackgroundVariant.Dots} 
				gap={20} 
				size={1.5} 
				color="#94a3b8" 
				style={{ opacity: 0.3 }}
			/>
			<Controls 
				className="bg-white border border-gray-200 rounded-lg shadow-lg"
			/>
			<MiniMap 
				nodeColor={(node) => {
					if (node.id.startsWith('header-')) {
						return '#667eea';
					}
					if (node.id.startsWith('lane-')) {
						return 'transparent';
					}
					return '#94A3B8';
				}}
				maskColor="rgba(0, 0, 0, 0.05)"
				className="bg-white border border-gray-200 rounded-lg shadow-lg"
			/>
		</ReactFlow>
	);
}
