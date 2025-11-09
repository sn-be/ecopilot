import { NextResponse } from 'next/server';
// Import our new, fast JSON database
// Make sure 'ceda_data.json' is in your /lib directory
import cedaData from '@/lib/ceda_data.json';

/**
 * Define the structure of our data.
 * This helps TypeScript ensure we are accessing the data correctly.
 */
interface CedaRow {
  country: string;
  category: string;
  factor: number;
}

// We cast our imported JSON to this type so TypeScript understands it
const data: CedaRow[] = cedaData as CedaRow[];

/**
 * This is the API endpoint handler for POST requests.
 * It calculates emissions based on spend, country, and category.
 */
export async function POST(request: Request) {
  try {
    // 1. Parse the incoming request body from the client
    const body = await request.json();
    const { category, country, spend_amount } = body;

    // 2. Validate the inputs
    if (
      !category ||
      !country ||
      spend_amount === undefined ||
      spend_amount === null
    ) {
      return NextResponse.json(
        { error: 'Missing required fields: category, country, spend_amount' },
        { status: 400 }
      );
    }

    const spend = Number(spend_amount);
    if (isNaN(spend) || spend < 0) {
      return NextResponse.json(
        { error: 'Invalid spend_amount: must be a positive number' },
        { status: 400 }
      );
    }

    // 3. Find the matching emission factor in our JSON data
    // This is very fast because the JSON is already in memory.
    const row = data.find(
      (d) =>
        d.category.toLowerCase() === category.toLowerCase() &&
        d.country.toLowerCase() === country.toLowerCase()
    );

    // 4. Handle cases where no match is found
    if (!row) {
      return NextResponse.json(
        { error: 'No emission factor found for the specified country and category' },
        { status: 404 }
      );
    }

    // 5. Perform the calculation
    //    Emissions = Spend Amount ($) * Emission Factor (kg CO2e / $)
    const emissionFactor = row.factor;
    const total_emissions_kg_co2e = emissionFactor * spend;

    // 6. Return the successful result
    return NextResponse.json({
      country: row.country,
      category: row.category,
      spend_amount_usd: spend,
      emission_factor_kg_co2e_per_usd: emissionFactor,
      total_emissions_kg_co2e: total_emissions_kg_co2e,
    });
      
  } catch (error) {
    console.error('Error in /api/emissions:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}

/**
 * Added a GET handler just for testing.
 * You can visit /api/emissions in your browser to see this message.
 */
export async function GET() {
  return NextResponse.json({
    message: 'This is the CEDA emissions API. Please use a POST request to calculate emissions.',
    example_body: {
      country: 'United States',
      category: 'Air transportation',
      spend_amount: 1000
    }
  });
}