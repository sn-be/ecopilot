import { SignedIn, SignedOut, SignIn, UserProfile, SignOutButton } from "@clerk/nextjs";

export default function Home() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center">
			<SignedOut>
				<SignIn routing="hash" />
			</SignedOut>
			<SignedIn>
				<div className="flex flex-col items-center justify-center gap-8">
					<h1 className="font-bold text-4xl">Authenticated</h1>
					<UserProfile routing="hash" />
					<SignOutButton />
				</div>
			</SignedIn>
		</main>
	);
}
