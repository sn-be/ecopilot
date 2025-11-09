# EcoPilot

EcoPilot is a sustainability platform that uses AI to help businesses figure out and shrink their carbon footprint. It's built with modern web tech and uses Azure OpenAI to give you personalized action plans and real-time advice to help you hit your sustainability targets.

## Features

### Carbon Footprint Calculation

  * Uses GPT-4o for AI-powered footprint analysis
  * Gives you a detailed breakdown by category, like energy, transport, waste, and so on
  * Uses industry-standard emission factors
  * Takes regional factors into account, like the local power grid mix and climate

### Interactive Dashboard

  * Track your emissions in real time
  * Check out visual breakdowns and charts
  * Monitor your progress over time
  * See how you stack up against industry benchmarks

### AI Chat Assistant

  * Provides sustainability guidance that's aware of your specific context
  * Gives you personalized recommendations
  * Can answer questions about your company's specific footprint
  * Gives actionable advice on strategies to reduce emissions

### Personalized Action Plans

  * Get recommendations prioritized by their impact and cost
  * Find 'quick wins' you can implement right away
  * Lays out comprehensive long-term strategies
  * Includes ROI calculations and payback periods

### CEDA Integration

  * Lets you access emission factors based on the dollar amount spent in a specific industry
  * Uses up-to-date carbon emission data
  * Provides accurate calculations thanks to its Open CEDA integration

### Business Onboarding

  * A guided setup flow to get you started
  * Asks questions specific to your industry
  * Collects data about your facilities and operations
  * Helps establish a customized baseline for your business

## Tech Stack

We built this project with the T3 Stack. Here's what's included:

  * **[Next.js 15](https://nextjs.org)** - A React framework using the App Router
  * **[TypeScript](https://www.typescriptlang.org/)** - For type safety
  * **[tRPC](https://trpc.io)** - For end-to-end typesafe APIs
  * **[Drizzle ORM](https://orm.drizzle.team)** - A TypeScript ORM
  * **[Tailwind CSS](https://tailwindcss.com)** - Our utility-first CSS framework
  * **[Clerk](https://clerk.com)** - Handles authentication and user management
  * **[Azure OpenAI](https://azure.microsoft.com/en-us/products/ai-services/openai-service)** - Powers all the AI calculations and chat features
  * **[Vercel AI SDK](https://sdk.vercel.ai)** - The framework we use for AI integration
  * **[shadcn/ui](https://ui.shadcn.com/)** - For beautiful UI components
  * **[Recharts](https://recharts.org/)** - Used for data visualization
  * **[Zod](https://zod.dev/)** - Handles schema validation

## Getting Started

### Prerequisites

You'll need a few things before you start:

  * Node.js (version 18 or newer) and pnpm
  * An Azure OpenAI account with a GPT-4o deployment
  * A Clerk account to handle authentication

### Installation

1.  First, clone the repository:

<!-- end list -->

```bash
git clone https://github.com/yourusername/ecopilot.git
cd ecopilot
```

2.  Then, install the dependencies:

<!-- end list -->

```bash
pnpm install
```

3.  You'll need to set up your environment variables. Just copy the example file:

<!-- end list -->

```bash
cp .env.example .env
```

Now, edit the `.env` file and add your credentials:

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

4.  Set up the database:

<!-- end list -->

```bash
pnpm db:push
```

5.  Finally, run the development server:

<!-- end list -->

```bash
pnpm dev
```

You can see the app running at http://localhost:3000.

## Project Structure

```
src/
├── app/                  # These are the Next.js App Router pages
│   ├── dashboard/        # Dashboard-specific pages
│   └── api/              # Our API routes
├── components/           # All the React components
│   ├── ui/               # Components from shadcn/ui
│   └── *.tsx             # Our custom feature components
├── server/               # This is where the backend logic lives
│   ├── api/              # Our tRPC routers
│   └── db/               # The database schema
├── lib/                  # Utility functions and config files
│   ├── ai-schemas.ts     # Zod schemas for validating AI inputs/outputs
│   └── azure-openai.ts   # Config for the Azure OpenAI provider
└── styles/               # Global styles
```

## Documentation

  * **[Footprint Calculation Guide](https://www.google.com/search?q=docs/FOOTPRINT_CALCULATION.md)**: Check this for detailed API usage and implementation.
  * **[Implementation Summary](https://www.google.com/search?q=docs/IMPLEMENTATION_SUMMARY.md)**: This gives a technical overview.
  * **[Integration Example](https://www.google.com/search?q=docs/INTEGRATION_EXAMPLE.md)**: Look here for code examples.

## Key Commands

```bash
# For development
pnpm dev              # Starts the dev server (uses Turbo)
pnpm build            # Creates a production build
pnpm start            # Runs the production server

# Database stuff
pnpm db:push          # Pushes schema changes to the DB
pnpm db:studio        # Opens the Drizzle Studio UI
pnpm db:generate      # Generates new migration files

# Code quality checks
pnpm check            # Runs the Biome linter
pnpm check:write      # Tries to automatically fix linting issues
pnpm typecheck        # Runs the TypeScript type checker
```

## Features in Detail

### Carbon Footprint Calculation

EcoPilot uses AI to look at your business data and calculate emissions. It breaks them down into several categories:

  * **Energy**: This includes electricity and heating from sources like natural gas, oil, and so on.
  * **Transportation**: Covers employee commutes and any business travel.
  * **Waste**: Tracks what goes to landfill, recycling, and composting.
  * **Supply Chain**: Looks at procurement and logistics.
  * **Team**: Covers other employee-related emissions.

To get accurate results, the AI uses industry-standard emission factors and also considers regional differences.

### AI Chat Assistant

The chat widget that's built-in can give you:

  * Answers that are based on your specific footprint data
  * Recommendations tailored for your industry
  * Answers to general sustainability questions
  * Helpful guidance on how to implement the action items

### Action Plans

Your personalized plan will include:

  * **Executive Summary**: A quick overview of your current footprint
  * **Prioritized Next Step**: The single highest-impact action you should take
  * **Quick Wins**: A list of 3 to 5 actions that are low-cost but have a high impact
  * **Full Action Plan**: A full list of 8 to 15 comprehensive recommendations

For each recommendation, you'll see:

  * Impact level (High, Medium, or Low)
  * A cost estimate (shown as $, $$, or $$$)
  * The payback period
  * Steps on how to implement it

## Contributing

We'd love to have your help. Contributions are welcome\! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
