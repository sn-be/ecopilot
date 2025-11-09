import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ActionPlanPage } from "@/components/action-plan-page";

export default async function ActionsPage() {
	const { userId } = await auth();

	if (!userId) {
		redirect("/sign-in");
	}

	return <ActionPlanPage userId={userId} />;
}

