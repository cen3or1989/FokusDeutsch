# TELC B2 Exam System

[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-green.svg)](https://flask.palletsprojects.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-Educational-yellow.svg)](LICENSE)

A comprehensive web application for TELC B2 German exam preparation and administration, featuring a modern React frontend and Flask backend with full Persian translation support.

## 🌟 Key Features

### For Students
- **Complete TELC B2 Exam Simulation**: All four exam sections with authentic format
- **Real-time Progress Tracking**: Interactive answer sheet with visual indicators
- **Persian Translation**: Automatic translation for all exam content
- **Smart Timer Management**: Built-in timer with section-specific warnings
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Dark Mode Support**: Eye-friendly theme switching capability

### For Administrators
- **Comprehensive Exam Editor**: Create and manage complete TELC B2 exams
- **Rich Content Editor**: Support for complex formatting and media
- **Student Analytics**: Detailed performance metrics and results
- **Secure Admin Panel**: Token-based authentication system
- **Bulk Operations**: Import/export exam content
- **Translation Management**: Control translation services and caching

## 📋 Exam Structure

The system implements the complete TELC B2 exam format:

### 1. **Leseverstehen (Reading Comprehension)** - 90 minutes
- **Teil 1**: Headline matching (Questions 1-5)
- **Teil 2**: Detailed comprehension (Questions 6-10)
- **Teil 3**: Situation matching (Questions 11-20)

### 2. **Sprachbausteine (Language Elements)** - 30 minutes
- **Teil 1**: Grammar exercises (Questions 21-30)
- **Teil 2**: Vocabulary exercises (Questions 31-40)

### 3. **Hörverstehen (Listening Comprehension)** - 20 minutes
- **Teil 1**: True/False statements (Questions 41-45)
- **Teil 2**: True/False statements (Questions 46-55)
- **Teil 3**: True/False statements (Questions 56-60)

### 4. **Schriftlicher Ausdruck (Written Expression)** - 30 minutes
- **Task A**: Formal letter/email writing
- **Task B**: Opinion essay on given topic

## 🛠️ Technology Stack

### Frontend
- **React 18.2** - Modern UI library with hooks
- **Vite 5.0** - Lightning-fast build tool
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Shadcn/UI** - High-quality React components
- **React Router DOM 6** - Client-side routing
- **FontAwesome 6** - Icon library

### Backend
- **Flask 3.0** - Lightweight Python web framework
- **SQLAlchemy 2.0** - SQL toolkit and ORM
- **PostgreSQL 15** - Production-grade database
- **Flask-CORS** - Cross-origin resource sharing
- **Flask-Migrate** - Database migration handling
- **Alembic** - Database schema versioning

### Infrastructure
- **Docker & Docker Compose** - Containerization
- **Rate Limiting** - API protection
- **Translation API** - Multi-service integration

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Docker & Docker Compose
- PostgreSQL (or use Docker)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/telc-b2-exam-system.git
cd telc-b2-exam-system
```

2. **Start PostgreSQL with Docker**
```bash
docker-compose up -d postgres
```

3. **Setup Backend**
```bash
cd telc_exam_backend
pip install -r requirements.txt
python ../init_database.py
python run_local.py
```

4. **Setup Frontend**
```bash
cd telc_exam_frontend
npm install
npm run dev
```

5. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Admin Panel: http://localhost:5173/admin

## 📁 Project Structure

```
telc-b2-exam-system/
├── telc_exam_frontend/          # React frontend application
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── exam/           # Exam-specific components
│   │   │   │   └── sections/   # Individual exam sections
│   │   │   ├── ui/             # Reusable UI components
│   │   │   ├── AdminPanel.jsx  # Admin interface
│   │   │   ├── ExamInterface.jsx
│   │   │   └── Landing.jsx     # Landing page
│   │   ├── context/            # React context providers
│   │   ├── hooks/              # Custom React hooks
│   │   └── lib/                # Utility functions
│   └── package.json
├── telc_exam_backend/          # Flask backend API
│   ├── src/
│   │   ├── models/             # SQLAlchemy models
│   │   │   ├── exam.py         # Exam and result models
│   │   │   ├── translation.py  # Translation cache models
│   │   │   └── user.py         # User model
│   │   ├── routes/             # API endpoints
│   │   │   ├── exam.py         # Exam CRUD operations
│   │   │   ├── translation.py  # Translation services
│   │   │   └── user.py         # User management
│   │   ├── security.py         # Authentication & rate limiting
│   │   └── main.py             # Application entry point
│   ├── migrations/             # Database migrations
│   └── requirements.txt        # Python dependencies
├── docker-compose.yml          # Docker configuration
├── init_database.py           # Database initialization
└── README.md                  # This file
```

## 🔧 Configuration

### Environment Variables

Create `.env` file in `telc_exam_backend/`:

```env
# Database Configuration
DATABASE_URL=postgresql://telc_user:telc_password@localhost:5432/telc_exam_db

# Admin Configuration
ADMIN_TOKEN=your-secure-admin-token-here

# Flask Configuration
FLASK_ENV=development
SECRET_KEY=your-secret-key-here

# Frontend URL (for CORS)
FRONTEND_ORIGIN=http://localhost:5173

# Optional: Translation Service
TRANSLATION_API_KEY=your-api-key
```

### Database Configuration

PostgreSQL connection settings (when using Docker):
- **Host**: localhost:5432
- **Database**: telc_exam_db
- **Username**: telc_user
- **Password**: telc_password

## 📚 API Documentation

### Authentication
All admin endpoints require the `X-Admin-Token` header:
```http
X-Admin-Token: your-admin-token-here
```

### Main Endpoints

#### Exam Management
- `GET /api/exams` - List all exams
- `GET /api/exams/:id` - Get specific exam details
- `POST /api/exams` - Create new exam (admin)
- `PUT /api/exams/:id` - Update exam (admin)
- `DELETE /api/exams/:id` - Delete exam (admin)

#### Exam Results
- `GET /api/exam-results` - Get exam results (admin)
- `POST /api/exam-results` - Submit exam results

#### Translation
- `POST /api/translate` - Translate text content
- `GET /api/translate/exam/:id?lang=fa` - Get translated exam

#### System
- `GET /api/health` - Health check
- `GET /api/admin/stats` - System statistics (admin)

## 🔒 Security Features

- **Token-based Admin Authentication**: Secure admin access
- **Rate Limiting**: Prevents API abuse (configurable per endpoint)
- **CORS Protection**: Configured for specific origins
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: ORM-based queries
- **XSS Prevention**: React's built-in protection

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd telc_exam_backend
pytest

# Frontend tests
cd telc_exam_frontend
npm test
```

### Test Coverage
```bash
# Backend coverage
pytest --cov=src

# Frontend coverage
npm run test:coverage
```

## 🚀 Deployment

### Using Docker (Recommended)

1. **Build and run all services**
```bash
docker-compose up --build
```

### Manual Deployment

See detailed deployment guides:
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment guide
- [LOCAL_DEVELOPMENT.md](LOCAL_DEVELOPMENT.md) - Local development setup

### Supported Platforms
- **Render.com** - Recommended for both frontend and backend
- **Vercel** - Alternative for frontend
- **Heroku** - Traditional PaaS option
- **AWS/GCP/Azure** - Enterprise deployment

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- **Frontend**: ESLint with React configuration
- **Backend**: PEP 8 Python style guide
- **Commits**: Conventional commits format

## 📈 Performance Optimization

- **Frontend**: Code splitting, lazy loading, memoization
- **Backend**: Database indexing, query optimization, caching
- **API**: Response compression, pagination, rate limiting
- **Assets**: CDN integration, image optimization

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check PostgreSQL is running: `docker-compose ps`
   - Verify DATABASE_URL environment variable
   - Check database logs: `docker-compose logs postgres`

2. **CORS Errors**
   - Verify FRONTEND_ORIGIN in backend .env
   - Check browser console for specific origin errors

3. **Translation Not Working**
   - Check translation API credentials
   - Verify network connectivity
   - Check translation cache table

For more issues, see [LOCAL_DEVELOPMENT.md](LOCAL_DEVELOPMENT.md)

## 📝 License

This project is for educational purposes only. TELC is a registered trademark of telc gGmbH.

## ⚠️ Disclaimer

This application is independent of telc gGmbH and is not officially endorsed or affiliated with the TELC examination system. All exam content is created for educational demonstration purposes only.

## 🙏 Acknowledgments

- TELC format specifications from public resources
- React and Flask communities
- Contributors and testers

---

**Made with ❤️ for German language learners**

# FokusDeutsch
