# TELC B2 Exam System - Development Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Development Environment Setup](#development-environment-setup)
4. [Project Structure](#project-structure)
5. [Development Workflow](#development-workflow)
6. [Testing](#testing)
7. [Debugging](#debugging)
8. [Code Style Guide](#code-style-guide)
9. [Common Tasks](#common-tasks)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- **Python 3.8+** (3.11 recommended)
- **Node.js 16+** (18 LTS recommended)
- **Docker & Docker Compose**
- **Git**
- **PostgreSQL 15** (or use Docker)

### Recommended Tools

- **VS Code** or **PyCharm** for development
- **Postman** or **Insomnia** for API testing
- **pgAdmin** or **DBeaver** for database management
- **React Developer Tools** browser extension

## Quick Start

### Using Automated Scripts

#### Windows
```bash
git clone https://github.com/yourusername/telc-b2-exam-system.git
cd telc-b2-exam-system
start_local_dev.bat
```

#### macOS/Linux
```bash
git clone https://github.com/yourusername/telc-b2-exam-system.git
cd telc-b2-exam-system
chmod +x start_local_dev.sh
./start_local_dev.sh
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Database: localhost:5432

## Development Environment Setup

### 1. Database Setup (PostgreSQL in Docker)

```bash
# Start PostgreSQL container
docker-compose up -d postgres

# Verify it's running
docker-compose ps

# View logs if needed
docker-compose logs postgres
```

Default connection details:
- Host: `localhost:5432`
- Database: `telc_exam_db`
- Username: `telc_user`
- Password: `telc_password`

### 2. Backend Setup (Flask)

```bash
# Navigate to backend directory
cd telc_exam_backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
cd ..
python init_database.py

# Run backend server
cd telc_exam_backend
python run_local.py
```

### 3. Frontend Setup (React)

```bash
# In a new terminal, navigate to frontend
cd telc_exam_frontend

# Install dependencies
npm install
# or with pnpm
pnpm install

# Start development server
npm run dev
```

### 4. Environment Configuration

Create `.env` file in `telc_exam_backend/`:

```env
# Database
DATABASE_URL=postgresql://telc_user:telc_password@localhost:5432/telc_exam_db

# Admin
ADMIN_TOKEN=your-secure-admin-token-here

# Flask
FLASK_ENV=development
SECRET_KEY=dev-secret-key-change-in-production

# CORS
FRONTEND_ORIGIN=http://localhost:5173

# Optional: Translation API
TRANSLATION_API_KEY=your-api-key-if-available
```

## Project Structure

```
telc-b2-exam-system/
├── telc_exam_frontend/              # React frontend
│   ├── src/
│   │   ├── components/              # UI components
│   │   │   ├── exam/               # Exam-specific components
│   │   │   │   └── sections/       # Individual exam sections
│   │   │   ├── ui/                 # Reusable UI components
│   │   │   ├── AdminPanel.jsx      # Admin interface
│   │   │   ├── ExamInterface.jsx   # Main exam interface
│   │   │   └── Landing.jsx         # Landing page
│   │   ├── context/                # React Context
│   │   ├── hooks/                  # Custom React hooks
│   │   └── lib/                    # Utilities
│   ├── public/                     # Static assets
│   └── package.json                # Dependencies
│
├── telc_exam_backend/              # Flask backend
│   ├── src/
│   │   ├── models/                 # Database models
│   │   ├── routes/                 # API endpoints
│   │   ├── security.py             # Auth & rate limiting
│   │   └── main.py                 # App entry point
│   ├── migrations/                 # Database migrations
│   └── requirements.txt            # Dependencies
│
├── docker-compose.yml              # Docker configuration
├── init_database.py               # DB initialization
└── Documentation files            # Various .md files
```

## Development Workflow

### 1. Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/your-feature-name

# Create pull request on GitHub
```

### 2. Commit Convention

Follow conventional commits format:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Build process/auxiliary changes

### 3. Database Migrations

```bash
cd telc_exam_backend

# Create new migration
flask db migrate -m "Add new column to exam table"

# Apply migrations
flask db upgrade

# Rollback if needed
flask db downgrade
```

### 4. Adding New Features

#### Frontend Component
```jsx
// src/components/NewFeature.jsx
import React from 'react';

export function NewFeature({ props }) {
  return (
    <div className="p-4">
      {/* Component content */}
    </div>
  );
}
```

#### Backend Endpoint
```python
# src/routes/new_feature.py
from flask import Blueprint, jsonify

new_feature_bp = Blueprint('new_feature', __name__)

@new_feature_bp.route('/new-endpoint', methods=['GET'])
def new_endpoint():
    return jsonify({'message': 'New feature'})
```

## Testing

### Backend Testing

```bash
cd telc_exam_backend

# Run all tests
pytest

# Run with coverage
pytest --cov=src

# Run specific test file
pytest tests/test_exam_routes.py

# Run with verbose output
pytest -v
```

### Frontend Testing

```bash
cd telc_exam_frontend

# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm test -- --watch
```

### API Testing with cURL

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test exam list
curl http://localhost:5000/api/exams

# Test admin endpoint
curl -H "X-Admin-Token: your-admin-token-here" \
     http://localhost:5000/api/admin/stats
```

## Debugging

### Backend Debugging

#### Using VS Code
1. Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: Flask",
      "type": "python",
      "request": "launch",
      "module": "flask",
      "env": {
        "FLASK_APP": "src/main.py",
        "FLASK_ENV": "development"
      },
      "args": ["run", "--no-debugger", "--no-reload"],
      "jinja": true
    }
  ]
}
```

#### Using PyCharm
1. Right-click on `main.py`
2. Select "Debug 'main'"
3. Set breakpoints as needed

### Frontend Debugging

#### Browser DevTools
```javascript
// Add debugger statements
function handleSubmit() {
  debugger; // Execution will pause here
  // ... rest of code
}
```

#### React DevTools
- Install React Developer Tools extension
- Inspect component props and state
- Profile performance

### Database Debugging

```sql
-- Check active queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query 
FROM pg_stat_activity 
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';

-- Enable query logging
ALTER SYSTEM SET log_statement = 'all';
SELECT pg_reload_conf();
```

## Code Style Guide

### Python (Backend)

Follow PEP 8 with these additions:

```python
# Good
def calculate_exam_score(answers: Dict[str, str], correct_answers: Dict[str, str]) -> float:
    """
    Calculate the total exam score.
    
    Args:
        answers: Student's answers
        correct_answers: Correct answers
        
    Returns:
        float: Score percentage
    """
    score = 0
    for question, answer in answers.items():
        if answer == correct_answers.get(question):
            score += 1
    return (score / len(correct_answers)) * 100
```

### JavaScript/React (Frontend)

Follow Airbnb style guide:

```javascript
// Good
const ExamComponent = ({ examId, onComplete }) => {
  const [answers, setAnswers] = useState({});
  
  const handleAnswer = useCallback((questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  }, []);
  
  return (
    <div className="exam-container">
      {/* Component content */}
    </div>
  );
};
```

## Common Tasks

### 1. Adding a New Exam Section

Backend:
```python
# In models/exam.py
new_section_content = db.Column(db.Text)
new_section_answers = db.Column(db.Text)

# Run migration
flask db migrate -m "Add new exam section"
flask db upgrade
```

Frontend:
```jsx
// Create new section component
// src/components/exam/sections/NewSection.jsx
export function NewSection({ content, onAnswer }) {
  // Implementation
}
```

### 2. Adding Translation Support

```python
# Backend route
@translation_bp.route('/translate/new-content', methods=['POST'])
def translate_new_content():
    # Implementation
```

### 3. Updating Dependencies

Backend:
```bash
pip install --upgrade package-name
pip freeze > requirements.txt
```

Frontend:
```bash
npm update
npm audit fix
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Database Connection Failed
```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart if needed
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

#### 2. CORS Errors
```python
# In main.py, ensure CORS is configured
CORS(app, origins=[
    "http://localhost:5173",
    "http://localhost:3000"
])
```

#### 3. Module Import Errors
```bash
# Ensure you're in virtual environment
which python  # Should show venv path

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

#### 4. Frontend Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Or with pnpm
pnpm store prune
pnpm install
```

#### 5. Port Already in Use
```bash
# Find process using port
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :5000
kill -9 <PID>
```

### Getting Help

1. Check existing issues on GitHub
2. Review error logs carefully
3. Use browser DevTools for frontend issues
4. Enable Flask debug mode for detailed errors
5. Ask in project discussions

## Performance Tips

### Backend
- Use database connection pooling
- Implement caching for translations
- Optimize database queries with indexes
- Use pagination for large datasets

### Frontend
- Implement lazy loading for components
- Use React.memo for expensive components
- Optimize images and assets
- Implement virtual scrolling for long lists

## Security Best Practices

1. Never commit `.env` files
2. Use strong admin tokens
3. Validate all user input
4. Keep dependencies updated
5. Use HTTPS in production
6. Implement rate limiting
7. Sanitize database queries

---

Last updated: January 2024
Version: 1.0