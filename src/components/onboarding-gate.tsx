"use client";

import { useUser } from "@clerk/nextjs";
import { Dashboard } from "./dashboard";
import { OnboardingFlow } from "./onboarding-flow";
import { Spinner } from "./ui/spinner";

export function OnboardingGate() {
	const { user, isLoaded } = useUser();

	if (!isLoaded) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Spinner className="size-8" />
			</div>
		);
	}

	// Check if onboarding is complete
	const onboardingComplete =
		user?.unsafeMetadata?.onboardingComplete === true;

	if (onboardingComplete) {
		return <Dashboard />;
	}

	return <OnboardingFlow />;
}
