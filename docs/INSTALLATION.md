# Installation Guide

This guide will help you install and set up Studio Inventory on your system.

## Prerequisites

Before installing Studio Inventory, make sure you have the following installed:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **PostgreSQL 15+** - [Download here](https://www.postgresql.org/download/)
- **Git** - [Download here](https://git-scm.com/)
- **Docker** (optional) - [Download here](https://www.docker.com/)

## Installation Methods

### Method 1: Docker (Recommended)

The easiest way to get started is using Docker Compose.

#### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/studio-inventory.git
cd studio-inventory
```

#### Step 2: Start the Application
```bash
docker-compose up -d
```

#### Step 3: Access the Application
Open your browser and navigate to `http://localhost:5173`

The application will automatically:
- Start PostgreSQL database
- Run database migrations
- Start the web application

### Method 2: Local Development

#### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/studio-inventory.git
cd studio-inventory
```

#### Step 2: Install Dependencies
```bash
npm install
```

#### Step 3: Set Up Environment Variables
```bash
cp env.example .env
```

Edit the `.env` file with your database credentials:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/studio_inventory"
SESSION_SECRET="your-super-secret-session-key"
```

#### Step 4: Set Up the Database

**Option A: Using Docker for Database Only**
```bash
docker run --name studio-inventory-db \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=studio_inventory \
  -p 5432:5432 \
  -d postgres:15
```

**Option B: Using Local PostgreSQL**
1. Create a new database:
```sql
CREATE DATABASE studio_inventory;
CREATE USER admin WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE studio_inventory TO admin;
```

#### Step 5: Run Database Migrations
```bash
npx prisma migrate dev
```

#### Step 6: Seed the Database (Optional)
```bash
npx prisma db seed
```

#### Step 7: Start the Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `SESSION_SECRET` | Secret key for sessions | Required |
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Application port | `5173` |

### Database Configuration

The application uses PostgreSQL with the following default settings:
- **Host**: localhost
- **Port**: 5432
- **Database**: studio_inventory
- **User**: admin
- **Password**: (set in environment)

### Production Deployment

For production deployment, consider:

1. **Use a production database** (AWS RDS, Google Cloud SQL, etc.)
2. **Set strong session secrets**
3. **Enable HTTPS**
4. **Set up proper backups**
5. **Configure logging**

Example production `.env`:
```env
DATABASE_URL="postgresql://user:password@production-db:5432/studio_inventory"
SESSION_SECRET="very-long-random-secret-key"
NODE_ENV="production"
PORT=3000
```

## Troubleshooting

### Common Issues

#### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Make sure PostgreSQL is running and the connection string is correct.

#### Migration Errors
```
Error: P1001: Can't reach database server
```
**Solution**: Check database credentials and network connectivity.

#### Port Already in Use
```
Error: listen EADDRINUSE :::5173
```
**Solution**: Change the port in your `.env` file or stop other services using the port.

#### Permission Denied
```
Error: EACCES: permission denied
```
**Solution**: Check file permissions and ensure you have write access to the project directory.

### Getting Help

If you encounter issues:

1. Check the [GitHub Issues](https://github.com/yourusername/studio-inventory/issues)
2. Search existing discussions
3. Create a new issue with detailed information
4. Include your operating system and error messages

## Next Steps

After successful installation:

1. **Create your first admin user** using the admin creation script
2. **Set up categories** for your assets
3. **Import existing data** using the CSV import feature
4. **Configure settings** in the admin panel
5. **Invite team members** and set up user accounts

See the [User Guide](USER_GUIDE.md) for detailed instructions on using the application. 