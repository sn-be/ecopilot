"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "./ui/spinner";
import { api } from "@/trpc/react";
import { OnboardingFlow } from "@/components/onboarding-flow";

export function OnboardingGate() {
	const { user, isLoaded } = useUser();
	const router = useRouter();
	const { data: latestData, isLoading: isLoadingData } = api.footprint.getLatest.useQuery(
		{ userId: user?.id ?? "" },
		{ enabled: !!user?.id && isLoaded }
	);

	// Check if onboarding is complete
	const onboardingComplete = user?.unsafeMetadata?.onboardingComplete === true;

	useEffect(() => {
		// If onboarding is complete and they have a dashboard, redirect to dashboard page
		if (onboardingComplete && latestData?.dashboard) {
			router.push("/dashboard");
		}
	}, [onboardingComplete, latestData, router]);

	if (!isLoaded || isLoadingData) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Spinner className="size-8" />
			</div>
		);
	}

	// If onboarding is complete but no dashboard yet, show loading
	// (they'll be redirected once data loads)
	if (onboardingComplete) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Spinner className="size-8" />
			</div>
		);
	}

	return <OnboardingFlow />;
}
