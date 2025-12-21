# Ansible Automation for GreenCare

This directory contains Ansible playbooks and roles to automate the build and deployment of the GreenCare application to Kubernetes (Minikube).

## 📁 Structure

```
ansible/
├── ansible.cfg           # Ansible configuration
├── inventory.ini         # Inventory file (localhost)
├── group_vars/
│   └── local.yml        # Variables for local deployment
├── playbooks/           # Ansible playbooks
│   ├── build-images.yml # Build Docker images
│   ├── load-images.yml  # Load images to Minikube
│   ├── k8s-deploy.yml   # Deploy to Kubernetes
│   └── full-deploy.yml  # Complete pipeline
└── roles/               # Ansible roles
    ├── build-images/    # Build Docker images role
    ├── load-images/     # Load images to Minikube role
    └── k8s-deploy/      # Deploy to Kubernetes role
```

## 🚀 Quick Start

### Prerequisites

- Docker installed and running
- Minikube installed and running
- Kubectl installed and configured
- Ansible installed (Python 3.11+)

**Note**: Ansible has compatibility issues on Windows. Use PowerShell to run Docker commands directly or use WSL2 with a proper Linux distribution (Ubuntu).

### Install Ansible (if needed)

**Linux/Mac:**

```bash
pip install ansible docker
```

**Windows (Limited Support):**

```powershell
pip install ansible docker pywinrm
```

## 📝 Available Playbooks

### 1. Full Deployment Pipeline (Recommended)

Runs all steps in sequence: build → load → deploy.

```bash
cd ansible
ansible-playbook playbooks/full-deploy.yml
```

**What it does:**

1. Builds Docker images for backend and frontend
2. Loads images into Minikube
3. Deploys all manifests to Kubernetes
4. Displays access information

### 2. Build Docker Images

Builds both backend (Django) and frontend (React) Docker images.

```bash
ansible-playbook playbooks/build-images.yml
```

### 3. Load Images to Minikube

Loads the built images into Minikube's Docker daemon.

```bash
ansible-playbook playbooks/load-images.yml
```

### 4. Deploy to Kubernetes

Deploys all Kubernetes manifests to the cluster.

```bash
ansible-playbook playbooks/k8s-deploy.yml
```

## ⚙️ Configuration

Variables are defined in `group_vars/local.yml`:

```yaml
# Image configuration
backend_image_name: my-django-app
frontend_image_name: my-react-app
image_tag: latest

# Minikube configuration
minikube_profile: minikube
k8s_namespace: default

# Deployments to manage
project_deployments:
  - backend-deployment
  - frontend-deployment
  - prometheus-deployment
  - grafana-deployment
```

## 🛠️ Manual Alternative (Windows)

Since Ansible has issues on Windows, use these Docker commands directly:

### Build Images in Minikube

```powershell
# Set Minikube Docker environment
& minikube -p minikube docker-env --shell powershell | Invoke-Expression

# Build backend
docker build -t my-django-app:latest ./backend

# Build frontend
docker build -t my-react-app:latest --build-arg VITE_API_URL=/api ./frontend
```

### Deploy to Kubernetes

```powershell
kubectl apply -f ./k8s/
```

## 📖 Learn More

- [Ansible Documentation](https://docs.ansible.com/)
- [Kubernetes Guide](../k8s/README.md)
- [Grafana Configuration](../grafana/README.md)
