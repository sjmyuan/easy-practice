# Math Practice App

A mobile-first web application that helps parents facilitate math practice for their children (ages 3-9) by generating random addition and subtraction problems within 20. The app prioritizes previously failed problems and provides simple performance tracking.

## Features

- 🎯 **Smart Problem Selection**: Automatically prioritizes previously failed problems
- 📊 **Performance Tracking**: Track which problems your child struggles with
- 📱 **Mobile-First Design**: Optimized for mobile devices
- 💾 **Offline Support**: All data stored locally using IndexedDB
- 🎨 **Clean Interface**: Simple, distraction-free design
- 🚀 **Fast & Lightweight**: Static site generation for optimal performance

## Technology Stack

- **Framework**: Next.js 16+ with App Router
- **UI Library**: React 19+
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS 4+
- **Data Storage**: IndexedDB (via Dexie.js)
- **Testing**: Vitest + React Testing Library
- **Deployment**: Static export (AWS S3 + CloudFront ready)

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/easy-practice.git
   cd easy-practice
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking
- `npm test` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI
- `npm run test:ci` - Run tests with coverage (CI)

## Project Structure

```
easy-practice/
├── app/                    # Next.js App Router
├── components/             # React components
├── contexts/              # React Context (state management)
├── services/              # Business logic services
├── lib/                   # Utilities and database schema
├── types/                 # TypeScript type definitions
├── hooks/                 # Custom React hooks
├── utils/                 # Utility functions
├── tests/                 # Test files
├── public/                # Static assets
│   └── problem-sets/      # Problem set JSON files
└── docs/                  # Documentation
```

## Architecture

The application follows a **local-first architecture** with all data stored in the browser using IndexedDB:

- **Problem Sets**: Pre-generated addition and subtraction problems (231 + 231 = 462 total)
- **Statistics**: Tracks attempts, pass/fail counts, and calculates priority scores
- **Priority Algorithm**: Failed problems get higher priority for repetition
- **No Backend**: Completely client-side application

See [docs/architecture.md](docs/architecture.md) for detailed architecture documentation.

## Testing

```bash
# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:ci
```

## Building for Production

```bash
# Build static export
npm run build

# The output will be in the 'out' directory
# Deploy the 'out' directory to any static hosting service
```

## Deployment

The application is configured for static export and can be deployed to:

- AWS S3 + CloudFront
- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

See [docs/architecture.md](docs/architecture.md) for AWS deployment instructions.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Icons from [Lucide React](https://lucide.dev/)
- Database powered by [Dexie.js](https://dexie.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

## Support

For questions or issues, please open an issue on GitHub.

---

**Made with ❤️ for parents and children learning math together**
