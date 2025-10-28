import React from "react";
import { Collapse } from "antd";
const { Panel } = Collapse;

export function Accordion({
	title,
	children,
	defaultOpen = false,
}: {
	title: string;
	children: React.ReactNode;
	defaultOpen?: boolean;
}) {
	return (
		<Collapse defaultActiveKey={defaultOpen ? ["1"] : []}>
			<Panel header={title} key="1">
				{children}
			</Panel>
		</Collapse>
	);
}
