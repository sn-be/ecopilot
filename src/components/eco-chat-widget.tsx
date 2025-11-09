"use client";

import { Leaf, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface Message {
	id: string;
	role: "user" | "assistant";
	content: string;
	timestamp: Date;
}

interface EcoChatWidgetProps {
	userId?: string;
	businessContext?: {
		industry?: string;
		employeeCount?: number;
		totalEmissions?: number;
		breakdown?: Array<{
			category: string;
			kgCO2e: number;
			percent: number;
		}>;
		topEmissionSource?: string;
		recommendations?: string[];
	};
}

export function EcoChatWidget({ userId, businessContext }: EcoChatWidgetProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [messages, setMessages] = useState<Message[]>([
		{
			id: "welcome",
			role: "assistant",
			content:
				"🌱 Hi! I'm your EcoPilot assistant. I have access to your complete carbon footprint data and can answer questions about your emissions, provide personalized reduction strategies, and help you understand your sustainability metrics. What would you like to know?",
			timestamp: new Date(),
		},
	]);
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [showSuggestions, setShowSuggestions] = useState(true);
	const scrollAreaRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const lastMessageId = messages[messages.length - 1]?.id;

	// Auto-scroll to bottom when new messages arrive
	// biome-ignore lint/correctness/useExhaustiveDependencies: We only want to scroll when a new message is added
	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [lastMessageId]);

	// Focus input when chat opens
	useEffect(() => {
		if (isOpen && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isOpen]);

	const handleSendMessage = async (messageText?: string) => {
		const textToSend = messageText ?? input.trim();
		if (!textToSend || isLoading) return;

		const userMessage: Message = {
			id: `user-${Date.now()}`,
			role: "user",
			content: textToSend,
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, userMessage]);
		setInput("");
		setIsLoading(true);
		setShowSuggestions(false);

		try {
			const response = await fetch("/api/chat", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					messages: messages
						.concat(userMessage)
						.map((m) => ({ role: m.role, content: m.content })),
					userId,
					businessContext,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to get response");
			}

			const data = await response.json();

			const assistantMessage: Message = {
				id: `assistant-${Date.now()}`,
				role: "assistant",
				content: data.message,
				timestamp: new Date(),
			};

			setMessages((prev) => [...prev, assistantMessage]);
		} catch (error) {
			console.error("Chat error:", error);
			const errorMessage: Message = {
				id: `error-${Date.now()}`,
				role: "assistant",
				content:
					"I'm sorry, I encountered an error. Please try again in a moment.",
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, errorMessage]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	return (
		<>
			{/* Chat Widget Button */}
			<div className="fixed right-6 bottom-6 z-50">
				{!isOpen && (
					<Button
						className={cn(
							"group relative size-16 rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl",
							"fade-in slide-in-from-bottom-4 animate-in",
						)}
						onClick={() => setIsOpen(true)}
						size="lg"
					>
						<div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
						<MessageCircle className="size-6 stroke-current text-primary-foreground transition-transform group-hover:rotate-12" />
						<div className="-top-1 -right-1 absolute flex size-5 items-center justify-center rounded-full shadow-md">
							<span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />
							<span className="relative inline-flex size-5 items-center justify-center rounded-full bg-green-500">
								<Sparkles className="size-3 stroke-current text-white" />
							</span>
						</div>
					</Button>
				)}

				{/* Chat Window */}
				{isOpen && (
					<Card
						className={cn(
							"flex h-[600px] w-[400px] flex-col overflow-hidden border-2 border-primary/20 pt-0 shadow-2xl",
							"fade-in slide-in-from-bottom-8 zoom-in-95 animate-in duration-300",
						)}
					>
						{/* Header */}
						<div className="relative flex items-center justify-between border-b bg-gradient-to-br from-primary/10 to-primary/5 p-4">
							<div className="flex items-center gap-3">
								<div className="relative">
									<div className="rounded-full bg-primary p-2 shadow-md">
										<Leaf className="size-5 stroke-current text-primary-foreground" />
									</div>
								</div>
								<div>
									<h3 className="font-semibold text-foreground">
										EcoPilot Assistant
									</h3>
									<div className="flex items-center gap-1.5">
										<div className="relative flex size-2">
											<span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />
											<span className="relative inline-flex size-2 rounded-full bg-green-500" />
										</div>
										<p className="text-muted-foreground text-xs">
											Online & Ready
										</p>
									</div>
								</div>
							</div>
							<Button
								className="size-8 hover:bg-destructive/10 hover:text-destructive"
								onClick={() => setIsOpen(false)}
								size="icon"
								variant="ghost"
							>
								<X className="size-4 stroke-current" />
							</Button>
						</div>

						{/* Business Context Badge */}
						{businessContext && (
							<div className="border-b bg-muted/30 px-4 py-2">
								<div className="flex flex-wrap gap-2">
									{businessContext.industry && (
										<Badge className="text-xs" variant="secondary">
											{businessContext.industry}
										</Badge>
									)}
									{businessContext.employeeCount && (
										<Badge className="text-xs" variant="secondary">
											{businessContext.employeeCount} employees
										</Badge>
									)}
									{businessContext.totalEmissions && (
										<Badge className="text-xs" variant="secondary">
											{businessContext.totalEmissions.toLocaleString()} kg CO2e
										</Badge>
									)}
								</div>
							</div>
						)}

						{/* Messages */}
						<div className="relative flex-1 overflow-hidden">
							<ScrollArea className="h-full" ref={scrollAreaRef}>
								<div className="space-y-4 p-4">
								{messages.map((message, index) => (
									<div
										className={cn(
											"fade-in slide-in-from-bottom-2 flex animate-in gap-3",
											message.role === "user" ? "flex-row-reverse" : "flex-row",
										)}
										key={message.id}
										style={{
											animationDelay: `${index * 50}ms`,
											animationFillMode: "backwards",
										}}
									>
										{/* Avatar */}
										<Avatar
											className={cn(
												"size-8 shrink-0",
												message.role === "assistant"
													? "bg-primary/10"
													: "bg-muted",
											)}
										>
											{message.role === "assistant" ? (
												<div className="flex size-full items-center justify-center">
													<Leaf className="size-4 stroke-current text-primary" />
												</div>
											) : (
												<div className="flex size-full items-center justify-center bg-gradient-to-br from-chart-2 to-chart-3 font-semibold text-white text-xs">
													{userId?.charAt(0).toUpperCase() ?? "U"}
												</div>
											)}
										</Avatar>

										{/* Message Bubble */}
										<div
											className={cn(
												"group relative max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm transition-all hover:shadow-md",
												message.role === "assistant"
													? "border border-primary/10 bg-card"
													: "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground",
											)}
										>
											<div
												className={cn(
													"prose prose-sm max-w-none break-words text-sm leading-relaxed",
													message.role === "assistant"
														? "prose-slate text-foreground"
														: "prose-invert text-primary-foreground",
												)}
											>
												{message.role === "assistant" ? (
													<ReactMarkdown remarkPlugins={[remarkGfm]}>
														{message.content}
													</ReactMarkdown>
												) : (
													<p className="m-0">{message.content}</p>
												)}
											</div>
											<span
												className={cn(
													"mt-1 block text-[10px] opacity-0 transition-opacity group-hover:opacity-100",
													message.role === "assistant"
														? "text-muted-foreground"
														: "text-primary-foreground/70",
												)}
											>
												{message.timestamp.toLocaleTimeString([], {
													hour: "2-digit",
													minute: "2-digit",
												})}
											</span>
										</div>
									</div>
								))}

								{/* Loading Indicator */}
								{isLoading && (
									<div className="fade-in slide-in-from-bottom-2 flex animate-in gap-3">
										<Avatar className="size-8 shrink-0 bg-primary/10">
											<div className="flex size-full items-center justify-center">
												<Leaf className="size-4 stroke-current text-primary" />
											</div>
										</Avatar>
										<div className="flex items-center gap-2 rounded-2xl border border-primary/10 bg-card px-4 py-3 shadow-sm">
											<Spinner className="size-4 text-primary" />
											<span className="text-muted-foreground text-sm">
												Thinking...
											</span>
										</div>
									</div>
								)}

								{/* Suggested Questions */}
								{showSuggestions && messages.length === 1 && businessContext && (
									<div className="fade-in animate-in space-y-2">
										<p className="text-muted-foreground text-xs">
											Try asking:
										</p>
										<div className="flex flex-col gap-2">
											<Button
												className="h-auto justify-start whitespace-normal border-primary/20 text-left text-sm hover:border-primary hover:bg-primary/5"
												onClick={() =>
													handleSendMessage(
														"What's my biggest source of emissions?",
													)
												}
												size="sm"
												variant="outline"
											>
												What's my biggest source of emissions?
											</Button>
											<Button
												className="h-auto justify-start whitespace-normal border-primary/20 text-left text-sm hover:border-primary hover:bg-primary/5"
												onClick={() =>
													handleSendMessage(
														"How can I reduce my carbon footprint?",
													)
												}
												size="sm"
												variant="outline"
											>
												How can I reduce my carbon footprint?
											</Button>
											<Button
												className="h-auto justify-start whitespace-normal border-primary/20 text-left text-sm hover:border-primary hover:bg-primary/5"
												onClick={() =>
													handleSendMessage(
														"Explain my emissions breakdown in detail",
													)
												}
												size="sm"
												variant="outline"
											>
												Explain my emissions breakdown in detail
											</Button>
										</div>
									</div>
								)}
								<div ref={messagesEndRef} />
								</div>
							</ScrollArea>
						</div>

						{/* Input Area */}
						<div className="border-t bg-muted/20 p-4">
							<div className="flex gap-2">
								<Input
									className="flex-1 border-primary/20 bg-background transition-all focus-visible:border-primary focus-visible:ring-primary/20"
									disabled={isLoading}
									onChange={(e) => setInput(e.target.value)}
									onKeyDown={handleKeyPress}
									placeholder="Ask about sustainability..."
									ref={inputRef}
									value={input}
								/>
								<Button
									className="shrink-0 bg-primary transition-all hover:scale-105 hover:shadow-md disabled:opacity-50"
									disabled={!input.trim() || isLoading}
									onClick={() => handleSendMessage()}
									size="icon"
								>
									<Send className="size-4 stroke-current text-primary-foreground" />
								</Button>
							</div>
							<p className="mt-2 text-center text-muted-foreground text-xs">
								Powered by Azure OpenAI • EcoPilot
							</p>
						</div>
					</Card>
				)}
			</div>
		</>
	);
}
