---
title: Zero Downtime Deployment
description: Deploy without service interruption
---

Deploy new versions of your application without taking your service offline.

## Strategies

### 1. Blue-Green Deployment

Run two identical production environments:

```
┌─────────────┐     ┌─────────────┐
│   Blue      │     │   Green     │
│  (Active)   │     │  (Standby)  │
└──────┬──────┘     └──────┬──────┘
       │                   │
       └────┬──────────┬───┘
            │ Switch   │
       ┌────▼──────────▼────┐
       │   Load Balancer    │
       └────────────────────┘
```

**Steps:**

1. Deploy to Green (standby) environment
2. Test Green environment
3. Switch load balancer to Green
4. Blue becomes new standby

**Pros:**
- Instant rollback (switch back)
- Full testing before switch
- Zero downtime

**Cons:**
- Requires double infrastructure
- Database migrations need care

### 2. Rolling Deployment

Update servers one at a time:

```
Server 1: v1 → v2 ✓
Server 2: v1 → v2 ✓
Server 3: v1 → v2 ✓
Server 4: v1 → v2 ✓
```

**Steps:**

1. Remove one server from load balancer
2. Deploy new version
3. Add back to load balancer
4. Repeat for each server

**Pros:**
- No extra infrastructure needed
- Gradual rollout

**Cons:**
- Mixed versions running simultaneously
- Slower deployment

### 3. Canary Deployment

Route small percentage to new version:

```
┌──────────────────┐
│ v1 (95% traffic) │
└──────────────────┘
┌──────────────────┐
│ v2 (5% traffic)  │
└──────────────────┘
```

**Steps:**

1. Deploy v2 to subset of servers
2. Route 5% of traffic to v2
3. Monitor metrics
4. Gradually increase if healthy
5. Full rollout when confident

**Pros:**
- Minimal risk
- Real-world testing
- Easy rollback

**Cons:**
- Complex routing logic
- Requires good monitoring

## Implementation

### Blue-Green with Load Balancer

Nginx upstream configuration:

```nginx
upstream backend_blue {
    server blue1.example.com:9000;
    server blue2.example.com:9000;
}

upstream backend_green {
    server green1.example.com:9000;
    server green2.example.com:9000;
}

upstream backend {
    server backend_blue;
    # Switch to backend_green when deploying
}

server {
    location / {
        proxy_pass http://backend;
    }
}
```

### Rolling Deployment Script

```bash
#!/bin/bash
set -e

SERVERS=("server1" "server2" "server3" "server4")

for server in "${SERVERS[@]}"; do
    echo "Deploying to $server..."

    # Remove from load balancer
    curl -X POST "http://lb.example.com/api/servers/$server/disable"

    # Wait for connections to drain
    sleep 30

    # Deploy
    ssh $server << 'EOF'
        cd /var/www/app
        git pull origin main
        composer install --no-dev --optimize-autoloader --classmap-authoritative
        php vendor/bin/glueful migrate:run
        # Refresh CLI command manifest (a stale manifest referencing a removed command —
        # e.g. queue:autoscale after dropping glueful/queue-ops — breaks CLI boot).
        php vendor/bin/glueful commands:cache --clear
        sudo supervisorctl restart glueful-worker:*
EOF

    # Add back to load balancer
    curl -X POST "http://lb.example.com/api/servers/$server/enable"

    # Monitor for issues
    sleep 10

    echo "$server deployed successfully"
done

echo "Deployment complete!"
```

Note: Run a single scheduler instance in production (e.g., one host or a dedicated service) using `php vendor/bin/glueful queue:scheduler work` to avoid duplicate job execution.

### Canary with Docker Compose

```yaml
version: '3.8'

services:
  app-v1:
    image: myapp:v1
    deploy:
      replicas: 19  # 95% traffic
      labels:
        - "traefik.http.services.app-v1.loadbalancer.server.weight=95"

  app-v2:
    image: myapp:v2
    deploy:
      replicas: 1  # 5% traffic
      labels:
        - "traefik.http.services.app-v2.loadbalancer.server.weight=5"
```

## Database Migrations

### Compatible Migrations

Make migrations backward compatible:

```php
// ✅ Good - backward compatible
public function up(SchemaBuilderInterface $schema): void
{
    // Add column as nullable
    $schema->table('users', function ($table) {
        $table->string('phone')->nullable();
    });
}

// Deploy code that uses phone (optional)
// Later migration: make not nullable if needed
```

```php
// ❌ Bad - breaking change
public function up(SchemaBuilderInterface $schema): void
{
    $schema->table('users', function ($table) {
        $table->dropColumn('email'); // Breaking!
    });
}
```

### Multi-Phase Migrations

**Phase 1: Add new column**
```php
$schema->table('users', function ($table) {
    $table->string('email_new')->nullable();
});
```

**Deploy code that writes to both columns**

**Phase 2: Backfill data**
```php
db($context)->table('users')->update([
    'email_new' => db($context)->raw('email')
]);
```

**Phase 3: Switch reads to new column**

**Deploy code that reads from email_new**

**Phase 4: Drop old column**
```php
$schema->table('users', function ($table) {
    $table->dropColumn('email');
    $table->renameColumn('email_new', 'email');
});
```

## Health Checks

Use Glueful's built-in endpoints (no custom routes required):

- Liveness: `GET /healthz`
- Overall health: `GET /health`
- Readiness: `GET /ready` (IP allowlist)



### Load Balancer Configuration

```nginx
upstream backend {
    server app1.example.com:80 max_fails=3 fail_timeout=30s;
    server app2.example.com:80 max_fails=3 fail_timeout=30s;
}

server {
    location / {
        proxy_pass http://backend;
        proxy_next_upstream error timeout invalid_header http_500 http_502 http_503;
        proxy_connect_timeout 2s;
        proxy_read_timeout 60s;
    }

    location /healthz {
        proxy_pass http://backend/healthz;
        access_log off;
    }
}
```

### Kubernetes Probes

Configure liveness and readiness probes to route traffic only to healthy, ready pods:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: glueful-app
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: app
        image: your-registry/glueful:latest
        ports:
        - containerPort: 80
        livenessProbe:
          httpGet:
            path: /healthz
            port: 80
          initialDelaySeconds: 10
          periodSeconds: 15
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /ready
            port: 80
          initialDelaySeconds: 10
          periodSeconds: 10
          timeoutSeconds: 3
          failureThreshold: 3
```

### Kubernetes Apply

Apply the ConfigMap and workload manifests, then watch rollout and verify health:

```bash
# Apply Nginx config (if using the sidecar pattern)
kubectl apply -f k8s/nginx-configmap.yaml

# Apply Deployment (and Service if included in the file)
kubectl apply -f k8s/deployment.yaml

# Wait for rollout
kubectl rollout status deployment/glueful-app

# Watch pods
kubectl get pods -l app=glueful -w

# Optional: quick local check via port-forward
kubectl port-forward svc/glueful-service 8080:80 &
curl -fsS http://localhost:8080/healthz && echo OK
```

## Connection Draining

Wait for active connections before restarting:

```bash
#!/bin/bash

# Send graceful shutdown signal
kill -QUIT $(cat /var/run/php-fpm.pid)

# Wait for connections to finish
TIMEOUT=30
ELAPSED=0

while [ $ELAPSED -lt $TIMEOUT ]; do
    CONNECTIONS=$(netstat -an | grep :9000 | grep ESTABLISHED | wc -l)

    if [ $CONNECTIONS -eq 0 ]; then
        echo "All connections drained"
        break
    fi

    echo "Waiting for $CONNECTIONS connections to drain..."
    sleep 5
    ELAPSED=$((ELAPSED + 5))
done

# Start new version
php-fpm
```

### Nginx Drain Pattern

Use Nginx upstream server state to gracefully remove a node from rotation while allowing in‑flight requests to complete.

1) Upstream with a shared zone for live reconfiguration:

```nginx
upstream backend {
    zone backend 64k;
    server app1.example.com:80 max_fails=3 fail_timeout=30s;
    server app2.example.com:80 max_fails=3 fail_timeout=30s; # to drain later
}
```

2) To drain app2, mark it down and reload Nginx (no connection drop):

```nginx
upstream backend {
    zone backend 64k;
    server app1.example.com:80 max_fails=3 fail_timeout=30s;
    server app2.example.com:80 down; # marked down, no new requests
}
```

Reload Nginx to apply the change while keeping existing connections:

```bash
nginx -t && nginx -s reload
```

Optional graceful settings (nginx.conf):

```nginx
# Allow workers time to finish active requests on reload/stop
worker_shutdown_timeout 30s;
keepalive_timeout 65s;
```

## Rollback Strategy

### Automated Rollback

```bash
#!/bin/bash

HEALTH_URL="https://api.example.com/health"
MAX_RETRIES=5
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

    if [ $HTTP_CODE -eq 200 ]; then
        echo "Health check passed"
        exit 0
    fi

    echo "Health check failed (attempt $((RETRY_COUNT + 1))/$MAX_RETRIES)"
    RETRY_COUNT=$((RETRY_COUNT + 1))
    sleep 10
done

echo "Health checks failed, rolling back..."

# Rollback commands
git checkout previous-version
        composer install --no-dev --optimize-autoloader --classmap-authoritative
        php vendor/bin/glueful migrate:rollback
sudo supervisorctl restart glueful-worker:*

exit 1
```

### Manual Rollback

```bash
# Switch load balancer back to previous version
nginx -s reload

# Or with Docker
docker-compose up -d app:previous-tag

# Database rollback (if needed)
php vendor/bin/glueful migrate:rollback
```

## Monitoring During Deployment

Track these metrics:
- Error rate
- Response time (p50, p95, p99)
- Success rate
- Active connections
- Queue depth
- CPU/Memory usage

### Deployment Checklist

Before deployment:
- [ ] Tests passing in CI
- [ ] Database migrations are backward compatible
- [ ] Health checks implemented
- [ ] Rollback plan documented
- [ ] Monitoring alerts configured

During deployment:
- [ ] Monitor error rates
- [ ] Check response times
- [ ] Verify health checks
- [ ] Monitor queue depth
- [ ] Watch for exceptions

After deployment:
- [ ] Run smoke tests
- [ ] Verify all features working
- [ ] Check logs for errors
- [ ] Monitor for 30+ minutes

## Best Practices

### Immutable Deployments

```bash
# ✅ Good - deploy new artifact
docker pull myapp:v2
docker-compose up -d

# ❌ Bad - modify running system
ssh server "git pull && composer install"
```

### Version Everything

```php
// config/app.php
'version' => env('APP_VERSION', 'unknown'),

// Include in responses
return Response::success($data, headers: [
    'X-App-Version' => config($context, 'app.version')
]);
```

### Test Deployments

Deploy to staging first:

```bash
# Deploy to staging
./deploy.sh staging

# Run integration tests
./run-tests.sh staging

# If successful, deploy to production
./deploy.sh production
```

## Troubleshooting

**Deployment stuck?**
- Check health endpoints
- Review application logs
- Verify database connectivity

**Traffic not routing to new version?**
- Check load balancer configuration
- Verify health checks passing
- Check firewall rules

**Database migration failed?**
- Rollback migration
- Fix migration script
- Try again

## Next Steps

- [Production Setup](/deployment/production) - Production configuration
- [Docker](/deployment/docker) - Container deployment
- [Monitoring](/advanced/performance) - Deployment monitoring
