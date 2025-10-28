import React from "react";
import { Link, useNavigate } from "react-router";
import { Table, Tag, Card, Button, Space } from "antd";
import { SettingOutlined } from "@ant-design/icons";

type Platform = "kubernetes" | "aws" | "mano" | "custom";
type Deployment = {
	id: string;
	name: string;
	platform: Platform;
	uptime: string;
	load: string;
};

const mockData: Deployment[] = [
	{ id: "1", name: "vOCS-testbed", platform: "kubernetes", uptime: "3d 4h", load: "27%" },
	{ id: "2", name: "vOCS-1M", platform: "mano", uptime: "12h 10m", load: "63%" },
	{ id: "3", name: "BCTTLL", platform: "mano", uptime: "7d 1h", load: "12%" },
	{ id: "4", name: "Germadept", platform: "aws", uptime: "7d 1h", load: "12%" },
	{ id: "5", name: "Edge-Custom", platform: "custom", uptime: "2h 5m", load: "5%" },
];

function renderPlatformTag(p: Platform) {
	switch (p) {
		case "kubernetes":
			return <Tag color="blue">Kubernetes</Tag>;
		case "aws":
			return <Tag color="orange">AWS</Tag>;
		case "mano":
			return <Tag color="green">MANO</Tag>;
		default:
			return <Tag>Custom</Tag>;
	}
}

export function meta() {
	return [{ title: "Deployment - 5G Policy Studio" }];
}

export default function Deployment() {
	const navigate = useNavigate();

	const columns = [
		{
			title: "Name",
			dataIndex: "name",
			key: "name",
			render: (text: string, record: Deployment) => (
				<div>
					<div style={{ fontWeight: 600 }}>{text}</div>
					<div style={{ color: "#888", fontSize: 12 }}>id: {record.id}</div>
				</div>
			),
		},
		{
			title: "Platform",
			dataIndex: "platform",
			key: "platform",
			render: (p: Platform) => renderPlatformTag(p),
		},
		{ title: "Uptime", dataIndex: "uptime", key: "uptime" },
		{ title: "Current Load", dataIndex: "load", key: "load" },
		{
			title: "Actions",
			key: "actions",
			render: (_: any, record: Deployment) => (
				<Space>
					<Link to={`/deployment/${record.id}`}>
						<Button icon={<SettingOutlined />}>Settings</Button>
					</Link>
				</Space>
			),
		},
	];

	return (
		<div className="p-6">
			<header className="flex items-center justify-between mb-4">
				<h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Deployments</h2>
				<Button type="primary" onClick={() => navigate("/deployment/create")}>Create Deployment</Button>
			</header>

			<Card>
				<Table columns={columns} dataSource={mockData} rowKey="id" pagination={false} />
			</Card>
		</div>
	);
}
