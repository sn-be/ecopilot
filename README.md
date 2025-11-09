# EcoPilot 🌱

EcoPilot is an AI-powered sustainability platform that helps businesses measure, understand, and reduce their carbon footprint. Built with modern web technologies and powered by Azure OpenAI, EcoPilot provides personalized action plans and real-time guidance for achieving sustainability goals.

## Features

### 🎯 Carbon Footprint Calculation
- AI-powered footprint analysis using GPT-4o
- Detailed breakdown by category (Energy, Transport, Waste, etc.)
- Industry-standard emission factors
- Regional considerations (grid mix, climate)

### 📊 Interactive Dashboard
- Real-time emissions tracking
- Visual breakdowns and charts
- Progress monitoring over time
- Industry benchmarks comparison

### 🤖 AI Chat Assistant
- Context-aware sustainability guidance
- Personalized recommendations
- Answers questions about your specific footprint
- Actionable advice for reduction strategies

### 📋 Personalized Action Plans
- Prioritized recommendations based on impact and cost
- Quick wins for immediate implementation
- Comprehensive long-term strategies
- ROI calculations and payback periods

### 🌍 CEDA Integration
- Access to emission factors based on dollar amount spent in an industry
- Up-to-date carbon emission data
- Accurate calculations based on Open CEDA integration.

### ⚙️ Business Onboarding
- Guided setup flow
- Industry-specific questions
- Facility and operations data collection
- Customized baseline establishment

## Tech Stack

This project is built with the [T3 Stack](https://create.t3.gg/) and includes:

- **[Next.js 15](https://nextjs.org)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[tRPC](https://trpc.io)** - End-to-end typesafe APIs
- **[Drizzle ORM](https://orm.drizzle.team)** - TypeScript ORM
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first CSS
- **[Clerk](https://clerk.com)** - Authentication and user management
- **[Azure OpenAI](https://azure.microsoft.com/en-us/products/ai-services/openai-service)** - AI-powered calculations and chat
- **[Vercel AI SDK](https://sdk.vercel.ai)** - AI integration framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful UI components
- **[Recharts](https://recharts.org/)** - Data visualization
- **[Zod](https://zod.dev/)** - Schema validation

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Azure OpenAI account with GPT-4o deployment
- Clerk account for authentication

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ecopilot.git
cd ecopilot
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
```env
# Azure OpenAI
AZURE_OPENAI_API_KEY="your-api-key"
AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com"
AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4o"
AZURE_OPENAI_API_VERSION="2024-08-01-preview"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-publishable-key"
CLERK_SECRET_KEY="your-secret-key"

# Database
DATABASE_URL="file:./db.sqlite"
```

4. Set up the database:
```bash
pnpm db:push
```

5. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard pages
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── *.tsx             # Feature components
├── server/               # Backend logic
│   ├── api/             # tRPC routers
│   └── db/              # Database schema
├── lib/                 # Utilities and configurations
│   ├── ai-schemas.ts    # Zod schemas for AI
│   └── azure-openai.ts  # AI provider config
└── styles/              # Global styles
```

## Documentation

- **[Footprint Calculation Guide](docs/FOOTPRINT_CALCULATION.md)** - Detailed API usage and implementation
- **[Implementation Summary](docs/IMPLEMENTATION_SUMMARY.md)** - Technical overview
- **[Integration Example](docs/INTEGRATION_EXAMPLE.md)** - Code examples

## Key Commands

```bash
# Development
pnpm dev              # Start dev server with Turbo
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm db:push          # Push schema changes
pnpm db:studio        # Open Drizzle Studio
pnpm db:generate      # Generate migrations

# Code Quality
pnpm check            # Run Biome linter
pnpm check:write      # Fix linting issues
pnpm typecheck        # Run TypeScript checks
```

## Features in Detail

### Carbon Footprint Calculation

EcoPilot uses AI to analyze business data and calculate emissions across multiple categories:

- **Energy**: Electricity and heating (natural gas, oil, etc.)
- **Transportation**: Employee commutes and business travel
- **Waste**: Landfill, recycling, and composting
- **Supply Chain**: Procurement and logistics
- **Team**: Employee-related emissions

The AI applies industry-standard emission factors and considers regional variations for accurate results.

### AI Chat Assistant

The integrated chat widget provides:
- Context-aware responses based on your footprint data
- Specific recommendations for your industry
- Answers to sustainability questions
- Implementation guidance for action items

### Action Plans

Personalized plans include:
- **Executive Summary**: Overview of current footprint
- **Prioritized Next Step**: Highest-impact action to take
- **Quick Wins**: 3-5 low-cost, high-impact actions
- **Full Action Plan**: 8-15 comprehensive recommendations

Each recommendation includes:
- Impact level (High/Medium/Low)
- Cost estimate ($, $$, $$$)
- Payback period
- Implementation steps


## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

