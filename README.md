# GreenCare 🌱

GreenCare is a full-stack application designed to help users manage and care for their plants. Built with React (frontend) and Django (backend), deployed on Kubernetes with integrated monitoring.

## 📚 Documentation

This repository is organized into multiple components with comprehensive documentation:

### Core Application

- **[Frontend Documentation](./frontend/README.md)** - React/Vite frontend with TypeScript
- **[Backend Documentation](./backend/README.md)** - Django REST API backend

### Infrastructure & Deployment

- **[Kubernetes Manifests](./k8s/README.md)** - K8s deployment configurations, services, monitoring
- **[Ansible Automation](./ansible/README.md)** - Automated build and deployment playbooks
- **[Grafana Monitoring](./grafana/README.md)** - Dashboard configurations and metrics

### Quick Start Guide

- **[Port Forwarding Script](./start-services.ps1)** - Access services locally
- **[Frontend-Backend Connection](./frontend/README-CONNECTION-FIX.md)** - API proxy configuration

## 🏗️ Project Structure

```
GreenCare/
├── frontend/              # React + Vite + TypeScript frontend
│   ├── src/              # Source code
│   ├── nginx.conf        # Nginx reverse proxy config
│   ├── Dockerfile        # Multi-stage Docker build
│   └── .env*             # Environment configurations
├── backend/              # Django REST API backend
│   ├── authentication/   # User authentication
│   ├── plants/          # Plant management
│   ├── products/        # Product catalog
│   ├── Dockerfile       # Backend Docker image
│   └── requirements.txt # Python dependencies
├── k8s/                 # Kubernetes manifests
│   ├── *-deployment.yaml    # Deployments
│   ├── *-service.yaml       # Services
│   ├── *-configmap.yaml     # ConfigMaps
│   └── README.md           # K8s documentation
├── ansible/             # Infrastructure automation
│   ├── playbooks/      # Ansible playbooks
│   ├── roles/          # Reusable roles
│   └── README.md       # Ansible documentation
├── grafana/            # Monitoring dashboards
│   └── provisioning/   # Grafana configuration
├── prometheus.yml      # Prometheus scrape config
├── docker-compose.yml  # Local development setup
└── start-services.ps1  # Port forwarding helper
```

## 🚀 Quick Start

### Local Development (Docker Compose)

The fastest way to get started:

```bash
# Clone the repository
git clone https://github.com/chadirabii/GreenCare.git
cd GreenCare

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:8080
# Backend:  http://localhost:8000
# Grafana:  http://localhost:3001 (admin/admin)
```

### Kubernetes Deployment (Minikube)

For production-like environment with monitoring:

```bash
# Ensure Minikube is running
minikube start

# Option 1: Full automated deployment
cd ansible
ansible-playbook playbooks/full-deploy.yml

# Option 2: Manual deployment
cd k8s
kubectl apply -f .

# Access services
.\start-services.ps1  # Run from project root
```

Then open:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001

See detailed instructions in:

- [Kubernetes Deployment Guide](./k8s/README.md)
- [Ansible Automation Guide](./ansible/README.md)

## 📋 Prerequisites

### For Local Development

- **Node.js** v18 or higher
- **Python** 3.11 or higher
- **Docker** & Docker Compose
- **Git**
- **Code Editor** (VS Code recommended)

### For Kubernetes Deployment

- **Docker Desktop** with WSL2 (Windows) or Docker (Linux/Mac)
- **Minikube** v1.36+
- **kubectl** (Kubernetes CLI)
- **Ansible** (optional, for automation)
- **PowerShell** or Bash

## 💻 Local Development Setup

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env if needed (default: http://localhost:8000/api)

# Start development server
npm run dev

# Frontend runs on http://localhost:8080
```

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start development server
python manage.py runserver

# Backend runs on http://localhost:8000
```

### Access Django Admin

http://localhost:8000/admin (use superuser credentials)

### Access API Documentation

http://localhost:8000/api/ (Swagger UI)

## 🏭 Production Build

### Frontend Production Build

```bash
cd frontend
npm run build
# Built files in dist/
```

### Docker Build

```bash
# Build backend
docker build -t my-django-app:latest ./backend

# Build frontend
docker build -t my-react-app:latest ./frontend

# Or use docker-compose
docker-compose build
```

## ✨ Features

### Frontend

- ⚛️ **React 18** with TypeScript
- 🎨 **Tailwind CSS** for styling
- 🧩 **Shadcn UI** component library
- 📱 **Responsive Design** - mobile-first approach
- 🔔 **Toast Notifications** system
- 🔐 **JWT Authentication** with auto-refresh
- 🌐 **Axios** for API calls with interceptors
- 🎯 **React Router** for navigation
- 📦 **Vite** for fast development

### Backend

- 🐍 **Django 5.x** REST API
- 🔒 **JWT Authentication** (djangorestframework-simplejwt)
- 📊 **PostgreSQL** database support
- 📈 **Prometheus Metrics** (django-prometheus)
- 🔍 **API Documentation** (drf-yasg Swagger)
- 🌐 **CORS** configured
- 🛡️ **Security** best practices

### Infrastructure

- 🐳 **Docker** & Docker Compose
- ☸️ **Kubernetes** deployments
- 🔧 **Ansible** automation
- 📊 **Prometheus** metrics collection
- 📈 **Grafana** dashboards
- 🔄 **Nginx** reverse proxy
- 🚀 **Multi-stage builds** for optimization

### Monitoring

- 📊 HTTP request/response metrics
- 🗄️ Database query performance
- 💾 Memory & CPU usage
- 🐍 Python runtime statistics
- ⚙️ Custom business metrics
- 🎯 Pre-built Grafana dashboards

## 🛠️ Technology Stack

| Category           | Technologies                                               |
| ------------------ | ---------------------------------------------------------- |
| **Frontend**       | React 18, TypeScript, Vite, Tailwind CSS, Shadcn UI, Axios |
| **Backend**        | Django 5.x, Django REST Framework, Python 3.11+            |
| **Database**       | PostgreSQL (production), SQLite (development)              |
| **Authentication** | JWT (djangorestframework-simplejwt)                        |
| **Monitoring**     | Prometheus, Grafana, django-prometheus                     |
| **Infrastructure** | Docker, Kubernetes, Minikube, Nginx                        |
| **Automation**     | Ansible                                                    |
| **API Docs**       | Swagger (drf-yasg)                                         |

## 🌟 Architecture

### Application Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Browser   │────▶│   Frontend   │────▶│   Backend   │
│             │     │  (React+Nginx)│     │  (Django)   │
└─────────────┘     └──────────────┘     └─────────────┘
                           │                      │
                           │                      │
                    /api/* proxy            /metrics
                           │                      │
                           ▼                      ▼
                    ┌──────────────┐     ┌─────────────┐
                    │   Backend    │────▶│ Prometheus  │
                    │   Service    │     │             │
                    └──────────────┘     └─────────────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │   Grafana   │
                                        │             │
                                        └─────────────┘
```

### Deployment Architecture

```
┌────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────────┐   │
│  │  Frontend  │  │  Backend   │  │   Prometheus   │   │
│  │    Pod     │  │    Pod     │  │      Pod       │   │
│  │  (Nginx)   │  │  (Django)  │  │                │   │
│  └────────────┘  └────────────┘  └────────────────┘   │
│         │               │                  │           │
│  ┌────────────┐  ┌────────────┐  ┌────────────────┐   │
│  │  Frontend  │  │  Backend   │  │   Prometheus   │   │
│  │  Service   │  │  Service   │  │    Service     │   │
│  │  (NodePort)│  │ (NodePort) │  │   (NodePort)   │   │
│  └────────────┘  └────────────┘  └────────────────┘   │
│                                                         │
│  ┌────────────┐  ┌────────────────────────────────┐   │
│  │  Grafana   │  │        ConfigMaps              │   │
│  │    Pod     │  │  • Frontend (nginx.conf)       │   │
│  │            │  │  • Prometheus (scrape config)  │   │
│  └────────────┘  │  • Grafana (datasources)       │   │
│         │        └────────────────────────────────┘   │
│  ┌────────────┐                                        │
│  │  Grafana   │                                        │
│  │  Service   │                                        │
│  │ (NodePort) │                                        │
│  └────────────┘                                        │
└────────────────────────────────────────────────────────┘
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Workflow

1. **Setup**: Follow local development setup above
2. **Code**: Make your changes
3. **Test**: Ensure all tests pass
4. **Lint**: Run linters (frontend: `npm run lint`)
5. **Build**: Test production build
6. **Document**: Update relevant README files
7. **Submit**: Create PR with clear description

## 📖 Additional Resources

- **[Kubernetes Guide](./k8s/README.md)** - Detailed K8s deployment instructions
- **[Ansible Guide](./ansible/README.md)** - Automation and CI/CD setup
- **[Grafana Guide](./grafana/README.md)** - Monitoring and dashboards
- **[Frontend Connection Fix](./frontend/README-CONNECTION-FIX.md)** - API proxy setup
- **[Port Forwarding Script](./start-services.ps1)** - Local access helper


## Authors

- **Chadi RABII** - [GitHub](https://github.com/chadirabii)
- **Chayma JERBI** - [GitHub](https://github.com/chaimaJr)
- **Nour El Houda Khedri** - [GitHub](https://github.com/)
- **Ahlem Ben Mohamed** - [GitHub](https://github.com/)
