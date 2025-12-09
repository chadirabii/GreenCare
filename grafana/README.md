# Grafana Monitoring Configuration

This directory contains Grafana provisioning configurations for monitoring the GreenCare application.

## 📁 Structure

```
grafana/
└── provisioning/
    ├── dashboards/
    │   ├── dashboard.yml           # Dashboard provider configuration
    │   └── django-dashboard.json   # Django metrics dashboard
    └── datasources/
        └── prometheus.yml          # Prometheus datasource configuration
```

## 🎯 Purpose

Grafana is used to visualize metrics collected by Prometheus from the Django backend application. This provides real-time insights into:

- **Application Performance**: Request rates, response times, error rates
- **Database Metrics**: Query performance, connection pool stats
- **System Metrics**: CPU usage, memory usage, Python runtime stats
- **Business Metrics**: Custom application-specific metrics

## 📊 Components

### 1. Datasource Configuration (`datasources/prometheus.yml`)

Configures Prometheus as the default datasource for Grafana.

```yaml
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus-service:9090 # Kubernetes service name
    isDefault: true
    editable: true
    jsonData:
      timeInterval: "5s"
```

**Key Settings:**

- `access: proxy` - Grafana server proxies requests to Prometheus
- `url` - Points to Prometheus service in Kubernetes
- `timeInterval: "5s"` - Default scrape interval

### 2. Dashboard Provider (`dashboards/dashboard.yml`)

Configures where Grafana should look for dashboard JSON files.

```yaml
apiVersion: 1
providers:
  - name: "default"
    orgId: 1
    folder: ""
    type: file
    disableDeletion: false
    editable: true
    options:
      path: /var/lib/grafana/dashboards
```

### 3. Django Dashboard (`dashboards/django-dashboard.json`)

Pre-configured dashboard with panels for Django application monitoring.

**Dashboard Panels Include:**

- HTTP Request Rate
- HTTP Response Time (p50, p95, p99)
- HTTP Error Rate
- Database Query Time
- Active Requests
- Python Memory Usage
- And more...

## 🚀 Deployment

### Docker Compose (Local Development)

Grafana is automatically configured when using docker-compose:

```bash
docker-compose up -d grafana
```

Access: http://localhost:3001

- Username: `admin`
- Password: `admin`

### Kubernetes Deployment

Grafana is deployed with the monitoring stack:

```bash
# Deploy Grafana with ConfigMaps
kubectl apply -f k8s/grafana-configmap.yaml
kubectl apply -f k8s/grafana-deployment.yaml
kubectl apply -f k8s/grafana-service.yaml

# Check status
kubectl get pods -l app=grafana
```

Access via port-forward:

```bash
kubectl port-forward svc/grafana-service 3001:3000

# Or use the helper script
.\start-services.ps1
```

Then open: http://localhost:3001

## 🔐 Default Credentials

**Username**: `admin`  
**Password**: `admin`

⚠️ **Important**: Change the default password in production!

## 📈 Using Grafana

### First Time Setup

1. **Login** with default credentials (admin/admin)
2. **Navigate to Dashboards** → Browse
3. **Open "Django Application Metrics"** dashboard
4. **Explore the panels** to see your application metrics

### Creating Custom Dashboards

1. Click **"+"** → **Dashboard**
2. Click **Add Panel**
3. Select **Prometheus** as datasource
4. Write PromQL query (examples below)
5. Configure visualization
6. Save dashboard

### Example PromQL Queries

**HTTP Request Rate:**

```promql
rate(django_http_requests_total_by_method_total[5m])
```

**Response Time (95th percentile):**

```promql
histogram_quantile(0.95, rate(django_http_requests_latency_seconds_by_view_method_bucket[5m]))
```

**Error Rate:**

```promql
rate(django_http_requests_total_by_method_total{status=~"5.."}[5m])
```

**Database Query Time:**

```promql
rate(django_db_query_duration_seconds_sum[5m]) / rate(django_db_query_duration_seconds_count[5m])
```

**Active Requests:**

```promql
django_http_requests_total_by_transport_total
```

## 🎨 Dashboard Features

### Pre-configured Dashboard Includes:

1. **Overview Section**

   - Total requests per second
   - Average response time
   - Error rate percentage
   - Active connections

2. **HTTP Metrics**

   - Request rate by method (GET, POST, etc.)
   - Response time percentiles
   - Status code distribution
   - Requests by endpoint

3. **Database Metrics**

   - Query execution time
   - Number of queries
   - Database connections
   - Slow query detection

4. **System Metrics**

   - Python memory usage
   - CPU usage
   - Thread count
   - Garbage collection stats

5. **Custom Business Metrics**
   - User registrations
   - API usage patterns
   - Feature-specific metrics

## 🔧 Configuration in Kubernetes

The Grafana deployment uses ConfigMaps to inject configuration:

```yaml
# grafana-configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana-datasources
data:
  prometheus.yml: |
    # Datasource configuration
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana-dashboards-config
data:
  dashboard.yml: |
    # Dashboard provider configuration
```

These are mounted into the Grafana pod at:

- `/etc/grafana/provisioning/datasources/`
- `/etc/grafana/provisioning/dashboards/`

## 📊 Adding Custom Dashboards

### Method 1: Via Grafana UI

1. Create dashboard in Grafana UI
2. Click **Share** → **Export**
3. Save JSON to `grafana/provisioning/dashboards/`
4. Rebuild/restart Grafana container

### Method 2: Import from Grafana.com

1. Browse dashboards at https://grafana.com/grafana/dashboards/
2. Find a Django dashboard (e.g., ID: 9528)
3. In Grafana: **Dashboards** → **Import**
4. Enter dashboard ID or upload JSON
5. Select Prometheus datasource
6. Import

### Method 3: ConfigMap (Kubernetes)

1. Add dashboard JSON to ConfigMap:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana-dashboards
data:
  my-dashboard.json: |
    {
      "dashboard": { ... }
    }
```

2. Mount ConfigMap in deployment
3. Restart Grafana pod

## 🔍 Monitoring Best Practices

1. **Set Up Alerts**

   - Configure alert rules in dashboard panels
   - Set up notification channels (email, Slack, etc.)

2. **Use Variables**

   - Add dashboard variables for filtering (namespace, pod, etc.)
   - Makes dashboards more reusable

3. **Organize Dashboards**

   - Group related panels
   - Use rows to organize sections
   - Add helpful descriptions

4. **Performance**

   - Use appropriate time ranges
   - Avoid too many panels on one dashboard
   - Use query caching when possible

5. **Regular Review**
   - Review dashboards weekly
   - Remove unused panels
   - Update queries as application changes

## 🛠️ Troubleshooting

### Grafana Not Starting

```bash
# Check pod logs
kubectl logs -l app=grafana --tail=50

# Check pod status
kubectl describe pod -l app=grafana
```

### No Data in Dashboard

1. **Check Prometheus is running:**

   ```bash
   kubectl get pods -l app=prometheus
   ```

2. **Verify datasource connection:**

   - Grafana → Configuration → Data Sources → Prometheus
   - Click "Test" button

3. **Check Prometheus is scraping backend:**
   - Open Prometheus UI: http://localhost:9090
   - Status → Targets
   - Ensure `backend-service` target is UP

### Dashboard Not Loading

1. **Check ConfigMap:**

   ```bash
   kubectl describe cm grafana-dashboards-config
   ```

2. **Verify mount in pod:**

   ```bash
   kubectl exec -it <grafana-pod> -- ls -la /etc/grafana/provisioning/dashboards/
   ```

3. **Check Grafana logs:**
   ```bash
   kubectl logs -l app=grafana | grep -i dashboard
   ```

### Can't Login

1. Check environment variables in deployment:

   ```bash
   kubectl describe deployment grafana-deployment
   ```

2. Default credentials are set in `grafana-deployment.yaml`:

   - `GF_SECURITY_ADMIN_USER=admin`
   - `GF_SECURITY_ADMIN_PASSWORD=admin`

3. Reset admin password:
   ```bash
   kubectl exec -it <grafana-pod> -- grafana-cli admin reset-admin-password newpassword
   ```

## 📚 Learn More

- [Grafana Documentation](https://grafana.com/docs/grafana/latest/)
- [PromQL Query Language](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Django Prometheus Metrics](https://github.com/korfuri/django-prometheus)
- [Grafana Dashboard Best Practices](https://grafana.com/docs/grafana/latest/best-practices/best-practices-for-creating-dashboards/)

## 🔗 Related

- See [k8s/README.md](../k8s/README.md) for Kubernetes deployment details
- See [Prometheus configuration](../k8s/prometheus-configmap.yaml) for metrics collection
- See [Backend metrics endpoint](../backend/README.md) for available metrics

## 💡 Tips

- Use dashboard templates from grafana.com to get started quickly
- Set up alerts for critical metrics (error rate > 5%, response time > 500ms, etc.)
- Use dashboard snapshots to share metrics with team members
- Export dashboards regularly as backup
- Use time range variables for flexible time-based analysis
