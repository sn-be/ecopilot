"use client";

import { useState } from "react";
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
import { Spinner } from "@/components/ui/spinner";
import type { CarbonFootprint, EcoPilotDashboard } from "@/lib/ai-schemas";
import { api } from "@/trpc/react";

interface FootprintCalculatorProps {
	userId: string;
}

export function FootprintCalculator({ userId }: FootprintCalculatorProps) {
	const [footprint, setFootprint] = useState<CarbonFootprint | null>(null);
	const [dashboard, setDashboard] = useState<EcoPilotDashboard | null>(null);

	const calculateMutation = api.footprint.calculateAndGenerate.useMutation({
		onSuccess: (data) => {
			setFootprint(data.footprint);
			setDashboard(data.dashboard);
		},
	});

	// Get impact badge variant
	const getImpactVariant = (
		impact: "High" | "Medium" | "Low",
	): "destructive" | "warning" | "default" => {
		if (impact === "High") return "destructive";
		if (impact === "Medium") return "warning";
		return "default";
	};

	const handleCalculate = () => {
		calculateMutation.mutate({ userId });
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Calculate Your Carbon Footprint</CardTitle>
					<CardDescription>
						Get a detailed analysis of your business's carbon emissions and
						personalized recommendations
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button
						className="w-full"
						disabled={calculateMutation.isPending}
						onClick={handleCalculate}
					>
						{calculateMutation.isPending ? (
							<>
								<Spinner className="mr-2 h-4 w-4" />
								Calculating...
							</>
						) : (
							"Calculate Footprint"
						)}
					</Button>

					{calculateMutation.isError && (
						<Alert className="mt-4" variant="destructive">
							<AlertDescription>
								{calculateMutation.error.message}
							</AlertDescription>
						</Alert>
					)}
				</CardContent>
			</Card>

			{footprint && dashboard && (
				<>
					{/* Total Footprint */}
					<Card>
						<CardHeader>
							<CardTitle>Your Carbon Footprint</CardTitle>
							<CardDescription>{footprint.dataSource}</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="font-bold text-4xl">
								{footprint.totalKgCO2eAnnual.toLocaleString()} kg CO2e
							</div>
							<div className="text-muted-foreground text-sm">per year</div>

							{/* Breakdown */}
							<div className="mt-6 space-y-3">
								{footprint.breakdown.map((item) => (
									<div className="space-y-1" key={item.category}>
										<div className="flex items-center justify-between">
											<span className="font-medium">{item.category}</span>
											<span className="text-muted-foreground text-sm">
												{item.percent.toFixed(1)}%
											</span>
										</div>
										<div className="flex items-center gap-2">
											<div className="h-2 flex-1 rounded-full bg-secondary">
												<div
													className="h-2 rounded-full bg-primary"
													style={{ width: `${item.percent}%` }}
												/>
											</div>
											<span className="font-medium text-sm">
												{item.kgCO2e.toLocaleString()} kg
											</span>
										</div>
										{item.status && (
											<Badge className="text-xs" variant="outline">
												{item.status}
											</Badge>
										)}
									</div>
								))}
							</div>

							{footprint.calculationNotes && (
								<Alert className="mt-4">
									<AlertDescription className="text-sm">
										{footprint.calculationNotes}
									</AlertDescription>
								</Alert>
							)}
						</CardContent>
					</Card>

					{/* Executive Summary */}
					<Card>
						<CardHeader>
							<CardTitle>Executive Summary</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground">
								{dashboard.executiveSummary}
							</p>
						</CardContent>
					</Card>

					{/* Prioritized Next Step */}
					<Card className="border-primary">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								🎯 Your #1 Priority
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<h3 className="font-semibold text-xl">
									{dashboard.prioritizedNextStep.title}
								</h3>
								<p className="mt-2 text-muted-foreground">
									{dashboard.prioritizedNextStep.description}
								</p>
							</div>
							<div className="flex gap-2">
								<Badge
									variant={getImpactVariant(
										dashboard.prioritizedNextStep.impact,
									)}
								>
									Impact: {dashboard.prioritizedNextStep.impact}
								</Badge>
								<Badge variant="outline">
									Cost: {dashboard.prioritizedNextStep.cost}
								</Badge>
								<Badge variant="outline">
									Payback: {dashboard.prioritizedNextStep.paybackPeriod}
								</Badge>
							</div>
						</CardContent>
					</Card>

					{/* Quick Wins */}
					<Card>
						<CardHeader>
							<CardTitle>⚡ Quick Wins</CardTitle>
							<CardDescription>
								Low-cost actions you can implement in 1-3 months
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{dashboard.quickWins.map((win) => (
									<div className="space-y-1" key={win.title}>
										<h4 className="font-medium">{win.title}</h4>
										<p className="text-muted-foreground text-sm">
											{win.description}
										</p>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Full Action Plan */}
					<Card>
						<CardHeader>
							<CardTitle>📋 Full Action Plan</CardTitle>
							<CardDescription>
								Comprehensive roadmap for reducing your carbon footprint
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{dashboard.fullActionPlan.map((action) => (
									<div
										className="space-y-2 border-primary border-l-2 pl-4"
										key={action.title}
									>
										<div className="flex items-start justify-between gap-2">
											<div className="flex-1">
												<Badge className="mb-2" variant="outline">
													{action.category}
												</Badge>
												<h4 className="font-medium">{action.title}</h4>
												<p className="mt-1 text-muted-foreground text-sm">
													{action.description}
												</p>
											</div>
										</div>
										<div className="flex gap-2">
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
								))}
							</div>
						</CardContent>
					</Card>
				</>
			)}
		</div>
	);
}
