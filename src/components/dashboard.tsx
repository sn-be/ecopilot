"use client";

import { UserButton } from "@clerk/nextjs";

export function Dashboard() {
	return (
		<div className="flex flex-col items-center justify-center gap-4">
			<h1 className="font-bold text-2xl">Welcome to your Dashboard!</h1>
			<UserButton />
		</div>
	);
}

