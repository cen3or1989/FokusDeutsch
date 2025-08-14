#!/bin/bash

echo "Starting TELC Exam System..."

# Check if .env files exist
if [ ! -f "telc_exam_backend/.env" ]; then
    echo "Creating backend .env file..."
    cat > telc_exam_backend/.env << EOF
DATABASE_URL=postgresql://username:password@localhost:5432/telc_exam_db
SECRET_KEY=your-secret-key-here
FRONTEND_ORIGIN=http://localhost:5173
PORT=5000
DEBUG=true
EOF
    echo "Please update telc_exam_backend/.env with your actual database credentials!"
fi

if [ ! -f "telc_exam_frontend/.env" ]; then
    echo "Creating frontend .env file..."
    cat > telc_exam_frontend/.env << EOF
VITE_API_URL=http://localhost:5000
EOF
fi

# Start backend
echo "Starting backend server..."
cd telc_exam_backend
# Use system Python with --break-system-packages flag for development
python3 src/main.py &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 3

# Start frontend
echo "Starting frontend server..."
cd telc_exam_frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "Servers started!"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:5000"
echo ""
echo "To stop servers, run: kill $BACKEND_PID $FRONTEND_PID"

# Keep script running
wait