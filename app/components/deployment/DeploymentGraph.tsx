import React from "react";
import ReactFlow, {
	Background,
	Controls,
	MiniMap,
	Position,
	Handle
} from "reactflow";
import type { Edge, Node } from "reactflow";
import 'reactflow/dist/style.css';

// lightweight box label
function BoxLabel({
	title,
	subtitle,
	kpis,
	tone = "default",
}: {
	title: string;
	subtitle?: string;
	kpis?: { label: string; value: string }[];
	tone?: "default" | "warn" | "error";
}) {
	const bg = tone === "error" ? "#FEF2F2" : tone === "warn" ? "#FFFBEB" : "#F0FDF4";
	const border = tone === "error" ? "#FCA5A5" : tone === "warn" ? "#FCD34D" : "#86EFAC";
	return (
		<div style={{ border: `1px solid ${border}`, background: bg, borderRadius: 6, padding: 8 }}>
			<div style={{ fontSize: 12, fontWeight: 600 }}>{title}</div>
			{subtitle ? <div style={{ fontSize: 11, color: "#6b7280" }}>{subtitle}</div> : null}
			{(kpis?.length ?? 0) > 0 ? (
				<div style={{ marginTop: 4 }}>
					{kpis!.map((k) => (
						<div key={k.label} style={{ fontSize: 11, lineHeight: "16px" }}>
							<span style={{ color: "#6b7280" }}>{k.label}: </span>
							<span style={{ fontWeight: 600 }}>{k.value}</span>
						</div>
					))}
				</div>
			) : null}
		</div>
	);
}

// group node label
function GroupLabel({ title }: { title: string }) {
	return (
		<div style={{ border: "1px solid #c7d2fe", background: "#eff6ff", padding: "6px 10px", borderRadius: 6, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.3 }}>
			{title}
		</div>
	);
}

// Custom ReactFlow nodes that render no handles visually, but provide invisible handles for edges
function BoxNode({ data, id }: { data: { label: React.ReactNode }, id: string }) {
	return (
		<div style={{ position: "relative" }}>
			{/* invisible handles for edge anchoring */}
			<Handle id="top" type="target" position={Position.Top} style={{ opacity: 0, pointerEvents: "none" }} isConnectable={false} />
			<Handle id="bottom" type="source" position={Position.Bottom} style={{ opacity: 0, pointerEvents: "none" }} isConnectable={false} />
			{data.label}
		</div>
	);
}
function GroupNode({ data, id }: { data: { label: React.ReactNode }, id: string }) {
	return (
		<div style={{ position: "relative" }}>
			{/* invisible handles for edge anchoring */}
			<Handle id="top" type="target" position={Position.Top} style={{ opacity: 0, pointerEvents: "none" }} isConnectable={false} />
			<Handle id="bottom" type="source" position={Position.Bottom} style={{ opacity: 0, pointerEvents: "none" }} isConnectable={false} />
			{data.label}
		</div>
	);
}

export default function DeploymentGraph() {
	// layout helpers
	// Increase base sizes and gaps a bit
	const CELL_W = 200;
	const CELL_H = 76;
	const GAP_X = 26;
	const GAP_Y = 36;

	// group headers
	const GROUP_HEADER_H = 36;
	const ENGINE_HEADER_H = 36;
	// uniform inner content padding and top gap
	const CONTENT_PADDING = 12;
	const CONTENT_GAP_Y = 12;
	// gap between bottom group containers
	const BOTTOM_GROUP_GAP_X = 24;

	// NEW: a shared style to hide default dark node border/box for child modules
	const NODE_CHILD_STYLE: React.CSSProperties = { width: CELL_W, border: "none", background: "transparent", boxShadow: "none" };

	function placeRow(ids: string[], y: number, xStart = 0): { id: string; x: number; y: number }[] {
		return ids.map((id, i) => ({ id, x: xStart + i * (CELL_W + GAP_X), y }));
	}

	// compute container width/height from inner rows (accounts for header offsets in y)
	function sizeFromRows(rows: { id: string; x: number; y: number }[]): { w: number; h: number } {
		const maxX = rows.reduce((m, r) => Math.max(m, r.x), 0);
		const maxY = rows.reduce((m, r) => Math.max(m, r.y), 0);
		return {
			w: maxX + CELL_W + CONTENT_PADDING,
			h: maxY + CELL_H + CONTENT_PADDING,
		};
	}

	// Top: NFs (7)
	const nfs = [
		{ id: "nrf", name: "NRF", ip: "10.20.30.31:8100" },
		{ id: "amf", name: "AMF", ip: "10.20.30.31:8101" },
		{ id: "smf", name: "SMF", ip: "10.20.30.31:8102" },
		{ id: "nef", name: "NEF", ip: "10.20.30.31:8103" },
		{ id: "ims", name: "IMS", ip: "10.20.30.31:8104" },
		{ id: "nwdaf", name: "NWDAF", ip: "10.20.30.31:8105" },
		{ id: "chf", name: "CHF", ip: "10.20.30.31:8105" },
	];
	const nfRows = placeRow(nfs.map((x) => x.id), 0);
	// NEW: compute NF row content width for centering
	const nfContentWidth = nfRows.length * CELL_W + (nfRows.length - 1) * GAP_X;

	// Gateway group (single row), tight container sizing
	const gatewayId = "grp-gateway";
	const gatewayApis = [
		{ id: "api-sm", title: "npcf-sm-policycontrol" },
		{ id: "api-am", title: "npcf-am-policycontrol" },
		{ id: "api-ue", title: "npcf-ue-policycontrol" },
		{ id: "api-authz", title: "npcf-policy-authorization" },
		{ id: "api-event", title: "npcf-event-exposure", tone: "warn" as const, kpis: [{ label: "Load", value: "400 TPS" }, { label: "Latency", value: "8.62 ms" }, { label: "Success", value: "50%" }] },
		{ id: "api-pdtq", title: "npcf-pdtq-policycontrol" },
		{ id: "api-bdt", title: "npcf-bdt-policycontrol" },
		{ id: "api-mbs", title: "npcf-mbs-policycontrol" },
		{ id: "api-sl", title: "nchf-spending-limit", tone: "error" as const, kpis: [{ label: "Load", value: "1,800 TPS" }, { label: "Latency", value: "8.62 ms" }, { label: "Success", value: "50%" }] },
		{ id: "api-analytics", title: "nwdaf-analytics-info", tone: "warn" as const, kpis: [{ label: "Load", value: "400 TPS" }, { label: "Latency", value: "3.62 ms" }, { label: "Success", value: "50%" }] },
	];
	// Position gateway container under NFs with extra spacing
	const gatewayTopLeft = { x: 0, y: CELL_H + GAP_Y + 24 };

	// Arrange APIs in a single horizontal row
	const gatewayCols = gatewayApis.length;
	const gatewayRows: { id: string; x: number; y: number }[] = [];
	for (let i = 0; i < gatewayApis.length; i++) {
		const col = i % gatewayCols;
		const row = Math.floor(i / gatewayCols);
		gatewayRows.push({
			id: gatewayApis[i].id,
			x: CONTENT_PADDING + col * (CELL_W + GAP_X),
			y: GROUP_HEADER_H + CONTENT_GAP_Y + row * (CELL_H + GAP_Y),
		});
	}
	// REPLACED: compute container size dynamically to account for extra lines in tiles (KPIs/subtitle)
	// Estimate BoxLabel height ≈ padding(16) + title(18) + subtitle(0|16) + (kpiCount>0 ? 4 + 16 * kpiCount : 0)
	const gatewayContentWidth = gatewayCols * CELL_W + (gatewayCols - 1) * GAP_X;
	function estimateTileHeight(hasSubtitle: boolean, kpiCount: number) {
		const pad = 16, titleH = 18, subtitleH = hasSubtitle ? 16 : 0;
		const kpiBlockH = kpiCount > 0 ? 4 + 16 * kpiCount : 0;
		return pad + titleH + subtitleH + kpiBlockH;
	}
	const maxGatewayTileH = Math.max(
		CELL_H,
		...gatewayApis.map(a => estimateTileHeight(false, (a.kpis?.length ?? 3)))
	);
	const gatewaySize = {
		w: CONTENT_PADDING * 2 + gatewayContentWidth,
		h: GROUP_HEADER_H + CONTENT_GAP_Y + maxGatewayTileH + CONTENT_PADDING + 30,
	};

	// Policy Control Engine (already tight), single row
	const engineId = "grp-engine";
	const engineTopLeft = { x: 0, y: gatewayTopLeft.y + gatewaySize.h + GAP_Y };
	const controllers = [
		{ id: "ctl-rating", title: "Rating Controller" },
		{ id: "ctl-session", title: "Session Policy Controller" },
		{ id: "ctl-ue", title: "UE Policy Controller" },
		{ id: "ctl-config", title: "Configuration Controller" },
		{ id: "ctl-etc", title: "…" },
	];
	const engineCoreId = "engine-core";
	const engineRow = [{ id: engineCoreId, title: "Engine Core", isCore: true } as const, ...controllers.map(c => ({ id: c.id, title: c.title, isCore: false as const }))];
	const engineRowPositions = engineRow.map((item, i) => ({
		id: item.id,
		x: CONTENT_PADDING + i * (CELL_W + GAP_X),
		y: ENGINE_HEADER_H + CONTENT_GAP_Y,
	}));
	const engineContentWidth = engineRow.length * CELL_W + (engineRow.length - 1) * GAP_X;
	const engineSize = {
		w: CONTENT_PADDING * 2 + engineContentWidth,
		h: ENGINE_HEADER_H + CONTENT_GAP_Y + CELL_H + CONTENT_PADDING,
	};

	// Bottom groups — compute tight sizes and positions like Gateway/Engine
	const registryItems = [
		{ id: "reg-cache", title: "AWS ElasticCache" },
		{ id: "reg-codec", title: "Codec" },
		{ id: "reg-storage", title: "Storage" },
	];
	const subsItems = [
		{ id: "sub-abm", title: "vOCS ABM", subtitle: "10.52.3.59" },
		{ id: "sub-udr", title: "UDR" },
		{ id: "sub-custom", title: "Custom" },
	];
	const intelItems = [
		{ id: "intel-mcp", title: "MCP Server" },
		{ id: "intel-agent", title: "AI Agent" },
	];

	const registryRows = registryItems.map((_, i) => ({
		id: registryItems[i].id,
		x: CONTENT_PADDING + i * (CELL_W + GAP_X),
		y: GROUP_HEADER_H + CONTENT_GAP_Y,
	}));
	const subsRows = subsItems.map((_, i) => ({
		id: subsItems[i].id,
		x: CONTENT_PADDING + i * (CELL_W + GAP_X),
		y: GROUP_HEADER_H + CONTENT_GAP_Y,
	}));
	const intelRows = intelItems.map((_, i) => ({
		id: intelItems[i].id,
		x: CONTENT_PADDING + i * (CELL_W + GAP_X),
		y: GROUP_HEADER_H + CONTENT_GAP_Y,
	}));

	// REPLACED: dynamic sizes from rows so containers always wrap children
	const registrySize = sizeFromRows(registryRows);
	const subsSize = sizeFromRows(subsRows);
	const intelSize = sizeFromRows(intelRows);

	// canvas width picks widest of top rows
	const totalWidth = Math.max(
		nfContentWidth,          // was: nfRows.length * (CELL_W + GAP_X) - GAP_X
		gatewaySize.w,
		engineSize.w
	);
	const X_OFFSET = 20;

	// NEW: baseX offsets to center each block horizontally
	const nfBaseX = X_OFFSET + Math.max(0, (totalWidth - nfContentWidth) / 2);
	const gatewayX = X_OFFSET + Math.max(0, (totalWidth - gatewaySize.w) / 2);
	const engineX = X_OFFSET + Math.max(0, (totalWidth - engineSize.w) / 2);

	// horizontally center 3 bottom groups with even gaps
	const bottomY = engineTopLeft.y + engineSize.h + GAP_Y;
	const groupsTotalWidth = registrySize.w + subsSize.w + intelSize.w + 2 * BOTTOM_GROUP_GAP_X;
	const bottomBaseX = X_OFFSET + Math.max(0, (totalWidth - groupsTotalWidth) / 2);

	const registryPos = { x: bottomBaseX, y: bottomY };
	const subsPos = { x: bottomBaseX + registrySize.w + BOTTOM_GROUP_GAP_X, y: bottomY };
	const intelPos = { x: bottomBaseX + registrySize.w + BOTTOM_GROUP_GAP_X + subsSize.w + BOTTOM_GROUP_GAP_X, y: bottomY };

	const nodes: Node[] = [
		// Top NFs — centered using nfBaseX
		...nfRows.map((pos, i) => ({
			id: nfs[i].id,
			type: "box",
			position: {
				x: nfBaseX + pos.x,
				y: pos.y, // reverted NEF to original Y (no lift)
			},
			data: { label: <BoxLabel title={nfs[i].name} subtitle={nfs[i].ip} /> },
			draggable: false,
			selectable: false,
			connectable: false,
			style: NODE_CHILD_STYLE,
		})),
		// Gateway container — centered using gatewayX
		{
			id: gatewayId,
			type: "group",
			position: { x: gatewayX, y: gatewayTopLeft.y },
			targetPosition: Position.Top,
			data: { label: <GroupLabel title="Gateway" /> },
			style: { width: gatewaySize.w, height: gatewaySize.h, border: "1px solid #c7d2fe", background: "#f8fafc", borderRadius: 8, padding: 0 },
			selectable: false,
			connectable: false,
		},
		// Gateway API tiles (single row, inner offset)
		...gatewayRows.map((pos, i) => ({
			id: gatewayApis[i].id,
			type: "box",
			parentNode: gatewayId,
			extent: "parent" as const,
			position: { x: pos.x, y: pos.y },
			data: { label: <BoxLabel title={gatewayApis[i].title} tone={gatewayApis[i].tone} kpis={gatewayApis[i].kpis ?? [{ label: "Load", value: "400 TPS" }, { label: "Latency", value: "3.62 ms" }, { label: "Success", value: "100%" }]} /> },
			style: NODE_CHILD_STYLE,
			selectable: false,
			draggable: false,
			connectable: false,
		})),
		// Policy Control Engine — centered using engineX
		{
			id: engineId,
			type: "group",
			position: { x: engineX, y: engineTopLeft.y },
			data: { label: <GroupLabel title="Policy Control Engine" /> },
			style: { width: engineSize.w, height: engineSize.h, border: "1px solid #c7d2fe", background: "#f8fafc", borderRadius: 8, padding: 0 },
			selectable: false,
			connectable: false,
		},
		// Engine row: Engine Core + controllers (single row, inner offset)
		...engineRowPositions.map((pos, idx) => ({
			id: engineRow[idx].id,
			type: "box",
			parentNode: engineId,
			extent: "parent" as const,
			position: { x: pos.x, y: pos.y },
			data: { label: <BoxLabel title={engineRow[idx].title} /> },
			style: NODE_CHILD_STYLE,
			selectable: false,
			draggable: false,
			connectable: false,
		})),
		// Bottom groups — containers (tight) and items with inner offsets
		{
			id: "grp-registry",
			type: "group",
			position: registryPos,
			data: { label: <GroupLabel title="Policy Registry" /> },
			style: { width: registrySize.w, height: registrySize.h, border: "1px solid #c7d2fe", background: "#f8fafc", borderRadius: 8, padding: 0 },
			selectable: false,
			connectable: false,
		},
		{
			id: "grp-subs",
			type: "group",
			position: subsPos,
			data: { label: <GroupLabel title="Subscription Manager" /> },
			style: { width: subsSize.w, height: subsSize.h, border: "1px solid #c7d2fe", background: "#f8fafc", borderRadius: 8, padding: 0 },
			selectable: false,
			connectable: false,
		},
		{
			id: "grp-intel",
			type: "group",
			position: intelPos,
			data: { label: <GroupLabel title="Intelligence & Analytics" /> },
			style: { width: intelSize.w, height: intelSize.h, border: "1px solid #c7d2fe", background: "#f8fafc", borderRadius: 8, padding: 0 },
			selectable: false,
			connectable: false,
		},
		// Bottom group items
		...registryRows.map((pos, i) => ({
			id: registryItems[i].id,
			type: "box",
			parentNode: "grp-registry",
			extent: "parent" as const,
			position: { x: pos.x, y: pos.y },
			data: { label: <BoxLabel title={registryItems[i].title} /> },
			style: NODE_CHILD_STYLE,
			selectable: false,
			draggable: false,
			connectable: false,
		})),
		...subsRows.map((pos, i) => ({
			id: subsItems[i].id,
			type: "box",
			parentNode: "grp-subs",
			extent: "parent" as const,
			position: { x: pos.x, y: pos.y },
			data: { label: <BoxLabel title={subsItems[i].title} subtitle={(subsItems as any)[i].subtitle} /> },
			style: NODE_CHILD_STYLE,
			selectable: false,
			draggable: false,
			connectable: false,
		})),
		...intelRows.map((pos, i) => ({
			id: intelItems[i].id,
			type: "box",
			parentNode: "grp-intel",
			extent: "parent" as const,
			position: { x: pos.x, y: pos.y },
			data: { label: <BoxLabel title={intelItems[i].title} /> },
			style: NODE_CHILD_STYLE,
			selectable: false,
			draggable: false,
			connectable: false,
		})),
	];

	// No edges for now
	const edges: Edge[] = [];

	// Register node types
	const nodeTypes = { box: BoxNode, group: GroupNode };

	return (
		<div style={{ width: "100%", height: "100%" }}>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				fitView
				fitViewOptions={{ padding: 0.25 }}
				proOptions={{ hideAttribution: true }}
				nodeTypes={nodeTypes}
				nodesDraggable={false}
				nodesConnectable={false}
				elementsSelectable={false}
				panOnScroll
				panOnDrag
				zoomOnScroll
			>
				<Background gap={24} size={1} color="#e5e7eb" />
				<MiniMap pannable />
				<Controls />
			</ReactFlow>
		</div>
	);
}
