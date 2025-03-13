# Database Management

This directory contains the Prisma schema and seeding scripts for the Perpetua backend database.

## Setup

Before you can run the migrations, make sure you have a PostgreSQL database running and the connection URL is properly set in the `.env` file:

```
DATABASE_URL="postgresql://username:password@localhost:5432/perpetua?schema=public"
```

## Commands

### Migrations

To create and apply migrations:

```bash
# Create a new migration
npm run db:migrate -- --name name_of_migration

# Apply pending migrations
npm run db:migrate
```

### Reset Database

To reset the database (drop all tables and reapply migrations):

```bash
npm run db:reset
```

This will also automatically run the seed script after resetting.

### Seeding

To seed the database with initial data:

```bash
npm run db:seed
```

### Prisma Studio

To open Prisma Studio (database GUI):

```bash
npm run db:studio
```

## Schema

The database schema is defined in `schema.prisma` and includes the following models:

- **User**: User accounts and profiles
- **Asset**: Investment assets (real estate, agriculture, etc.)
- **Investment**: User investments in assets
- **Earning**: Earnings generated from investments
- **Referral**: Referral codes and relationships
- **Reward**: Rewards from referrals and other activities
- **Performance**: Asset performance metrics over time
- **Transaction**: Transaction records

## Migrations

Migrations are stored in the `migrations` directory after they are created. Do not edit migration files directly unless you know what you're doing.

## Seed Data

The `seed.ts` file contains sample data used to populate the database with test data. It includes:

- Admin user
- Sample assets with performance data
- Test users with referral codes 