# TELC B2 Exam System - Architecture Documentation

## System Overview

The TELC B2 Exam System is a web-based platform for German language proficiency testing, following a modern client-server architecture with separation of concerns between frontend presentation, backend business logic, and data persistence.

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface                            │
│                    (React + Tailwind CSS)                        │
├─────────────────────────────────────────────────────────────────┤
│                         API Gateway                              │
│                    (Flask + CORS + Auth)                         │
├─────────────────────────────────────────────────────────────────┤
│                     Business Logic Layer                         │
│              (Routes + Services + Security)                      │
├─────────────────────────────────────────────────────────────────┤
│                      Data Access Layer                           │
│                   (SQLAlchemy ORM + Models)                      │
├─────────────────────────────────────────────────────────────────┤
│                         Database                                 │
│                        (PostgreSQL)                              │
└─────────────────────────────────────────────────────────────────┘
```

## Architecture Principles

1. **Separation of Concerns**: Clear boundaries between presentation, business logic, and data layers
2. **RESTful Design**: API follows REST principles for predictable resource management
3. **Stateless Backend**: All session state maintained on client side
4. **Security First**: Authentication, rate limiting, and input validation at every layer
5. **Scalability Ready**: Horizontal scaling possible for both frontend and backend

## Component Architecture

### Frontend Architecture

```
telc_exam_frontend/
├── src/
│   ├── components/          # UI Components
│   │   ├── exam/           # Exam-specific components
│   │   │   ├── sections/   # Individual exam sections
│   │   │   ├── ExamNavigation.jsx
│   │   │   ├── ExamTimer.jsx
│   │   │   └── QuickAnswerMap.jsx
│   │   ├── ui/             # Reusable UI components
│   │   ├── AdminPanel.jsx  # Admin interface
│   │   ├── ExamInterface.jsx
│   │   └── Landing.jsx
│   ├── context/            # React Context for state
│   │   └── ExamContext.jsx # Global exam state
│   ├── hooks/              # Custom React hooks
│   │   ├── useAudio.js     # Audio playback
│   │   ├── useExamTimer.js # Timer management
│   │   ├── useTranslation.js # Translation handling
│   │   └── useExamAnswers.js # Answer management
│   └── lib/                # Utilities
│       ├── api.js          # API client
│       ├── languageUtils.js # Language helpers
│       └── debugUtils.js   # Debug utilities
```

#### Key Frontend Patterns:

1. **Component Composition**: Small, focused components composed into larger features
2. **Custom Hooks**: Logic extraction and reusability
3. **Context API**: Global state management without external dependencies
4. **Lazy Loading**: Code splitting for performance

### Backend Architecture

```
telc_exam_backend/
├── src/
│   ├── models/             # Data Models
│   │   ├── exam.py         # Exam and ExamResult
│   │   ├── translation.py  # Translation cache
│   │   └── user.py         # User model
│   ├── routes/             # API Routes
│   │   ├── exam.py         # Exam CRUD operations
│   │   ├── translation.py  # Translation services
│   │   └── user.py         # User management
│   ├── security.py         # Auth & rate limiting
│   └── main.py            # Application entry
├── migrations/            # Database migrations
└── requirements.txt       # Dependencies
```

#### Key Backend Patterns:

1. **Blueprint Organization**: Modular route organization
2. **ORM Pattern**: SQLAlchemy for database abstraction
3. **Decorator Pattern**: Authentication and rate limiting
4. **Service Layer**: Translation services abstraction

## Data Flow Architecture

### 1. Exam Taking Flow

```
User → React UI → API Request → Flask Routes → Database
                                      ↓
                              Translation Service
                                      ↓
User ← React UI ← API Response ← Flask Routes
```

### 2. Admin Flow

```
Admin → Admin Panel → Auth Check → Admin Routes → Database
                          ↓
                    Validate Token
                          ↓
Admin ← Update UI ← Success/Error ← Database Operation
```

### 3. Translation Flow

```
Content → Check Cache → Found? → Return Cached
             ↓
         Not Found
             ↓
    Translation API → Store in Cache → Return Translation
```

## Database Architecture

### Entity Relationship Diagram

```
┌─────────────────┐     ┌──────────────────┐
│      User       │     │       Exam       │
├─────────────────┤     ├──────────────────┤
│ id              │     │ id               │
│ username        │     │ title            │
│ email           │     │ created_at       │
└─────────────────┘     │ lv1_titles       │
                        │ lv1_texts        │
                        │ lv1_answers      │
┌─────────────────┐     │ lv2_*            │
│   ExamResult    │     │ lv3_*            │
├─────────────────┤     │ sb1_*            │
│ id              │     │ sb2_*            │
│ exam_id ────────┼─────┤ hv1_*            │
│ student_name    │     │ hv2_*            │
│ answers         │     │ hv3_*            │
│ score           │     │ sa_task_a        │
│ completed_at    │     │ sa_task_b        │
└─────────────────┘     └──────────────────┘

┌─────────────────────┐ ┌──────────────────┐
│  TranslationCache   │ │  ExamTranslation │
├─────────────────────┤ ├──────────────────┤
│ id                  │ │ id               │
│ resource_type       │ │ exam_id          │
│ resource_id         │ │ target_lang      │
│ path                │ │ exam_hash        │
│ source_lang         │ │ payload          │
│ target_lang         │ │ created_at       │
│ source_hash         │ │ updated_at       │
│ translated_text     │ └──────────────────┘
│ created_at          │
│ updated_at          │
└─────────────────────┘
```

### Data Storage Strategy

1. **Exam Content**: Stored as JSON in TEXT columns for flexibility
2. **Translation Cache**: Granular caching at field level
3. **Results**: Denormalized for query performance
4. **Indexing**: On foreign keys and frequently queried fields

## Security Architecture

### Authentication Flow

```
Request → Check X-Admin-Token Header → Validate Token → Allow/Deny
                                            ↓
                                    Rate Limit Check
                                            ↓
                                    Process Request
```

### Security Layers

1. **Transport**: HTTPS in production
2. **Authentication**: Token-based for admin
3. **Authorization**: Role-based access control
4. **Rate Limiting**: Per-endpoint limits
5. **Input Validation**: Server-side validation
6. **SQL Injection**: ORM parameterized queries
7. **XSS Protection**: React's built-in escaping

## Performance Architecture

### Caching Strategy

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│   CDN/Cache │────▶│   Backend   │
│   Cache     │     │  (Future)   │     │   Server    │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │  Database   │
                                        │   Cache     │
                                        └─────────────┘
```

### Optimization Techniques

1. **Frontend**:
   - Code splitting with React.lazy()
   - Memoization for expensive computations
   - Virtual scrolling for long lists
   - Asset optimization and compression

2. **Backend**:
   - Database query optimization
   - Translation result caching
   - Connection pooling
   - Response compression

3. **Database**:
   - Indexed foreign keys
   - Query plan optimization
   - Connection pooling
   - Regular VACUUM operations

## Deployment Architecture

### Development Environment

```
┌─────────────────┐     ┌─────────────────┐
│  React Dev      │────▶│  Flask Dev      │
│  localhost:5173 │     │  localhost:5000 │
└─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │  PostgreSQL     │
                        │  (Docker)       │
                        │  localhost:5432 │
                        └─────────────────┘
```

### Production Environment

```
┌─────────────────┐     ┌─────────────────┐
│     CDN         │────▶│   Load Balancer │
│  (CloudFlare)   │     │    (Future)     │
└─────────────────┘     └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│  Static Site    │     │   API Servers   │
│   (Render)      │     │    (Render)     │
└─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │   PostgreSQL    │
                        │   (Managed)     │
                        └─────────────────┘
```

## Technology Decisions

### Frontend Technology Stack

| Technology | Reason | Alternative Considered |
|------------|--------|----------------------|
| React 18 | Modern hooks, widespread adoption | Vue.js, Angular |
| Vite | Fast build times, HMR | Create React App |
| Tailwind CSS | Utility-first, rapid development | Material-UI, Bootstrap |
| Context API | Simple state management | Redux, MobX |
| React Router | Standard routing solution | Reach Router |

### Backend Technology Stack

| Technology | Reason | Alternative Considered |
|------------|--------|----------------------|
| Flask | Lightweight, flexible | Django, FastAPI |
| SQLAlchemy | Mature ORM, flexibility | Django ORM, Peewee |
| PostgreSQL | ACID compliance, JSON support | MySQL, MongoDB |
| Alembic | Reliable migrations | Flask-Migrate alone |

## Scalability Considerations

### Horizontal Scaling

```
                    ┌─────────────────┐
                    │  Load Balancer  │
                    └─────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Server 1  │     │   Server 2  │     │   Server 3  │
└─────────────┘     └─────────────┘     └─────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            ▼
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    │   (Primary)     │
                    └─────────────────┘
                            │
                    ┌───────┴───────┐
                    ▼               ▼
            ┌─────────────┐ ┌─────────────┐
            │  Read Rep 1 │ │  Read Rep 2 │
            └─────────────┘ └─────────────┘
```

### Vertical Scaling Points

1. **Database**: Can scale up to handle more connections
2. **Application Servers**: Can increase CPU/RAM as needed
3. **Caching Layer**: Redis/Memcached can be added

## Future Architecture Enhancements

### Microservices Migration Path

```
Current Monolith          →          Future Microservices
┌─────────────────┐              ┌─────────────────┐
│                 │              │   API Gateway   │
│  Flask Monolith │              └─────────────────┘
│                 │                      │
└─────────────────┘              ┌───────┼───────┐
                                 ▼       ▼       ▼
                         ┌──────────┐ ┌──────────┐ ┌──────────┐
                         │  Exam    │ │  Trans   │ │  Auth    │
                         │ Service  │ │ Service  │ │ Service  │
                         └──────────┘ └──────────┘ └──────────┘
```

### Planned Improvements

1. **Message Queue**: For async operations (Celery + Redis)
2. **Search Service**: Elasticsearch for exam content
3. **Real-time Features**: WebSocket support
4. **File Storage**: S3-compatible object storage
5. **Monitoring**: Prometheus + Grafana stack

## Development Workflow

### Git Branch Strategy

```
main
 │
 ├── develop
 │    │
 │    ├── feature/exam-editor
 │    ├── feature/translation-api
 │    └── feature/admin-dashboard
 │
 ├── hotfix/security-patch
 └── release/v1.2.0
```

### CI/CD Pipeline

```
Code Push → GitHub Actions → Tests → Build → Deploy
                │                │
                ▼                ▼
           Lint Check      Unit Tests
                          Integration Tests
```

## Monitoring and Observability

### Logging Strategy

1. **Application Logs**: Structured JSON logging
2. **Access Logs**: Nginx/reverse proxy logs
3. **Error Tracking**: Sentry integration
4. **Performance Monitoring**: APM tools

### Health Checks

```python
/api/health → {
    "status": "healthy",
    "database": "connected",
    "cache": "connected",
    "translation_api": "available"
}
```

## Disaster Recovery

### Backup Strategy

1. **Database**: Daily automated backups, 30-day retention
2. **Code**: Git repository with tags for releases
3. **Configuration**: Environment variables in secure vault
4. **Media Files**: S3 with versioning enabled

### Recovery Time Objectives

- **RTO**: 4 hours maximum downtime
- **RPO**: 24 hours maximum data loss

## Documentation Standards

1. **Code Documentation**: Docstrings for all public methods
2. **API Documentation**: OpenAPI/Swagger specification
3. **Architecture Decision Records**: For significant changes
4. **Runbooks**: For operational procedures

---

Last updated: January 2024
Version: 1.0