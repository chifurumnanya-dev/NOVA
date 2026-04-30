# Contributing to NOVA

We welcome contributions to NOVA! This document outlines the process for contributing to the platform.

## Code of Conduct
By participating in this project, you agree to abide by our Code of Conduct.

## How to Contribute
1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## Development Setup
- Clone the repository
- Run `npm install` or `pnpm install`
- Start the development server with `npm run dev`

## Coding Standards
- We use TypeScript for all code. Please ensure strict mode is enabled.
- Keep route handlers thin and put business logic in service files.
- Ensure all API responses use our standard success/error formats.
