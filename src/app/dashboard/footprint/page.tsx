import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CarbonFootprintPage } from "@/components/carbon-footprint-page";

export default async function FootprintPage() {
	const user = await currentUser();

	if (!user) {
		redirect("/sign-in");
	}

	return <CarbonFootprintPage userId={user.id} />;
}

