import { SignedIn, SignedOut, SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { OnboardingGate } from "@/components/onboarding-gate";
import { api } from "@/trpc/server";

export default async function Home() {
	const { userId } = await auth();

	// If user is signed in, check if they have an active action plan
	if (userId) {
		try {
			const latestData = await api.footprint.getLatest({ userId });

			// If they have a dashboard with action plan, redirect to dashboard
			if (latestData?.dashboard) {
				redirect("/dashboard");
			}
		} catch {
			// If there's an error fetching data, continue to show OnboardingGate
			// which will handle the appropriate flow
		}
	}

	return (
		<main className="flex min-h-screen flex-col items-center justify-center">
			<SignedOut>
				<SignIn routing="hash" />
			</SignedOut>
			<SignedIn>
				<OnboardingGate />
			</SignedIn>
		</main>
	);
}
