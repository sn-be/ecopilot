"use client";

import { useUser } from "@clerk/nextjs";
import { OnboardingFlow } from "./onboarding-flow";
import { Dashboard } from "./dashboard";

export function OnboardingGate() {
	const { user, isLoaded } = useUser();

	if (!isLoaded) {
		return <div>Loading...</div>;
	}

	const onboardingComplete = user?.publicMetadata?.onboardingComplete === true;

	if (onboardingComplete) {
		return <Dashboard />;
	}

	return <OnboardingFlow />;
}

