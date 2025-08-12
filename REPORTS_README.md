# Asset Reports Feature

## Overview
The Asset Reports feature allows administrators to generate comprehensive PDF reports of inventory assets with various filtering options and report types.

## Features

### Report Types
1. **Summary Report** - Overview with asset counts, category breakdowns, and key metrics
2. **Detailed Report** - Comprehensive asset listing with full details
3. **Financial Report** - Cost analysis including purchase prices and maintenance expenses
4. **Maintenance Report** - Maintenance history and upcoming scheduled maintenance
5. **Location Report** - Asset distribution by location and room

### Filtering Options
- **Category Filter** - Filter assets by specific categories
- **Cable Type Filter** - Filter assets by cable types
- **Date Range** - Filter by time periods (This Month, This Year, Custom Range)

### PDF Generation
- All reports are automatically generated as downloadable PDF files
- Professional formatting with proper headers and data organization
- Automatic page breaks for long reports

## How to Use

### Accessing Reports
1. Navigate to the Admin Panel
2. Click on "Reports" in the sidebar navigation
3. Configure your report settings
4. Click "Generate PDF Report"

### Report Configuration
1. **Select Report Type** - Choose from the 5 available report types
2. **Apply Filters** - Use category, cable type, and date filters as needed
3. **Set Date Range** - Choose from predefined ranges or set custom dates
4. **Generate Report** - Click the button to create and download the PDF

### Report Content

#### Summary Report
- Total asset count
- Category breakdown with quantities
- Status breakdown
- Total asset value

#### Detailed Report
- Individual asset listings
- Serial numbers
- Locations and rooms
- Purchase dates and prices
- Current status

#### Financial Report
- Total purchase value
- Average asset value
- Value breakdown by category
- Cost analysis

#### Maintenance Report
- Total maintenance records
- Maintenance type breakdown
- Assets needing maintenance
- Maintenance history

#### Location Report
- Asset distribution by location
- Room assignments
- Location-based analytics

## Technical Details

### API Endpoint
- **Route**: `/api/admin/reports/generate`
- **Method**: GET
- **Authentication**: Admin users only
- **Parameters**: type, category, cableType, dateRange, startDate, endDate

### Dependencies
- **jsPDF** - Client-side PDF generation
- **Prisma** - Database queries and data processing

### Security
- Admin-only access
- User authentication required
- Role-based authorization

## File Structure
```
src/routes/admin/reports/
├── +page.svelte          # Reports page UI
├── +page.server.ts       # Server-side authentication
└── api/admin/reports/generate/
    └── +server.ts        # Report generation API
```

## Browser Compatibility
- Modern browsers with ES6+ support
- PDF generation works in all major browsers
- No server-side PDF generation required

## Future Enhancements
- Export to Excel/CSV formats
- Scheduled report generation
- Email report delivery
- Custom report templates
- Advanced charting and visualizations
- Report scheduling and automation
