# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY telc_exam_backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY telc_exam_backend/ ./telc_exam_backend/

# Copy frontend build
COPY telc_exam_frontend/dist/ ./telc_exam_frontend/dist/

# Expose port
EXPOSE 5000

# Set environment variables
ENV FLASK_APP=telc_exam_backend/src/main.py
ENV FLASK_ENV=production

# Run the application
CMD ["python", "telc_exam_backend/src/main.py"]
