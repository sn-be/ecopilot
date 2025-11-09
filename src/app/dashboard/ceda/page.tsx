import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CedaPage } from "@/components/ceda-page";

export default async function CedaDashboardPage() {
	const { userId } = await auth();

	if (!userId) {
		redirect("/sign-in");
	}

	return <CedaPage userId={userId} />;
}

