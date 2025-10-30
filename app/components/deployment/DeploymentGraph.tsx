import React from "react";
import ReactFlow, { MiniMap, Controls, Background, type Node, type Edge, Handle, Position } from "reactflow";
import "reactflow/dist/style.css";

/**
 * Custom node components with illustrative shapes:
 * - DB: vertical cylinder
 * - Queue: horizontal cylinder
 * - Logic: rounded rectangle
 * - Gateway: rectangle
 * - External: cloud
 *
 * These are visual-only placeholder nodes.
 */

function GatewayNode({ data }: any) {
	return (
		<div style={{ padding: 6, textAlign: "center" }}>
			<Handle type="target" position={Position.Top} />
			<svg width="160" height="48" viewBox="0 0 160 48" xmlns="http://www.w3.org/2000/svg">
				<rect x="2" y="6" width="156" height="36" rx="6" fill="#0ea5a4" stroke="#075e7a" />
				<text x="80" y="30" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="600">{data.label}</text>
			</svg>
			<Handle type="source" position={Position.Bottom} />
		</div>
	);
}

function LogicNode({ data }: any) {
	return (
		<div style={{ padding: 6, textAlign: "center" }}>
			<Handle type="target" position={Position.Top} />
			<svg width="140" height="64" viewBox="0 0 140 64" xmlns="http://www.w3.org/2000/svg">
				<rect x="4" y="6" width="132" height="52" rx="10" fill="#f97316" stroke="#7c2d12" />
				<text x="70" y="38" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="600">{data.label}</text>
			</svg>
			<Handle type="source" position={Position.Bottom} />
		</div>
	);
}

function DBNode({ data }: any) {
	// vertical cylinder: top ellipse, rect body, bottom ellipse
	return (
		<div style={{ padding: 6, textAlign: "center" }}>
			<Handle type="target" position={Position.Top} />
			<svg width="100" height="120" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
				<ellipse cx="50" cy="18" rx="36" ry="12" fill="#10b981" stroke="#064e3b" />
				<rect x="14" y="18" width="72" height="72" fill="#06b6d4" stroke="#065f46" />
				<ellipse cx="50" cy="90" rx="36" ry="12" fill="#06b6d4" stroke="#065f46" />
				<text x="50" y="62" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="600">{data.label}</text>
			</svg>
			<Handle type="source" position={Position.Bottom} />
		</div>
	);
}

function QueueNode({ data }: any) {
	// horizontal cylinder: left ellipse, rect body, right ellipse
	return (
		<div style={{ padding: 6, textAlign: "center" }}>
			<Handle type="target" position={Position.Top} />
			<svg width="220" height="80" viewBox="0 0 220 80" xmlns="http://www.w3.org/2000/svg">
				<ellipse cx="40" cy="40" rx="28" ry="30" fill="#8b5cf6" stroke="#4c1d95" />
				<rect x="40" y="10" width="140" height="60" fill="#7c3aed" stroke="#4c1d95" />
				<ellipse cx="180" cy="40" rx="28" ry="30" fill="#8b5cf6" stroke="#4c1d95" />
				<text x="110" y="46" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="600">{data.label}</text>
			</svg>
			<Handle type="source" position={Position.Bottom} />
		</div>
	);
}

function ExternalNode({ data }: any) {
	// simple cloud
	return (
		<div style={{ padding: 6, textAlign: "center" }}>
			<Handle type="target" position={Position.Top} />
			<svg width="160" height="80" viewBox="0 0 160 80" xmlns="http://www.w3.org/2000/svg">
				<path d="M40 50a16 16 0 0 1 0-32 24 24 0 0 1 46-8 20 20 0 0 1 62 18 18 18 0 0 1 -6 36H40z" fill="#60a5fa" stroke="#1e3a8a" />
				<text x="80" y="50" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="600">{data.label}</text>
			</svg>
			<Handle type="source" position={Position.Bottom} />
		</div>
	);
}

// register node types
const nodeTypes = {
	gateway: GatewayNode,
	logic: LogicNode,
	db: DBNode,
	queue: QueueNode,
	external: ExternalNode,
};

export default function DeploymentGraph() {
	const nodes: Node[] = [
		{ id: "gateway", type: "gateway", data: { label: "Gateway" }, position: { x: 20, y: 10 } },
		{ id: "external", type: "external", data: { label: "External Modules" }, position: { x: 260, y: 0 } },
		{ id: "logic1", type: "logic", data: { label: "Logic Block A" }, position: { x: 20, y: 140 } },
		{ id: "logic2", type: "logic", data: { label: "Logic Block B" }, position: { x: 220, y: 140 } },
		{ id: "db", type: "db", data: { label: "Database" }, position: { x: 420, y: 120 } },
		{ id: "queue", type: "queue", data: { label: "Queue" }, position: { x: 220, y: 300 } },
	];

	const edges: Edge[] = [
		{ id: "e1", source: "gateway", target: "logic1", animated: true },
		{ id: "e2", source: "gateway", target: "logic2", animated: true },
		{ id: "e3", source: "logic1", target: "queue" },
		{ id: "e4", source: "logic2", target: "db" },
		{ id: "e5", source: "external", target: "logic2" },
		{ id: "e6", source: "queue", target: "db" },
	];

	return (
		<div style={{ width: "100%", height: "100%", minHeight: 420 }}>
			<ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView>
				<MiniMap zoomable pannable />
				<Controls />
				<Background gap={16} />
			</ReactFlow>
		</div>
	);
}
