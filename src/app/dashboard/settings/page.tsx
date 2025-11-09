import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SettingsPage } from "@/components/settings-page";

export default async function Settings() {
	const user = await currentUser();

	if (!user) {
		redirect("/sign-in");
	}

	return <SettingsPage userId={user.id} />;
}
