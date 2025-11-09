"use client";

import { UserButton } from "@clerk/nextjs";
import {
	Building2,
	Database,
	Factory,
	Home,
	Leaf,
	Save,
	Settings as SettingsIcon,
	Target,
	TrendingDown,
	Users,
	Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

interface SettingsPageProps {
	userId: string;
}

export function SettingsPage({ userId }: SettingsPageProps) {
	const router = useRouter();
	const { data, isLoading, error } = api.onboarding.get.useQuery({ userId });
	const saveStep1 = api.onboarding.saveStep1.useMutation();
	const saveStep2 = api.onboarding.saveStep2.useMutation();
	const saveStep3 = api.onboarding.saveStep3.useMutation();
	const saveStep4 = api.onboarding.saveStep4.useMutation();

	// Form state
	const [businessName, setBusinessName] = useState("");
	const [industry, setIndustry] = useState("");
	const [country, setCountry] = useState("");
	const [postalCode, setPostalCode] = useState("");
	const [numberOfEmployees, setNumberOfEmployees] = useState("");
	const [locationSize, setLocationSize] = useState("");
	const [locationUnit, setLocationUnit] = useState<"sqft" | "sqm">("sqft");
	const [ownOrRent, setOwnOrRent] = useState<"own" | "rent">("rent");
	const [monthlyElectricityKwh, setMonthlyElectricityKwh] = useState("");
	const [monthlyElectricityAmount, setMonthlyElectricityAmount] = useState("");
	const [electricityCurrency, setElectricityCurrency] = useState("USD");
	const [heatingFuel, setHeatingFuel] = useState("");
	const [monthlyHeatingAmount, setMonthlyHeatingAmount] = useState("");
	const [heatingUnit, setHeatingUnit] = useState("");
	const [hasVehicles, setHasVehicles] = useState(false);
	const [numberOfVehicles, setNumberOfVehicles] = useState("");
	const [employeeCommutePattern, setEmployeeCommutePattern] = useState("");
	const [businessFlightsPerYear, setBusinessFlightsPerYear] = useState("");
	const [weeklyTrashBags, setWeeklyTrashBags] = useState("");

	useEffect(() => {
		if (data) {
			setBusinessName(data.businessName ?? "");
			setIndustry(data.industry ?? "");
			setCountry(data.country ?? "");
			setPostalCode(data.postalCode ?? "");
			setNumberOfEmployees(data.numberOfEmployees?.toString() ?? "");
			setLocationSize(data.locationSize?.toString() ?? "");
			setLocationUnit((data.locationUnit as "sqft" | "sqm") ?? "sqft");
			setOwnOrRent((data.ownOrRent as "own" | "rent") ?? "rent");
			setMonthlyElectricityKwh(data.monthlyElectricityKwh?.toString() ?? "");
			setMonthlyElectricityAmount(
				data.monthlyElectricityAmount?.toString() ?? "",
			);
			setElectricityCurrency(data.electricityCurrency ?? "USD");
			setHeatingFuel(data.heatingFuel ?? "");
			setMonthlyHeatingAmount(data.monthlyHeatingAmount?.toString() ?? "");
			setHeatingUnit(data.heatingUnit ?? "");
			setHasVehicles(data.hasVehicles === true);
			setNumberOfVehicles(data.numberOfVehicles?.toString() ?? "");
			setEmployeeCommutePattern(data.employeeCommutePattern ?? "");
			setBusinessFlightsPerYear(data.businessFlightsPerYear?.toString() ?? "");
			setWeeklyTrashBags(data.weeklyTrashBags?.toString() ?? "");
		}
	}, [data]);

	const handleSaveAll = async () => {
		try {
			// Save all steps
			await saveStep1.mutateAsync({
				userId,
				businessName,
				industry,
				country,
				postalCode,
			});

			await saveStep2.mutateAsync({
				userId,
				numberOfEmployees: Number(numberOfEmployees),
				locationSize: Number(locationSize),
				locationUnit,
				ownOrRent,
			});

			await saveStep3.mutateAsync({
				userId,
				monthlyElectricityKwh: monthlyElectricityKwh
					? Number(monthlyElectricityKwh)
					: undefined,
				monthlyElectricityAmount: monthlyElectricityAmount
					? Number(monthlyElectricityAmount)
					: undefined,
				electricityCurrency,
				heatingFuel: heatingFuel || undefined,
				monthlyHeatingAmount: monthlyHeatingAmount
					? Number(monthlyHeatingAmount)
					: undefined,
				heatingUnit: heatingUnit || undefined,
				energyDataSkipped: false,
			});

			await saveStep4.mutateAsync({
				userId,
				hasVehicles,
				numberOfVehicles: numberOfVehicles
					? Number(numberOfVehicles)
					: undefined,
				employeeCommutePattern,
				businessFlightsPerYear: Number(businessFlightsPerYear),
				weeklyTrashBags: Number(weeklyTrashBags),
			});

			toast.success("Settings saved successfully!");
			router.refresh();
		} catch (err) {
			toast.error("Failed to save settings. Please try again.");
			console.error(err);
		}
	};

	if (isLoading) {
		return <SettingsSkeleton />;
	}

	if (error) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<Alert className="max-w-md" variant="destructive">
					<AlertDescription>
						Failed to load settings: {error.message}
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen bg-background">
			{/* Sidebar */}
			<aside className="fixed top-0 left-0 h-screen w-72 border-r bg-card shadow-sm">
				<div className="flex h-full flex-col">
					{/* Logo/Header */}
					<div className="border-b bg-gradient-to-br from-primary/10 to-primary/5 p-6">
						<div className="flex items-center gap-3">
							<div className="rounded-lg bg-primary p-2">
								<Leaf className="size-6 stroke-current text-primary-foreground" />
							</div>
							<div>
								<h1 className="font-bold text-xl">EcoPilot</h1>
								<p className="text-muted-foreground text-xs">
									Sustainability Dashboard
								</p>
							</div>
						</div>
					</div>

					{/* Navigation */}
					<nav className="flex-1 space-y-1 overflow-y-auto p-4">
						<a
							className="flex items-center gap-3 rounded-lg px-4 py-3 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
							href="/dashboard"
						>
							<Home className="size-5 stroke-current" />
							<span>Overview</span>
						</a>
						<a
							className="flex items-center gap-3 rounded-lg px-4 py-3 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
							href="/dashboard/footprint"
						>
							<TrendingDown className="size-5 stroke-current" />
							<span>Carbon Footprint</span>
						</a>
						<a
							className="flex items-center gap-3 rounded-lg px-4 py-3 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
							href="/dashboard/ceda"
						>
							<Database className="size-5 stroke-current" />
							<span>CEDA</span>
						</a>
						<a
							className="flex items-center gap-3 rounded-lg px-4 py-3 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
							href="/dashboard/actions"
						>
							<Target className="size-5 stroke-current" />
							<span>Action Plan</span>
						</a>
						<a
							className="flex items-center gap-3 rounded-lg bg-primary px-4 py-3 text-primary-foreground shadow-sm transition-all hover:shadow-md"
							href="/dashboard/settings"
						>
							<SettingsIcon className="size-5 stroke-current" />
							<span className="font-medium">Settings</span>
						</a>
					</nav>

					{/* User */}
					<div className="border-t bg-muted/30 p-4">
						<div className="flex items-center gap-3">
							<UserButton />
							<div className="flex-1 text-sm">
								<p className="font-medium">Your Account</p>
								<p className="text-muted-foreground text-xs">Manage settings</p>
							</div>
						</div>
					</div>
				</div>
			</aside>

			{/* Main Content */}
			<main className="ml-72 flex-1 overflow-auto">
				<div className="@container/main flex flex-1 flex-col">
					<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
						{/* Page Header */}
						<div className="px-4 lg:px-6">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="rounded-lg bg-primary/10 p-3">
										<SettingsIcon className="size-6 stroke-current text-primary" />
									</div>
									<div>
										<h1 className="font-bold text-3xl">Settings</h1>
										<p className="text-muted-foreground">
											Manage your business information
										</p>
									</div>
								</div>
								<Button
									disabled={
										saveStep1.isPending ||
										saveStep2.isPending ||
										saveStep3.isPending ||
										saveStep4.isPending
									}
									onClick={handleSaveAll}
									size="lg"
								>
									<Save className="mr-2 size-4 stroke-current" />
									Save All Changes
								</Button>
							</div>
						</div>

						{/* Business Information */}
						<div className="px-4 lg:px-6">
							<Card>
								<CardHeader>
									<div className="flex items-center gap-2">
										<Building2 className="size-5 stroke-current text-primary" />
										<CardTitle>Business Information</CardTitle>
									</div>
									<CardDescription>
										Basic details about your business
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid gap-4 md:grid-cols-2">
										<div className="space-y-2">
											<Label htmlFor="businessName">Business Name</Label>
											<Input
												id="businessName"
												onChange={(e) => setBusinessName(e.target.value)}
												placeholder="Enter business name"
												value={businessName}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="industry">Industry</Label>
											<Select onValueChange={setIndustry} value={industry}>
												<SelectTrigger id="industry">
													<SelectValue placeholder="Select industry" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="Agriculture & Farming">
														Agriculture & Farming
													</SelectItem>
													<SelectItem value="Construction">
														Construction
													</SelectItem>
													<SelectItem value="Education">Education</SelectItem>
													<SelectItem value="Energy & Utilities">
														Energy & Utilities
													</SelectItem>
													<SelectItem value="Financial Services">
														Financial Services
													</SelectItem>
													<SelectItem value="Food & Beverage">
														Food & Beverage
													</SelectItem>
													<SelectItem value="Healthcare">Healthcare</SelectItem>
													<SelectItem value="Hospitality & Tourism">
														Hospitality & Tourism
													</SelectItem>
													<SelectItem value="Manufacturing">
														Manufacturing
													</SelectItem>
													<SelectItem value="Real Estate">
														Real Estate
													</SelectItem>
													<SelectItem value="Retail">Retail</SelectItem>
													<SelectItem value="Technology">Technology</SelectItem>
													<SelectItem value="Transportation & Logistics">
														Transportation & Logistics
													</SelectItem>
													<SelectItem value="Other">Other</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>
									<div className="grid gap-4 md:grid-cols-2">
										<div className="space-y-2">
											<Label htmlFor="country">Country</Label>
											<Select onValueChange={setCountry} value={country}>
												<SelectTrigger id="country">
													<SelectValue placeholder="Select country" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="Afghanistan">
														Afghanistan
													</SelectItem>
													<SelectItem value="Albania">Albania</SelectItem>
													<SelectItem value="Algeria">Algeria</SelectItem>
													<SelectItem value="Andorra">Andorra</SelectItem>
													<SelectItem value="Angola">Angola</SelectItem>
													<SelectItem value="Argentina">Argentina</SelectItem>
													<SelectItem value="Armenia">Armenia</SelectItem>
													<SelectItem value="Australia">Australia</SelectItem>
													<SelectItem value="Austria">Austria</SelectItem>
													<SelectItem value="Azerbaijan">Azerbaijan</SelectItem>
													<SelectItem value="Bahamas">Bahamas</SelectItem>
													<SelectItem value="Bahrain">Bahrain</SelectItem>
													<SelectItem value="Bangladesh">Bangladesh</SelectItem>
													<SelectItem value="Barbados">Barbados</SelectItem>
													<SelectItem value="Belarus">Belarus</SelectItem>
													<SelectItem value="Belgium">Belgium</SelectItem>
													<SelectItem value="Belize">Belize</SelectItem>
													<SelectItem value="Benin">Benin</SelectItem>
													<SelectItem value="Bhutan">Bhutan</SelectItem>
													<SelectItem value="Bolivia">Bolivia</SelectItem>
													<SelectItem value="Bosnia and Herzegovina">
														Bosnia and Herzegovina
													</SelectItem>
													<SelectItem value="Botswana">Botswana</SelectItem>
													<SelectItem value="Brazil">Brazil</SelectItem>
													<SelectItem value="Brunei">Brunei</SelectItem>
													<SelectItem value="Bulgaria">Bulgaria</SelectItem>
													<SelectItem value="Burkina Faso">
														Burkina Faso
													</SelectItem>
													<SelectItem value="Burundi">Burundi</SelectItem>
													<SelectItem value="Cambodia">Cambodia</SelectItem>
													<SelectItem value="Cameroon">Cameroon</SelectItem>
													<SelectItem value="Canada">Canada</SelectItem>
													<SelectItem value="Cape Verde">Cape Verde</SelectItem>
													<SelectItem value="Central African Republic">
														Central African Republic
													</SelectItem>
													<SelectItem value="Chad">Chad</SelectItem>
													<SelectItem value="Chile">Chile</SelectItem>
													<SelectItem value="China">China</SelectItem>
													<SelectItem value="Colombia">Colombia</SelectItem>
													<SelectItem value="Comoros">Comoros</SelectItem>
													<SelectItem value="Congo">Congo</SelectItem>
													<SelectItem value="Costa Rica">Costa Rica</SelectItem>
													<SelectItem value="Croatia">Croatia</SelectItem>
													<SelectItem value="Cuba">Cuba</SelectItem>
													<SelectItem value="Cyprus">Cyprus</SelectItem>
													<SelectItem value="Czech Republic">
														Czech Republic
													</SelectItem>
													<SelectItem value="Denmark">Denmark</SelectItem>
													<SelectItem value="Djibouti">Djibouti</SelectItem>
													<SelectItem value="Dominica">Dominica</SelectItem>
													<SelectItem value="Dominican Republic">
														Dominican Republic
													</SelectItem>
													<SelectItem value="East Timor">East Timor</SelectItem>
													<SelectItem value="Ecuador">Ecuador</SelectItem>
													<SelectItem value="Egypt">Egypt</SelectItem>
													<SelectItem value="El Salvador">
														El Salvador
													</SelectItem>
													<SelectItem value="Equatorial Guinea">
														Equatorial Guinea
													</SelectItem>
													<SelectItem value="Eritrea">Eritrea</SelectItem>
													<SelectItem value="Estonia">Estonia</SelectItem>
													<SelectItem value="Ethiopia">Ethiopia</SelectItem>
													<SelectItem value="Fiji">Fiji</SelectItem>
													<SelectItem value="Finland">Finland</SelectItem>
													<SelectItem value="France">France</SelectItem>
													<SelectItem value="Gabon">Gabon</SelectItem>
													<SelectItem value="Gambia">Gambia</SelectItem>
													<SelectItem value="Georgia">Georgia</SelectItem>
													<SelectItem value="Germany">Germany</SelectItem>
													<SelectItem value="Ghana">Ghana</SelectItem>
													<SelectItem value="Greece">Greece</SelectItem>
													<SelectItem value="Grenada">Grenada</SelectItem>
													<SelectItem value="Guatemala">Guatemala</SelectItem>
													<SelectItem value="Guinea">Guinea</SelectItem>
													<SelectItem value="Guinea-Bissau">
														Guinea-Bissau
													</SelectItem>
													<SelectItem value="Guyana">Guyana</SelectItem>
													<SelectItem value="Haiti">Haiti</SelectItem>
													<SelectItem value="Honduras">Honduras</SelectItem>
													<SelectItem value="Hungary">Hungary</SelectItem>
													<SelectItem value="Iceland">Iceland</SelectItem>
													<SelectItem value="India">India</SelectItem>
													<SelectItem value="Indonesia">Indonesia</SelectItem>
													<SelectItem value="Iran">Iran</SelectItem>
													<SelectItem value="Iraq">Iraq</SelectItem>
													<SelectItem value="Ireland">Ireland</SelectItem>
													<SelectItem value="Israel">Israel</SelectItem>
													<SelectItem value="Italy">Italy</SelectItem>
													<SelectItem value="Jamaica">Jamaica</SelectItem>
													<SelectItem value="Japan">Japan</SelectItem>
													<SelectItem value="Jordan">Jordan</SelectItem>
													<SelectItem value="Kazakhstan">Kazakhstan</SelectItem>
													<SelectItem value="Kenya">Kenya</SelectItem>
													<SelectItem value="Kiribati">Kiribati</SelectItem>
													<SelectItem value="North Korea">
														North Korea
													</SelectItem>
													<SelectItem value="South Korea">
														South Korea
													</SelectItem>
													<SelectItem value="Kuwait">Kuwait</SelectItem>
													<SelectItem value="Kyrgyzstan">Kyrgyzstan</SelectItem>
													<SelectItem value="Laos">Laos</SelectItem>
													<SelectItem value="Latvia">Latvia</SelectItem>
													<SelectItem value="Lebanon">Lebanon</SelectItem>
													<SelectItem value="Lesotho">Lesotho</SelectItem>
													<SelectItem value="Liberia">Liberia</SelectItem>
													<SelectItem value="Libya">Libya</SelectItem>
													<SelectItem value="Liechtenstein">
														Liechtenstein
													</SelectItem>
													<SelectItem value="Lithuania">Lithuania</SelectItem>
													<SelectItem value="Luxembourg">Luxembourg</SelectItem>
													<SelectItem value="Madagascar">Madagascar</SelectItem>
													<SelectItem value="Malawi">Malawi</SelectItem>
													<SelectItem value="Malaysia">Malaysia</SelectItem>
													<SelectItem value="Maldives">Maldives</SelectItem>
													<SelectItem value="Mali">Mali</SelectItem>
													<SelectItem value="Malta">Malta</SelectItem>
													<SelectItem value="Marshall Islands">
														Marshall Islands
													</SelectItem>
													<SelectItem value="Mauritania">Mauritania</SelectItem>
													<SelectItem value="Mauritius">Mauritius</SelectItem>
													<SelectItem value="Mexico">Mexico</SelectItem>
													<SelectItem value="Micronesia">Micronesia</SelectItem>
													<SelectItem value="Moldova">Moldova</SelectItem>
													<SelectItem value="Monaco">Monaco</SelectItem>
													<SelectItem value="Mongolia">Mongolia</SelectItem>
													<SelectItem value="Montenegro">Montenegro</SelectItem>
													<SelectItem value="Morocco">Morocco</SelectItem>
													<SelectItem value="Mozambique">Mozambique</SelectItem>
													<SelectItem value="Myanmar">Myanmar</SelectItem>
													<SelectItem value="Namibia">Namibia</SelectItem>
													<SelectItem value="Nauru">Nauru</SelectItem>
													<SelectItem value="Nepal">Nepal</SelectItem>
													<SelectItem value="Netherlands">
														Netherlands
													</SelectItem>
													<SelectItem value="New Zealand">
														New Zealand
													</SelectItem>
													<SelectItem value="Nicaragua">Nicaragua</SelectItem>
													<SelectItem value="Niger">Niger</SelectItem>
													<SelectItem value="Nigeria">Nigeria</SelectItem>
													<SelectItem value="North Macedonia">
														North Macedonia
													</SelectItem>
													<SelectItem value="Norway">Norway</SelectItem>
													<SelectItem value="Oman">Oman</SelectItem>
													<SelectItem value="Pakistan">Pakistan</SelectItem>
													<SelectItem value="Palau">Palau</SelectItem>
													<SelectItem value="Palestine">Palestine</SelectItem>
													<SelectItem value="Panama">Panama</SelectItem>
													<SelectItem value="Papua New Guinea">
														Papua New Guinea
													</SelectItem>
													<SelectItem value="Paraguay">Paraguay</SelectItem>
													<SelectItem value="Peru">Peru</SelectItem>
													<SelectItem value="Philippines">
														Philippines
													</SelectItem>
													<SelectItem value="Poland">Poland</SelectItem>
													<SelectItem value="Portugal">Portugal</SelectItem>
													<SelectItem value="Qatar">Qatar</SelectItem>
													<SelectItem value="Romania">Romania</SelectItem>
													<SelectItem value="Russia">Russia</SelectItem>
													<SelectItem value="Rwanda">Rwanda</SelectItem>
													<SelectItem value="Saint Kitts and Nevis">
														Saint Kitts and Nevis
													</SelectItem>
													<SelectItem value="Saint Lucia">
														Saint Lucia
													</SelectItem>
													<SelectItem value="Saint Vincent and the Grenadines">
														Saint Vincent and the Grenadines
													</SelectItem>
													<SelectItem value="Samoa">Samoa</SelectItem>
													<SelectItem value="San Marino">San Marino</SelectItem>
													<SelectItem value="Sao Tome and Principe">
														Sao Tome and Principe
													</SelectItem>
													<SelectItem value="Saudi Arabia">
														Saudi Arabia
													</SelectItem>
													<SelectItem value="Senegal">Senegal</SelectItem>
													<SelectItem value="Serbia">Serbia</SelectItem>
													<SelectItem value="Seychelles">Seychelles</SelectItem>
													<SelectItem value="Sierra Leone">
														Sierra Leone
													</SelectItem>
													<SelectItem value="Singapore">Singapore</SelectItem>
													<SelectItem value="Slovakia">Slovakia</SelectItem>
													<SelectItem value="Slovenia">Slovenia</SelectItem>
													<SelectItem value="Solomon Islands">
														Solomon Islands
													</SelectItem>
													<SelectItem value="Somalia">Somalia</SelectItem>
													<SelectItem value="South Africa">
														South Africa
													</SelectItem>
													<SelectItem value="South Sudan">
														South Sudan
													</SelectItem>
													<SelectItem value="Spain">Spain</SelectItem>
													<SelectItem value="Sri Lanka">Sri Lanka</SelectItem>
													<SelectItem value="Sudan">Sudan</SelectItem>
													<SelectItem value="Suriname">Suriname</SelectItem>
													<SelectItem value="Sweden">Sweden</SelectItem>
													<SelectItem value="Switzerland">
														Switzerland
													</SelectItem>
													<SelectItem value="Syria">Syria</SelectItem>
													<SelectItem value="Taiwan">Taiwan</SelectItem>
													<SelectItem value="Tajikistan">Tajikistan</SelectItem>
													<SelectItem value="Tanzania">Tanzania</SelectItem>
													<SelectItem value="Thailand">Thailand</SelectItem>
													<SelectItem value="Togo">Togo</SelectItem>
													<SelectItem value="Tonga">Tonga</SelectItem>
													<SelectItem value="Trinidad and Tobago">
														Trinidad and Tobago
													</SelectItem>
													<SelectItem value="Tunisia">Tunisia</SelectItem>
													<SelectItem value="Turkey">Turkey</SelectItem>
													<SelectItem value="Turkmenistan">
														Turkmenistan
													</SelectItem>
													<SelectItem value="Tuvalu">Tuvalu</SelectItem>
													<SelectItem value="Uganda">Uganda</SelectItem>
													<SelectItem value="Ukraine">Ukraine</SelectItem>
													<SelectItem value="United Arab Emirates">
														United Arab Emirates
													</SelectItem>
													<SelectItem value="United Kingdom">
														United Kingdom
													</SelectItem>
													<SelectItem value="United States">
														United States
													</SelectItem>
													<SelectItem value="Uruguay">Uruguay</SelectItem>
													<SelectItem value="Uzbekistan">Uzbekistan</SelectItem>
													<SelectItem value="Vanuatu">Vanuatu</SelectItem>
													<SelectItem value="Vatican City">
														Vatican City
													</SelectItem>
													<SelectItem value="Venezuela">Venezuela</SelectItem>
													<SelectItem value="Vietnam">Vietnam</SelectItem>
													<SelectItem value="Yemen">Yemen</SelectItem>
													<SelectItem value="Zambia">Zambia</SelectItem>
													<SelectItem value="Zimbabwe">Zimbabwe</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div className="space-y-2">
											<Label htmlFor="postalCode">Postal Code</Label>
											<Input
												id="postalCode"
												onChange={(e) => setPostalCode(e.target.value)}
												placeholder="Enter postal code"
												value={postalCode}
											/>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Team & Space */}
						<div className="px-4 lg:px-6">
							<Card>
								<CardHeader>
									<div className="flex items-center gap-2">
										<Users className="size-5 stroke-current text-primary" />
										<CardTitle>Team & Space</CardTitle>
									</div>
									<CardDescription>
										Information about your team and location
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid gap-4 md:grid-cols-2">
										<div className="space-y-2">
											<Label htmlFor="numberOfEmployees">
												Number of Employees
											</Label>
											<Input
												id="numberOfEmployees"
												min="1"
												onChange={(e) => setNumberOfEmployees(e.target.value)}
												placeholder="Enter number"
												type="number"
												value={numberOfEmployees}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="ownOrRent">Own or Rent</Label>
											<Select
												onValueChange={(value) =>
													setOwnOrRent(value as "own" | "rent")
												}
												value={ownOrRent}
											>
												<SelectTrigger id="ownOrRent">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="own">Own</SelectItem>
													<SelectItem value="rent">Rent</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>
									<div className="grid gap-4 md:grid-cols-2">
										<div className="space-y-2">
											<Label htmlFor="locationSize">Location Size</Label>
											<Input
												id="locationSize"
												min="1"
												onChange={(e) => setLocationSize(e.target.value)}
												placeholder="Enter size"
												type="number"
												value={locationSize}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="locationUnit">Unit</Label>
											<Select
												onValueChange={(value) =>
													setLocationUnit(value as "sqft" | "sqm")
												}
												value={locationUnit}
											>
												<SelectTrigger id="locationUnit">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="sqft">Square Feet</SelectItem>
													<SelectItem value="sqm">Square Meters</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Energy Use */}
						<div className="px-4 lg:px-6">
							<Card>
								<CardHeader>
									<div className="flex items-center gap-2">
										<Zap className="size-5 stroke-current text-primary" />
										<CardTitle>Energy Use</CardTitle>
									</div>
									<CardDescription>
										Electricity and heating information
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid gap-4 md:grid-cols-2">
										<div className="space-y-2">
											<Label htmlFor="monthlyElectricityKwh">
												Monthly Electricity (kWh)
											</Label>
											<Input
												id="monthlyElectricityKwh"
												min="0"
												onChange={(e) =>
													setMonthlyElectricityKwh(e.target.value)
												}
												placeholder="Enter kWh"
												type="number"
												value={monthlyElectricityKwh}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="monthlyElectricityAmount">
												Monthly Electricity Cost
											</Label>
											<Input
												id="monthlyElectricityAmount"
												min="0"
												onChange={(e) =>
													setMonthlyElectricityAmount(e.target.value)
												}
												placeholder="Enter amount"
												type="number"
												value={monthlyElectricityAmount}
											/>
										</div>
									</div>
									<div className="grid gap-4 md:grid-cols-3">
										<div className="space-y-2">
											<Label htmlFor="electricityCurrency">Currency</Label>
											<Select
												onValueChange={setElectricityCurrency}
												value={electricityCurrency}
											>
												<SelectTrigger id="electricityCurrency">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="USD">USD</SelectItem>
													<SelectItem value="EUR">EUR</SelectItem>
													<SelectItem value="GBP">GBP</SelectItem>
													<SelectItem value="CAD">CAD</SelectItem>
													<SelectItem value="AUD">AUD</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div className="space-y-2">
											<Label htmlFor="heatingFuel">Heating Fuel</Label>
											<Select
												onValueChange={setHeatingFuel}
												value={heatingFuel}
											>
												<SelectTrigger id="heatingFuel">
													<SelectValue placeholder="Select fuel" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="none">
														No heating / Electric
													</SelectItem>
													<SelectItem value="natural-gas">
														Natural Gas
													</SelectItem>
													<SelectItem value="propane">Propane</SelectItem>
													<SelectItem value="heating-oil">
														Heating Oil
													</SelectItem>
													<SelectItem value="wood">Wood</SelectItem>
													<SelectItem value="other">Other</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div className="space-y-2">
											<Label htmlFor="monthlyHeatingAmount">
												Monthly Heating Amount
											</Label>
											<Input
												id="monthlyHeatingAmount"
												min="0"
												onChange={(e) =>
													setMonthlyHeatingAmount(e.target.value)
												}
												placeholder="Enter amount"
												type="number"
												value={monthlyHeatingAmount}
											/>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Operations */}
						<div className="px-4 lg:px-6">
							<Card>
								<CardHeader>
									<div className="flex items-center gap-2">
										<Factory className="size-5 stroke-current text-primary" />
										<CardTitle>Operations</CardTitle>
									</div>
									<CardDescription>
										Transportation and waste information
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid gap-4 md:grid-cols-2">
										<div className="space-y-2">
											<Label htmlFor="hasVehicles">Company Vehicles</Label>
											<Select
												onValueChange={(value) =>
													setHasVehicles(value === "true")
												}
												value={hasVehicles.toString()}
											>
												<SelectTrigger id="hasVehicles">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="true">Yes</SelectItem>
													<SelectItem value="false">No</SelectItem>
												</SelectContent>
											</Select>
										</div>
										{hasVehicles && (
											<div className="space-y-2">
												<Label htmlFor="numberOfVehicles">
													Number of Vehicles
												</Label>
												<Input
													id="numberOfVehicles"
													min="0"
													onChange={(e) => setNumberOfVehicles(e.target.value)}
													placeholder="Enter number"
													type="number"
													value={numberOfVehicles}
												/>
											</div>
										)}
									</div>
									<div className="grid gap-4 md:grid-cols-2">
										<div className="space-y-2">
											<Label htmlFor="employeeCommutePattern">
												Employee Commute Pattern
											</Label>
											<Select
												onValueChange={setEmployeeCommutePattern}
												value={employeeCommutePattern}
											>
												<SelectTrigger id="employeeCommutePattern">
													<SelectValue placeholder="Select pattern" />
												</SelectTrigger>
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
										</div>
										<div className="space-y-2">
											<Label htmlFor="businessFlightsPerYear">
												Business Flights Per Year
											</Label>
											<Input
												id="businessFlightsPerYear"
												min="0"
												onChange={(e) =>
													setBusinessFlightsPerYear(e.target.value)
												}
												placeholder="Enter number"
												type="number"
												value={businessFlightsPerYear}
											/>
										</div>
									</div>
									<div className="space-y-2">
										<Label htmlFor="weeklyTrashBags">Weekly Trash Bags</Label>
										<Input
											id="weeklyTrashBags"
											min="0"
											onChange={(e) => setWeeklyTrashBags(e.target.value)}
											placeholder="Enter number"
											type="number"
											value={weeklyTrashBags}
										/>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Save Button */}
						<div className="px-4 lg:px-6">
							<Button
								className="w-full"
								disabled={
									saveStep1.isPending ||
									saveStep2.isPending ||
									saveStep3.isPending ||
									saveStep4.isPending
								}
								onClick={handleSaveAll}
								size="lg"
							>
								<Save className="mr-2 size-4 stroke-current" />
								Save All Changes
							</Button>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}

function SettingsSkeleton() {
	return (
		<div className="flex min-h-screen bg-background">
			<aside className="fixed top-0 left-0 h-screen w-72 border-r bg-card shadow-sm">
				<div className="flex h-full flex-col">
					<div className="border-b bg-gradient-to-br from-primary/10 to-primary/5 p-6">
						<div className="flex items-center gap-3">
							<Skeleton className="size-10 rounded-lg" />
							<div className="flex-1">
								<Skeleton className="h-6 w-24" />
								<Skeleton className="mt-1 h-3 w-32" />
							</div>
						</div>
					</div>
					<div className="flex-1 space-y-2 p-4">
						{["home", "footprint", "actions", "settings"].map((item) => (
							<Skeleton className="h-12 w-full rounded-lg" key={item} />
						))}
					</div>
					<div className="border-t bg-muted/30 p-4">
						<div className="flex items-center gap-3">
							<Skeleton className="size-8 rounded-full" />
							<div className="flex-1">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="mt-1 h-3 w-20" />
							</div>
						</div>
					</div>
				</div>
			</aside>
			<main className="ml-72 flex-1 overflow-auto p-8">
				<div className="space-y-8">
					<div className="flex items-center justify-between">
						<Skeleton className="h-16 w-96" />
						<Skeleton className="h-12 w-48" />
					</div>
					{["business", "team", "energy", "operations"].map((item) => (
						<Skeleton className="h-64 rounded-lg" key={item} />
					))}
				</div>
			</main>
		</div>
	);
}
