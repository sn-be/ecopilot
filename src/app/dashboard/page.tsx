import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardWithSidebar } from "@/components/dashboard-with-sidebar";

export default async function DashboardPage() {
	const { userId } = await auth();

	if (!userId) {
		redirect("/");
	}

	return <DashboardWithSidebar userId={userId} />;
}

