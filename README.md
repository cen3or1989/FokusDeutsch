# TELC B2 Exam System

A comprehensive web application for TELC B2 exam preparation and administration, built with React frontend and Flask backend.

## Features

### For Students
- **Complete TELC B2 Exam Simulation**: Full exam experience with all sections
- **Interactive Interface**: Modern, responsive design with smooth navigation
- **Translation Support**: Persian translation for all exam content
- **Real-time Progress Tracking**: Answer sheet with progress indicators
- **Timer Management**: Built-in exam timer with warnings
- **Results Analysis**: Detailed score breakdown and performance review

### For Administrators
- **Exam Management**: Create, edit, and delete exams
- **Content Editor**: Rich text editor for all exam sections
- **Student Results**: View and analyze student performance
- **System Statistics**: Dashboard with usage analytics
- **Secure Access**: Admin authentication with token-based security

## Exam Sections

1. **Leseverstehen (Reading Comprehension)**
   - Teil 1: Headings matching (1-5)
   - Teil 2: Detailed comprehension (6-10)
   - Teil 3: Situation matching (11-20)

2. **Sprachbausteine (Language Elements)**
   - Teil 1: Grammar exercises (21-30)
   - Teil 2: Vocabulary exercises (31-40)

3. **Hörverstehen (Listening Comprehension)**
   - Teil 1: Audio statements (41-45)
   - Teil 2: Audio statements (46-55)
   - Teil 3: Audio statements (56-60)

4. **Schriftlicher Ausdruck (Written Expression)**
   - Task A: Formal letter/email
   - Task B: Opinion essay

## Technology Stack

### Frontend
- **React 18** with modern hooks
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Shadcn UI** components
- **React Router DOM** for navigation
- **FontAwesome** icons

### Backend
- **Flask** web framework
- **SQLAlchemy** ORM
- **SQLite** database
- **Flask-CORS** for cross-origin requests
- **Flask-Migrate** for database migrations

### Key Features
- **Translation API Integration**: Multiple translation services
- **Rate Limiting**: API protection
- **Admin Authentication**: Secure admin panel
- **Responsive Design**: Mobile-friendly interface
- **Dark Mode Support**: Theme switching capability

## Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or pnpm

### Backend Setup
```bash
cd telc_exam_backend
pip install -r requirements.txt
python src/main.py
```

### Frontend Setup
```bash
cd telc_exam_frontend
npm install
npm run dev
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
ADMIN_TOKEN=your_admin_token_here
FLASK_ENV=development
```

## Usage

1. **Start the application**: Both backend (port 5000) and frontend (port 5173)
2. **Access the landing page**: Navigate to the frontend URL
3. **Admin access**: Use the admin token to access the admin panel
4. **Create exams**: Use the admin panel to create and manage exam content
5. **Student access**: Students can take exams through the main interface

## Project Structure

```
├── telc_exam_backend/          # Flask backend
│   ├── src/
│   │   ├── main.py            # Main application entry
│   │   ├── models/            # Database models
│   │   ├── routes/            # API endpoints
│   │   └── security.py        # Authentication & security
│   ├── migrations/            # Database migrations
│   └── requirements.txt       # Python dependencies
├── telc_exam_frontend/        # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── context/           # React context providers
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utility functions
│   │   └── main.jsx           # Application entry
│   └── package.json           # Node.js dependencies
└── README.md                  # This file
```

## API Endpoints

### Exam Management
- `GET /api/exams` - List all exams
- `GET /api/exams/<id>` - Get specific exam
- `POST /api/exams` - Create new exam (admin only)
- `PUT /api/exams/<id>` - Update exam (admin only)
- `DELETE /api/exams/<id>` - Delete exam (admin only)

### Results
- `GET /api/exam-results` - Get exam results
- `POST /api/exam-results` - Submit exam results

### Translation
- `POST /api/translate` - Translate text content

### Admin
- `GET /api/admin/stats` - Get system statistics (admin only)

## Security Features

- **Rate Limiting**: Prevents API abuse
- **Admin Authentication**: Token-based admin access
- **CORS Configuration**: Secure cross-origin requests
- **Input Validation**: Server-side data validation
- **SQL Injection Protection**: ORM-based queries

## Development

### Code Style
- **Frontend**: ESLint configuration for React
- **Backend**: PEP 8 Python style guide
- **Comments**: English comments throughout the codebase

### Database Migrations
```bash
cd telc_exam_backend
flask db migrate -m "Description of changes"
flask db upgrade
```

## Deployment

### Backend (Render.com)
- Python web service
- Environment variables configuration
- PostgreSQL database (recommended for production)

### Frontend (Render.com)
- Node.js static site
- Build command: `npm run build`
- Publish directory: `dist`

## License

This project is for educational purposes. TELC is a registered trademark of telc gGmbH.

## Disclaimer

This application is independent of telc gGmbH and is not officially endorsed or affiliated with the TELC examination system. All content is created for educational purposes only.

