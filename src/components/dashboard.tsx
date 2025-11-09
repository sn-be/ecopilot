"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { FootprintCalculator } from "@/components/footprint-calculator";

export function Dashboard() {
	const { user } = useUser();

	if (!user) {
		return (
			<div className="flex items-center justify-center">
				<p>Loading...</p>
			</div>
		);
	}

	return (
		<div className="container mx-auto space-y-8 py-8">
			<div className="flex items-center justify-between">
				<h1 className="font-bold text-3xl">Your Sustainability Dashboard</h1>
				<UserButton />
			</div>

			<FootprintCalculator userId={user.id} />
		</div>
	);
}
