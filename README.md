# Service API Boilerplate

A production-grade API boilerplate featuring Domain-Driven Design (DDD) principles, RBAC (Role-Based Access Control), and modern TypeScript patterns. Built with **Fastify**, **Prisma**, **Zod**, and **TypeScript**.

## 📋 About This Boilerplate

This boilerplate provides a robust foundation for building scalable service APIs with:

- **Domain-Driven Design (DDD)**: Modular architecture organized by business domains
- **RBAC Authorization**: Fine-grained permission system with role-based access control
- **Type Safety**: End-to-end type safety with TypeScript and Zod validation
- **Multi-tenancy**: Built-in organization and membership management
- **Production-Ready**: Includes authentication, error handling, and request context
- **BFF Integration**: Secure service-to-service authentication pattern

## 🏗️ Architecture

This boilerplate follows **Domain-Driven Design (DDD)** principles with a modular architecture:

### Core Modules

- **Users**: User identity and profile management
- **Organizations**: Multi-tenant organization management
- **Memberships**: User-organization relationships with role assignments
- **RBAC**: Fine-grained permissions system with roles and permission guards
- **Billing**: Sample domain module demonstrating permission-based access patterns

### DDD Layers

Each module follows a consistent layered architecture:

```
module/
├── routes.ts        # Presentation Layer - HTTP endpoints
├── schemas.ts       # Presentation Layer - Request/response validation
├── service.ts       # Application Layer - Business logic orchestration
├── repo.ts          # Infrastructure Layer - Data access
├── types.ts         # Domain Layer - Domain types and interfaces
└── index.ts         # Module exports and registration
```

**Layer Responsibilities:**

1. **Presentation (routes.ts, schemas.ts)**: Handles HTTP requests, validation, and response formatting
2. **Application (service.ts)**: Orchestrates business logic, coordinates between repositories
3. **Infrastructure (repo.ts)**: Database operations, external service integrations
4. **Domain (types.ts)**: Domain entities, value objects, and business rules

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
├── plugins/                   # Fastify plugins (infrastructure concerns)
│   ├── db.ts                 # Prisma database connection
│   ├── errors.ts             # Global error handling
│   ├── auth.ts               # Authentication (userId resolution)
│   ├── bffAuth.ts            # BFF service authentication
│   └── requestContext.ts     # Request-scoped context
├── shared/                    # Shared utilities and cross-cutting concerns
│   ├── constants.ts          # Application constants
│   ├── errors.ts             # Error classes
│   ├── http.ts               # HTTP response helpers
│   ├── types.ts              # Shared TypeScript types
│   ├── zod.ts                # Zod validation helpers
│   └── rbac/                 # RBAC shared utilities
│       ├── permissionKeys.ts # Canonical permission definitions
│       └── policy.ts         # Permission checking utilities
└── modules/                   # Domain modules (DDD bounded contexts)
    ├── users/                # User domain
    │   ├── routes.ts         # HTTP endpoints
    │   ├── schemas.ts        # Request/response schemas
    │   ├── service.ts        # Business logic
    │   ├── repo.ts           # Data access
    │   ├── types.ts          # Domain types
    │   └── index.ts          # Module registration
    ├── organizations/        # Organization domain
    ├── memberships/          # Membership domain
    ├── rbac/                 # RBAC domain
    │   ├── guards/           # Authorization guards
    │   │   ├── requireAuth.ts
    │   │   ├── requireOrg.ts
    │   │   ├── requireOwnership.ts
    │   │   └── requirePermission.ts
    │   ├── resolvers/
    │   │   └── resolveMembership.ts
    │   └── cache/
    │       └── permissionCache.ts
    ├── billing/              # Sample billing domain
    └── auth/                 # Authentication domain
```

### Adding New Modules

To add a new domain module:

1. Create a new folder under `src/modules/`
2. Implement the DDD layers: `routes.ts`, `schemas.ts`, `service.ts`, `repo.ts`, `types.ts`
3. Export module registration in `index.ts`
4. Register module in `src/server.ts`

Example module structure:

```typescript
// types.ts - Domain types
export interface YourEntity {
  id: string;
  // ... domain properties
}

// repo.ts - Data access
export class YourRepository {
  async findById(id: string): Promise<YourEntity | null> { }
  async create(data: CreateYourEntityInput): Promise<YourEntity> { }
}

// service.ts - Business logic
export class YourService {
  constructor(private repo: YourRepository) {}
  async getById(id: string): Promise<YourEntity> { }
}

// schemas.ts - Validation
export const createYourEntitySchema = z.object({ });

// routes.ts - HTTP endpoints
export async function yourRoutes(fastify: FastifyInstance) {
  fastify.post('/your-entities', { }, async (request, reply) => { });
}

// index.ts - Module registration
export async function registerYourModule(fastify: FastifyInstance) {
  await fastify.register(yourRoutes, { prefix: '/api/v1/your-entities' });
}
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

## 🧪 Testing

### TODO: Testing & Code Coverage

- [ ] Set up testing framework (e.g., Vitest, Jest)
- [ ] Add test scripts to `package.json`
- [ ] Implement unit tests for each DDD layer with minimum coverage requirements:
  - **Domain Layer (types.ts)**: 100% - Pure domain logic, no dependencies
  - **Application Layer (service.ts)**: 80% - Business logic orchestration
  - **Infrastructure Layer (repo.ts)**: 70% - Data access patterns
  - **Presentation Layer (routes.ts)**: 60% - HTTP endpoint integration
- [ ] Add integration tests for critical user flows
- [ ] Configure coverage reports and CI/CD gates
- [ ] Document testing patterns and conventions

**Rationale for Layer Coverage Requirements:**

- **Domain Layer**: Highest coverage (100%) because it contains pure business rules
- **Application Layer**: High coverage (80%) for business logic orchestration
- **Infrastructure Layer**: Moderate coverage (70%) - often mocked in unit tests
- **Presentation Layer**: Lower coverage (60%) - focuses on integration tests

## 🏭 Production Considerations

### Authentication
- Replace header-based auth with JWT tokens or session cookies
- Implement token refresh logic
- Add rate limiting
- Consider OAuth2/OIDC for third-party integrations

### Database
- Enable connection pooling (configured in Prisma)
- Configure read replicas for scaling
- Implement database backups and disaster recovery
- Set up migration strategies for zero-downtime deployments

### Caching
- Add Redis for permission caching at scale
- Implement cache invalidation strategies
- Consider CDN for static assets

### Monitoring & Observability
- Add APM (Application Performance Monitoring)
- Implement structured logging (JSON format)
- Set up error tracking (Sentry, Rollbar, etc.)
- Add distributed tracing (OpenTelemetry)
- Configure health checks and readiness probes

### Security
- Enable HTTPS in production
- Implement CSRF protection
- Add input sanitization
- Configure security headers (helmet)
- Implement API versioning strategy
- Set up Web Application Firewall (WAF)
- Regular security audits and dependency updates

### Scalability
- Horizontal scaling with load balancers
- Implement message queues for async operations
- Consider event-driven architecture for decoupling
- Database sharding strategies for multi-tenancy

### CI/CD
- Automated testing in pipelines
- Code coverage enforcement
- Automated security scanning
- Blue-green or canary deployments
- Infrastructure as Code (IaC)

## 📝 License

ISC

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Code Structure**: Follow the DDD layered architecture pattern
2. **Naming Conventions**: Use descriptive names following TypeScript conventions
3. **Type Safety**: Leverage TypeScript and Zod for type safety
4. **Testing**: Add tests for new features (see Testing section)
5. **Documentation**: Update README and inline comments for significant changes
6. **Commits**: Write clear, conventional commit messages

## 🎯 Roadmap

- [ ] Add testing framework and achieve target coverage per DDD layer
- [ ] Implement API documentation (OpenAPI/Swagger)
- [ ] Add Docker and docker-compose setup
- [ ] Create example microservice communication patterns
- [ ] Add event sourcing example module
- [ ] Implement CQRS pattern for complex domains
- [ ] Add example GraphQL integration
- [ ] Create CLI for scaffolding new modules
- [ ] Add performance benchmarking suite

## 📚 Additional Resources

- [Domain-Driven Design](https://martinfowler.com/tags/domain%20driven%20design.html)
- [Fastify Documentation](https://www.fastify.io/)
- [Prisma Best Practices](https://www.prisma.io/docs/guides)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zod Documentation](https://zod.dev/)

---

**Built with ❤️ as a foundation for modern service APIs**
