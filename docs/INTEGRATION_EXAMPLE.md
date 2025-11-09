# Integration Example: Adding Footprint Calculator to Dashboard

This guide shows how to integrate the carbon footprint calculator into your existing dashboard.

## Option 1: Update Existing Dashboard Component

Update `src/components/dashboard.tsx` to include the footprint calculator:

```typescript
"use client";

import { UserButton } from "@clerk/nextjs";
import { FootprintCalculator } from "@/components/footprint-calculator";
import { useUser } from "@clerk/nextjs";

export function Dashboard() {
	const { user } = useUser();

	if (!user) {
		return <div>Loading...</div>;
	}

	return (
		<div className="container mx-auto py-8">
			<div className="mb-8 flex items-center justify-between">
				<h1 className="font-bold text-3xl">Your Sustainability Dashboard</h1>
				<UserButton />
			</div>

			<FootprintCalculator userId={user.id} />
		</div>
	);
}
```

## Option 2: Create a Dedicated Footprint Page

Create a new page at `src/app/footprint/page.tsx`:

```typescript
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { FootprintCalculator } from "@/components/footprint-calculator";

export default async function FootprintPage() {
	const { userId } = await auth();

	if (!userId) {
		redirect("/sign-in");
	}

	return (
		<div className="container mx-auto py-8">
			<FootprintCalculator userId={userId} />
		</div>
	);
}
```

## Option 3: Server-Side Pre-Calculation

For better UX, calculate the footprint on the server and pass it to the client:

### Create Server Action (`src/app/actions/footprint.ts`)

```typescript
"use server";

import { auth } from "@clerk/nextjs/server";
import { api } from "@/trpc/server";

export async function getFootprintData() {
	const { userId } = await auth();

	if (!userId) {
		throw new Error("Not authenticated");
	}

	try {
		const result = await api.footprint.calculateAndGenerate({ userId });
		return result;
	} catch (error) {
		console.error("Error calculating footprint:", error);
		return null;
	}
}
```

### Use in Dashboard Component

```typescript
"use client";

import { useEffect, useState } from "react";
import { getFootprintData } from "@/app/actions/footprint";
import type { CarbonFootprint, EcoPilotDashboard } from "@/lib/ai-schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function Dashboard() {
	const [data, setData] = useState<{
		footprint: CarbonFootprint;
		dashboard: EcoPilotDashboard;
	} | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getFootprintData()
			.then(setData)
			.finally(() => setLoading(false));
	}, []);

	if (loading) {
		return <DashboardSkeleton />;
	}

	if (!data) {
		return <div>Failed to load footprint data</div>;
	}

	return (
		<div className="container mx-auto py-8 space-y-6">
			<h1 className="font-bold text-3xl">Your Sustainability Dashboard</h1>

			{/* Key Metrics */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader>
						<CardTitle>Total Emissions</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="font-bold text-3xl">
							{data.footprint.totalKgCO2eAnnual.toLocaleString()}
						</div>
						<p className="text-muted-foreground text-sm">kg CO2e per year</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Largest Source</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">
							{data.footprint.breakdown[0]?.category}
						</div>
						<p className="text-muted-foreground text-sm">
							{data.footprint.breakdown[0]?.percent.toFixed(1)}% of total
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Priority Action</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="font-bold text-xl">
							{data.dashboard.prioritizedNextStep.title}
						</div>
						<p className="text-muted-foreground text-sm">
							{data.dashboard.prioritizedNextStep.impact} Impact
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Full Details */}
			<FootprintCalculator userId={userId} />
		</div>
	);
}

function DashboardSkeleton() {
	return (
		<div className="container mx-auto py-8 space-y-6">
			<Skeleton className="h-10 w-64" />
			<div className="grid gap-4 md:grid-cols-3">
				<Skeleton className="h-32" />
				<Skeleton className="h-32" />
				<Skeleton className="h-32" />
			</div>
		</div>
	);
}
```

## Option 4: Tabbed Interface

Create a multi-tab dashboard with footprint as one tab:

```typescript
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FootprintCalculator } from "@/components/footprint-calculator";
import { useUser } from "@clerk/nextjs";

export function Dashboard() {
	const { user } = useUser();

	if (!user) return null;

	return (
		<div className="container mx-auto py-8">
			<h1 className="mb-6 font-bold text-3xl">Sustainability Dashboard</h1>

			<Tabs defaultValue="overview">
				<TabsList>
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="footprint">Carbon Footprint</TabsTrigger>
					<TabsTrigger value="actions">Action Plan</TabsTrigger>
					<TabsTrigger value="progress">Progress</TabsTrigger>
				</TabsList>

				<TabsContent value="overview">
					{/* Dashboard overview */}
				</TabsContent>

				<TabsContent value="footprint">
					<FootprintCalculator userId={user.id} />
				</TabsContent>

				<TabsContent value="actions">
					{/* Action tracking */}
				</TabsContent>

				<TabsContent value="progress">
					{/* Progress charts */}
				</TabsContent>
			</Tabs>
		</div>
	);
}
```

## Option 5: Progressive Enhancement

Show a summary first, then allow users to calculate full footprint:

```typescript
"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FootprintCalculator } from "@/components/footprint-calculator";

export function Dashboard({ userId }: { userId: string }) {
	const [showFullCalculation, setShowFullCalculation] = useState(false);

	// Check if user has onboarding data
	const { data: onboardingData } = api.onboarding.get.useQuery({ userId });

	if (!onboardingData) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Complete Your Profile</CardTitle>
					<CardDescription>
						Complete the onboarding to calculate your carbon footprint
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button asChild>
						<a href="/onboarding">Start Onboarding</a>
					</Button>
				</CardContent>
			</Card>
		);
	}

	if (!showFullCalculation) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Ready to Calculate Your Carbon Footprint?</CardTitle>
					<CardDescription>
						Get personalized recommendations to reduce your environmental impact
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button onClick={() => setShowFullCalculation(true)}>
						Calculate My Footprint
					</Button>
				</CardContent>
			</Card>
		);
	}

	return <FootprintCalculator userId={userId} />;
}
```

## Best Practices

### 1. Loading States
Always show loading indicators during calculation:

```typescript
{calculateMutation.isPending && (
	<div className="flex items-center gap-2">
		<Spinner className="h-4 w-4" />
		<span>Analyzing your business data...</span>
	</div>
)}
```

### 2. Error Handling
Provide helpful error messages:

```typescript
{calculateMutation.isError && (
	<Alert variant="destructive">
		<AlertTitle>Calculation Failed</AlertTitle>
		<AlertDescription>
			{calculateMutation.error.message.includes("No onboarding data")
				? "Please complete your business profile first."
				: "An error occurred. Please try again."}
		</AlertDescription>
	</Alert>
)}
```

### 3. Caching
Cache results to avoid redundant calculations:

```typescript
const { data, isLoading } = api.footprint.calculateAndGenerate.useQuery(
	{ userId },
	{
		staleTime: 1000 * 60 * 60, // 1 hour
		cacheTime: 1000 * 60 * 60 * 24, // 24 hours
	}
);
```

### 4. Optimistic Updates
Show immediate feedback when users take actions:

```typescript
const utils = api.useUtils();

const completeActionMutation = api.actions.complete.useMutation({
	onMutate: async (newAction) => {
		// Optimistically update UI
		await utils.footprint.generateDashboard.cancel();
		const previousData = utils.footprint.generateDashboard.getData();
		
		utils.footprint.generateDashboard.setData(/* updated data */);
		
		return { previousData };
	},
	onError: (err, newAction, context) => {
		// Rollback on error
		utils.footprint.generateDashboard.setData(context?.previousData);
	},
});
```

## Navigation Integration

Add footprint to your navigation:

```typescript
// In your layout or navigation component
<nav>
	<Link href="/dashboard">Overview</Link>
	<Link href="/footprint">Carbon Footprint</Link>
	<Link href="/actions">Action Plan</Link>
	<Link href="/settings">Settings</Link>
</nav>
```

## Mobile Considerations

Ensure the component works well on mobile:

```typescript
<div className="container mx-auto px-4 py-8">
	{/* Use responsive grid */}
	<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
		{/* Cards */}
	</div>
</div>
```

## Accessibility

Add proper ARIA labels:

```typescript
<button
	onClick={handleCalculate}
	aria-label="Calculate carbon footprint"
	aria-busy={isCalculating}
>
	Calculate Footprint
</button>
```

## Summary

Choose the integration approach that best fits your app:

- **Option 1**: Simple, all-in-one dashboard
- **Option 2**: Dedicated page for detailed analysis
- **Option 3**: Server-side pre-calculation for speed
- **Option 4**: Organized tabs for multiple features
- **Option 5**: Progressive enhancement for better UX

All options use the same underlying tRPC procedures and can be mixed and matched based on your needs!

