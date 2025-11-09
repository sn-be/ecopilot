"use client";

import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Building2,
	MapPin,
	Users,
	Zap,
	Briefcase,
	ArrowLeft,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { getPostalCodeFormat } from "@/lib/postal-code-formats";
import { api } from "@/trpc/react";

const industries = [
	"Agriculture & Farming",
	"Construction",
	"Education",
	"Energy & Utilities",
	"Financial Services",
	"Food & Beverage",
	"Healthcare",
	"Hospitality & Tourism",
	"Manufacturing",
	"Real Estate",
	"Retail",
	"Technology",
	"Transportation & Logistics",
	"Other",
] as const;

const countries = [
	"Afghanistan",
	"Albania",
	"Algeria",
	"Andorra",
	"Angola",
	"Argentina",
	"Armenia",
	"Australia",
	"Austria",
	"Azerbaijan",
	"Bahamas",
	"Bahrain",
	"Bangladesh",
	"Barbados",
	"Belarus",
	"Belgium",
	"Belize",
	"Benin",
	"Bhutan",
	"Bolivia",
	"Bosnia and Herzegovina",
	"Botswana",
	"Brazil",
	"Brunei",
	"Bulgaria",
	"Burkina Faso",
	"Burundi",
	"Cambodia",
	"Cameroon",
	"Canada",
	"Cape Verde",
	"Central African Republic",
	"Chad",
	"Chile",
	"China",
	"Colombia",
	"Comoros",
	"Congo",
	"Costa Rica",
	"Croatia",
	"Cuba",
	"Cyprus",
	"Czech Republic",
	"Denmark",
	"Djibouti",
	"Dominica",
	"Dominican Republic",
	"East Timor",
	"Ecuador",
	"Egypt",
	"El Salvador",
	"Equatorial Guinea",
	"Eritrea",
	"Estonia",
	"Ethiopia",
	"Fiji",
	"Finland",
	"France",
	"Gabon",
	"Gambia",
	"Georgia",
	"Germany",
	"Ghana",
	"Greece",
	"Grenada",
	"Guatemala",
	"Guinea",
	"Guinea-Bissau",
	"Guyana",
	"Haiti",
	"Honduras",
	"Hungary",
	"Iceland",
	"India",
	"Indonesia",
	"Iran",
	"Iraq",
	"Ireland",
	"Israel",
	"Italy",
	"Jamaica",
	"Japan",
	"Jordan",
	"Kazakhstan",
	"Kenya",
	"Kiribati",
	"North Korea",
	"South Korea",
	"Kuwait",
	"Kyrgyzstan",
	"Laos",
	"Latvia",
	"Lebanon",
	"Lesotho",
	"Liberia",
	"Libya",
	"Liechtenstein",
	"Lithuania",
	"Luxembourg",
	"Madagascar",
	"Malawi",
	"Malaysia",
	"Maldives",
	"Mali",
	"Malta",
	"Marshall Islands",
	"Mauritania",
	"Mauritius",
	"Mexico",
	"Micronesia",
	"Moldova",
	"Monaco",
	"Mongolia",
	"Montenegro",
	"Morocco",
	"Mozambique",
	"Myanmar",
	"Namibia",
	"Nauru",
	"Nepal",
	"Netherlands",
	"New Zealand",
	"Nicaragua",
	"Niger",
	"Nigeria",
	"North Macedonia",
	"Norway",
	"Oman",
	"Pakistan",
	"Palau",
	"Palestine",
	"Panama",
	"Papua New Guinea",
	"Paraguay",
	"Peru",
	"Philippines",
	"Poland",
	"Portugal",
	"Qatar",
	"Romania",
	"Russia",
	"Rwanda",
	"Saint Kitts and Nevis",
	"Saint Lucia",
	"Saint Vincent and the Grenadines",
	"Samoa",
	"San Marino",
	"Sao Tome and Principe",
	"Saudi Arabia",
	"Senegal",
	"Serbia",
	"Seychelles",
	"Sierra Leone",
	"Singapore",
	"Slovakia",
	"Slovenia",
	"Solomon Islands",
	"Somalia",
	"South Africa",
	"South Sudan",
	"Spain",
	"Sri Lanka",
	"Sudan",
	"Suriname",
	"Sweden",
	"Switzerland",
	"Syria",
	"Taiwan",
	"Tajikistan",
	"Tanzania",
	"Thailand",
	"Togo",
	"Tonga",
	"Trinidad and Tobago",
	"Tunisia",
	"Turkey",
	"Turkmenistan",
	"Tuvalu",
	"Uganda",
	"Ukraine",
	"United Arab Emirates",
	"United Kingdom",
	"United States",
	"Uruguay",
	"Uzbekistan",
	"Vanuatu",
	"Vatican City",
	"Venezuela",
	"Vietnam",
	"Yemen",
	"Zambia",
	"Zimbabwe",
] as const;

// Step schemas
const step1Schema = z.object({
	businessName: z.string().min(1, "Business name is required"),
	industry: z.string().min(1, "Please select an industry"),
	country: z.string().min(1, "Please select a country"),
	postalCode: z.string().min(1, "Postal code is required"),
});

const step2Schema = z.object({
	numberOfEmployees: z.number().min(1, "Please select number of employees"),
	locationSize: z.number().min(1, "Location size is required"),
	locationUnit: z.enum(["sqft", "sqm"]),
	ownOrRent: z.enum(["own", "rent"]),
});

// Employee range mapping (display -> stored value)
const employeeRanges = [
	{ label: "1-9 employees", value: 5 },
	{ label: "10-50 employees", value: 30 },
	{ label: "51-100 employees", value: 75 },
	{ label: "101-250 employees", value: 175 },
	{ label: "251-500 employees", value: 375 },
	{ label: "501-1000 employees", value: 750 },
	{ label: "1000+ employees", value: 1500 },
] as const;

const step3Schema = z.object({
	dataInputMethod: z.enum(["kwh", "amount", "skip"]),
	monthlyElectricityKwh: z.number().optional(),
	monthlyElectricityAmount: z.number().optional(),
	electricityCurrency: z.string().optional(),
	heatingFuel: z.string().optional(),
	monthlyHeatingAmount: z.number().optional(),
	heatingUnit: z.string().optional(),
});

const step4Schema = z.object({
	hasVehicles: z.boolean(),
	numberOfVehicles: z.number().optional(),
	employeeCommutePattern: z.string().min(1, "Please select a commute pattern"),
	businessFlightsPerYear: z.number().min(0),
	weeklyTrashBags: z.number().min(0),
});

type Step1FormData = z.infer<typeof step1Schema>;
type Step2FormData = z.infer<typeof step2Schema>;
type Step3FormData = z.infer<typeof step3Schema>;
type Step4FormData = z.infer<typeof step4Schema>;

export function OnboardingFlow() {
	const { user } = useUser();
	const [currentStep, setCurrentStep] = useState(1);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Step 1 form
	const step1Form = useForm<Step1FormData>({
		resolver: zodResolver(step1Schema),
		defaultValues: {
			businessName: "",
			industry: "",
			country: "",
			postalCode: "",
		},
	});

	// Step 2 form
	const step2Form = useForm<Step2FormData>({
		resolver: zodResolver(step2Schema),
		defaultValues: {
			numberOfEmployees: 0,
			locationSize: 1000,
			locationUnit: "sqft",
			ownOrRent: "rent",
		},
	});

	// Step 3 form
	const step3Form = useForm<Step3FormData>({
		resolver: zodResolver(step3Schema),
		defaultValues: {
			dataInputMethod: "kwh",
			monthlyElectricityKwh: undefined,
			monthlyElectricityAmount: undefined,
			electricityCurrency: "USD",
			heatingFuel: "",
			monthlyHeatingAmount: undefined,
			heatingUnit: "therms",
		},
	});

	// Step 4 form
	const step4Form = useForm<Step4FormData>({
		resolver: zodResolver(step4Schema),
		defaultValues: {
			hasVehicles: false,
			numberOfVehicles: 0,
			employeeCommutePattern: "",
			businessFlightsPerYear: 0,
			weeklyTrashBags: 1,
		},
	});

	// Mutations
	const saveStep1 = api.onboarding.saveStep1.useMutation({
		onSuccess: () => {
			toast.success("Business information saved!");
			setCurrentStep(2);
		},
		onError: (error) => {
			toast.error(error.message ?? "Failed to save. Please try again.");
		},
	});

	const saveStep2 = api.onboarding.saveStep2.useMutation({
		onSuccess: () => {
			toast.success("Team & space information saved!");
			setCurrentStep(3);
		},
		onError: (error) => {
			toast.error(error.message ?? "Failed to save. Please try again.");
		},
	});

	const saveStep3 = api.onboarding.saveStep3.useMutation({
		onSuccess: () => {
			toast.success("Energy information saved!");
			setCurrentStep(4);
		},
		onError: (error) => {
			toast.error(error.message ?? "Failed to save. Please try again.");
		},
	});

	const saveStep4 = api.onboarding.saveStep4.useMutation({
		onSuccess: async () => {
			toast.success("Onboarding complete! 🎉");
			// Mark onboarding as complete in Clerk
			await user?.update({
				unsafeMetadata: {
					onboardingComplete: true,
				},
			});
		},
		onError: (error) => {
			toast.error(error.message ?? "Failed to save. Please try again.");
		},
	});

	// Submit handlers
	const onSubmitStep1 = async (data: Step1FormData) => {
		if (!user?.id) {
			toast.error("User not found. Please sign in again.");
			return;
		}

		setIsSubmitting(true);
		try {
			await saveStep1.mutateAsync({
				userId: user.id,
				...data,
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const onSubmitStep2 = async (data: Step2FormData) => {
		if (!user?.id) {
			toast.error("User not found. Please sign in again.");
			return;
		}

		setIsSubmitting(true);
		try {
			await saveStep2.mutateAsync({
				userId: user.id,
				...data,
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const onSubmitStep3 = async (data: Step3FormData) => {
		if (!user?.id) {
			toast.error("User not found. Please sign in again.");
			return;
		}

		setIsSubmitting(true);
		try {
			const energyDataSkipped = data.dataInputMethod === "skip";
			await saveStep3.mutateAsync({
				userId: user.id,
				monthlyElectricityKwh: data.monthlyElectricityKwh,
				monthlyElectricityAmount: data.monthlyElectricityAmount,
				electricityCurrency: data.electricityCurrency,
				heatingFuel: data.heatingFuel,
				monthlyHeatingAmount: data.monthlyHeatingAmount,
				heatingUnit: data.heatingUnit,
				energyDataSkipped,
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const onSubmitStep4 = async (data: Step4FormData) => {
		if (!user?.id) {
			toast.error("User not found. Please sign in again.");
			return;
		}

		setIsSubmitting(true);
		try {
			await saveStep4.mutateAsync({
				userId: user.id,
				...data,
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const totalSteps = 4;

	// Render step content
	const renderStepContent = () => {
		switch (currentStep) {
			case 1:
				return <Step1 form={step1Form} onSubmit={onSubmitStep1} isSubmitting={isSubmitting} />;
			case 2:
				return <Step2 form={step2Form} onSubmit={onSubmitStep2} isSubmitting={isSubmitting} onBack={() => setCurrentStep(1)} />;
			case 3:
				return <Step3 form={step3Form} onSubmit={onSubmitStep3} isSubmitting={isSubmitting} onBack={() => setCurrentStep(2)} />;
			case 4:
				return <Step4 form={step4Form} onSubmit={onSubmitStep4} isSubmitting={isSubmitting} onBack={() => setCurrentStep(3)} />;
			default:
				return null;
		}
	};

	return (
		<div className="flex min-h-screen w-full items-center justify-center p-4">
			<div className="fade-in slide-in-from-bottom-4 w-full max-w-2xl animate-in duration-700">
				{/* Progress indicator */}
				<div className="mb-8">
					<div className="mb-4 flex items-center justify-between">
						<span className="font-medium text-muted-foreground text-sm">
							Step {currentStep} of {totalSteps}
						</span>
					</div>
					<div className="flex gap-2">
						{Array.from({ length: totalSteps }, (_, index) => {
							const stepNumber = index + 1;
							return (
								<div
									key={`step-${stepNumber}`}
									className={`h-2 flex-1 rounded-full transition-all duration-500 ${
										stepNumber <= currentStep ? "bg-primary" : "bg-muted"
									}`}
								/>
							);
						})}
					</div>
				</div>

				{renderStepContent()}

				{/* Help text */}
				<p className="fade-in mt-6 animate-in text-center text-muted-foreground text-sm delay-500 duration-700">
					Your information is secure and will only be used to personalize your
					experience
				</p>
			</div>
		</div>
	);
}

// Step 1: Business Information
function Step1({
	form,
	onSubmit,
	isSubmitting,
}: {
	form: ReturnType<typeof useForm<Step1FormData>>;
	onSubmit: (data: Step1FormData) => Promise<void>;
	isSubmitting: boolean;
}) {
	return (
		<Card className="border-2 shadow-lg">
			<CardHeader className="space-y-3 pb-6">
				<div className="flex items-center gap-3">
					<div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
						<Building2 className="size-6 stroke-current text-primary" />
					</div>
					<div>
						<CardTitle className="text-2xl">Welcome to EcoPilot!</CardTitle>
						<CardDescription className="text-base">
							Let's get to know your business
						</CardDescription>
					</div>
				</div>
			</CardHeader>

			<CardContent>
				<Form {...form}>
					<form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
						{/* Business Name */}
						<FormField
							control={form.control}
							name="businessName"
							render={({ field }) => (
								<FormItem className="fade-in slide-in-from-bottom-2 animate-in delay-100 duration-500">
									<FormLabel className="text-base">Business Name</FormLabel>
									<FormControl>
										<div className="relative">
											<Building2 className="absolute top-3 left-3 size-4 stroke-current text-muted-foreground" />
											<Input
												className="pl-10"
												placeholder="Enter your business name"
												{...field}
											/>
										</div>
									</FormControl>
									<FormDescription>
										The official name of your organization
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Industry */}
						<FormField
							control={form.control}
							name="industry"
							render={({ field }) => (
								<FormItem className="fade-in slide-in-from-bottom-2 flex animate-in flex-col delay-200 duration-500">
									<FormLabel className="text-base">Industry</FormLabel>
									<FormControl>
										<Combobox
											value={field.value}
											onValueChange={field.onChange}
											options={industries}
											placeholder="Select your industry"
											searchPlaceholder="Search industries..."
											emptyText="No industry found."
										/>
									</FormControl>
									<FormDescription>Your primary business sector</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Country and Postal Code */}
						<div className="grid gap-6 sm:grid-cols-2">
							<FormField
								control={form.control}
								name="country"
								render={({ field }) => (
									<FormItem className="fade-in slide-in-from-bottom-2 flex animate-in flex-col delay-300 duration-500">
										<FormLabel className="text-base">Country</FormLabel>
										<FormControl>
											<Combobox
												value={field.value}
												onValueChange={field.onChange}
												options={countries}
												placeholder="Select country"
												searchPlaceholder="Search country..."
												emptyText="No country found."
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="postalCode"
								render={({ field }) => {
									const selectedCountry = form.watch("country");
									const postalFormat = getPostalCodeFormat(selectedCountry);
									return (
										<FormItem className="fade-in slide-in-from-bottom-2 animate-in delay-300 duration-500">
											<FormLabel className="text-base">
												Zip/Postal Code
											</FormLabel>
											<FormControl>
												<div className="relative">
													<MapPin className="absolute top-3 left-3 size-4 stroke-current text-muted-foreground" />
													<Input
														className="pl-10"
														placeholder={postalFormat.example}
														{...field}
													/>
												</div>
											</FormControl>
											<FormDescription className="text-xs">
												Format: {postalFormat.format}
											</FormDescription>
											<FormMessage />
										</FormItem>
									);
								}}
							/>
						</div>

						{/* Submit Button */}
						<div className="fade-in slide-in-from-bottom-2 flex animate-in justify-end pt-4 delay-400 duration-500">
							<Button
								className="min-w-32"
								disabled={isSubmitting}
								size="lg"
								type="submit"
							>
								{isSubmitting ? "Saving..." : "Next"}
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}

// Step 2: Team & Space
function Step2({
	form,
	onSubmit,
	isSubmitting,
	onBack,
}: {
	form: ReturnType<typeof useForm<Step2FormData>>;
	onSubmit: (data: Step2FormData) => Promise<void>;
	isSubmitting: boolean;
	onBack: () => void;
}) {
	return (
		<Card className="border-2 shadow-lg">
			<CardHeader className="space-y-3 pb-6">
				<div className="flex items-center gap-3">
					<div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
						<Users className="size-6 stroke-current text-primary" />
					</div>
					<div>
						<CardTitle className="text-2xl">Your Team & Space</CardTitle>
						<CardDescription className="text-base">
							Tell us about your main location
						</CardDescription>
					</div>
				</div>
			</CardHeader>

			<CardContent>
				<Form {...form}>
					<form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
						{/* Number of Employees */}
						<FormField
							control={form.control}
							name="numberOfEmployees"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-base">Number of Employees</FormLabel>
									<Select
										value={field.value?.toString() ?? ""}
										onValueChange={(value) => field.onChange(Number(value))}
									>
										<FormControl>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Select employee range" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{employeeRanges.map((range) => (
												<SelectItem
													key={range.value}
													value={range.value.toString()}
												>
													{range.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormDescription>
										Approximate number of employees at this location
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Location Size */}
						<div className="space-y-4">
							<FormField
								control={form.control}
								name="locationSize"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-base">Location Size</FormLabel>
										<FormControl>
											<Input
												type="number"
												min={1}
												placeholder="e.g., 5000"
												{...field}
												onChange={(e) => field.onChange(Number(e.target.value))}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="locationUnit"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<RadioGroup
												value={field.value}
												onValueChange={field.onChange}
												className="flex gap-4"
											>
												<div className="flex items-center space-x-2">
													<RadioGroupItem value="sqft" id="sqft" />
													<Label htmlFor="sqft">Square feet (sq. ft.)</Label>
												</div>
												<div className="flex items-center space-x-2">
													<RadioGroupItem value="sqm" id="sqm" />
													<Label htmlFor="sqm">Square meters (sq. m.)</Label>
												</div>
											</RadioGroup>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Own or Rent */}
						<FormField
							control={form.control}
							name="ownOrRent"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-base">
										Do you Own or Rent this space?
									</FormLabel>
									<FormControl>
										<ButtonGroup className="w-full">
											<Button
												type="button"
												variant={field.value === "own" ? "default" : "outline"}
												className="flex-1"
												onClick={() => field.onChange("own")}
											>
												Own
											</Button>
											<Button
												type="button"
												variant={field.value === "rent" ? "default" : "outline"}
												className="flex-1"
												onClick={() => field.onChange("rent")}
											>
												Rent
											</Button>
										</ButtonGroup>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Navigation Buttons */}
						<div className="flex justify-between pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={onBack}
								disabled={isSubmitting}
							>
								<ArrowLeft className="mr-2 size-4 stroke-current" />
								Back
							</Button>
							<Button
								className="min-w-32"
								disabled={isSubmitting}
								size="lg"
								type="submit"
							>
								{isSubmitting ? "Saving..." : "Next"}
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}

// Step 3: Energy Use
function Step3({
	form,
	onSubmit,
	isSubmitting,
	onBack,
}: {
	form: ReturnType<typeof useForm<Step3FormData>>;
	onSubmit: (data: Step3FormData) => Promise<void>;
	isSubmitting: boolean;
	onBack: () => void;
}) {
	const dataInputMethod = form.watch("dataInputMethod");

	const handleSkip = async () => {
		form.setValue("dataInputMethod", "skip");
		await form.handleSubmit(onSubmit)();
	};

	return (
		<Card className="border-2 shadow-lg">
			<CardHeader className="space-y-3 pb-6">
				<div className="flex items-center gap-3">
					<div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
						<Zap className="size-6 stroke-current text-primary" />
					</div>
					<div>
						<CardTitle className="text-2xl">Your Energy Use</CardTitle>
						<CardDescription className="text-base">
							Please grab your latest utility bill for accurate results
						</CardDescription>
					</div>
				</div>
			</CardHeader>

			<CardContent>
				<Form {...form}>
					<form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
						{/* Data Input Method */}
						<FormField
							control={form.control}
							name="dataInputMethod"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-base">How would you like to enter your electricity usage?</FormLabel>
									<FormControl>
										<RadioGroup
											value={field.value}
											onValueChange={field.onChange}
											className="space-y-3"
										>
											<div className="flex items-center space-x-2">
												<RadioGroupItem value="kwh" id="kwh" />
												<Label htmlFor="kwh" className="font-normal">
													I have my kWh usage
												</Label>
											</div>
											<div className="flex items-center space-x-2">
												<RadioGroupItem value="amount" id="amount" />
												<Label htmlFor="amount" className="font-normal">
													I only have the dollar amount
												</Label>
											</div>
										</RadioGroup>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Electricity Input - kWh */}
						{dataInputMethod === "kwh" && (
							<FormField
								control={form.control}
								name="monthlyElectricityKwh"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-base">
											Monthly Electricity Use (kWh)
										</FormLabel>
										<FormControl>
											<Input
												type="number"
												min={0}
												step={0.01}
												placeholder="e.g., 1500"
												{...field}
												value={field.value ?? ""}
												onChange={(e) =>
													field.onChange(
														e.target.value ? Number(e.target.value) : undefined,
													)
												}
											/>
										</FormControl>
										<FormDescription>
											Found on your electricity bill as kilowatt-hours
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						{/* Electricity Input - Amount */}
						{dataInputMethod === "amount" && (
							<div className="grid gap-4 sm:grid-cols-2">
								<FormField
									control={form.control}
									name="monthlyElectricityAmount"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-base">
												Monthly Bill Amount
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													min={0}
													step={0.01}
													placeholder="e.g., 150"
													{...field}
													value={field.value ?? ""}
													onChange={(e) =>
														field.onChange(
															e.target.value ? Number(e.target.value) : undefined,
														)
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="electricityCurrency"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-base">Currency</FormLabel>
											<Select
												value={field.value}
												onValueChange={field.onChange}
											>
												<FormControl>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Select currency" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="USD">USD ($)</SelectItem>
													<SelectItem value="EUR">EUR (€)</SelectItem>
													<SelectItem value="GBP">GBP (£)</SelectItem>
													<SelectItem value="CAD">CAD ($)</SelectItem>
													<SelectItem value="AUD">AUD ($)</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						)}

						{/* Heating Fuel */}
						{dataInputMethod !== "skip" && (
							<>
								<FormField
									control={form.control}
									name="heatingFuel"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-base">
												Main Heating Fuel (Optional)
											</FormLabel>
											<Select
												value={field.value}
												onValueChange={field.onChange}
											>
												<FormControl>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Select heating fuel" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="none">No heating / Electric</SelectItem>
													<SelectItem value="natural-gas">Natural Gas</SelectItem>
													<SelectItem value="propane">Propane</SelectItem>
													<SelectItem value="heating-oil">Heating Oil</SelectItem>
													<SelectItem value="wood">Wood</SelectItem>
													<SelectItem value="other">Other</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								{form.watch("heatingFuel") &&
									form.watch("heatingFuel") !== "none" && (
										<div className="grid gap-4 sm:grid-cols-2">
											<FormField
												control={form.control}
												name="monthlyHeatingAmount"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-base">
															Monthly Heating Amount
														</FormLabel>
														<FormControl>
															<Input
																type="number"
																min={0}
																step={0.01}
																placeholder="e.g., 50"
																{...field}
																value={field.value ?? ""}
																onChange={(e) =>
																	field.onChange(
																		e.target.value
																			? Number(e.target.value)
																			: undefined,
																	)
																}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name="heatingUnit"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-base">Unit</FormLabel>
														<Select
															value={field.value}
															onValueChange={field.onChange}
														>
															<FormControl>
																<SelectTrigger className="w-full">
																	<SelectValue placeholder="Select unit" />
																</SelectTrigger>
															</FormControl>
															<SelectContent>
																<SelectItem value="therms">Therms</SelectItem>
																<SelectItem value="ccf">CCF</SelectItem>
																<SelectItem value="gallons">Gallons</SelectItem>
																<SelectItem value="dollars">Dollars ($)</SelectItem>
															</SelectContent>
														</Select>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
									)}
							</>
						)}

						{/* Navigation Buttons */}
						<div className="flex flex-col gap-3 pt-4">
							<div className="flex justify-between">
								<Button
									type="button"
									variant="outline"
									onClick={onBack}
									disabled={isSubmitting}
								>
									<ArrowLeft className="mr-2 size-4 stroke-current" />
									Back
								</Button>
								<Button
									className="min-w-32"
									disabled={isSubmitting}
									size="lg"
									type="submit"
								>
									{isSubmitting ? "Saving..." : "Next"}
								</Button>
							</div>

							{/* Skip Button */}
							<Button
								type="button"
								variant="ghost"
								onClick={handleSkip}
								disabled={isSubmitting}
								className="w-full"
							>
								I'll do this later - Skip for now
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}

// Step 4: Operations
function Step4({
	form,
	onSubmit,
	isSubmitting,
	onBack,
}: {
	form: ReturnType<typeof useForm<Step4FormData>>;
	onSubmit: (data: Step4FormData) => Promise<void>;
	isSubmitting: boolean;
	onBack: () => void;
}) {
	const hasVehicles = form.watch("hasVehicles");

	return (
		<Card className="border-2 shadow-lg">
			<CardHeader className="space-y-3 pb-6">
				<div className="flex items-center gap-3">
					<div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
						<Briefcase className="size-6 stroke-current text-primary" />
					</div>
					<div>
						<CardTitle className="text-2xl">Your Operations</CardTitle>
						<CardDescription className="text-base">
							Almost done! Just a few final details
						</CardDescription>
					</div>
				</div>
			</CardHeader>

			<CardContent>
				<Form {...form}>
					<form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
						{/* Company Vehicles */}
						<FormField
							control={form.control}
							name="hasVehicles"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-base">
										Does your company have vehicles?
									</FormLabel>
									<FormControl>
										<ButtonGroup className="w-full">
											<Button
												type="button"
												variant={field.value ? "default" : "outline"}
												className="flex-1"
												onClick={() => field.onChange(true)}
											>
												Yes
											</Button>
											<Button
												type="button"
												variant={!field.value ? "default" : "outline"}
												className="flex-1"
												onClick={() => field.onChange(false)}
											>
												No
											</Button>
										</ButtonGroup>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Number of Vehicles */}
						{hasVehicles && (
							<FormField
								control={form.control}
								name="numberOfVehicles"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-base">
											How many vehicles?
										</FormLabel>
										<FormControl>
											<Input
												type="number"
												min={0}
												placeholder="e.g., 5"
												{...field}
												value={field.value ?? ""}
												onChange={(e) =>
													field.onChange(
														e.target.value ? Number(e.target.value) : undefined,
													)
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						{/* Employee Commute */}
						<FormField
							control={form.control}
							name="employeeCommutePattern"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-base">
										How do most employees commute?
									</FormLabel>
									<Select value={field.value} onValueChange={field.onChange}>
										<FormControl>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Select commute pattern" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="mostly-remote">
												Mostly Remote
											</SelectItem>
											<SelectItem value="drive-alone">
												Drive Alone
											</SelectItem>
											<SelectItem value="carpool">Carpool</SelectItem>
											<SelectItem value="public-transit">
												Public Transit
											</SelectItem>
											<SelectItem value="bike-walk">Bike/Walk</SelectItem>
											<SelectItem value="mixed">Mixed</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Business Flights */}
						<FormField
							control={form.control}
							name="businessFlightsPerYear"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-base">
										Business Flights per Year
									</FormLabel>
									<FormControl>
										<div className="space-y-4">
											<Slider
												min={0}
												max={100}
												step={1}
												value={[field.value]}
												onValueChange={(values) => field.onChange(values[0])}
											/>
											<div className="text-center font-medium text-lg">
												{field.value} {field.value === 1 ? "flight" : "flights"}
											</div>
										</div>
									</FormControl>
									<FormDescription>
										Approximate number of round-trip flights
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Weekly Trash Bags */}
						<FormField
							control={form.control}
							name="weeklyTrashBags"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-base">
										Weekly Trash Bags (Approximate)
									</FormLabel>
									<FormControl>
										<Input
											type="number"
											min={0}
											placeholder="e.g., 10"
											{...field}
											onChange={(e) => field.onChange(Number(e.target.value))}
										/>
									</FormControl>
									<FormDescription>
										Standard 13-gallon trash bags per week
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Navigation Buttons */}
						<div className="flex justify-between pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={onBack}
								disabled={isSubmitting}
							>
								<ArrowLeft className="mr-2 size-4 stroke-current" />
								Back
							</Button>
							<Button
								className="min-w-32"
								disabled={isSubmitting}
								size="lg"
								type="submit"
							>
								{isSubmitting ? "Calculating..." : "Calculate My Footprint!"}
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
