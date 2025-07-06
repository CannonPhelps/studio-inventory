# Contributing to Studio Inventory

Thank you for your interest in contributing to Studio Inventory! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Bugs
- Use the [GitHub Issues](https://github.com/yourusername/studio-inventory/issues) page
- Include detailed steps to reproduce the bug
- Provide your operating system and browser information
- Include any error messages or screenshots

### Suggesting Features
- Use the [GitHub Issues](https://github.com/yourusername/studio-inventory/issues) page
- Describe the feature and its use case
- Consider if it fits the project's scope

### Code Contributions
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Git

### Local Development
```bash
# Fork and clone the repository
git clone https://github.com/yourusername/studio-inventory.git
cd studio-inventory

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npx prisma migrate dev

# Seed the database (optional)
npx prisma db seed

# Start development server
npm run dev
```

## 📝 Code Style Guidelines

### TypeScript
- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type when possible
- Use meaningful variable and function names

### Svelte/SvelteKit
- Follow SvelteKit conventions
- Use reactive statements appropriately
- Keep components focused and reusable
- Use proper event handling

### CSS/Styling
- Use Tailwind CSS classes
- Follow responsive design principles
- Maintain consistent spacing and colors
- Use semantic HTML elements

### Database
- Use Prisma for database operations
- Write efficient queries
- Include proper error handling
- Add database migrations for schema changes

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- --grep "test name"
```

### Writing Tests
- Write tests for new features
- Include both unit and integration tests
- Test error cases and edge cases
- Maintain good test coverage

## 📦 Building and Deployment

### Production Build
```bash
npm run build
npm run preview
```

### Docker Build
```bash
docker build -t studio-inventory .
docker run -p 3000:3000 studio-inventory
```

## 🔍 Code Review Process

1. **Pull Request Requirements**
   - Clear description of changes
   - Tests included (if applicable)
   - Documentation updated
   - No breaking changes (or clearly documented)

2. **Review Checklist**
   - Code follows style guidelines
   - Tests pass
   - No security vulnerabilities
   - Performance considerations addressed

3. **Review Process**
   - At least one maintainer must approve
   - All CI checks must pass
   - Code review comments must be addressed

## 🐛 Bug Fixes

### Before Submitting
- Verify the bug exists in the latest version
- Check if it's already reported
- Try to reproduce the issue
- Include relevant logs and error messages

### Fix Guidelines
- Fix the root cause, not just symptoms
- Add tests to prevent regression
- Update documentation if needed
- Consider backward compatibility

## ✨ Feature Development

### Before Starting
- Discuss the feature in an issue first
- Ensure it aligns with project goals
- Consider implementation complexity
- Plan for testing and documentation

### Implementation
- Follow existing code patterns
- Add comprehensive tests
- Update documentation
- Consider performance impact
- Include user interface updates if needed

## 📚 Documentation

### Code Documentation
- Add JSDoc comments for functions
- Document complex algorithms
- Include usage examples
- Keep README files updated

### User Documentation
- Update user guides for new features
- Include screenshots when helpful
- Provide step-by-step instructions
- Keep installation guides current

## 🚀 Release Process

### Versioning
- Follow [Semantic Versioning](https://semver.org/)
- Major version for breaking changes
- Minor version for new features
- Patch version for bug fixes

### Release Checklist
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version numbers updated
- [ ] Release notes prepared

## 🆘 Getting Help

### Questions and Support
- Use [GitHub Discussions](https://github.com/yourusername/studio-inventory/discussions)
- Check existing issues and documentation
- Be specific about your problem
- Include relevant code and error messages

### Community Guidelines
- Be respectful and inclusive
- Help others when possible
- Follow the project's code of conduct
- Provide constructive feedback

## 📄 License

By contributing to Studio Inventory, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in:
- Project README
- Release notes
- GitHub contributors page
- Project documentation

Thank you for contributing to Studio Inventory! 🎉 