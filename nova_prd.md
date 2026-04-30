# Product Requirements Document: HealthAccess NG Open API Platform

## 1. Product Name

**HealthAccess NG**

## 2. Product Summary

HealthAccess NG is an open-source, API-first healthcare data platform for Nigeria. It provides structured, searchable, and developer-friendly data on Nigerian health facilities, hospital clinic schedules, and public health opportunities.

The platform should function both as:

1. A public API for developers, researchers, health-tech builders, NGOs, and public health teams.
2. A visual dashboard for non-technical users to explore healthcare information across Nigeria.

The system should be built to a high standard, with strong attention to API design, data quality, documentation, map-based exploration, contribution workflows, and long-term maintainability.

---

## 3. Core Product Vision

Healthcare information in Nigeria is often scattered, inconsistent, outdated, or difficult to access in a machine-readable format. HealthAccess NG aims to solve this by creating a structured, open-source, community-powered healthcare data infrastructure layer.

The platform should allow users to:

- Search health facilities by state, LGA, type, ownership, and available services.
- View health facilities on a Nigerian map.
- Explore clinic days and specialist schedules for hospitals.
- Discover public health opportunities such as fellowships, grants, jobs, training programmes, and conferences.
- Access the data through a clean, versioned public API.
- Contribute new data or corrections.
- Track coverage and verification status across Nigeria.

---

## 4. Target Users

### 4.1 Developers

Developers building health-tech apps, emergency tools, referral tools, public health dashboards, research products, or data-driven applications.

### 4.2 Public Health Professionals

People working in public health who need structured information on facilities, opportunities, and health system coverage.

### 4.3 Researchers and NGOs

Researchers, NGOs, and civil society organisations needing Nigerian health facility data, service availability data, or public health opportunity information.

### 4.4 General Users

People who want to find hospitals, primary health centres, specialist services, or clinic schedules.

### 4.5 Contributors

Healthcare workers, students, researchers, and local volunteers who can submit or correct facility and clinic information.

---

## 5. Product Modules

The first version should include three major modules:

1. **Health Facility Finder**
2. **ClinicDay NG**
3. **Open API for Nigerian Health Facilities and Services**

These modules should live under one unified product and visual identity.

---

# MODULE 1: Health Facility Finder

## 6. Feature Overview

Health Facility Finder is a searchable database and map of healthcare facilities in Nigeria.

Users should be able to search and filter facilities by:

- State
- LGA
- Facility type
- Ownership
- Services offered
- Verification status
- Search keyword

## 7. Facility Data Fields

Each facility should contain:

- ID
- Name
- State
- LGA
- Ward
- Address
- Facility type
- Ownership
- Services offered
- Phone number
- Email
- Website
- Opening hours
- Latitude
- Longitude
- Data source
- Verification status
- Last verified date
- Date created
- Date updated

## 8. Facility Types

Initial supported facility types:

- Teaching hospital
- Federal Medical Centre
- General hospital
- Primary Health Centre
- Private hospital
- Mission hospital
- Specialist hospital
- Diagnostic centre
- Laboratory
- Pharmacy
- Maternity centre
- Dialysis centre
- Emergency centre

## 9. Facility Services

Initial services should include:

- Emergency care
- Maternity care
- Antenatal care
- Immunisation
- Paediatrics
- Surgery
- Internal medicine
- Cardiology
- Dialysis
- Laboratory services
- Radiology
- Mental health
- HIV services
- TB services
- Family planning
- Dental care
- Eye care

---

# MODULE 2: ClinicDay NG

## 10. Feature Overview

ClinicDay NG provides structured data on hospital clinic schedules and specialist clinic days.

Users should be able to search clinic schedules by:

- Hospital
- State
- LGA
- Specialty
- Day of the week
- Referral requirement

## 11. Clinic Schedule Data Fields

Each clinic schedule should contain:

- ID
- Facility ID
- Facility name
- Specialty
- Clinic days
- Clinic time
- Appointment process
- Referral required
- Notes
- Source
- Verification status
- Last verified date
- Date created
- Date updated

## 12. Supported Specialties

Initial specialties should include:

- Cardiology
- Paediatrics
- Obstetrics and Gynaecology
- Surgery
- Orthopaedics
- Ophthalmology
- ENT
- Dermatology
- Psychiatry
- Neurology
- Nephrology
- Oncology
- Haematology
- Endocrinology
- Gastroenterology
- Urology
- Dental surgery
- Family medicine

---

# MODULE 3: Open API for Nigerian Health Facilities and Services

## 13. Feature Overview

The Open API for Nigerian Health Facilities and Services is the developer-facing core of HealthAccess NG. It should expose clean, structured, versioned, and well-documented API endpoints for Nigerian healthcare facility and service data.

This module is not a separate content board. Instead, it is the public API layer that allows developers, researchers, civic-tech builders, health-tech teams, NGOs, and public health organisations to access reliable healthcare data programmatically.

Users should be able to access structured data on:

- Health facilities
- Facility services
- Facility ownership
- Facility types
- Clinic schedules
- States and LGAs
- Specialties
- Data coverage
- Verification status
- Source and freshness metadata

## 14. API Use Cases

The API should support use cases such as:

- Building hospital and PHC finder apps
- Building referral tools
- Building emergency care lookup tools
- Building public health dashboards
- Building research datasets
- Building facility coverage maps
- Supporting healthcare access analysis
- Supporting civic-tech and health-tech products

## 15. Core API Data Domains

The open API should expose these major data domains:

### Facilities

Structured data on hospitals, PHCs, clinics, diagnostic centres, laboratories, pharmacies, and specialist centres.

### Services

Structured data on services provided by facilities, such as emergency care, maternity care, immunisation, dialysis, laboratory services, radiology, antenatal care, and mental health services.

### Clinic Schedules

Structured clinic day and specialty schedule data linked to health facilities.

### Geographic Metadata

Structured data on Nigerian states, LGAs, wards where available, and facility location coordinates.

### Data Quality Metadata

Structured metadata on verification status, source, confidence score, last verified date, and data freshness.

---

# 16. Public API Requirements

## 16.1 API Philosophy

The API should be:

- RESTful
- Versioned
- Predictable
- Well-documented
- Publicly accessible for read operations
- Protected for write/admin operations
- Easy to consume by developers
- Designed with stable response formats

## 16.2 API Base URL

Use a versioned base URL:

```txt
/api/v1
```

## 16.3 Core API Endpoints

### Facilities

```txt
GET /api/v1/facilities
GET /api/v1/facilities/{id}
GET /api/v1/facilities/search
GET /api/v1/facilities/stats
POST /api/v1/facilities/contributions
```

### Clinic Schedules

```txt
GET /api/v1/clinic-schedules
GET /api/v1/clinic-schedules/{id}
GET /api/v1/clinic-schedules/search
POST /api/v1/clinic-schedules/contributions
```

### Opportunities

```txt
GET /api/v1/opportunities
GET /api/v1/opportunities/{id}
GET /api/v1/opportunities/search
POST /api/v1/opportunities/contributions
```

### Metadata

```txt
GET /api/v1/states
GET /api/v1/states/{state}/lgas
GET /api/v1/services
GET /api/v1/specialties
GET /api/v1/stats
GET /api/v1/health
```

## 16.4 Filtering Requirements

Facilities should support filters such as:

```txt
?state=lagos
?lga=ikeja
?facility_type=primary_health_centre
?ownership=public
?service=immunisation
?verified=true
?page=1
?limit=20
```

Clinic schedules should support filters such as:

```txt
?state=lagos
?specialty=cardiology
?day=monday
?referral_required=true
?page=1
?limit=20
```

Opportunities should support filters such as:

```txt
?category=fellowship
?field=public-health
?remote=true
?deadline_before=2026-06-30
?page=1
?limit=20
```

## 16.5 Standard Success Response

All successful list responses should follow this structure:

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "total_pages": 0,
    "has_next_page": false
  }
}
```

## 16.6 Standard Error Response

All errors should follow this structure:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameter.",
    "details": {}
  }
}
```

## 16.7 Pagination

Use page-based pagination for the MVP:

```txt
?page=1&limit=20
```

Default limit: 20  
Maximum limit: 100

## 16.8 Rate Limiting

Initial rate limits:

- Anonymous users: 100 requests per hour
- API key users: 1,000 requests per day
- Admin users: higher internal limits

Return rate limit headers:

```txt
X-RateLimit-Limit
X-RateLimit-Remaining
X-RateLimit-Reset
```

## 16.9 API Documentation

API documentation should be generated from an OpenAPI specification and should include:

- Overview
- Authentication
- Rate limits
- Pagination
- Error handling
- Endpoint list
- Example requests
- Example responses
- Data disclaimer
- Changelog

---

# 17. Dashboard Requirements

## 17.1 Dashboard Purpose

The dashboard should make the API data visually understandable to non-technical users. It should provide an overview of healthcare data coverage across Nigeria.

## 17.2 Dashboard Pages

The dashboard should include:

1. Overview dashboard
2. Nigerian map explorer
3. Facility search page
4. Facility profile page
5. Clinic schedule search page
6. Opportunity board page
7. Contribution page
8. API documentation page
9. Admin dashboard

## 17.3 Overview Dashboard

The overview dashboard should show:

- Total facilities
- Total clinic schedules
- Total opportunities
- Number of states covered
- Number of LGAs covered
- Verified vs unverified records
- Recently added data
- Most covered states
- Least covered states
- Data freshness indicator

## 17.4 Nigerian Map Explorer

The map should show Nigeria with state-level visualisation.

Map features:

- Choropleth map by facility count
- Hover state to show summary
- Click state to filter data
- Display number of facilities per state
- Display number of verified facilities per state
- Display number of clinic schedules per state
- Display coverage percentage where available
- Option to switch between facility coverage, clinic schedule coverage, and opportunity coverage

## 17.5 Facility Map

The facility map should show facility points using latitude and longitude.

Features:

- Cluster markers when zoomed out
- Marker popup with facility name, type, and state
- Link from marker to facility profile
- Filters beside the map
- Search input above the map

## 17.6 Facility Profile Page

Each facility profile should show:

- Facility name
- Facility type
- Ownership
- State and LGA
- Address
- Contact details
- Services offered
- Clinic schedules attached to that facility
- Verification status
- Source information
- Last verified date
- Suggest correction button

## 17.7 Opportunity Board Page

Opportunity board should show:

- Cards/list of opportunities
- Deadline badges
- Category filters
- Remote/on-site badge
- Field tags
- Application button
- Expired opportunity handling

## 17.8 Admin Dashboard

The admin dashboard should allow authorised users to:

- View pending contributions
- Approve contributions
- Reject contributions
- Edit facility data
- Edit clinic schedules
- Edit opportunities
- View audit logs
- View data quality warnings

---

# 18. Data Quality and Governance

## 18.1 Verification Statuses

Use these statuses:

- unverified
- community_submitted
- source_verified
- admin_verified
- stale
- rejected

## 18.2 Required Data Quality Fields

Every major data record should include:

- data_source
- source_url
- submitted_by
- verified_status
- verified_by
- last_verified_at
- confidence_score
- created_at
- updated_at

## 18.3 Data Freshness

Records older than 12 months without verification should be marked as stale.

## 18.4 Contribution Workflow

The contribution workflow should be:

1. User submits data
2. System validates required fields
3. Contribution is stored as pending
4. Admin reviews submission
5. Admin approves or rejects submission
6. If approved, main record is created or updated
7. Audit log is created

---

# 19. Technical Architecture

## 19.1 Recommended Stack

### API

- Cloudflare Workers
- Hono
- TypeScript
- Zod
- Drizzle ORM

### Database

- PostgreSQL via Supabase or Neon

### Frontend / Dashboard

- Next.js
- Tailwind CSS
- shadcn/ui or custom component system
- Recharts for charts
- Leaflet or Mapbox for maps

### Documentation

- OpenAPI
- Scalar, Redoc, or Swagger UI

### CI/CD

- GitHub Actions

### Monitoring

- Sentry
- Cloudflare Analytics

## 19.2 Repository Structure

```txt
healthaccess-ng/
├── apps/
│   ├── api/
│   ├── web/
│   └── docs/
├── packages/
│   ├── database/
│   ├── validators/
│   ├── types/
│   └── config/
├── datasets/
├── .github/
│   └── workflows/
├── README.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── CHANGELOG.md
├── LICENSE
└── package.json
```

## 19.3 Database Tables

Initial tables:

- states
- lgas
- facilities
- services
- facility_services
- specialties
- clinic_schedules
- opportunities
- contributions
- users
- api_keys
- audit_logs
- sources

---

# 20. Design System

## 20.1 Design Principles

The design should feel:

- Trustworthy
- Clean
- Civic/public-interest oriented
- Modern
- Lightweight
- Data-focused
- Accessible
- Nigerian without being visually noisy

Avoid overusing green-white-green. The Nigerian identity should be present but mature.

## 20.2 Visual Personality

The product should feel like:

- A public data utility
- A serious health infrastructure product
- A developer-friendly API platform
- A clean dashboard for decision-making

## 20.3 Colour System

### Primary Colour

Deep healthcare green.

Suggested token:

```txt
--color-primary: #0F766E
```

### Secondary Colour

Soft public-sector blue.

```txt
--color-secondary: #2563EB
```

### Accent Colour

Warm amber for alerts, deadlines, and highlights.

```txt
--color-accent: #F59E0B
```

### Success

```txt
--color-success: #16A34A
```

### Warning

```txt
--color-warning: #F59E0B
```

### Danger

```txt
--color-danger: #DC2626
```

### Neutral Backgrounds

```txt
--color-background: #F8FAFC
--color-surface: #FFFFFF
--color-muted: #E2E8F0
--color-border: #CBD5E1
--color-text: #0F172A
--color-text-muted: #64748B
```

## 20.4 Typography

Recommended fonts:

- Inter
- Geist Sans
- Satoshi
- IBM Plex Sans

Use a clean sans-serif font for all product interfaces.

## 20.5 Layout Rules

- Use generous spacing.
- Use card-based dashboard sections.
- Avoid cluttered layouts.
- Use strong information hierarchy.
- Use filters on the left or top of list pages.
- Use sticky search/filter areas on data-heavy pages.

## 20.6 Components

Build reusable components:

- Button
- Input
- Select
- Search bar
- Badge
- Status badge
- Card
- Stat card
- Data table
- Empty state
- Loading skeleton
- Error state
- Map container
- Filter sidebar
- Pagination
- Modal
- Toast
- Tabs
- API endpoint card
- Code block
- Contribution form

## 20.7 Badges

Verification badges:

- Unverified
- Community submitted
- Source verified
- Admin verified
- Stale
- Rejected

Opportunity badges:

- Fellowship
- Grant
- Scholarship
- Remote
- Deadline soon
- Expired

Facility badges:

- Public
- Private
- Mission
- PHC
- Teaching hospital
- Emergency care

## 20.8 Dashboard Design

The dashboard should use:

- Stat cards at the top
- Nigerian map as the main visual element
- Filterable data tables
- Charts for coverage and verification status
- Recent updates panel
- Data quality panel

## 20.9 Map Design

The Nigerian map should:

- Be visually central
- Support state-level interaction
- Use subtle colours
- Avoid overly bright political-map styling
- Display tooltips clearly
- Allow switching between layers

Map layers:

- Facilities by state
- Verified facilities by state
- Clinic schedules by state
- Opportunities by state
- Stale records by state

## 20.10 Accessibility Requirements

- Minimum contrast ratio should be accessible.
- Buttons should have visible focus states.
- Forms should have labels.
- Error messages should be clear.
- Map data should also be available in table form.
- Do not rely on colour alone to communicate status.

---

# 21. Developer Experience Requirements

The API should be easy for developers to use.

## 21.1 Developer Portal

The developer portal should include:

- API overview
- Quickstart guide
- Authentication guide
- Example requests
- Example responses
- Rate limits
- Error codes
- Changelog
- Data disclaimer
- GitHub contribution guide

## 21.2 Example Code Snippets

Include examples in:

- JavaScript
- Python
- cURL

## 21.3 SDKs

SDKs are not required for MVP, but the architecture should allow future SDKs.

Future SDKs:

- JavaScript SDK
- Python SDK

---

# 22. Security Requirements

## 22.1 Public Read Access

Public read endpoints should be accessible without login but rate-limited.

## 22.2 Write Access

Write actions should require validation and abuse protection.

## 22.3 Admin Access

Admin routes must require authentication and role-based access.

## 22.4 Audit Logs

Admin actions should be logged.

Audit logs should record:

- User
- Action
- Resource type
- Resource ID
- Previous value
- New value
- Timestamp

---

# 23. MVP Scope

## 23.1 MVP Must Include

- Public API
- Facility search
- Clinic schedule search
- Opportunity listing
- API documentation
- Dashboard overview
- Nigerian map explorer
- Contribution form
- Admin review page
- Standard response format
- Pagination
- Filtering
- Error handling
- GitHub README
- Open-source licence

## 23.2 MVP Data Volume

Start with:

- 50 health facilities
- 50 clinic schedules
- 50 public health opportunities
- All 36 states and FCT
- Sample LGAs for states covered by the first dataset

## 23.3 Out of Scope for MVP

Do not include initially:

- User accounts for general users
- Mobile app
- AI chatbot
- SMS alerts
- Advanced analytics
- Paid API plans
- Complex geospatial routing
- Real-time facility availability

---

# 24. Success Metrics

Initial success metrics:

- API is publicly accessible
- Documentation is complete
- At least 100 records exist across modules
- At least 10 states have facility data
- Search works by state, LGA, service, and specialty
- Map renders state-level coverage
- Contributions can be submitted and reviewed
- API has stable response format
- Project has clear README and contribution guide

Developer success metrics:

- A developer can make their first successful API request within 5 minutes.
- API examples work without modification.
- API errors are understandable.
- Documentation explains all major endpoints.

---

# 25. Suggested Build Milestones

## Milestone 1: Foundation

- Set up monorepo
- Set up API app
- Set up web app
- Set up database schema
- Add seed data
- Add environment configuration

## Milestone 2: Public API

- Implement facilities endpoints
- Implement clinic schedule endpoints
- Implement opportunities endpoints
- Implement metadata endpoints
- Add pagination
- Add filtering
- Add standard error handling

## Milestone 3: Documentation

- Create OpenAPI specification
- Add docs page
- Add example requests
- Add API response examples
- Add changelog

## Milestone 4: Dashboard

- Build overview dashboard
- Build Nigerian map explorer
- Build facility list page
- Build clinic schedule list page
- Build opportunity board page

## Milestone 5: Contributions and Admin

- Build contribution form
- Build admin review dashboard
- Add approve/reject workflow
- Add audit logs

## Milestone 6: Polish and Launch

- Improve UI
- Add loading states
- Add empty states
- Add error states
- Add README
- Add contribution guide
- Add security policy
- Deploy API and web dashboard

---

# 26. Coding Agent Instructions for Antigravity or Claude Code

## 26.1 General Instruction

Build this project as a production-grade open-source API platform, not as a simple demo app.

Prioritise:

- Clean architecture
- Type safety
- API consistency
- Documentation
- Maintainability
- Reusable components
- Accessible design
- Data quality workflows

## 26.2 Implementation Order

The coding agent should build in this order:

1. Create monorepo structure
2. Set up TypeScript configuration
3. Set up database schema
4. Set up API routes
5. Add validation schemas
6. Add standard response utilities
7. Add seed data
8. Build dashboard UI
9. Add map visualisation
10. Add contribution workflow
11. Add admin review workflow
12. Add documentation
13. Add tests
14. Add deployment configuration

## 26.3 Non-Negotiable Standards

The coding agent must:

- Use TypeScript strictly.
- Avoid hardcoded response shapes scattered across routes.
- Use central response helpers.
- Use shared validation schemas.
- Use consistent error codes.
- Use reusable UI components.
- Keep API route handlers thin.
- Put business logic in services.
- Keep database schema modular.
- Include loading, error, and empty states in the UI.
- Ensure map data is also available in table/list format.

---

# 27. Initial Prompt for Antigravity or Claude Code

Use this prompt to begin implementation:

```txt
You are building HealthAccess NG, a production-grade open-source healthcare data API platform for Nigeria.

Build an API-first monorepo with three modules:

1. Health Facility Finder
2. ClinicDay NG
3. Public Health Opportunity Board

The project should use TypeScript and follow clean architecture principles. It should include a public REST API, dashboard web app, API documentation, Nigerian map explorer, contribution workflow, and admin review workflow.

Recommended stack:
- API: Cloudflare Workers + Hono + TypeScript
- Database: PostgreSQL with Drizzle ORM
- Validation: Zod
- Web dashboard: Next.js + Tailwind CSS
- Charts: Recharts
- Map: Leaflet or another suitable React map library
- Documentation: OpenAPI with Scalar, Redoc, or Swagger UI

Start by creating the monorepo structure, shared packages, database schema, API response utilities, and the first set of public endpoints for facilities, clinic schedules, and opportunities.

Important standards:
- Use /api/v1 versioning.
- Use standard success and error response formats.
- Add pagination and filtering.
- Use strict TypeScript.
- Use reusable validation schemas.
- Keep route handlers thin and place business logic in service files.
- Build a clean dashboard with a Nigerian map, stat cards, tables, filters, and useful coverage insights.
- Include a proper README, CONTRIBUTING guide, CHANGELOG, SECURITY file, and open-source licence.
```

---

# 28. Launch Positioning

The project can eventually be described as:

HealthAccess NG is an open-source API and dashboard for Nigerian healthcare data. It provides structured access to health facilities, hospital clinic schedules, and public health opportunities across Nigeria, with contribution workflows, verification status, map-based exploration, and developer-friendly documentation.

---

# 29. Final Product Standard

The finished MVP should feel like a serious public data infrastructure project. It should not feel like a school project, a basic CRUD app, or a generic directory.

It should communicate:

- Trust
- Structure
- Public usefulness
- Developer quality
- Nigerian relevance
- Healthcare seriousness
- Long-term maintainability

