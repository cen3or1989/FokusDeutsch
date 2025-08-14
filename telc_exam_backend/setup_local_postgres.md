# Local PostgreSQL Setup Guide

## 1. Install PostgreSQL

### Windows:
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember the password you set for the 'postgres' user

### Alternative (using Docker):
```bash
docker run --name telc-postgres -e POSTGRES_DB=telc_exam_db -e POSTGRES_USER=telc_user -e POSTGRES_PASSWORD=telc_password -p 5432:5432 -d postgres:15
```

## 2. Create Database and User

Connect to PostgreSQL as the postgres user:
```bash
psql -U postgres
```

Then run these SQL commands:
```sql
-- Create database
CREATE DATABASE telc_exam_db;

-- Create user
CREATE USER telc_user WITH PASSWORD 'telc_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE telc_exam_db TO telc_user;

-- Exit
\q
```

## 3. Set Environment Variable

Set the DATABASE_URL environment variable:

### Windows (PowerShell):
```powershell
$env:DATABASE_URL="postgresql://telc_user:telc_password@localhost:5432/telc_exam_db"
```

### Windows (Command Prompt):
```cmd
set DATABASE_URL=postgresql://telc_user:telc_password@localhost:5432/telc_exam_db
```

### Linux/Mac:
```bash
export DATABASE_URL="postgresql://telc_user:telc_password@localhost:5432/telc_exam_db"
```

## 4. Test Connection

Test the connection:
```bash
psql postgresql://telc_user:telc_password@localhost:5432/telc_exam_db
```

## 5. Run Migrations

Once the database is set up:
```bash
cd telc_exam_backend
flask db upgrade
```

