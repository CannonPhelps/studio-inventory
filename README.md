# Studio Inventory

A comprehensive inventory management system for studios and production companies. Built with SvelteKit, TypeScript, and PostgreSQL.

## 🚀 Features

- **Asset Management**: Track equipment, cables, and accessories
- **Checkout System**: Manage equipment checkouts and returns
- **User Management**: Role-based access control (Admin/User)
- **Cable Management**: Specialized cable tracking with connectors
- **Reporting**: Dashboard with analytics and insights
- **Import/Export**: CSV import and data export capabilities
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend**: SvelteKit, TypeScript, Tailwind CSS
- **Backend**: SvelteKit API routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Session-based with cookies
- **Deployment**: Docker support

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 15+
- Docker (optional)

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/studio-inventory.git
cd studio-inventory

# Start with Docker Compose
docker-compose up -d

# The application will be available at http://localhost:5173
```

### Option 2: Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/studio-inventory.git
cd studio-inventory

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npx prisma migrate dev

# Start the development server
npm run dev
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://admin:password@localhost:5432/studio_inventory"
SESSION_SECRET="your-session-secret-here"
```

### Database Setup

The application uses PostgreSQL. You can either:

1. **Use Docker Compose** (includes PostgreSQL)
2. **Use your own PostgreSQL instance**

## 📚 Documentation

- [Installation Guide](docs/INSTALLATION.md)
- [User Guide](docs/USER_GUIDE.md)
- [API Documentation](docs/API.md)
- [Contributing Guidelines](CONTRIBUTING.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/yourusername/studio-inventory.git
cd studio-inventory

# Install dependencies
npm install

# Set up the database
npx prisma migrate dev
npx prisma db seed

# Start development server
npm run dev
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [SvelteKit](https://kit.svelte.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Database ORM by [Prisma](https://www.prisma.io/)

## 📞 Support

- 📧 Email: cannon [at] quadbit.dev
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/studio-inventory/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/studio-inventory/discussions)
