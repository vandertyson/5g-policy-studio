import { useState } from "react";
import { useNavigate } from "react-router";
import { 
	AppstoreOutlined, 
	TableOutlined, 
	EditOutlined, 
	DeleteOutlined,
	PlusOutlined,
	SearchOutlined,
	FilterOutlined,
	StarOutlined,
	StarFilled
} from '@ant-design/icons';

export function meta() {
	return [{ title: "Designer - 5G Policy Studio" }];
}

// Mock data for policies
const mockPolicies = [
	{
		id: 1,
		name: "Basic QoS Policy",
		description: "Default quality of service policy for standard users",
		type: "QoS",
		status: "Active",
		lastModified: "2025-11-10",
		isFavorite: true
	},
	{
		id: 2,
		name: "Premium Bandwidth",
		description: "High bandwidth allocation for premium subscribers",
		type: "Bandwidth",
		status: "Active",
		lastModified: "2025-11-09",
		isFavorite: false
	},
	{
		id: 3,
		name: "IoT Device Policy",
		description: "Optimized policy for IoT devices with low latency",
		type: "QoS",
		status: "Draft",
		lastModified: "2025-11-08",
		isFavorite: true
	},
	{
		id: 4,
		name: "Emergency Services",
		description: "Priority routing for emergency service communications",
		type: "Priority",
		status: "Active",
		lastModified: "2025-11-07",
		isFavorite: false
	},
];

export default function Designer() {
	const navigate = useNavigate();
	const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
	const [selectedPolicy, setSelectedPolicy] = useState(mockPolicies[0]);
	const [searchQuery, setSearchQuery] = useState('');
	const [filterMode, setFilterMode] = useState<'all' | 'active' | 'draft' | 'favorite'>('all');

	const handleEdit = (policyId: number) => {
		navigate(`/designer/${policyId}`);
	};

	const handleDelete = (policyId: number) => {
		console.log('Delete policy:', policyId);
		// TODO: Implement delete functionality
	};

	const toggleFavorite = (policyId: number) => {
		console.log('Toggle favorite:', policyId);
		// TODO: Implement favorite toggle
	};

	// Filter policies based on filter mode
	const filteredPolicies = mockPolicies.filter(policy => {
		if (filterMode === 'all') return true;
		if (filterMode === 'active') return policy.status === 'Active';
		if (filterMode === 'draft') return policy.status === 'Draft';
		if (filterMode === 'favorite') return policy.isFavorite;
		return true;
	});

	return (
		<main className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
			{/* Header with Breadcrumb */}
			<div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
				<h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Policy Designer</h2>
				<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
					Home / Designer
				</p>
			</div>

			{/* Action Bar */}
			<div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
				<div className="flex items-center justify-between gap-4">
					{/* Left: New Policy Button and Search */}
					<div className="flex items-center gap-3 flex-1">
						<button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg flex items-center gap-2 transition-all shadow-md hover:shadow-lg font-medium whitespace-nowrap">
							<PlusOutlined className="text-base text-white" />
							<span className="text-white">New Policy</span>
						</button>
						
						<div className="relative flex-1 max-w-md">
							<SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-base" />
							<input
								type="text"
								placeholder="Search policies..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>
					</div>
					
					{/* Center: Filter Buttons */}
					<div className="flex items-center gap-2">
						<button
							onClick={() => setFilterMode('all')}
							className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
								filterMode === 'all'
									? 'bg-blue-600 text-white shadow-md'
									: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
							}`}
						>
							<span className={filterMode === 'all' ? 'text-white' : ''}>All</span>
						</button>
						<button
							onClick={() => setFilterMode('active')}
							className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
								filterMode === 'active'
									? 'bg-blue-600 text-white shadow-md'
									: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
							}`}
						>
							<span className={filterMode === 'active' ? 'text-white' : ''}>Active</span>
						</button>
						<button
							onClick={() => setFilterMode('draft')}
							className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
								filterMode === 'draft'
									? 'bg-blue-600 text-white shadow-md'
									: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
							}`}
						>
							<span className={filterMode === 'draft' ? 'text-white' : ''}>Draft</span>
						</button>
						<button
							onClick={() => setFilterMode('favorite')}
							className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
								filterMode === 'favorite'
									? 'bg-blue-600 text-white shadow-md'
									: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
							}`}
						>
							<StarOutlined className={`text-sm ${filterMode === 'favorite' ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`} />
							<span className={filterMode === 'favorite' ? 'text-white' : ''}>Favorite</span>
						</button>
					</div>
					
					{/* Right: View Mode Toggle */}
					<div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden shadow-sm">
						<button
							onClick={() => setViewMode('grid')}
							className={`px-4 py-2 transition-all ${
								viewMode === 'grid'
									? 'bg-blue-600'
									: 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
							}`}
							title="Grid View"
						>
							<AppstoreOutlined className={`text-base ${viewMode === 'grid' ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`} />
						</button>
						<button
							onClick={() => setViewMode('table')}
							className={`px-4 py-2 transition-all border-l border-gray-300 dark:border-gray-600 ${
								viewMode === 'table'
									? 'bg-blue-600'
									: 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
							}`}
							title="Table View"
						>
							<TableOutlined className={`text-base ${viewMode === 'table' ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`} />
						</button>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="flex-1 overflow-hidden">
				{viewMode === 'grid' ? (
					<div className="h-full flex">
						{/* Grid View - Left Side */}
						<div className="flex-1 p-6 overflow-y-auto">
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{mockPolicies.map((policy) => (
									<div
										key={policy.id}
										onClick={() => {
											setSelectedPolicy(policy);
										}}
										onDoubleClick={() => navigate(`/designer/${policy.id}`)}
										className={`bg-white dark:bg-gray-800 rounded-lg border-2 p-4 cursor-pointer transition-all hover:shadow-lg ${
											selectedPolicy?.id === policy.id
												? 'border-blue-600 shadow-md'
												: 'border-gray-200 dark:border-gray-700'
										}`}
									>
										<div className="flex items-start justify-between mb-2">
											<h3 className="font-semibold text-gray-900 dark:text-gray-100">
												{policy.name}
											</h3>
											<span
												className={`px-2 py-1 text-xs rounded-full ${
													policy.status === 'Active'
														? 'bg-green-100 text-green-800'
														: 'bg-yellow-100 text-yellow-800'
												}`}
											>
												{policy.status}
											</span>
										</div>
										<p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
											{policy.description}
										</p>
										<div className="flex items-center justify-between">
											<span className="text-xs text-gray-500">
												Type: {policy.type}
											</span>
											<div className="flex gap-2">
												<button
													onClick={(e) => {
														e.stopPropagation();
														handleEdit(policy.id);
													}}
													className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 rounded transition-colors"
													title="Edit"
												>
													<EditOutlined />
												</button>
												<button
													onClick={(e) => {
														e.stopPropagation();
														handleDelete(policy.id);
													}}
													className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 rounded transition-colors"
													title="Delete"
												>
													<DeleteOutlined />
												</button>
											</div>
										</div>
										<div className="text-xs text-gray-400 mt-2">
											Last modified: {policy.lastModified}
										</div>
										
										{/* Star icon in bottom right corner */}
										<button
											onClick={(e) => {
												e.stopPropagation();
												toggleFavorite(policy.id);
											}}
											className="absolute bottom-3 right-3 transition-transform hover:scale-110"
										>
											{policy.isFavorite ? (
												<StarFilled 
													className="text-xl" 
													style={{
														color: '#fbbf24',
													}} 
												/>
											) : (
												<StarOutlined className="text-xl text-gray-400 hover:text-gray-600" />
											)}
										</button>
									</div>
								))}
							</div>
						</div>

						{/* Preview Pane - Right Side */}
						<div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-6 overflow-y-auto">
							<h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
								Preview
							</h3>
							{selectedPolicy ? (
								<div className="space-y-4">
									<div>
										<label className="text-sm font-medium text-gray-700 dark:text-gray-300">
											Policy Name
										</label>
										<p className="mt-1 text-gray-900 dark:text-gray-100">
											{selectedPolicy.name}
										</p>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-700 dark:text-gray-300">
											Description
										</label>
										<p className="mt-1 text-gray-900 dark:text-gray-100">
											{selectedPolicy.description}
										</p>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-700 dark:text-gray-300">
											Type
										</label>
										<p className="mt-1 text-gray-900 dark:text-gray-100">
											{selectedPolicy.type}
										</p>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-700 dark:text-gray-300">
											Status
										</label>
										<p className="mt-1">
											<span
												className={`px-2 py-1 text-xs rounded-full ${
													selectedPolicy.status === 'Active'
														? 'bg-green-100 text-green-800'
														: 'bg-yellow-100 text-yellow-800'
												}`}
											>
												{selectedPolicy.status}
											</span>
										</p>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-700 dark:text-gray-300">
											Last Modified
										</label>
										<p className="mt-1 text-gray-900 dark:text-gray-100">
											{selectedPolicy.lastModified}
										</p>
									</div>
									<div className="pt-4 border-t border-gray-200 dark:border-gray-700">
										<h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">
											Policy Configuration
										</h4>
										<div className="text-sm text-gray-600 dark:text-gray-400">
											<p>Configuration details will be displayed here...</p>
										</div>
									</div>
								</div>
							) : (
								<p className="text-gray-500 dark:text-gray-400">
									Select a policy to preview
								</p>
							)}
						</div>
					</div>
				) : (
					/* Table View */
					<div className="p-6 overflow-auto h-full">
						<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
							<table className="w-full">
								<thead className="bg-gray-50 dark:bg-gray-700">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
											
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
											Policy Name
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
											Description
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
											Type
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
											Status
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
											Last Modified
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200 dark:divide-gray-700">
									{filteredPolicies.map((policy) => (
										<tr
											key={policy.id}
											className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
											onDoubleClick={() => navigate(`/designer/${policy.id}`)}
										>
											<td className="px-6 py-4 whitespace-nowrap">
												<button
													onClick={() => toggleFavorite(policy.id)}
													className="transition-colors"
												>
													{policy.isFavorite ? (
														<StarFilled className="text-base" style={{ color: '#fbbf24' }} />
													) : (
														<StarOutlined className="text-base text-gray-400 hover:text-gray-600" />
													)}
												</button>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="font-medium text-gray-900 dark:text-gray-100">
													{policy.name}
												</div>
											</td>
											<td className="px-6 py-4">
												<div className="text-sm text-gray-600 dark:text-gray-400">
													{policy.description}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="text-sm text-gray-900 dark:text-gray-100">
													{policy.type}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span
													className={`px-2 py-1 text-xs rounded-full ${
														policy.status === 'Active'
															? 'bg-green-100 text-green-800'
															: 'bg-yellow-100 text-yellow-800'
													}`}
												>
													{policy.status}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
												{policy.lastModified}
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="flex gap-2">
													<button
														onClick={() => handleEdit(policy.id)}
														className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 rounded transition-colors"
														title="Edit"
													>
														<EditOutlined />
													</button>
													<button
														onClick={() => handleDelete(policy.id)}
														className="p-2 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 rounded transition-colors"
														title="Delete"
													>
														<DeleteOutlined />
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}
			</div>
		</main>
	);
}
