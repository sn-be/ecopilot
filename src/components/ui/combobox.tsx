"use client";

import { ChevronsUpDown } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ComboboxProps {
	value: string;
	onValueChange: (value: string) => void;
	options: readonly string[];
	placeholder?: string;
	searchPlaceholder?: string;
	emptyText?: string;
	className?: string;
}

export function Combobox({
	value,
	onValueChange,
	options,
	placeholder = "Select an option...",
	searchPlaceholder = "Search...",
	emptyText = "No results found.",
	className,
}: ComboboxProps) {
	const [open, setOpen] = React.useState(false);

	return (
		<Popover onOpenChange={setOpen} open={open}>
			<PopoverTrigger asChild>
				<Button
					aria-expanded={open}
					className={cn(
						"justify-between",
						!value && "text-muted-foreground",
						className,
					)}
					role="combobox"
					variant="outline"
				>
					{value ? options.find((option) => option === value) : placeholder}
					<ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				align="start"
				avoidCollisions={false}
				className="p-0"
				side="bottom"
				sideOffset={4}
				style={{
					width: "var(--radix-popover-trigger-width)",
				}}
			>
				<Command>
					<CommandInput placeholder={searchPlaceholder} />
					<CommandList className="max-h-[200px]">
						<CommandEmpty>{emptyText}</CommandEmpty>
						<CommandGroup>
							{options.map((option) => (
								<CommandItem
									key={option}
									onSelect={() => {
										onValueChange(option);
										setOpen(false);
									}}
									value={option}
								>
									{option}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
