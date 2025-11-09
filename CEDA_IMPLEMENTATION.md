# CEDA Spending Tracker Implementation

## Overview
Successfully implemented a CEDA (Carbon Emissions Database for Enterprises) spending tracker tab that allows users to input their spending habits and calculate CO2e emissions based on the Open CEDA database.

## Features Implemented

### 1. Database Schema
- Created `cedaSpendingEntries` table to store spending entries
- Fields include: category, spendAmount, emissionFactor, totalEmissions, country, description
- Indexed by userId and createdAt for efficient queries

### 2. tRPC API Router (`src/server/api/routers/ceda.ts`)
- **addEntry**: Add a new spending entry, automatically fetches user's country from onboarding data
- **getEntries**: Retrieve all spending entries for a user
- **getTotalEmissions**: Calculate total emissions and spend across all entries
- **deleteEntry**: Remove a spending entry

### 3. CEDA Categories Helper (`src/lib/ceda-categories.ts`)
- Extracted 400+ unique industry categories from the CEDA dataset
- Exported as TypeScript constant for type safety

### 4. CEDA Page Component (`src/components/ceda-page.tsx`)
- **Sidebar Navigation**: Full sidebar with navigation to all dashboard sections
- **Summary Card**: Displays total supply chain emissions, total spend, and entry count
- **Add Entry Form**:
  - Combobox with 400+ searchable categories
  - USD spend amount input
  - Optional description field
  - Real-time calculation preview before saving
  - Cool loading animations during calculation
- **Spending History**: 
  - List of all entries with emissions breakdown
  - Delete functionality with hover effects
  - Detailed emission factor display
  - Empty state with helpful message

### 5. Dashboard Route (`src/app/dashboard/ceda/page.tsx`)
- Protected route with Clerk authentication
- Renders the CEDA page component

### 6. Navigation Updates
Updated sidebar navigation in all dashboard pages:
- `dashboard-with-sidebar.tsx` (Overview)
- `carbon-footprint-page.tsx` (Carbon Footprint)
- `action-plan-page.tsx` (Action Plan)
- `settings-page.tsx` (Settings)
- Added Database icon for CEDA tab

## User Flow

1. User navigates to the CEDA tab from the dashboard sidebar
2. User selects a spending category from the searchable combobox (e.g., "Marketing Consultants")
3. User enters the spend amount in USD (e.g., $500)
4. User optionally adds a description
5. User clicks "Calculate Emissions" to preview the result
6. System shows:
   - Emission factor (kg CO2e per $1)
   - Total emissions (kg CO2e)
7. User clicks "Add to Supply Chain Footprint" to save the entry
8. Entry appears in the Spending History with full details
9. Total emissions are updated in the summary card

## Technical Details

### API Integration
- Uses existing `/api/ceda` route for emission calculations
- Automatically fetches user's country from onboarding data
- Validates all inputs before API calls

### Data Flow
1. User input → Frontend validation
2. Preview calculation → Direct API call to `/api/ceda`
3. Save entry → tRPC mutation → Database storage
4. Display → tRPC query → Real-time updates

### UI/UX Features
- Loading states with spinners
- Hover effects on entries
- Delete confirmation via mutation
- Empty states with helpful messaging
- Responsive design with Tailwind CSS
- Gradient backgrounds and shadows for visual hierarchy
- Badge components for key metrics

## Database Migration
- Migration file: `drizzle/0004_cheerful_purple_man.sql`
- Successfully applied to database

## Files Created/Modified

### Created:
- `src/server/api/routers/ceda.ts`
- `src/components/ceda-page.tsx`
- `src/app/dashboard/ceda/page.tsx`
- `src/lib/ceda-categories.ts`
- `drizzle/0004_cheerful_purple_man.sql`

### Modified:
- `src/server/db/schema.ts` (added cedaSpendingEntries table)
- `src/server/api/root.ts` (added ceda router)
- `src/components/dashboard-with-sidebar.tsx` (added CEDA nav link)
- `src/components/carbon-footprint-page.tsx` (added CEDA nav link)
- `src/components/action-plan-page.tsx` (added CEDA nav link)
- `src/components/settings-page.tsx` (added CEDA nav link)

## Next Steps (Optional Enhancements)

1. **Integration with Main Footprint**: Add CEDA emissions as a "Supply Chain" category in the main carbon footprint breakdown
2. **Bulk Import**: Allow CSV upload for multiple spending entries
3. **Analytics**: Add charts showing emissions by category over time
4. **Export**: Allow users to export their spending data
5. **Recommendations**: AI-generated suggestions for reducing supply chain emissions based on spending patterns

## Testing Checklist

- [x] Database migration successful
- [x] tRPC router registered
- [x] CEDA page renders with sidebar
- [x] Category combobox displays all 400+ categories
- [x] Calculation preview works
- [x] Entry saving works
- [x] Entry deletion works
- [x] Total emissions calculation accurate
- [x] Navigation links work on all pages
- [x] No linting errors
- [x] Responsive design
- [x] Loading states display correctly

