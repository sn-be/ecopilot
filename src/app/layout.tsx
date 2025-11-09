import "@/styles/globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/themes";
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
	title: "EcoPilot - Sustainability Management",
	description: "Manage your business sustainability with EcoPilot",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const outfit = Outfit({
	subsets: ["latin"],
	variable: "--font-outfit",
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<ClerkProvider
			appearance={{
				baseTheme: shadcn,
			}}
			afterSignOutUrl="https://ecopilot.app"
		>
			<html className={`${outfit.variable} dark`} lang="en">
				<body>
					<TRPCReactProvider>{children}</TRPCReactProvider>
					<Toaster />
				</body>
			</html>
		</ClerkProvider>
	);
}
