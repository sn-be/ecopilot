"use client";

import { UserButton } from "@clerk/nextjs";
import {
	Calculator,
	Database,
	DollarSign,
	Home,
	Leaf,
	Loader2,
	Settings,
	Target,
	Trash2,
	TrendingDown,
	TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cedaCategories } from "@/lib/ceda-categories";
import { api } from "@/trpc/react";

interface CedaPageProps {
	userId: string;
}

export function CedaPage({ userId }: CedaPageProps) {
	const [selectedCategory, setSelectedCategory] = useState<string>("");
	const [spendAmount, setSpendAmount] = useState<string>("");
	const [description, setDescription] = useState<string>("");
	const [isCalculating, setIsCalculating] = useState(false);
	const [calculationResult, setCalculationResult] = useState<{
		emissions: number;
		factor: number;
	} | null>(null);

	const utils = api.useUtils();

	// Fetch entries
	const { data: entries, isLoading: entriesLoading } =
		api.ceda.getEntries.useQuery({
			userId,
		});

	// Fetch total emissions
	const { data: totals, isLoading: totalsLoading } =
		api.ceda.getTotalEmissions.useQuery({
			userId,
		});

	// Add entry mutation
	const addEntryMutation = api.ceda.addEntry.useMutation({
		onSuccess: () => {
			void utils.ceda.getEntries.invalidate({ userId });
			void utils.ceda.getTotalEmissions.invalidate({ userId });
			// Reset form
			setSelectedCategory("");
			setSpendAmount("");
			setDescription("");
			setCalculationResult(null);
			setIsCalculating(false);
		},
		onError: (error) => {
			console.error("Failed to add entry:", error);
			setIsCalculating(false);
		},
	});

	// Delete entry mutation
	const deleteEntryMutation = api.ceda.deleteEntry.useMutation({
		onSuccess: () => {
			void utils.ceda.getEntries.invalidate({ userId });
			void utils.ceda.getTotalEmissions.invalidate({ userId });
		},
	});

	const handleCalculate = async () => {
		if (!selectedCategory || !spendAmount) return;

		const amount = parseFloat(spendAmount);
		if (Number.isNaN(amount) || amount <= 0) return;

		setIsCalculating(true);
		setCalculationResult(null);

		try {
			// Call the API to calculate emissions (preview)
			const response = await fetch("/api/ceda", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					category: selectedCategory,
					country: "United States", // This will be fetched from user's onboarding data in the mutation
					spend_amount: amount,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to calculate emissions");
			}

			const result = (await response.json()) as {
				emission_factor_kg_co2e_per_usd: number;
				total_emissions_kg_co2e: number;
			};

			setCalculationResult({
				emissions: result.total_emissions_kg_co2e,
				factor: result.emission_factor_kg_co2e_per_usd,
			});
		} catch (error) {
			console.error("Calculation error:", error);
			setCalculationResult(null);
		} finally {
			setIsCalculating(false);
		}
	};

	const handleAddEntry = () => {
		if (!selectedCategory || !spendAmount) return;

		const amount = parseFloat(spendAmount);
		if (Number.isNaN(amount) || amount <= 0) return;

		addEntryMutation.mutate({
			userId,
			category: selectedCategory,
			spendAmount: amount,
			description: description || undefined,
		});
	};

	const handleDeleteEntry = (id: number) => {
		deleteEntryMutation.mutate({ id, userId });
	};

	const isLoading = entriesLoading || totalsLoading;

	return (
		<div className="flex min-h-screen bg-background">
			{/* Sidebar */}
			<aside className="fixed top-0 left-0 h-screen w-72 border-r bg-card shadow-sm">
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
							className="flex items-center gap-3 rounded-lg px-4 py-3 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
							href="/dashboard/footprint"
						>
							<TrendingDown className="size-5 stroke-current" />
							<span>Carbon Footprint</span>
						</a>
						<a
							className="flex items-center gap-3 rounded-lg bg-primary px-4 py-3 text-primary-foreground shadow-sm transition-all hover:shadow-md"
							href="/dashboard/ceda"
						>
							<Database className="size-5 stroke-current" />
							<span className="font-medium">CEDA</span>
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
						<div className="px-4 lg:px-6">
							{/* Header */}
							<div className="mb-6">
								<h1 className="font-bold text-3xl tracking-tight">
									CEDA Spending Tracker
								</h1>
								<p className="mt-2 text-muted-foreground">
									Track your supply chain emissions using the Open CEDA
									database. Input your spending by category to calculate CO2e
									emissions.
								</p>
							</div>
							<div className="space-y-4">
								{/* Summary Card */}
								<Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<div className="rounded-lg bg-primary/10 p-2">
												<TrendingUp className="size-5 stroke-current text-primary" />
											</div>
											Total Supply Chain Emissions
										</CardTitle>
										<CardDescription>
											Calculated from {totals?.entryCount ?? 0} spending entries
										</CardDescription>
									</CardHeader>
									<CardContent>
										{isLoading ? (
											<div className="space-y-2">
												<Skeleton className="h-12 w-48" />
												<Skeleton className="h-4 w-32" />
											</div>
										) : (
											<div className="space-y-4">
												<div>
													<div className="font-bold text-4xl tabular-nums">
														{(totals?.totalEmissions ?? 0).toLocaleString(
															undefined,
															{
																maximumFractionDigits: 2,
															},
														)}
													</div>
													<p className="text-muted-foreground text-sm">
														kg CO2e
													</p>
												</div>
												<Separator />
												<div className="flex items-center gap-4 text-sm">
													<div>
														<span className="text-muted-foreground">
															Total Spend:
														</span>{" "}
														<span className="font-semibold">
															${(totals?.totalSpend ?? 0).toLocaleString()}
														</span>
													</div>
													<div>
														<span className="text-muted-foreground">
															Entries:
														</span>{" "}
														<span className="font-semibold">
															{totals?.entryCount ?? 0}
														</span>
													</div>
												</div>
											</div>
										)}
									</CardContent>
								</Card>

								{/* Add Entry Form */}
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<div className="rounded-lg bg-chart-2/10 p-2">
												<Calculator className="size-5 stroke-current text-chart-2" />
											</div>
											Add Spending Entry
										</CardTitle>
										<CardDescription>
											Select a spending category and amount to calculate
											emissions
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-4">
										{/* Category Selection */}
										<div className="space-y-2">
											<Label htmlFor="category">Spending Category</Label>
											<Combobox
												emptyText="No category found."
												options={cedaCategories}
												placeholder="Select category"
												searchPlaceholder="Search categories..."
												value={selectedCategory}
												onValueChange={setSelectedCategory}
											/>
											<p className="text-muted-foreground text-xs">
												Choose from 400+ industry categories
											</p>
										</div>

										{/* Spend Amount */}
										<div className="space-y-2">
											<Label htmlFor="amount">Spend Amount (USD)</Label>
											<div className="relative">
												<DollarSign className="absolute top-3 left-3 size-4 text-muted-foreground" />
												<Input
													className="pl-9"
													id="amount"
													min="0"
													placeholder="500"
													step="0.01"
													type="number"
													value={spendAmount}
													onChange={(e) => setSpendAmount(e.target.value)}
												/>
											</div>
										</div>

										{/* Description (Optional) */}
										<div className="space-y-2">
											<Label htmlFor="description">
												Description (Optional)
											</Label>
											<Textarea
												id="description"
												placeholder="e.g., Q4 marketing campaign expenses"
												rows={2}
												value={description}
												onChange={(e) => setDescription(e.target.value)}
											/>
										</div>

										{/* Calculate Button */}
										<Button
											className="w-full"
											disabled={
												!selectedCategory || !spendAmount || isCalculating
											}
											size="lg"
											variant="outline"
											onClick={handleCalculate}
										>
											{isCalculating ? (
												<>
													<Loader2 className="mr-2 size-4 animate-spin stroke-current" />
													Calculating...
												</>
											) : (
												<>
													<Calculator className="mr-2 size-4 stroke-current" />
													Calculate Emissions
												</>
											)}
										</Button>

										{/* Calculation Result */}
										{calculationResult && (
											<Alert className="border-primary/20 bg-primary/5">
												<Leaf className="size-4 stroke-current" />
												<AlertDescription>
													<div className="space-y-2">
														<div className="font-semibold">
															Calculation Result:
														</div>
														<div className="space-y-1 text-sm">
															<div>
																<span className="text-muted-foreground">
																	Emission Factor:
																</span>{" "}
																{calculationResult.factor.toFixed(4)} kg CO2e
																per $1
															</div>
															<div>
																<span className="text-muted-foreground">
																	Total Emissions:
																</span>{" "}
																<span className="font-bold text-lg text-primary">
																	{calculationResult.emissions.toFixed(2)} kg
																	CO2e
																</span>
															</div>
														</div>
													</div>
												</AlertDescription>
											</Alert>
										)}
									</CardContent>
									<CardFooter>
										<Button
											className="w-full"
											disabled={
												!selectedCategory ||
												!spendAmount ||
												!calculationResult ||
												addEntryMutation.isPending
											}
											size="lg"
											onClick={handleAddEntry}
										>
											{addEntryMutation.isPending ? (
												<>
													<Loader2 className="mr-2 size-4 animate-spin stroke-current" />
													Adding Entry...
												</>
											) : (
												<>
													<Leaf className="mr-2 size-4 stroke-current" />
													Add to Supply Chain Footprint
												</>
											)}
										</Button>
									</CardFooter>
								</Card>

								{/* Entries List */}
								<Card>
									<CardHeader>
										<CardTitle>Spending History</CardTitle>
										<CardDescription>
											Your recorded spending entries and their emissions
										</CardDescription>
									</CardHeader>
									<CardContent>
										{isLoading ? (
											<div className="space-y-3">
												{[1, 2, 3].map((i) => (
													<Skeleton className="h-24 w-full" key={i} />
												))}
											</div>
										) : entries && entries.length > 0 ? (
											<div className="space-y-3">
												{entries.map((entry) => (
													<div
														className="group flex items-start gap-4 rounded-lg border bg-card p-4 transition-all hover:border-primary hover:shadow-md"
														key={entry.id}
													>
														<div className="flex-1 space-y-2">
															<div className="flex items-start justify-between">
																<div>
																	<h4 className="font-semibold leading-tight">
																		{entry.category}
																	</h4>
																	{entry.description && (
																		<p className="mt-1 text-muted-foreground text-sm">
																			{entry.description}
																		</p>
																	)}
																</div>
																<Button
																	className="opacity-0 transition-opacity group-hover:opacity-100"
																	disabled={deleteEntryMutation.isPending}
																	size="icon"
																	variant="ghost"
																	onClick={() => handleDeleteEntry(entry.id)}
																>
																	<Trash2 className="size-4 stroke-current text-destructive" />
																</Button>
															</div>
															<div className="flex flex-wrap items-center gap-3 text-sm">
																<Badge variant="outline">
																	${entry.spendAmount.toLocaleString()}
																</Badge>
																<Badge
																	className="bg-primary/10 text-primary"
																	variant="secondary"
																>
																	{entry.totalEmissions.toFixed(2)} kg CO2e
																</Badge>
																<span className="text-muted-foreground text-xs">
																	Factor: {entry.emissionFactor.toFixed(4)} kg
																	CO2e/$
																</span>
															</div>
															<div className="text-muted-foreground text-xs">
																Added{" "}
																{new Date(entry.createdAt).toLocaleDateString(
																	undefined,
																	{
																		year: "numeric",
																		month: "short",
																		day: "numeric",
																	},
																)}
															</div>
														</div>
													</div>
												))}
											</div>
										) : (
											<div className="py-12 text-center">
												<div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
													<Calculator className="size-6 stroke-current text-muted-foreground" />
												</div>
												<h3 className="font-semibold text-lg">
													No entries yet
												</h3>
												<p className="mt-1 text-muted-foreground text-sm">
													Add your first spending entry to start tracking supply
													chain emissions
												</p>
											</div>
										)}
									</CardContent>
								</Card>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
