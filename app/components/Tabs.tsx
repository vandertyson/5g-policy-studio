import React from "react";
import { Tabs as AntTabs } from "antd";

export function Tabs<T extends string>({
	activeId,
	onChange,
	tabs,
}: {
	activeId?: T;
	onChange?: (id: T) => void;
	tabs: { id: T; title: string; content: React.ReactNode }[];
}) {
	return (
		<AntTabs
			activeKey={activeId ?? (tabs[0] ? String(tabs[0].id) : undefined)}
			onChange={(key) => onChange?.(key as T)}
			items={tabs.map((t) => ({ key: String(t.id), label: t.title, children: t.content }))}
		/>
	);
}
