# Kubernetes Deployment for GreenCare

This directory contains Kubernetes manifests for deploying the GreenCare application with integrated monitoring (Prometheus & Grafana) on Minikube.

## 📁 Manifest Files

### Application Components

- `backend-deployment.yaml` - Django backend deployment (with Prometheus annotations)
- `backend-service.yaml` - Backend NodePort service (port 30001)
- `frontend-deployment.yaml` - React frontend deployment
- `frontend-service.yaml` - Frontend NodePort service (port 30000)
- `frontend-ingress.yaml` - Ingress configuration for frontend

### Monitoring Stack

- `prometheus-configmap.yaml` - Prometheus configuration with scrape targets
- `prometheus-deployment.yaml` - Prometheus server deployment
- `prometheus-service.yaml` - Prometheus NodePort service (port 30090)
- `prometheus-rbac.yaml` - ServiceAccount and RBAC for Prometheus
- `grafana-configmap.yaml` - Grafana datasources and dashboard provisioning
- `grafana-deployment.yaml` - Grafana visualization deployment
- `grafana-service.yaml` - Grafana NodePort service (port 30030)

## 🚀 Deployment

### Option 1: Using Ansible (Recommended)

```bash
cd ansible
ansible-playbook playbooks/full-deploy.yml
```

This will:

1. Build Docker images for backend and frontend
2. Load images into Minikube
3. Deploy all manifests including monitoring stack

### Option 2: Manual kubectl

```bash
# Apply RBAC for Prometheus
kubectl apply -f k8s/prometheus-rbac.yaml

# Apply ConfigMaps
kubectl apply -f k8s/prometheus-configmap.yaml
kubectl apply -f k8s/grafana-configmap.yaml

# Deploy applications
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml

# Deploy monitoring
kubectl apply -f k8s/prometheus-deployment.yaml
kubectl apply -f k8s/prometheus-service.yaml
kubectl apply -f k8s/grafana-deployment.yaml
kubectl apply -f k8s/grafana-service.yaml
```

## 🔍 Accessing Services

### Using Minikube Service Command

```bash
# Backend
minikube service backend-service

# Frontend
minikube service frontend-service

# Prometheus
minikube service prometheus-service

# Grafana
minikube service grafana-service
```

### Using NodePort (Direct Access)

If Minikube is running on your local machine:

- **Backend**: http://localhost:30001
- **Frontend**: http://localhost:30000
- **Prometheus**: http://localhost:30090
- **Grafana**: http://localhost:30030

Get Minikube IP:

```bash
minikube ip
```

Then access: `http://<minikube-ip>:<nodeport>`

## 📊 Monitoring Configuration

### Prometheus Scrape Targets

1. **Prometheus self-monitoring** - `localhost:9090`
2. **Django Backend** - `backend-service:8000/metrics`
3. **Kubernetes API Server** - Auto-discovery
4. **Kubernetes Pods** - Auto-discovery (pods with `prometheus.io/scrape: "true"` annotation)

### Grafana Access

- **URL**: http://localhost:30030 (or via minikube service)
- **Username**: `admin`
- **Password**: `admin`
- **Default Datasource**: Prometheus (pre-configured)

### Backend Metrics

The Django backend exposes metrics at `/metrics` endpoint using `django-prometheus`:

- HTTP request counts and latencies
- Database query metrics
- Python runtime metrics
- Custom application metrics

## 🔗 Frontend-Backend Communication

The frontend communicates with the backend through an **nginx reverse proxy**:

```
Browser → Frontend (nginx) → /api/* → Backend Service
         (localhost:3000)   (proxy)   (backend-service:8000)
```

### How It Works

1. **Browser loads frontend** from http://localhost:3000
2. **JavaScript makes API call** to `/api/auth/login` (relative path)
3. **Nginx intercepts** and proxies to `http://backend-service:8000/api/auth/login`
4. **Backend responds** through the proxy back to browser
5. **No CORS issues** - same origin from browser perspective

### Configuration

**Frontend ConfigMap** (`frontend-configmap.yaml`):
```nginx
location /api/ {
    proxy_pass http://backend-service:8000/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    # ... more headers
}
```

**Frontend Deployment** mounts this configuration:
```yaml
volumeMounts:
  - name: nginx-config
    mountPath: /etc/nginx/conf.d/default.conf
    subPath: nginx.conf
```

### Benefits
- ✅ No CORS configuration needed
- ✅ Works with port-forwarding and service mesh
- ✅ No hardcoded backend URLs in frontend
- ✅ Easy to change backend location via ConfigMap
- ✅ Better security (backend not directly exposed)

For more details, see `frontend/README-CONNECTION-FIX.md`

## 🛠️ Troubleshooting

### Check Pod Status

```bash
kubectl get pods
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

### Check Services

```bash
kubectl get svc
kubectl describe svc <service-name>
```

### Test Backend Metrics

```bash
# Port-forward to backend
kubectl port-forward svc/backend-service 8000:8000

# Access metrics
curl http://localhost:8000/metrics
```

### Test Prometheus Targets

```bash
# Access Prometheus UI
minikube service prometheus-service

# Check targets at: http://prometheus-url/targets
```

### Verify Grafana Datasource

```bash
# Access Grafana
minikube service grafana-service

# Login and check: Configuration -> Data Sources -> Prometheus
```

## 📝 Notes

### Resource Limits

- Prometheus: 256Mi-512Mi RAM, 100m-500m CPU
- Grafana: 128Mi-256Mi RAM, 100m-200m CPU
- Adjust based on your monitoring needs

### Data Persistence

Current setup uses `emptyDir` volumes (data lost on pod restart). For production:

- Use PersistentVolumes for Prometheus storage
- Use PersistentVolumes for Grafana dashboards/settings

### RBAC Permissions

Prometheus requires cluster-wide read permissions for Kubernetes service discovery:

- ServiceAccount: `prometheus`
- ClusterRole: Read access to nodes, services, endpoints, pods
- ClusterRoleBinding: Binds role to service account

## 🔄 Updates & Maintenance

### Update Prometheus Configuration

```bash
kubectl edit configmap prometheus-config
kubectl rollout restart deployment/prometheus-deployment
```

### Update Grafana Datasources

```bash
kubectl edit configmap grafana-datasources
kubectl rollout restart deployment/grafana-deployment
```

### Scale Deployments

```bash
kubectl scale deployment/backend-deployment --replicas=3
kubectl scale deployment/prometheus-deployment --replicas=1  # Keep at 1
```

## 🌟 Next Steps

1. Import Django dashboard into Grafana (from grafana/provisioning/dashboards/)
2. Set up alerting rules in Prometheus
3. Configure persistent storage for production
4. Add more custom metrics to your Django application
5. Create custom Grafana dashboards for your business metrics
