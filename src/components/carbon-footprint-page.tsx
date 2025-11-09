"use client";

import { UserButton } from "@clerk/nextjs";
import {
	Factory,
	Flame,
	Home,
	Leaf,
	Settings,
	Target,
	Trash2,
	TrendingDown,
	Truck,
	Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Label,
	Line,
	LineChart,
	Pie,
	PieChart,
	XAxis,
	YAxis,
} from "recharts";
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

interface CarbonFootprintPageProps {
	userId: string;
}

export function CarbonFootprintPage({ userId }: CarbonFootprintPageProps) {
	const router = useRouter();
	const { data, isLoading, error } = api.footprint.getLatest.useQuery({
		userId,
	});

	const totalEmissions = useMemo(() => {
		return data?.footprint.totalKgCO2eAnnual ?? 0;
	}, [data?.footprint.totalKgCO2eAnnual]);

	useEffect(() => {
		if (!isLoading && !data) {
			router.push("/onboarding");
		}
	}, [data, isLoading, router]);

	if (isLoading) {
		return <CarbonFootprintSkeleton />;
	}

	if (error) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<Alert className="max-w-md" variant="destructive">
					<AlertDescription>
						Failed to load carbon footprint: {error.message}
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	if (!data) {
		return null;
	}

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

	// Prepare bar chart data
	const barChartData = data.footprint.breakdown.map(
		(item: { category: string; kgCO2e: number; percent: number }, index: number) => ({
			category: item.category,
			emissions: item.kgCO2e,
			percent: item.percent,
			fill: `var(--chart-${(index % 5) + 1})`,
		}),
	);

	// Calculate monthly breakdown for trend simulation
	const monthlyData = [
		{ month: "Jan", emissions: totalEmissions / 12 },
		{ month: "Feb", emissions: totalEmissions / 12 },
		{ month: "Mar", emissions: totalEmissions / 12 },
		{ month: "Apr", emissions: totalEmissions / 12 },
		{ month: "May", emissions: totalEmissions / 12 },
		{ month: "Jun", emissions: totalEmissions / 12 },
		{ month: "Jul", emissions: totalEmissions / 12 },
		{ month: "Aug", emissions: totalEmissions / 12 },
		{ month: "Sep", emissions: totalEmissions / 12 },
		{ month: "Oct", emissions: totalEmissions / 12 },
		{ month: "Nov", emissions: totalEmissions / 12 },
		{ month: "Dec", emissions: totalEmissions / 12 },
	];

	// Calculate comparison metrics
	const tonnesCO2e = (data.footprint.totalKgCO2eAnnual / 1000).toFixed(2);

	return (
		<div className="flex min-h-screen bg-background">
			{/* Sidebar */}
			<aside className="fixed left-0 top-0 h-screen w-72 border-r bg-card shadow-sm">
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
					<nav className="flex-1 space-y-1 overflow-y-auto p-4">
						<a
							className="flex items-center gap-3 rounded-lg px-4 py-3 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
							href="/dashboard"
						>
							<Home className="size-5 stroke-current" />
							<span>Overview</span>
						</a>
						<a
							className="flex items-center gap-3 rounded-lg bg-primary px-4 py-3 text-primary-foreground shadow-sm transition-all hover:shadow-md"
							href="/dashboard/footprint"
						>
							<TrendingDown className="size-5 stroke-current" />
							<span className="font-medium">Carbon Footprint</span>
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
						{/* Page Header */}
						<div className="px-4 lg:px-6">
							<div className="flex items-center gap-3">
								<div className="rounded-lg bg-primary/10 p-3">
									<TrendingDown className="size-6 stroke-current text-primary" />
								</div>
								<div>
									<h1 className="font-bold text-3xl">Carbon Footprint</h1>
									<p className="text-muted-foreground">
										Detailed analysis of your emissions
									</p>
								</div>
							</div>
						</div>

						{/* Key Metrics Cards */}
						<div className="grid @5xl/main:grid-cols-4 @xl/main:grid-cols-2 grid-cols-1 gap-4 px-4 lg:px-6">
							<Card>
								<CardHeader>
									<CardDescription>Total Annual Emissions</CardDescription>
									<CardTitle className="font-semibold text-3xl tabular-nums">
										{data.footprint.totalKgCO2eAnnual.toLocaleString()}
									</CardTitle>
								</CardHeader>
								<CardFooter className="flex-col items-start gap-1 text-sm">
									<div className="font-medium">kg CO2e per year</div>
									<div className="text-muted-foreground">
										{tonnesCO2e} tonnes CO2e
									</div>
								</CardFooter>
							</Card>

							<Card>
								<CardHeader>
									<CardDescription>Monthly Average</CardDescription>
									<CardTitle className="font-semibold text-3xl tabular-nums">
										{(data.footprint.totalKgCO2eAnnual / 12).toLocaleString(
											undefined,
											{ maximumFractionDigits: 0 },
										)}
									</CardTitle>
								</CardHeader>
								<CardFooter className="flex-col items-start gap-1 text-sm">
									<div className="font-medium">kg CO2e per month</div>
									<div className="text-muted-foreground">Average emissions</div>
								</CardFooter>
							</Card>

							<Card>
								<CardHeader>
									<CardDescription>Largest Source</CardDescription>
									<CardTitle className="font-semibold text-2xl">
										{data.footprint.breakdown[0]?.category}
									</CardTitle>
								</CardHeader>
								<CardFooter className="flex-col items-start gap-1 text-sm">
									<div className="font-medium">
										{data.footprint.breakdown[0]?.percent.toFixed(1)}% of total
									</div>
									<div className="text-muted-foreground">
										{data.footprint.breakdown[0]?.kgCO2e.toLocaleString()} kg
										CO2e
									</div>
								</CardFooter>
							</Card>

							<Card>
								<CardHeader>
									<CardDescription>Emission Categories</CardDescription>
									<CardTitle className="font-semibold text-3xl tabular-nums">
										{data.footprint.breakdown.length}
									</CardTitle>
								</CardHeader>
								<CardFooter className="flex-col items-start gap-1 text-sm">
									<div className="font-medium">Categories tracked</div>
									<div className="text-muted-foreground">
										Across all operations
									</div>
								</CardFooter>
							</Card>
						</div>

						{/* Charts Section */}
						<div className="flex flex-col gap-4 px-4 lg:flex-row lg:px-6">
							{/* Pie Chart */}
							<div className="basis-1/2">
								<Card className="h-full">
									<CardHeader>
										<CardTitle>Emissions Distribution</CardTitle>
										<CardDescription>
											Breakdown by emission category
										</CardDescription>
									</CardHeader>
									<CardContent>
										<ChartContainer
											className="mx-auto aspect-square max-h-[350px]"
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
													innerRadius={70}
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
																			className="fill-foreground font-bold text-3xl"
																			x={viewBox.cx}
																			y={viewBox.cy}
																		>
																			{totalEmissions.toLocaleString()}
																		</tspan>
																		<tspan
																			className="fill-muted-foreground"
																			x={viewBox.cx}
																			y={(viewBox.cy || 0) + 24}
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
								</Card>
							</div>

							{/* Bar Chart */}
							<div className="basis-1/2">
								<Card className="h-full">
									<CardHeader>
										<CardTitle>Emissions by Category</CardTitle>
										<CardDescription>
											Detailed breakdown in kg CO2e
										</CardDescription>
									</CardHeader>
									<CardContent>
										<ChartContainer config={chartConfig}>
											<BarChart
												accessibilityLayer
												data={barChartData}
												layout="vertical"
												margin={{
													left: 20,
												}}
											>
												<CartesianGrid horizontal={false} />
												<YAxis
													axisLine={false}
													dataKey="category"
													tickFormatter={(value) =>
														value.length > 15
															? `${value.substring(0, 15)}...`
															: value
													}
													tickLine={false}
													tickMargin={10}
													type="category"
													width={120}
												/>
												<XAxis dataKey="emissions" hide type="number" />
												<ChartTooltip
													content={<ChartTooltipContent hideLabel />}
													cursor={false}
												/>
												<Bar
													dataKey="emissions"
													layout="vertical"
													radius={5}
												/>
											</BarChart>
										</ChartContainer>
									</CardContent>
								</Card>
							</div>
						</div>

						{/* Monthly Trend */}
						<div className="px-4 lg:px-6">
							<Card>
								<CardHeader>
									<CardTitle>Monthly Emissions Projection</CardTitle>
									<CardDescription>
										Estimated monthly distribution based on annual total
									</CardDescription>
								</CardHeader>
								<CardContent>
									<ChartContainer
										config={{
											emissions: {
												label: "Emissions",
												color: "var(--chart-2)",
											},
										}}
									>
										<LineChart
											accessibilityLayer
											data={monthlyData}
											margin={{
												left: 12,
												right: 12,
											}}
										>
											<CartesianGrid vertical={false} />
											<XAxis
												axisLine={false}
												dataKey="month"
												tickLine={false}
												tickMargin={8}
											/>
											<YAxis
												axisLine={false}
												tickFormatter={(value) =>
													`${(value / 1000).toFixed(0)}k`
												}
												tickLine={false}
												tickMargin={8}
											/>
											<ChartTooltip
												content={
													<ChartTooltipContent
														formatter={(value) =>
															`${Number(value).toLocaleString()} kg CO2e`
														}
													/>
												}
												cursor={false}
											/>
											<Line
												dataKey="emissions"
												dot={{
													fill: "var(--chart-2)",
												}}
												fill="var(--chart-2)"
												radius={4}
												stroke="var(--chart-2)"
												strokeWidth={2}
												type="monotone"
											/>
										</LineChart>
									</ChartContainer>
								</CardContent>
								<CardFooter>
									<div className="text-muted-foreground text-sm">
										Note: This is a projection based on your annual footprint.
										Actual monthly emissions may vary.
									</div>
								</CardFooter>
							</Card>
						</div>

						{/* Detailed Breakdown */}
						<div className="px-4 lg:px-6">
							<Card>
								<CardHeader>
									<CardTitle>Detailed Breakdown</CardTitle>
									<CardDescription>
										Complete analysis of all emission sources
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{data.footprint.breakdown.map(
											(
												item: {
													category: string;
													kgCO2e: number;
													percent: number;
												},
												index: number,
											) => {
												const Icon = getCategoryIcon(item.category);
												return (
													<div key={item.category}>
														<div className="flex items-center justify-between">
															<div className="flex items-center gap-3">
																<div className="rounded-lg bg-muted p-2">
																	<Icon className="size-5 text-foreground" />
																</div>
																<div>
																	<p className="font-medium">{item.category}</p>
																	<p className="text-muted-foreground text-sm">
																		{item.kgCO2e.toLocaleString()} kg CO2e
																		annually
																	</p>
																</div>
															</div>
															<Badge variant="outline">
																{item.percent.toFixed(1)}%
															</Badge>
														</div>
														{index < data.footprint.breakdown.length - 1 && (
															<Separator className="mt-4" />
														)}
													</div>
												);
											},
										)}
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Data Source & Notes */}
						{data.footprint.calculationNotes && (
							<div className="px-4 lg:px-6">
								<Card>
									<CardHeader>
										<CardTitle>Calculation Notes</CardTitle>
										<CardDescription>
											Methodology and data sources
										</CardDescription>
									</CardHeader>
									<CardContent>
										<p className="text-muted-foreground leading-relaxed">
											{data.footprint.calculationNotes}
										</p>
									</CardContent>
								</Card>
							</div>
						)}
					</div>
				</div>
			</main>
		</div>
	);
}

function CarbonFootprintSkeleton() {
	return (
		<div className="flex min-h-screen bg-background">
			<aside className="fixed left-0 top-0 h-screen w-72 border-r bg-card shadow-sm">
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
						{["home", "footprint", "actions", "settings"].map((item) => (
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
			<main className="ml-72 flex-1 overflow-auto p-8">
				<div className="space-y-8">
					<Skeleton className="h-16 w-96" />
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
						{["total", "monthly", "source", "categories"].map((item) => (
							<Skeleton className="h-40 rounded-lg" key={item} />
						))}
					</div>
					<div className="grid gap-6 lg:grid-cols-2">
						<Skeleton className="h-96 rounded-lg" />
						<Skeleton className="h-96 rounded-lg" />
					</div>
					<Skeleton className="h-64 rounded-lg" />
				</div>
			</main>
		</div>
	);
}

