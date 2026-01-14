# Pozial API

Production-grade API with RBAC (Role-Based Access Control) built with **Fastify**, **Prisma**, **Zod**, and **TypeScript**.

## 🏗️ Architecture

This project implements a complete RBAC system with:

- **Users**: User identity and profile management
- **Organizations**: Multi-tenant organization management
- **Memberships**: User-organization relationships with role assignments
- **RBAC**: Fine-grained permissions system with roles and permission guards
- **Billing**: Sample billing module demonstrating permission-based access

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.0.0
- PostgreSQL database
- pnpm/npm/yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update DATABASE_URL in .env with your PostgreSQL connection string
```

### Database Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed the database with initial data
npm run prisma:seed
```

### Development

```bash
# Start development server with hot reload
npm run dev
```

The server will be available at `http://localhost:3000`

### Production

```bash
# Build the project
npm run build

# Start production server
npm start
```

## 🔒 BFF Authentication Setup

This API uses AWS Cognito authentication via a Next.js BFF (Backend-For-Frontend) with HMAC-SHA256 signed headers.

### Quick Setup

1. **Generate a shared secret**:
   ```bash
   openssl rand -hex 32
   ```

2. **Add to your `.env`**:
   ```bash
   BFF_SERVICE_SECRET=your-generated-secret-here
   ```

3. **Use the same secret in your Next.js BFF** (see [BFF_QUICKSTART.md](./BFF_QUICKSTART.md))

### Security Features

✅ Cryptographically signed headers (HMAC-SHA256)  
✅ Replay attack protection (5-minute timestamp window)  
✅ Resource ownership validation  
✅ Multi-tenancy isolation  
✅ Permission-based access control

**📚 Detailed guides:**
- [BFF Quick Start Guide](./BFF_QUICKSTART.md) - Get up and running in 5 minutes
- [BFF Implementation Guide](./docs/BFF_AUTH_IMPLEMENTATION.md) - Complete implementation details
- [Service Authentication Pattern](./docs/SERVICE_AUTHENTICATION.md) - Architecture overview

## 📁 Project Structure

```
src/
├── server.ts                  # Application entry point
├── plugins/                   # Fastify plugins
│   ├── db.ts                 # Prisma database connection
│   ├── errors.ts             # Global error handling
│   ├── auth.ts               # Authentication (userId resolution)
│   └── requestContext.ts     # Request-scoped context
├── shared/                    # Shared utilities
│   ├── constants.ts
│   ├── errors.ts             # Error classes
│   ├── http.ts               # HTTP response helpers
│   ├── types.ts              # Shared TypeScript types
│   ├── zod.ts                # Zod validation helpers
│   └── rbac/
│       ├── permissionKeys.ts # Canonical permission definitions
│       └── policy.ts         # Permission checking utilities
└── modules/                   # Feature modules
    ├── users/                # User management
    ├── organizations/        # Organization management
    ├── memberships/          # User-org relationships
    ├── rbac/                 # RBAC system
    │   ├── guards/           # Authorization guards
    │   │   ├── requireAuth.ts
    │   │   ├── requireOrg.ts
    │   │   └── requirePermission.ts
    │   ├── resolvers/
    │   │   └── resolveMembership.ts
    │   └── cache/
    │       └── permissionCache.ts
    └── billing/              # Sample billing module
```

## 🔐 RBAC System

### Permission Keys

All permissions are defined in `src/shared/rbac/permissionKeys.ts`:

```typescript
- users.read, users.write, users.delete
- organizations.read, organizations.write, organizations.delete
- memberships.read, memberships.write, memberships.delete
- roles.read, roles.write, roles.delete
- billing.read, billing.write, billing.invoice.create
```

### Guards

Use guards as Fastify `preHandler` hooks to protect routes:

```typescript
// Require authentication
preHandler: [requireAuth]

// Require organization membership
preHandler: [requireOrg(membershipResolver)]

// Require specific permission
preHandler: [
  requireOrg(membershipResolver),
  requirePermission(PermissionKeys.BILLING_READ)
]
```

### Example Protected Route

```typescript
fastify.get('/billing/invoices', {
  preHandler: [
    requireOrg(fastify.membershipResolver),
    requirePermission(PermissionKeys.BILLING_READ),
  ],
}, async (request, reply) => {
  // Only users with billing.read permission can access this
  const invoices = await billingService.getInvoices();
  return reply.send(success(invoices));
});
```

## 🔌 API Endpoints

### Health Check
- `GET /health` - Server health status

### Users
- `GET /api/v1/users` - List users
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create user
- `PATCH /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Organizations
- `GET /api/v1/organizations` - List organizations
- `GET /api/v1/organizations/:id` - Get organization by ID
- `POST /api/v1/organizations` - Create organization
- `PATCH /api/v1/organizations/:id` - Update organization
- `DELETE /api/v1/organizations/:id` - Delete organization

### Memberships
- `GET /api/v1/memberships/:id` - Get membership by ID
- `GET /api/v1/memberships/organizations/:organizationId/members` - List org members
- `GET /api/v1/memberships/users/:userId/memberships` - List user's organizations
- `POST /api/v1/memberships` - Create membership
- `PATCH /api/v1/memberships/:id` - Update membership (change role)
- `DELETE /api/v1/memberships/:id` - Delete membership

### RBAC
- `GET /api/v1/rbac/permissions` - List all permissions
- `GET /api/v1/rbac/organizations/:organizationId/roles` - List roles in org
- `GET /api/v1/rbac/roles/:id` - Get role by ID
- `POST /api/v1/rbac/roles` - Create role
- `PATCH /api/v1/rbac/roles/:id` - Update role
- `DELETE /api/v1/rbac/roles/:id` - Delete role
- `GET /api/v1/rbac/roles/:id/permissions` - Get role permissions
- `POST /api/v1/rbac/roles/:id/permissions` - Attach permissions
- `DELETE /api/v1/rbac/roles/:id/permissions` - Detach permissions
- `PUT /api/v1/rbac/roles/:id/permissions` - Sync permissions (replace all)

### Billing
- `GET /api/v1/billing/:id` - Get invoice (requires `billing.read`)
- `GET /api/v1/billing/organizations/:organizationId/invoices` - List invoices (requires `billing.read`)
- `POST /api/v1/billing/invoices` - Create invoice (requires `billing.invoice.create`)

## 🧪 Testing Authentication

This demo uses a simple header-based authentication for demonstration:

```bash
# Set user ID in header
curl -H "X-User-Id: <user-id>" http://localhost:3000/api/v1/users

# Set organization ID in header for RBAC checks
curl -H "X-User-Id: <user-id>" -H "X-Organization-Id: <org-id>" http://localhost:3000/api/v1/billing/invoices
```

**Note**: In production, replace this with proper JWT/session-based authentication.

## 📊 Database Commands

```bash
# Open Prisma Studio (database GUI)
npm run prisma:studio

# Create a new migration
npm run prisma:migrate

# Reset database (drop all data)
npx prisma migrate reset

# Format schema file
npx prisma format
```

## 🛠️ Development Commands

```bash
# Type check
npm run type-check

# Lint code
npm run lint

# Format code
npm run format
```

## 🏭 Production Considerations

### Authentication
- Replace header-based auth with JWT tokens or session cookies
- Implement token refresh logic
- Add rate limiting

### Database
- Enable connection pooling
- Configure read replicas for scaling
- Implement database backups

### Caching
- Add Redis for permission caching
- Implement cache invalidation strategies

### Monitoring
- Add APM (Application Performance Monitoring)
- Implement structured logging
- Set up error tracking (Sentry, etc.)

### Security
- Enable HTTPS in production
- Implement CSRF protection
- Add input sanitization
- Configure security headers properly

## 📝 License

ISC

## 🤝 Contributing

Contributions are welcome! Please follow the existing code structure and conventions.
