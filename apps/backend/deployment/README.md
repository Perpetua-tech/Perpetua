# Perpetua Backend Deployment

This directory contains the deployment configuration for the Perpetua backend API.

## Prerequisites

- Docker and Docker Compose
- SSL certificate for your domain
- Environment variables configured

## Directory Structure

```
deployment/
├── docker-compose.yml    # Docker Compose configuration
├── .env                  # Environment variables (create from .env.example)
├── .env.example          # Example environment file
└── nginx/                # Nginx configuration
    ├── conf.d/           # Nginx server configurations
    │   └── default.conf  # Default server configuration
    ├── ssl/              # SSL certificates (not included in repo)
    │   ├── perpetua.crt  # SSL certificate
    │   └── perpetua.key  # SSL private key
    └── www/              # Static files
        ├── 404.html      # 404 error page
        └── 50x.html      # 50x error page
```

## Setup Instructions

1. Clone the repository
2. Navigate to the deployment directory
3. Create `.env` file from `.env.example` and fill in the required values
4. Place your SSL certificates in the `nginx/ssl/` directory
5. Start the services:

```bash
docker-compose up -d
```

## Environment Variables

See `.env.example` for a list of required environment variables.

## Database Migration

The database will be automatically created when the services start, but you need to run migrations:

```bash
docker-compose exec backend npm run db:migrate
```

## Seeding the Database

To seed the database with initial data:

```bash
docker-compose exec backend npm run db:seed
```

## Monitoring

You can monitor the logs of the services:

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

## Scaling

To scale the backend service:

```bash
docker-compose up -d --scale backend=3
```

Note: When scaling, you may need to adjust the Nginx configuration to use upstream servers.

## Backup

To backup the database:

```bash
docker-compose exec postgres pg_dump -U perpetua perpetua > backup_$(date +%Y%m%d).sql
```

## Restore

To restore from a backup:

```bash
cat backup_file.sql | docker-compose exec -T postgres psql -U perpetua perpetua
```

## Troubleshooting

- **Database connection issues**: Check the `DATABASE_URL` in the `.env` file
- **API not accessible**: Check Nginx logs and configuration
- **SSL certificate issues**: Verify the certificate files and paths in the Nginx configuration 