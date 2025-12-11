# Fairness Audit - Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Database Setup](#database-setup)
5. [Running the Application](#running-the-application)
6. [Production Deployment](#production-deployment)
7. [Monitoring](#monitoring)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements
- **Python**: 3.9 or higher
- **Node.js**: 18 or higher
- **Database**: PostgreSQL 13+ (or SQLite for development)
- **Memory**: Minimum 4GB RAM (8GB+ recommended for SHAP)
- **Storage**: 10GB+ for datasets and models

### Required Accounts
- **Google Cloud**: For Gemini AI recommendations (optional)
- **Database**: PostgreSQL instance or cloud database

---

## Installation

### Backend Setup

1. **Clone Repository**
```bash
git clone https://github.com/your-org/audit-iq.git
cd audit-iq/backend
```

2. **Create Virtual Environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install Dependencies**
```bash
pip install -r requirements.txt
```

**Key Dependencies**:
```
fastapi==0.104.1
uvicorn==0.24.0
sqlalchemy==2.0.23
fairlearn==0.10.0
scikit-learn==1.3.2
shap==0.43.0
google-generativeai==0.3.1
pandas==2.1.3
numpy==1.26.2
matplotlib==3.8.2
seaborn==0.13.0
plotly==5.18.0
```

### Frontend Setup

1. **Navigate to Frontend**
```bash
cd ../  # Back to root
```

2. **Install Dependencies**
```bash
pnpm install
# or
npm install
```

---

## Configuration

### Environment Variables

Create `.env` file in backend directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/auditiq
# For SQLite (development):
# DATABASE_URL=sqlite:///./auditiq.db

# Security
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI Recommendations (Optional)
GEMINI_API_KEY=your-gemini-api-key

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com

# File Upload
MAX_UPLOAD_SIZE=100000000  # 100MB
UPLOAD_DIR=./uploads

# Fairness Settings
FAIRNESS_THRESHOLD=0.1  # Demographic parity threshold
MIN_GROUP_SIZE=30  # Minimum samples per group
SHAP_SAMPLE_SIZE=100  # Default SHAP sample size
```

Create `.env.local` in frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=AuditIQ
```

### Configuration Files

**Backend: `config.py`**
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    secret_key: str
    gemini_api_key: str = None
    fairness_threshold: float = 0.1
    min_group_size: int = 30
    shap_sample_size: int = 100
    
    class Config:
        env_file = ".env"

settings = Settings()
```

---

## Database Setup

### PostgreSQL (Production)

1. **Create Database**
```sql
CREATE DATABASE auditiq;
CREATE USER auditiq_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE auditiq TO auditiq_user;
```

2. **Run Migrations**
```bash
cd backend
alembic upgrade head
```

### SQLite (Development)

```bash
# Migrations will auto-create SQLite database
python main.py
```

### Database Migrations

**Create New Migration**:
```bash
alembic revision --autogenerate -m "description"
```

**Apply Migrations**:
```bash
alembic upgrade head
```

**Rollback**:
```bash
alembic downgrade -1
```

---

## Running the Application

### Development Mode

**Backend**:
```bash
cd backend
python main.py
# Server runs on http://localhost:8000
```

**Frontend**:
```bash
pnpm run dev
# App runs on http://localhost:3000
```

### Production Mode

**Backend with Gunicorn**:
```bash
gunicorn audit_iq_backend:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --timeout 120 \
  --access-logfile - \
  --error-logfile -
```

**Frontend Build**:
```bash
pnpm run build
pnpm run start
```

---

## Production Deployment

### Docker Deployment

**Dockerfile (Backend)**:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["gunicorn", "audit_iq_backend:app", \
     "--workers", "4", \
     "--worker-class", "uvicorn.workers.UvicornWorker", \
     "--bind", "0.0.0.0:8000"]
```

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: auditiq
      POSTGRES_USER: auditiq_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://auditiq_user:${DB_PASSWORD}@db:5432/auditiq
      SECRET_KEY: ${SECRET_KEY}
      GEMINI_API_KEY: ${GEMINI_API_KEY}
    ports:
      - "8000:8000"
    depends_on:
      - db
    volumes:
      - ./uploads:/app/uploads

  frontend:
    build: .
    environment:
      NEXT_PUBLIC_API_URL: http://backend:8000
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

**Build and Run**:
```bash
docker-compose up -d
```

### Cloud Deployment

#### Render.com

**Backend**:
1. Create new Web Service
2. Connect GitHub repository
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `gunicorn audit_iq_backend:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT`
5. Add environment variables

**Frontend**:
1. Create new Static Site
2. Build Command: `pnpm run build`
3. Publish Directory: `out`

#### Cloudflare Pages (Frontend)

```bash
pnpm run pages:build
pnpm run pages:deploy
```

#### AWS Deployment

**Backend (EC2)**:
```bash
# Install dependencies
sudo apt update
sudo apt install python3.11 python3-pip nginx

# Clone and setup
git clone https://github.com/your-org/audit-iq.git
cd audit-iq/backend
pip install -r requirements.txt

# Setup systemd service
sudo nano /etc/systemd/system/auditiq.service
```

**auditiq.service**:
```ini
[Unit]
Description=AuditIQ Backend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/audit-iq/backend
Environment="PATH=/home/ubuntu/audit-iq/backend/venv/bin"
ExecStart=/home/ubuntu/audit-iq/backend/venv/bin/gunicorn audit_iq_backend:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

[Install]
WantedBy=multi-user.target
```

**Nginx Configuration**:
```nginx
server {
    listen 80;
    server_name api.auditiq.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Monitoring

### Health Checks

**Backend Health Endpoint**:
```python
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0",
        "database": "connected",
        "fairlearn": "available"
    }
```

**Monitor**:
```bash
curl http://localhost:8000/health
```

### Logging

**Backend Logging**:
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('auditiq.log'),
        logging.StreamHandler()
    ]
)
```

**Key Metrics to Monitor**:
- API response times
- Audit completion rates
- SHAP calculation times
- Database query performance
- Memory usage (especially for SHAP)
- Error rates

### Performance Optimization

**SHAP Optimization**:
```python
# Use sampling for large datasets
if len(X) > 1000:
    X_sample = X.sample(n=100, random_state=42)
else:
    X_sample = X
```

**Caching**:
```python
from functools import lru_cache

@lru_cache(maxsize=100)
def get_shap_explainer(model_id):
    # Cache SHAP explainers
    return shap.Explainer(model)
```

---

## Troubleshooting

### Common Issues

**1. SHAP Installation Fails**
```bash
# Install build dependencies
sudo apt-get install build-essential
pip install shap --no-cache-dir
```

**2. Database Connection Errors**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -h localhost -U auditiq_user -d auditiq
```

**3. Gemini API Errors**
```bash
# Verify API key
echo $GEMINI_API_KEY

# Test API
python -c "import google.generativeai as genai; genai.configure(api_key='YOUR_KEY'); print('OK')"
```

**4. Memory Issues with SHAP**
- Reduce `SHAP_SAMPLE_SIZE` in environment
- Use `method='coefficients'` for linear models
- Increase server memory

**5. Slow Counterfactual Generation**
- Reduce `max_iterations` parameter
- Limit `max_changes` to 2-3
- Use simpler models

### Debug Mode

**Enable Debug Logging**:
```python
# main.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

**FastAPI Debug**:
```python
app = FastAPI(debug=True)
```

---

## Security Checklist

- [ ] Change default `SECRET_KEY`
- [ ] Use HTTPS in production
- [ ] Set strong database passwords
- [ ] Enable CORS only for trusted domains
- [ ] Implement rate limiting
- [ ] Regular security updates
- [ ] Backup database regularly
- [ ] Monitor for suspicious activity
- [ ] Use environment variables for secrets
- [ ] Enable database encryption at rest

---

## Backup and Recovery

### Database Backup

**PostgreSQL**:
```bash
# Backup
pg_dump -U auditiq_user auditiq > backup_$(date +%Y%m%d).sql

# Restore
psql -U auditiq_user auditiq < backup_20241210.sql
```

**Automated Backups**:
```bash
# Cron job (daily at 2 AM)
0 2 * * * /usr/bin/pg_dump -U auditiq_user auditiq > /backups/auditiq_$(date +\%Y\%m\%d).sql
```

---

## Scaling

### Horizontal Scaling

**Load Balancer Configuration**:
```nginx
upstream backend {
    server backend1:8000;
    server backend2:8000;
    server backend3:8000;
}

server {
    location / {
        proxy_pass http://backend;
    }
}
```

### Vertical Scaling

**Recommended Resources**:
- **Small** (< 1000 audits/month): 2 CPU, 4GB RAM
- **Medium** (< 10000 audits/month): 4 CPU, 8GB RAM
- **Large** (> 10000 audits/month): 8 CPU, 16GB RAM

---

## Support

For deployment assistance:
- **Documentation**: Full docs at `/docs`
- **GitHub Issues**: Technical problems
- **Email**: devops@auditiq.com

---

**Last Updated**: December 2024
**Version**: 1.0.0
