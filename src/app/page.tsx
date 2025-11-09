import { SignedIn, SignedOut, SignIn } from "@clerk/nextjs";
import { OnboardingGate } from "@/components/onboarding-gate";

export default function Home() {
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
