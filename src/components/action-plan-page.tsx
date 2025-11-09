"use client";

import { UserButton } from "@clerk/nextjs";
import {
	BarChart3,
	Filter,
	Home,
	Leaf,
	Settings,
	Target,
	TrendingDown,
	X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { EcoPilotDashboard } from "@/lib/ai-schemas";
import { api } from "@/trpc/react";

interface ActionPlanPageProps {
	userId: string;
}

export function ActionPlanPage({ userId }: ActionPlanPageProps) {
	const router = useRouter();
	const { data, isLoading, error } = api.footprint.getLatest.useQuery({
		userId,
	});

	// Filter state
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	const [selectedImpact, setSelectedImpact] = useState<string | null>(null);
	const [selectedCost, setSelectedCost] = useState<string | null>(null);

	// Get impact badge variant
	const getImpactVariant = (
		impact: "High" | "Medium" | "Low",
	): "destructive" | "warning" | "default" => {
		if (impact === "High") return "destructive";
		if (impact === "Medium") return "warning";
		return "default";
	};

	// Get unique values for filters
	const categories = useMemo(() => {
		if (!data) return [];
		const cats = new Set(
			data.dashboard.fullActionPlan.map((action) => action.category),
		);
		return Array.from(cats).sort();
	}, [data]);

	const impacts = ["High", "Medium", "Low"];
	const costs = ["$", "$$", "$$$"];

	// Filter actions
	const filteredActions = useMemo(() => {
		if (!data) return [];
		return data.dashboard.fullActionPlan.filter((action) => {
			if (selectedCategory && action.category !== selectedCategory) return false;
			if (selectedImpact && action.impact !== selectedImpact) return false;
			if (selectedCost && action.cost !== selectedCost) return false;
			return true;
		});
	}, [data, selectedCategory, selectedImpact, selectedCost]);

	// Check if any filters are active
	const hasActiveFilters =
		selectedCategory !== null ||
		selectedImpact !== null ||
		selectedCost !== null;

	// Clear all filters
	const clearFilters = () => {
		setSelectedCategory(null);
		setSelectedImpact(null);
		setSelectedCost(null);
	};

	useEffect(() => {
		// If no data found, redirect back to onboarding
		if (!isLoading && !data) {
			router.push("/onboarding");
		}
	}, [data, isLoading, router]);

	if (isLoading) {
		return <ActionPlanSkeleton />;
	}

	if (error) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<Alert className="max-w-md" variant="destructive">
					<AlertDescription>
						Failed to load action plan: {error.message}
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	if (!data) {
		return null; // Will redirect
	}

	return (
		<div className="flex min-h-screen bg-background">
			{/* Sidebar */}
			<aside className="w-72 border-r bg-card shadow-sm">
				<div className="flex h-full flex-col">
					{/* Logo/Header */}
					<div className="border-b bg-gradient-to-br from-primary/10 to-primary/5 p-6">
						<div className="flex items-center gap-3">
							<div className="rounded-lg bg-primary p-2">
								<Leaf className="size-6 stroke-current text-primary-foreground" />
							</div>
							<div>
								<h1 className="font-bold text-xl">EcoPilot</h1>
								<p className="text-muted-foreground text-xs">
									Sustainability Dashboard
								</p>
							</div>
						</div>
					</div>

					{/* Navigation */}
					<nav className="flex-1 space-y-1 p-4">
						<a
							className="flex items-center gap-3 rounded-lg px-4 py-3 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
							href="/dashboard"
						>
							<Home className="size-5 stroke-current" />
							<span>Overview</span>
						</a>
						<a
							className="flex items-center gap-3 rounded-lg px-4 py-3 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
							href="/dashboard/footprint"
						>
							<TrendingDown className="size-5 stroke-current" />
							<span>Carbon Footprint</span>
						</a>
						<a
							className="flex items-center gap-3 rounded-lg bg-primary px-4 py-3 text-primary-foreground shadow-sm transition-all hover:shadow-md"
							href="/dashboard/actions"
						>
							<Target className="size-5 stroke-current" />
							<span className="font-medium">Action Plan</span>
						</a>
						<a
							className="flex items-center gap-3 rounded-lg px-4 py-3 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
							href="/dashboard/analytics"
						>
							<BarChart3 className="size-5 stroke-current" />
							<span>Analytics</span>
						</a>
						<a
							className="flex items-center gap-3 rounded-lg px-4 py-3 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
							href="/dashboard/settings"
						>
							<Settings className="size-5 stroke-current" />
							<span>Settings</span>
						</a>
					</nav>

					{/* User */}
					<div className="border-t bg-muted/30 p-4">
						<div className="flex items-center gap-3">
							<UserButton />
							<div className="flex-1 text-sm">
								<p className="font-medium">Your Account</p>
								<p className="text-muted-foreground text-xs">Manage settings</p>
							</div>
						</div>
					</div>
				</div>
			</aside>

			{/* Main Content */}
			<main className="flex-1 overflow-auto">
				<div className="@container/main flex flex-1 flex-col">
					<div className="flex flex-col gap-6 p-6 lg:p-8">
						{/* Header */}
						<div>
							<div className="flex items-center gap-3">
								<div className="rounded-lg bg-primary/10 p-3">
									<Target className="size-8 stroke-current text-primary" />
								</div>
								<div>
									<h1 className="font-bold text-3xl">Action Plan</h1>
									<p className="text-muted-foreground">
										Comprehensive roadmap for reducing your carbon footprint
									</p>
								</div>
							</div>
						</div>

						{/* Filters */}
						<Card className="shadow-xs">
							<CardHeader>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Filter className="size-5 stroke-current text-muted-foreground" />
										<CardTitle className="text-lg">Filters</CardTitle>
									</div>
									{hasActiveFilters && (
										<Button
											className="h-8 gap-1 text-xs"
											onClick={clearFilters}
											size="sm"
											variant="ghost"
										>
											<X className="size-3 stroke-current" />
											Clear All
										</Button>
									)}
								</div>
							</CardHeader>
							<CardContent>
								<div className="flex flex-wrap gap-4">
									{/* Category Filter */}
									<div className="flex flex-col gap-2">
										<span className="font-medium text-muted-foreground text-xs">
											Category
										</span>
										<div className="flex flex-wrap gap-2">
											{categories.map((category) => (
												<Badge
													className="cursor-pointer transition-all hover:shadow-sm"
													key={category}
													onClick={() =>
														setSelectedCategory(
															selectedCategory === category ? null : category,
														)
													}
													variant={
														selectedCategory === category ? "default" : "outline"
													}
												>
													{category}
												</Badge>
											))}
										</div>
									</div>

									{/* Impact Filter */}
									<div className="flex flex-col gap-2">
										<span className="font-medium text-muted-foreground text-xs">
											Impact
										</span>
										<div className="flex flex-wrap gap-2">
											{impacts.map((impact) => (
												<Badge
													className="cursor-pointer transition-all hover:shadow-sm"
													key={impact}
													onClick={() =>
														setSelectedImpact(
															selectedImpact === impact ? null : impact,
														)
													}
													variant={
														selectedImpact === impact
															? getImpactVariant(
																	impact as "High" | "Medium" | "Low",
																)
															: "outline"
													}
												>
													{impact}
												</Badge>
											))}
										</div>
									</div>

									{/* Cost Filter */}
									<div className="flex flex-col gap-2">
										<span className="font-medium text-muted-foreground text-xs">
											Cost
										</span>
										<div className="flex flex-wrap gap-2">
											{costs.map((cost) => (
												<Badge
													className="cursor-pointer transition-all hover:shadow-sm"
													key={cost}
													onClick={() =>
														setSelectedCost(selectedCost === cost ? null : cost)
													}
													variant={selectedCost === cost ? "default" : "outline"}
												>
													{cost}
												</Badge>
											))}
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Full Action Plan */}
						<Card className="shadow-xs">
							<CardHeader>
								<div className="flex items-center justify-between">
									<div>
										<CardTitle className="text-2xl">
											All Recommended Actions
										</CardTitle>
										<CardDescription className="mt-2">
											{hasActiveFilters
												? `Showing ${filteredActions.length} of ${data.dashboard.fullActionPlan.length} actions`
												: "Prioritized list of actions to reduce your environmental impact"}
										</CardDescription>
									</div>
									<Badge variant="secondary">
										{filteredActions.length}{" "}
										{filteredActions.length === 1 ? "Action" : "Actions"}
									</Badge>
								</div>
							</CardHeader>
							<CardContent>
								{filteredActions.length === 0 ? (
									<div className="flex flex-col items-center justify-center py-12 text-center">
										<Filter className="mb-4 size-12 stroke-current text-muted-foreground" />
										<h3 className="mb-2 font-semibold text-lg">
											No actions found
										</h3>
										<p className="mb-4 text-muted-foreground text-sm">
											Try adjusting your filters to see more results
										</p>
										<Button onClick={clearFilters} size="sm" variant="outline">
											Clear Filters
										</Button>
									</div>
								) : (
									<div className="space-y-4">
										{filteredActions.map(
										(
											action: EcoPilotDashboard["fullActionPlan"][number],
											index: number,
										) => (
											<div
												className="group rounded-lg border border-l-4 border-l-primary bg-card p-5 transition-all hover:shadow-md"
												key={action.title}
											>
												<div className="space-y-3">
													<div className="flex items-start justify-between gap-4">
														<div className="flex-1 space-y-2">
															<div className="flex items-center gap-2">
																<Badge className="text-xs" variant="outline">
																	{action.category}
																</Badge>
																<span className="text-muted-foreground text-xs">
																	Action {index + 1}
																</span>
															</div>
															<h4 className="font-semibold text-lg leading-tight group-hover:text-primary">
																{action.title}
															</h4>
															<p className="text-muted-foreground text-sm leading-relaxed">
																{action.description}
															</p>
														</div>
													</div>
													<div className="flex flex-wrap gap-2">
														<Badge
															className="text-xs"
															variant={getImpactVariant(action.impact)}
														>
															Impact: {action.impact}
														</Badge>
														<Badge className="text-xs" variant="outline">
															Cost: {action.cost}
														</Badge>
													</div>
												</div>
											</div>
										),
									)}
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</main>
		</div>
	);
}

function ActionPlanSkeleton() {
	return (
		<div className="flex min-h-screen bg-background">
			<aside className="w-72 border-r bg-card shadow-sm">
				<div className="flex h-full flex-col">
					<div className="border-b bg-gradient-to-br from-primary/10 to-primary/5 p-6">
						<div className="flex items-center gap-3">
							<Skeleton className="size-10 rounded-lg" />
							<div className="flex-1">
								<Skeleton className="h-6 w-24" />
								<Skeleton className="mt-1 h-3 w-32" />
							</div>
						</div>
					</div>
					<div className="flex-1 space-y-2 p-4">
						{["home", "footprint", "actions", "analytics", "settings"].map(
							(item) => (
								<Skeleton className="h-12 w-full rounded-lg" key={item} />
							),
						)}
					</div>
					<div className="border-t bg-muted/30 p-4">
						<div className="flex items-center gap-3">
							<Skeleton className="size-8 rounded-full" />
							<div className="flex-1">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="mt-1 h-3 w-20" />
							</div>
						</div>
					</div>
				</div>
			</aside>
			<main className="flex-1 overflow-auto p-8">
				<div className="space-y-6">
					<div className="flex items-center gap-3">
						<Skeleton className="size-14 rounded-lg" />
						<div className="flex-1">
							<Skeleton className="h-8 w-48" />
							<Skeleton className="mt-2 h-5 w-96" />
						</div>
					</div>
					<Skeleton className="h-[600px] rounded-lg" />
				</div>
			</main>
		</div>
	);
}

