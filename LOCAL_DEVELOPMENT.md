# Local Development Setup

This setup allows you to run the backend locally while using PostgreSQL in Docker.

## Prerequisites

1. **Python 3.11+** installed
2. **Docker** and **Docker Compose** installed
3. **Node.js** (for frontend)

## Quick Start

### Option 1: Using the provided scripts

**Windows:**
```bash
start_local_dev.bat
```

**Linux/Mac:**
```bash
chmod +x start_local_dev.sh
./start_local_dev.sh
```

### Option 2: Manual setup

1. **Start PostgreSQL in Docker:**
   ```bash
   docker-compose up -d postgres
   ```

2. **Install Python dependencies:**
   ```bash
   cd telc_exam_backend
   pip install -r requirements.txt
   ```

3. **Run database migrations:**
   ```bash
   cd telc_exam_backend
   flask db upgrade
   ```

4. **Start the backend locally:**
   ```bash
   cd telc_exam_backend
   python run_local.py
   ```

5. **Start the frontend:**
   ```bash
   cd telc_exam_frontend
   npm install
   npm run dev
   ```

## Configuration

The backend will automatically connect to the Docker PostgreSQL using these settings:
- **Host:** localhost:5432
- **Database:** telc_exam_db
- **Username:** telc_user
- **Password:** telc_password

You can modify these settings in `telc_exam_backend/env.local` if needed.

## URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Database:** localhost:5432

## Troubleshooting

### Database Connection Issues

1. Make sure PostgreSQL is running:
   ```bash
   docker-compose ps
   ```

2. Check database logs:
   ```bash
   docker-compose logs postgres
   ```

3. Test connection:
   ```bash
   docker exec -it telc_exam_postgres psql -U telc_user -d telc_exam_db
   ```

### Backend Issues

1. Check if all dependencies are installed:
   ```bash
   cd telc_exam_backend
   pip list
   ```

2. Verify environment variables:
   ```bash
   cd telc_exam_backend
   python -c "import os; print('DATABASE_URL:', os.getenv('DATABASE_URL'))"
   ```

### Frontend Issues

1. Make sure the backend is running on port 5000
2. Check browser console for CORS errors
3. Verify API_BASE_URL in `src/lib/api.js`

## Stopping the Environment

```bash
# Stop PostgreSQL
docker-compose down

# Stop backend (Ctrl+C in the terminal where it's running)
# Stop frontend (Ctrl+C in the terminal where it's running)
```
