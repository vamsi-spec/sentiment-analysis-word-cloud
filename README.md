# E-Consultation Sentiment Analysis Dashboard

A comprehensive React + Next.js dashboard for analyzing public comments and feedback from government e-consultation processes. Features real-time sentiment analysis, word cloud visualization, detailed analytics, and comprehensive reporting.

## Features

- **Comment Input System**: Upload CSV files or manually input comments
- **Sentiment Analysis**: AI-powered sentiment classification (positive, negative, neutral)
- **Word Cloud Visualization**: Interactive keyword frequency visualization
- **Analytics Dashboard**: Charts and graphs showing sentiment trends and distributions
- **Executive Summary**: Auto-generated insights and recommendations
- **Export Capabilities**: Download reports in CSV, JSON, and Markdown formats
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Quick Start

### Prerequisites

- Node.js 18+ installed
- VS Code (recommended)

### Installation

1. **Clone or download** this project to your local machine

2. **Open in VS Code**:
   \`\`\`bash
   code sentiment-analysis-dashboard
   \`\`\`

3. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

4. **Start the development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open your browser** and navigate to `http://localhost:3000`

That's it! The dashboard is now running locally.

## How to Use

### 1. Upload Comments
- Go to the "Upload Data" tab
- Either drag & drop a CSV file or manually add comments
- Supported formats: CSV files with comments in the first column, or plain text files

### 2. Run Analysis
- Switch to the "Analysis" tab
- Click "Start Analysis" to process your comments
- View detailed sentiment scores and individual comment analysis

### 3. View Results
- **Overview Tab**: High-level statistics and visualizations
- **Analysis Tab**: Detailed results with word cloud and charts
- **Reports Tab**: Executive summary and comprehensive insights

### 4. Export Reports
- Go to the "Reports" tab
- Choose from CSV (data), JSON (structured), or Markdown (formatted report)
- Click export to download your analysis

## Sample Data Format

### CSV Format
\`\`\`csv
Comment,Source
"I support this policy initiative",Public Survey
"This will negatively impact small businesses",Town Hall
"More information needed before deciding",Online Form
\`\`\`

### Manual Input
Simply type or paste individual comments in the text area on the Upload Data tab.

## Technology Stack

- **Frontend**: React 19, Next.js 14, TypeScript
- **UI Components**: Radix UI, Tailwind CSS
- **Charts**: Recharts
- **Sentiment Analysis**: Custom JavaScript implementation
- **Export**: Browser-based file generation

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main dashboard page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── comment-input.tsx  # File upload and manual input
│   ├── sentiment-analyzer.tsx # Analysis engine
│   ├── word-cloud.tsx     # Word cloud visualization
│   ├── analytics-charts.tsx # Charts and graphs
│   ├── summary-report.tsx # Executive summary
│   ├── export-controls.tsx # Export functionality
│   └── ui/               # Reusable UI components
├── lib/                  # Utility functions
│   ├── sentiment-analysis.ts # Core analysis logic
│   ├── summary-generator.ts  # Report generation
│   └── export-utils.ts      # Export functionality
└── README.md             # This file
\`\`\`

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Customization

The sentiment analysis uses a keyword-based approach with predefined positive/negative word lists. To customize:

1. Edit `lib/sentiment-analysis.ts`
2. Modify the `positiveWords` and `negativeWords` arrays
3. Adjust scoring algorithms as needed

### Adding New Export Formats

To add new export formats:

1. Create new export function in `lib/export-utils.ts`
2. Add new button/option in `components/export-controls.tsx`
3. Update the export handler logic

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy automatically

### Other Platforms
The app is a standard Next.js application and can be deployed to any platform supporting Node.js.

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Limitations

- Sentiment analysis is keyword-based (not ML-powered)
- File uploads limited to 10MB
- Processing is client-side only
- No data persistence (refresh clears data)

## Future Enhancements

- Integration with cloud-based ML sentiment analysis APIs
- Database storage for persistent data
- User authentication and multi-tenancy
- Advanced filtering and search capabilities
- Real-time collaboration features

## Support

For issues or questions:
1. Check the browser console for error messages
2. Ensure your CSV files are properly formatted
3. Try with a smaller dataset if experiencing performance issues

## License

This project is open source and available under the MIT License.
