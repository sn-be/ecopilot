"use client";

import { UserButton } from "@clerk/nextjs";
import {
	Database,
	Factory,
	Flame,
	Home,
	Leaf,
	Lightbulb,
	Settings,
	Target,
	Trash2,
	TrendingDown,
	TrendingUp,
	Truck,
	Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, Label, Pie, PieChart, XAxis, YAxis } from "recharts";
import { EcoChatWidget } from "@/components/eco-chat-widget";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { EcoPilotDashboard } from "@/lib/ai-schemas";
import { api } from "@/trpc/react";

interface DashboardWithSidebarProps {
	userId: string;
}

// Helper function to generate consistent action IDs
function generateActionId(title: string): string {
	// Simple hash function for consistent IDs
	let hash = 0;
	for (let i = 0; i < title.length; i++) {
		const char = title.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return `action_${Math.abs(hash)}`;
}

export function DashboardWithSidebar({ userId }: DashboardWithSidebarProps) {
	const router = useRouter();
	const utils = api.useUtils();
	const { data, isLoading, error } = api.footprint.getLatest.useQuery({
		userId,
	});

	// Local state for optimistic updates
	const [localCompletedIds, setLocalCompletedIds] = useState<Set<string>>(
		new Set(),
	);

	// Sync with server data
	useEffect(() => {
		if (data?.completedActionIds) {
			setLocalCompletedIds(new Set(data.completedActionIds));
		}
	}, [data?.completedActionIds]);

	const toggleActionMutation = api.footprint.toggleActionCompletion.useMutation(
		{
			onMutate: async (variables) => {
				// Optimistic update
				setLocalCompletedIds((prev) => {
					const newSet = new Set(prev);
					if (variables.completed) {
						newSet.add(variables.actionId);
					} else {
						newSet.delete(variables.actionId);
					}
					return newSet;
				});
			},
			onError: (_error, variables) => {
				// Revert on error
				setLocalCompletedIds((prev) => {
					const newSet = new Set(prev);
					if (variables.completed) {
						newSet.delete(variables.actionId);
					} else {
						newSet.add(variables.actionId);
					}
					return newSet;
				});
			},
			onSuccess: () => {
				// Refetch to ensure consistency
				void utils.footprint.getLatest.invalidate({ userId });
			},
		},
	);

	const handleToggleAction = (
		title: string,
		actionType: "priority" | "quickwin" | "actionplan",
	) => {
		const actionId = generateActionId(title);
		const isCompleted = localCompletedIds.has(actionId);

		toggleActionMutation.mutate({
			userId,
			actionId,
			actionType,
			completed: !isCompleted,
		});
	};

	const isActionCompleted = (title: string) => {
		return localCompletedIds.has(generateActionId(title));
	};

	const totalEmissions = useMemo(() => {
		return data?.footprint.totalKgCO2eAnnual ?? 0;
	}, [data?.footprint.totalKgCO2eAnnual]);

	// Find the largest emission source by percentage
	const largestEmissionSource = useMemo(() => {
		if (!data?.footprint.breakdown || data.footprint.breakdown.length === 0) {
			return null;
		}
		return data.footprint.breakdown.reduce(
			(
				max: { category: string; kgCO2e: number; percent: number },
				current: { category: string; kgCO2e: number; percent: number },
			) => {
				return current.percent > max.percent ? current : max;
			},
		);
	}, [data?.footprint.breakdown]);

	// Prepare business context for chat widget
	const chatBusinessContext = useMemo(() => {
		if (!data) return undefined;
		return {
			industry: largestEmissionSource?.category,
			employeeCount: undefined, // Could be fetched from user data if needed
			totalEmissions: data.footprint.totalKgCO2eAnnual,
			breakdown: data.footprint.breakdown,
			topEmissionSource: largestEmissionSource?.category,
			recommendations: data.footprint.recommendations,
		};
	}, [data, largestEmissionSource]);

	// Prepare action plan impact chart data
	const actionImpactData = useMemo(() => {
		if (!data) return [];

		const impactCounts = {
			High: 0,
			Medium: 0,
			Low: 0,
		};

		data.dashboard.fullActionPlan.forEach(
			(action: EcoPilotDashboard["fullActionPlan"][number]) => {
				if (action.impact in impactCounts) {
					impactCounts[action.impact as keyof typeof impactCounts]++;
				}
			},
		);

		return [
			{
				impact: "High",
				count: impactCounts.High,
				fill: "var(--color-destructive)",
			},
			{
				impact: "Medium",
				count: impactCounts.Medium,
				fill: "var(--color-chart-4)",
			},
			{
				impact: "Low",
				count: impactCounts.Low,
				fill: "var(--color-primary)",
			},
		];
	}, [data]);

	useEffect(() => {
		// If no data found, redirect back to onboarding
		if (!isLoading && !data) {
			router.push("/onboarding");
		}
	}, [data, isLoading, router]);

	if (isLoading) {
		return <DashboardSkeleton />;
	}

	if (error) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<Alert className="max-w-md" variant="destructive">
					<AlertDescription>
						Failed to load dashboard: {error.message}
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	if (!data) {
		return null; // Will redirect
	}

	// Prepare chart config
	const chartConfig = {
		emissions: {
			label: "Emissions",
		},
		...Object.fromEntries(
			data.footprint.breakdown.map(
				(
					item: { category: string; kgCO2e: number; percent: number },
					index: number,
				) => [
					item.category.toLowerCase().replace(/\s+/g, "_"),
					{
						label: item.category,
						color: `var(--chart-${(index % 5) + 1})`,
					},
				],
			),
		),
	} satisfies ChartConfig;

	// Prepare pie chart data
	const pieChartData = data.footprint.breakdown.map(
		(item: { category: string; kgCO2e: number }, index: number) => ({
			category: item.category,
			emissions: item.kgCO2e,
			fill: `var(--chart-${(index % 5) + 1})`,
		}),
	);

	// Get category icon
	const getCategoryIcon = (category: string) => {
		const lower = category.toLowerCase();
		if (lower.includes("electric") || lower.includes("energy")) return Zap;
		if (
			lower.includes("transport") ||
			lower.includes("commute") ||
			lower.includes("vehicle")
		)
			return Truck;
		if (lower.includes("heat") || lower.includes("gas")) return Flame;
		if (lower.includes("waste")) return Trash2;
		return Factory;
	};

	// Get impact badge variant
	const getImpactVariant = (
		impact: "High" | "Medium" | "Low",
	): "destructive" | "warning" | "default" => {
		if (impact === "High") return "destructive";
		if (impact === "Medium") return "warning";
		return "default";
	};

	return (
		<div className="flex min-h-screen bg-background">
			{/* Chat Widget */}
			<EcoChatWidget businessContext={chatBusinessContext} userId={userId} />

			{/* Sidebar */}
			<aside className="fixed top-0 left-0 h-screen w-72 border-r bg-card shadow-sm">
				<div className="flex h-full flex-col">
					{/* Logo/Header */}
					<div className="border-b bg-gradient-to-br from-primary/10 to-primary/5 p-6">
						<div className="flex items-center gap-3">
							<div className="rounded-lg bg-primary p-2">
								<Leaf className="size-6 stroke-current text-primary-foreground" />
							</div>
							<div className="min-w-0 flex-1">
								<h1 className="font-bold text-xl">EcoPilot</h1>
								<p className="truncate text-muted-foreground text-xs">
									{data.businessName ?? "Sustainability Dashboard"}
								</p>
							</div>
						</div>
					</div>

					{/* Navigation */}
					<nav className="flex-1 space-y-1 overflow-y-auto p-4">
						<a
							className="flex items-center gap-3 rounded-lg bg-primary px-4 py-3 text-primary-foreground shadow-sm transition-all hover:shadow-md"
							href="/dashboard"
						>
							<Home className="size-5 stroke-current" />
							<span className="font-medium">Overview</span>
						</a>
						<a
							className="flex items-center gap-3 rounded-lg px-4 py-3 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
							href="/dashboard/footprint"
						>
							<TrendingDown className="size-5 stroke-current" />
							<span>Carbon Footprint</span>
						</a>
						<a
							className="flex items-center gap-3 rounded-lg px-4 py-3 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
							href="/dashboard/ceda"
						>
							<Database className="size-5 stroke-current" />
							<span>CEDA</span>
						</a>
						<a
							className="flex items-center gap-3 rounded-lg px-4 py-3 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
							href="/dashboard/actions"
						>
							<Target className="size-5 stroke-current" />
							<span>Action Plan</span>
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
			<main className="ml-72 flex-1 overflow-auto">
				<div className="@container/main flex flex-1 flex-col">
					<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
						{/* Executive Summary */}
						<div className="px-4 lg:px-6">
							<Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent shadow-lg">
								<CardHeader className="space-y-3 pb-4">
									<div className="flex items-center gap-3">
										<div className="rounded-lg bg-primary/10 p-2.5">
											<Leaf className="size-6 stroke-current text-primary" />
										</div>
										<div className="flex-1">
											<CardTitle className="font-bold text-2xl tracking-tight">
												Executive Summary
											</CardTitle>
											<p className="mt-1 text-muted-foreground text-sm">
												{data.businessName ? (
													<>
														Company Name:{" "}
														<span className="font-medium text-foreground">
															{data.businessName}
														</span>
													</>
												) : (
													"AI-Generated Insights"
												)}
											</p>
										</div>
										<Badge
											className="bg-primary/10 text-primary"
											variant="secondary"
										>
											<Lightbulb className="mr-1 size-3 stroke-current" />
											AI Analysis
										</Badge>
									</div>
								</CardHeader>
								<CardContent className="pt-2">
									<div className="space-y-4">
										<p className="font-medium text-foreground text-lg leading-relaxed">
											{data.dashboard.executiveSummary}
										</p>
										<div className="flex items-center gap-2 border-primary/10 border-t pt-4">
											<div className="flex size-2 rounded-full bg-primary/60" />
											<p className="text-muted-foreground text-xs italic">
												This summary was generated using advanced AI analysis of
												your carbon footprint data
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
						{/* Key Metrics Cards */}
						<div className="grid @5xl/main:grid-cols-4 @xl/main:grid-cols-2 grid-cols-1 gap-4 px-4 lg:px-6">
							<Card className="group relative flex flex-col overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
								<div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-br from-primary/10 to-transparent opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
								<CardHeader className="relative flex-1 space-y-3 pb-3">
									<div className="flex items-center justify-between">
										<CardDescription className="font-medium text-xs uppercase tracking-wide">
											Total Emissions
										</CardDescription>
										<div className="rounded-full bg-primary/10 p-2">
											<TrendingDown className="size-4 stroke-current text-primary" />
										</div>
									</div>
									<CardTitle className="font-bold text-4xl tabular-nums tracking-tight">
										{data.footprint.totalKgCO2eAnnual.toLocaleString()}
									</CardTitle>
									<p className="text-muted-foreground text-sm">
										kg CO2e per year
									</p>
								</CardHeader>
								<CardFooter className="relative items-start justify-start pt-0">
									<Badge
										className="bg-primary/10 text-primary text-xs"
										variant="secondary"
									>
										Annual
									</Badge>
								</CardFooter>
							</Card>

							<Card className="group relative flex flex-col overflow-hidden border-chart-2/20 bg-gradient-to-br from-chart-2/5 via-card to-card shadow-sm transition-all hover:border-chart-2/40 hover:shadow-md">
								<div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-br from-chart-2/10 to-transparent opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
								<CardHeader className="relative flex-1 space-y-3 pb-3">
									<div className="flex items-center justify-between">
										<CardDescription className="font-medium text-xs uppercase tracking-wide">
											Largest Source
										</CardDescription>
										<div className="rounded-full bg-chart-2/10 p-2">
											{(() => {
												const Icon = getCategoryIcon(
													largestEmissionSource?.category ?? "",
												);
												return <Icon className="size-4 stroke-current text-chart-2" />;
											})()}
										</div>
									</div>
									<CardTitle className="line-clamp-2 font-bold text-3xl tracking-tight">
										{largestEmissionSource?.category ?? "N/A"}
									</CardTitle>
									<p className="text-muted-foreground text-sm">
										{largestEmissionSource?.kgCO2e.toLocaleString() ?? 0} kg CO2e
										({largestEmissionSource?.percent.toFixed(0) ?? 0}%)
									</p>
								</CardHeader>
								<CardFooter className="relative items-start justify-start pt-0">
									<Badge
										className="bg-chart-2/10 text-chart-2 text-xs"
										variant="secondary"
									>
										Primary Source
									</Badge>
								</CardFooter>
							</Card>

							<Card className="group relative flex flex-col overflow-hidden border-destructive/20 bg-gradient-to-br from-destructive/5 via-card to-card shadow-sm transition-all hover:border-destructive/40 hover:shadow-md">
								<div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-br from-destructive/10 to-transparent opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
								<CardHeader className="relative flex-1 space-y-3 pb-3">
									<div className="flex items-center justify-between">
										<CardDescription className="font-medium text-xs uppercase tracking-wide">
											Priority Action
										</CardDescription>
										<div className="rounded-full bg-destructive/10 p-2">
											<Target className="size-4 stroke-current text-destructive" />
										</div>
									</div>
									<CardTitle className="line-clamp-2 min-h-[4rem] font-bold text-2xl leading-tight tracking-tight">
										{data.dashboard.prioritizedNextStep.title}
									</CardTitle>
									<p className="text-muted-foreground text-sm">
										{data.dashboard.prioritizedNextStep.cost} •{" "}
										{data.dashboard.prioritizedNextStep.paybackPeriod}
									</p>
								</CardHeader>
								<CardFooter className="relative items-start justify-start pt-0">
									<Badge
										className="bg-destructive/10 text-destructive text-xs"
										variant="secondary"
									>
										{data.dashboard.prioritizedNextStep.impact} Impact
									</Badge>
								</CardFooter>
							</Card>

							<Card className="group relative flex flex-col overflow-hidden border-chart-4/20 bg-gradient-to-br from-chart-4/5 via-card to-card shadow-sm transition-all hover:border-chart-4/40 hover:shadow-md">
								<div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-br from-chart-4/10 to-transparent opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
								<CardHeader className="relative flex-1 space-y-3 pb-3">
									<div className="flex items-center justify-between">
										<CardDescription className="font-medium text-xs uppercase tracking-wide">
											Quick Wins
										</CardDescription>
										<div className="rounded-full bg-chart-4/10 p-2">
											<Lightbulb className="size-4 stroke-current text-chart-4" />
										</div>
									</div>
									<CardTitle className="font-bold text-4xl tabular-nums tracking-tight">
										{data.dashboard.quickWins.length}
									</CardTitle>
									<p className="text-muted-foreground text-sm">
										Low-cost actions available
									</p>
								</CardHeader>
								<CardFooter className="relative items-start justify-start pt-0">
									<Badge
										className="bg-chart-4/10 text-chart-4 text-xs"
										variant="secondary"
									>
										1-3 Months
									</Badge>
								</CardFooter>
							</Card>
						</div>

						{/* Charts Section */}
						<div className="flex flex-col gap-4 px-4 lg:flex-row lg:px-6">
							{/* Pie Chart */}
							<div className="basis-1/2">
								<Card className="@container/card flex h-full flex-col">
									<CardHeader className="items-center pb-0">
										<CardTitle>Emissions Breakdown</CardTitle>
										<CardDescription>Distribution by category</CardDescription>
									</CardHeader>
									<CardContent className="flex-1 pb-0">
										<ChartContainer
											className="mx-auto aspect-square max-h-[300px]"
											config={chartConfig}
										>
											<PieChart>
												<ChartTooltip
													content={<ChartTooltipContent hideLabel />}
													cursor={false}
												/>
												<Pie
													data={pieChartData}
													dataKey="emissions"
													innerRadius={80}
													nameKey="category"
													strokeWidth={5}
												>
													<Label
														content={({ viewBox }) => {
															if (
																viewBox &&
																"cx" in viewBox &&
																"cy" in viewBox
															) {
																return (
																	<text
																		dominantBaseline="middle"
																		textAnchor="middle"
																		x={viewBox.cx}
																		y={viewBox.cy}
																	>
																		<tspan
																			className="fill-foreground font-bold text-2xl"
																			x={viewBox.cx}
																			y={viewBox.cy}
																		>
																			{totalEmissions.toLocaleString()}
																		</tspan>
																		<tspan
																			className="fill-muted-foreground text-xs"
																			x={viewBox.cx}
																			y={(viewBox.cy || 0) + 20}
																		>
																			kg CO2e
																		</tspan>
																	</text>
																);
															}
														}}
													/>
												</Pie>
											</PieChart>
										</ChartContainer>
									</CardContent>
									<CardFooter className="flex-col gap-2 text-sm">
										<div className="flex items-center gap-2 font-medium leading-none">
											Annual carbon footprint{" "}
											<TrendingDown className="size-4" />
										</div>
										<div className="text-muted-foreground leading-none">
											Total emissions across all categories
										</div>
									</CardFooter>
								</Card>
							</div>

							{/* Action Plan Impact Chart */}
							<div className="basis-1/2">
								<Card className="@container/card h-full">
									<CardHeader>
										<CardTitle>Action Plan by Impact</CardTitle>
										<CardDescription>
											Recommended actions grouped by impact level
										</CardDescription>
									</CardHeader>
									<CardContent>
										<ChartContainer
											config={{
												count: {
													label: "Actions",
												},
												High: {
													label: "High Impact",
													color: "hsl(var(--destructive))",
												},
												Medium: {
													label: "Medium Impact",
													color: "hsl(var(--chart-4))",
												},
												Low: {
													label: "Low Impact",
													color: "hsl(var(--primary))",
												},
											}}
										>
											<BarChart
												accessibilityLayer
												data={actionImpactData}
												layout="vertical"
												margin={{
													left: 20,
												}}
											>
												<YAxis
													axisLine={false}
													dataKey="impact"
													tickLine={false}
													tickMargin={10}
													type="category"
													width={80}
												/>
												<XAxis dataKey="count" hide type="number" />
												<ChartTooltip
													content={<ChartTooltipContent hideLabel />}
													cursor={false}
												/>
												<Bar dataKey="count" layout="vertical" radius={5} />
											</BarChart>
										</ChartContainer>
									</CardContent>
									<CardFooter className="flex-col items-start gap-2 text-sm">
										<div className="flex gap-2 font-medium leading-none">
											{data.dashboard.fullActionPlan.length} total actions{" "}
											<Target className="size-4" />
										</div>
										<div className="text-muted-foreground leading-none">
											Prioritize high-impact actions for best results
										</div>
									</CardFooter>
								</Card>
							</div>
						</div>

						{/* Prioritized Next Step */}
						<div className="px-4 lg:px-6">
							<Card className="overflow-hidden border-2 border-primary pt-0 shadow-md">
								<div className="bg-gradient-to-r from-primary/10 to-transparent px-6 py-6">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<Target className="size-6 stroke-current text-primary" />
											<h3 className="font-semibold text-2xl">
												Your #1 Priority
											</h3>
										</div>
										<Badge className="bg-primary text-lg" variant="default">
											Top Action
										</Badge>
									</div>
								</div>
								<CardContent className="space-y-6 pt-6">
									<div className="flex items-start gap-4">
										<Checkbox
											checked={isActionCompleted(
												data.dashboard.prioritizedNextStep.title,
											)}
											className="mt-1 size-6"
											onCheckedChange={() =>
												handleToggleAction(
													data.dashboard.prioritizedNextStep.title,
													"priority",
												)
											}
										/>
										<div className="flex-1">
											<h3
												className={`font-bold text-2xl transition-all ${
													isActionCompleted(
														data.dashboard.prioritizedNextStep.title,
													)
														? "text-muted-foreground line-through"
														: ""
												}`}
											>
												{data.dashboard.prioritizedNextStep.title}
											</h3>
											<p className="mt-3 text-muted-foreground leading-relaxed">
												{data.dashboard.prioritizedNextStep.description}
											</p>
										</div>
									</div>
									<Separator />
									<div className="grid gap-4 sm:grid-cols-3">
										<div className="space-y-1">
											<p className="text-muted-foreground text-xs">
												Impact Level
											</p>
											<Badge
												className="text-sm"
												variant={getImpactVariant(
													data.dashboard.prioritizedNextStep.impact,
												)}
											>
												{data.dashboard.prioritizedNextStep.impact}
											</Badge>
										</div>
										<div className="space-y-1">
											<p className="text-muted-foreground text-xs">
												Cost Range
											</p>
											<Badge className="text-sm" variant="outline">
												{data.dashboard.prioritizedNextStep.cost}
											</Badge>
										</div>
										<div className="space-y-1">
											<p className="text-muted-foreground text-xs">
												Payback Period
											</p>
											<Badge className="text-sm" variant="outline">
												{data.dashboard.prioritizedNextStep.paybackPeriod}
											</Badge>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Quick Wins */}
						<div className="px-4 lg:px-6">
							<Card className="shadow-xs">
								<CardHeader>
									<div className="flex items-center justify-between">
										<div>
											<CardTitle className="flex items-center gap-2 text-2xl">
												<div className="rounded-lg bg-chart-4/10 p-2">
													<Lightbulb className="size-6 stroke-current text-chart-4" />
												</div>
												Quick Wins
											</CardTitle>
											<CardDescription className="mt-2">
												Low-cost actions you can implement in 1-3 months
											</CardDescription>
										</div>
										<Badge
											className="bg-chart-4/10 text-chart-4"
											variant="secondary"
										>
											{data.dashboard.quickWins.length} Actions
										</Badge>
									</div>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										{data.dashboard.quickWins.map(
											(
												win: EcoPilotDashboard["quickWins"][number],
												index: number,
											) => {
												const isCompleted = isActionCompleted(win.title);
												return (
													<div
														className={`group flex items-start gap-4 rounded-lg border bg-card p-4 transition-all hover:border-primary hover:shadow-md ${
															isCompleted ? "opacity-60" : ""
														}`}
														key={win.title}
													>
														<Checkbox
															checked={isCompleted}
															className="mt-0.5 size-5"
															onCheckedChange={() =>
																handleToggleAction(win.title, "quickwin")
															}
														/>
														<div className="flex items-center justify-center rounded-full bg-muted px-2.5 py-0.5">
															<span className="font-semibold text-muted-foreground text-xs">
																{index + 1}
															</span>
														</div>
														<div className="flex-1 space-y-1">
															<h4
																className={`font-semibold leading-tight transition-all ${
																	isCompleted
																		? "text-muted-foreground line-through"
																		: "group-hover:text-primary"
																}`}
															>
																{win.title}
															</h4>
															<p className="text-muted-foreground text-sm leading-relaxed">
																{win.description}
															</p>
														</div>
													</div>
												);
											},
										)}
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}

function DashboardSkeleton() {
	return (
		<div className="flex min-h-screen bg-background">
			<aside className="fixed top-0 left-0 h-screen w-72 border-r bg-card shadow-sm">
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
					<div className="flex-1 space-y-2 overflow-y-auto p-4">
						{["home", "footprint", "ceda", "actions", "settings"].map((item) => (
							<Skeleton className="h-12 w-full rounded-lg" key={item} />
						))}
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
			<main className="ml-72 flex-1 overflow-auto bg-muted/20 p-8">
				<div className="mx-auto max-w-7xl space-y-8">
					<div className="space-y-2">
						<Skeleton className="h-10 w-64" />
						<Skeleton className="h-6 w-96" />
					</div>
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
						{["emissions", "source", "action", "wins"].map((item) => (
							<Skeleton className="h-40 rounded-lg" key={item} />
						))}
					</div>
					<div className="grid gap-6 lg:grid-cols-2">
						<Skeleton className="h-96 rounded-lg" />
						<Skeleton className="h-96 rounded-lg" />
					</div>
					<Skeleton className="h-48 rounded-lg" />
					<Skeleton className="h-64 rounded-lg" />
				</div>
			</main>
		</div>
	);
}
