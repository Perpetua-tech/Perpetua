# Contributing to Perpetua

Thank you for your interest in contributing to Perpetua! We're excited to have you join our community. This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Issue Reporting](#issue-reporting)
- [Security Vulnerabilities](#security-vulnerabilities)
- [Contact](#contact)

## Code of Conduct

Our community is dedicated to providing a harassment-free experience for everyone. We do not tolerate harassment of participants in any form. Please treat everyone with respect and kindness.

## Getting Started

To get started with contributing:

1. **Fork the repository**
   - Click the "Fork" button at the top-right of the repository page

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR-USERNAME/Perpetua.git
   cd Perpetua
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/Perpetua-tech/Perpetua.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

1. **Keep your fork updated**
   ```bash
   git fetch upstream
   git merge upstream/main
   ```

2. **Make your changes**
   - Write your code
   - Add tests if applicable
   - Run linting and tests

3. **Commit your changes**
   - Follow the [commit message guidelines](#commit-message-guidelines)

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a pull request**
   - Go to the original repository and click "New Pull Request"
   - Choose your fork and branch

## Pull Request Process

1. Ensure all tests pass before submitting
2. Update documentation if needed
3. The PR should work in all supported environments
4. Your PR needs at least one approval from a maintainer
5. Once approved, a maintainer will merge your PR

## Coding Standards

We follow industry best practices and have specific coding standards for different parts of the codebase:

### JavaScript/TypeScript
- Use ESLint and Prettier
- Follow the Airbnb style guide
- Use meaningful variable and function names
- Write JSDoc comments for functions

### Rust
- Use `rustfmt` for formatting
- Follow the Rust API guidelines
- Properly document your code with rustdoc

### CSS/SCSS
- Follow BEM naming convention
- Keep selectors as simple as possible
- Avoid !important

## Commit Message Guidelines

We use conventional commits to make the commit history more readable:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types include:
- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code changes that neither fix bugs nor add features
- **test**: Adding or fixing tests
- **chore**: Changes to the build process or auxiliary tools

## Testing Guidelines

- Write tests for all new features
- Maintain or improve test coverage
- Unit tests should be fast and not depend on external services
- Integration tests should verify the integration of components
- End-to-end tests should verify the entire application flow

### Running Tests

```bash
# Run all tests
npm test

# Run specific tests
npm test -- -t "test name pattern"

# Run with coverage
npm run test:coverage
```

## Documentation

- Update documentation for any new features or changes
- Use clear, concise language
- Include code examples where appropriate
- Follow the existing documentation format

## Issue Reporting

When reporting issues:

1. Use the issue templates when available
2. Include detailed steps to reproduce
3. Describe expected vs. actual behavior
4. Include relevant logs or screenshots
5. Mention your environment (OS, browser, etc.)

## Security Vulnerabilities

If you discover a security vulnerability, please do NOT open an issue. Email security@perpetua.ltd with details. We'll work with you to verify and fix the vulnerability.

## Contact

If you have questions about contributing, please:
- Join our community discussions on [GitHub Discussions](https://github.com/Perpetua-tech/Perpetua/discussions)
- Email the development team at dev@perpetua.ltd

Thank you for contributing to Perpetua! 