---
title: Security Hardening
description: Secure your Glueful application for production
---

Best practices and configurations to secure your Glueful application in production.

## Quick Start Checklist

- [ ] Disable debug mode in production
- [ ] Use HTTPS/SSL everywhere
- [ ] Set strong TOKEN_SALT and session.jwt_key (env: JWT_KEY or SESSION_JWT_KEY)
- [ ] Enable CSRF protection
- [ ] Configure CORS properly
- [ ] Use prepared statements (default)
- [ ] Validate all input
- [ ] Hash passwords properly (bcrypt)
- [ ] Implement rate limiting
- [ ] Set secure headers
- [ ] Keep dependencies updated
- [ ] Configure firewall
- [ ] Disable unnecessary services
- [ ] Set proper file permissions

## Environment Configuration

### Production `.env`

```env
# NEVER enable debug in production
APP_ENV=production
APP_DEBUG=false

# Strong secrets (32+ chars, random)
TOKEN_SALT=your-strong-random-salt
# Framework reads config($context, 'session.jwt_key'); map from either env below as per your config loader
SESSION_JWT_KEY=your-strong-jwt-signing-key
JWT_ALGORITHM=HS256

# Token lifetimes (framework consumes config($context, 'session.*_token_lifetime'))
ACCESS_TOKEN_LIFETIME=3600        # 1 hour
REFRESH_TOKEN_LIFETIME=604800     # 7 days

# HTTPS only
APP_URL=https://api.example.com
FORCE_HTTPS=true

# Secure database
DB_HOST=localhost  # Not exposed
DB_PASSWORD=strong-random-password

# Secure Redis
REDIS_PASSWORD=strong-redis-password

# Security settings
SESSION_SECURE=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=strict
```

### Generate Secure Secrets

```bash
# Generate random secret
php -r "echo bin2hex(random_bytes(32)) . PHP_EOL;"

# Or use OpenSSL
openssl rand -hex 32
```

## HTTPS/SSL

### Force HTTPS

Prefer framework configuration over custom middleware:

```env
FORCE_HTTPS=true
HSTS_HEADER="max-age=31536000; includeSubDomains"
```

### SSL Headers

```php
class SecureHeadersMiddleware
{
    public function handle(Request $request, callable $next)
    {
        $response = $next($request);

        $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

        return $response;
    }
}
```

## Security Headers

### Implement Security Headers

Use environment variables consumed by `config/security.php`:

```env
X_FRAME_OPTIONS=DENY
X_CONTENT_TYPE_OPTIONS=nosniff
X_XSS_PROTECTION="1; mode=block"
HSTS_HEADER="max-age=31536000; includeSubDomains"
CSP_HEADER="default-src 'self'"
```

#### CSP Examples (safe patterns)

Prefer nonces or hashes over allowing inline scripts/styles. Generate a unique nonce per request and inject it into script/style tags.

```env
# Strict baseline for APIs (no inline scripts)
CSP_HEADER="default-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"

# If serving a frontend, use nonces and strict-dynamic
# Replace {nonce} at runtime with a per-request random value
CSP_HEADER="default-src 'self'; script-src 'self' 'nonce-{nonce}' 'strict-dynamic' https:; style-src 'self' https: 'nonce-{nonce}'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; img-src 'self' data:; connect-src 'self' https://api.example.com"
```

Notes:
- Do not use `unsafe-inline` unless absolutely necessary; prefer `'nonce-...'` or SHA256/384 hashes.
- Generate the `{nonce}` server-side per request and add it to your `<script>`/`<style>` tags: `<script nonce="$nonce">`.
- For SPAs loading from CDNs, explicitly allow only required hosts (e.g., `https:` or specific domains).

### Permissions System

Glueful includes a permission system to protect sensitive actions and configuration.

```env
ENABLE_PERMISSIONS=true
```

Sensitive config files are protected by default (see `config/security.php` → `sensitive_config_files`):
- security, database, app, auth, services, mail

Enforce permissions within controllers for privileged endpoints:

```php
// Example: require a permission before returning sensitive data
$this->requirePermission('system.health.detailed', 'health:detailed');
```

## Authentication & Authorization

### Secure Password Storage

```php
// ✅ Good - use bcrypt
$hashedPassword = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

// Verify
if (password_verify($inputPassword, $hashedPassword)) {
    // Valid
}

// ❌ Bad - never use plain text or weak hashing
$password = md5($password);  // DON'T DO THIS
$password = sha1($password); // DON'T DO THIS
```

### JWT Security

```php
// Use TOKEN_SALT and JWT_KEY from session config
config($context, 'session.token_salt');
config($context, 'session.jwt_key');
config($context, 'session.jwt_algorithm');

// Token lifetimes via env
config($context, 'session.access_token_lifetime');    // ACCESS_TOKEN_LIFETIME
config($context, 'session.refresh_token_lifetime');   // REFRESH_TOKEN_LIFETIME
```

### Rate Limiting

```php
// Protect authentication endpoints
$router->post('/auth/login', [AuthController::class, 'login'])
    ->middleware('rate_limit:5,60'); // 5 attempts per minute

$router->post('/auth/register', [AuthController::class, 'register'])
    ->middleware('rate_limit:3,3600'); // 3 registrations per hour
```

## Input Validation

### Always Validate

```php
class TaskController
{
    public function store(Request $request)
    {
        // ✅ Good - validate everything
        $data = $this->getRequestData();

        if ($error = $this->validateRequest($data, [
            'title' => 'required|max:255',
            'description' => 'max:1000',
            'status' => 'max:32',
            'due_date' => 'max:255',
        ])) {
            return $error;
        }

        $task = [
            'uuid' => \Glueful\Helpers\Utils::generateNanoID(),
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'status' => $data['status'] ?? 'pending',
            'due_date' => $data['due_date'] ?? null,
        ];

        db($context)->table('tasks')->insert($task);

        return Response::created($task);
    }
}
```

### Sanitize Output

```php
// Escape HTML output
function escape(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

// In views
echo escape($user->name);
```

## SQL Injection Prevention

### Use Prepared Statements (Default)

```php
// ✅ Good - parameterized queries (default in Glueful)
$users = db($context)->table('users')
    ->where('email', $email)
    ->get();

// ❌ Bad - string concatenation
$users = db($context)->raw("SELECT * FROM users WHERE email = '{$email}'");
```

### Validate Input Types

```php
// Ensure IDs are integers
$userId = (int) $request->input('user_id');

// Validate UUIDs
if (!preg_match('/^[a-zA-Z0-9]{12}$/', $uuid)) {
    return Response::error('Invalid ID', 400);
}
```

## CSRF Protection

### Enable CSRF

```env
CSRF_PROTECTION_ENABLED=true
```

### Verify CSRF Tokens

```php
class CsrfMiddleware
{
    public function handle(Request $request, callable $next)
    {
        if (in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            $token = $request->header('X-CSRF-TOKEN') ?? $request->input('_token');
            $sessionToken = $request->session()->get('csrf_token');

            if (!hash_equals($sessionToken, $token)) {
                return Response::error('CSRF token mismatch', 403);
            }
        }

        return $next($request);
    }
}
```

## CORS Security

### Configure CORS Properly

```env
# Only allow specific origins
CORS_ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com

# Don't use wildcard in production
# CORS_ALLOWED_ORIGINS=*  # DON'T DO THIS
```

The framework sets sensible defaults for methods/headers in `config/security.php`.
Override in configuration if needed (credentials, max-age, etc.).

## File Upload Security

## CLI Security Tools

Use built-in commands to audit and harden your app:

```bash
# Production readiness and security checks
php vendor/bin/glueful system:production --check
php vendor/bin/glueful security:check
php vendor/bin/glueful security:scan
php vendor/bin/glueful security:vulnerabilities

# Emergency lockdown
php vendor/bin/glueful security:lockdown --enable --reason "Incident response"
# Later disable lockdown
php vendor/bin/glueful security:lockdown --disable --cleanup

# Token hygiene
php vendor/bin/glueful security:revoke-tokens --expired
```

### Validate File Uploads

```php
$data = RequestHelper::getRequestData($request);

$rules = (new RuleParser())->parse([
    'avatar' => 'required|max:255',
    'document' => 'required|max:255',
]);

$validator = new Validator($rules);
$errors = $validator->validate($data);

if ($errors !== []) {
    throw new ValidationException($errors);
}
```

### Secure File Storage

```php
class FileUploadController
{
    public function upload(Request $request)
    {
        $file = $request->file('avatar');

        // Validate file type
        $allowedTypes = ['image/jpeg', 'image/png'];
        if (!in_array($file->getMimeType(), $allowedTypes)) {
            return Response::error('Invalid file type', 400);
        }

        // Generate random filename
        $filename = bin2hex(random_bytes(16)) . '.' . $file->getClientOriginalExtension();

        // Store outside public directory
        $path = storage_path($context, 'uploads/avatars/' . $filename);
        $file->move(dirname($path), $filename);

        return Response::success(['filename' => $filename]);
    }
}
```

### Prevent Directory Traversal

```php
function securePath(string $userPath): string
{
    // Remove any directory traversal attempts
    $userPath = str_replace(['../', '..\\'], '', $userPath);

    // Get real path
    $realPath = realpath($basePath . '/' . $userPath);

    // Ensure path is within base directory
    if (!$realPath || strpos($realPath, realpath($basePath)) !== 0) {
        throw new \Exception('Invalid path');
    }

    return $realPath;
}
```

## Server Configuration

### PHP Security Settings

`/etc/php/8.3/fpm/php.ini`:

```ini
; Disable dangerous functions
disable_functions = exec,passthru,shell_exec,system,proc_open,popen,curl_exec,curl_multi_exec,parse_ini_file,show_source

; Hide PHP version
expose_php = Off

; Restrict file access
open_basedir = /var/www/app:/tmp

; Session security
session.cookie_httponly = 1
session.cookie_secure = 1
session.cookie_samesite = Strict
session.use_strict_mode = 1

; File upload restrictions
file_uploads = On
upload_max_filesize = 10M
max_file_uploads = 5

; Resource limits
max_execution_time = 30
max_input_time = 60
memory_limit = 256M
```

### Nginx Security

`/etc/nginx/sites-available/app`:

```nginx
server {
    # Hide Nginx version
    server_tokens off;

    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }

    # Deny access to sensitive files
    location ~ \.(env|log|md)$ {
        deny all;
    }

    # Limit request size
    client_max_body_size 10M;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    location /api/ {
        limit_req zone=api burst=20 nodelay;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
```

### Firewall Configuration

```bash
# Allow only necessary ports
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable

# Limit SSH attempts
sudo ufw limit 22/tcp
```

## Dependency Security

### Keep Dependencies Updated

```bash
# Check for vulnerabilities
composer audit

# Update dependencies
composer update

# Lock dependencies
composer install --no-dev
```

### Remove Dev Dependencies

```bash
# Production
composer install --no-dev --optimize-autoloader
```

## Secrets Management

### Use Environment Variables

```php
// ✅ Good - from environment
$apiKey = env('STRIPE_SECRET_KEY');

// ❌ Bad - hardcoded
$apiKey = 'sk_live_...';
```

### Encrypt Sensitive Data

```php
class Encryptor
{
    private string $key;

    public function __construct()
    {
        $this->key = env('APP_KEY');
    }

    public function encrypt(string $data): string
    {
        $iv = random_bytes(16);
        $encrypted = openssl_encrypt($data, 'AES-256-CBC', $this->key, 0, $iv);
        return base64_encode($iv . $encrypted);
    }

    public function decrypt(string $data): string
    {
        $data = base64_decode($data);
        $iv = substr($data, 0, 16);
        $encrypted = substr($data, 16);
        return openssl_decrypt($encrypted, 'AES-256-CBC', $this->key, 0, $iv);
    }
}
```

## Monitoring & Logging

### Log Security Events

```php
// Failed login attempts
app($context, \Psr\Log\LoggerInterface::class)->warning('Failed login attempt', [
    'email' => $email,
    'ip' => $request->ip(),
    'user_agent' => $request->userAgent(),
]);

// Suspicious activity
app($context, \Psr\Log\LoggerInterface::class)->critical('Potential SQL injection attempt', [
    'input' => $input,
    'ip' => $request->ip(),
]);

// Access to admin endpoints
app($context, \Psr\Log\LoggerInterface::class)->info('Admin access', [
    'user_id' => $user->id,
    'action' => $action,
    'ip' => $request->ip(),
]);
```

### Monitor Failed Attempts

```php
class LoginAttemptTracker
{
    public function trackFailedLogin(string $email, string $ip): void
    {
        $key = "failed_logins:{$ip}";
        $attempts = (int) Cache::get($key, 0);
        $attempts++;

        Cache::set($key, $attempts, 3600); // 1 hour

        if ($attempts >= 5) {
            app($context, \Psr\Log\LoggerInterface::class)->critical('Multiple failed login attempts', [
                'email' => $email,
                'ip' => $ip,
                'attempts' => $attempts,
            ]);

            // Block IP
            Cache::set("blocked:{$ip}", true, 86400); // 24 hours
        }
    }
}
```

## Best Practices

### 1. Defense in Depth

Layer multiple security measures:
- Input validation
- Output encoding
- Prepared statements
- CSRF protection
- Rate limiting
- Security headers

### 2. Principle of Least Privilege

```bash
# Run app as non-root user
chown -R www-data:www-data /var/www/app
chmod -R 755 /var/www/app
chmod -R 775 storage/
```

### 3. Fail Securely

```php
// ✅ Good - fail closed
if (!$this->isAuthorized($user, $resource)) {
    return Response::error('Unauthorized', 403);
}

// ❌ Bad - fail open
if ($this->isAuthorized($user, $resource)) {
    // Allow access
}
// No explicit denial - might allow through
```

### 4. Regular Security Audits

- Review logs for suspicious activity
- Update dependencies regularly
- Test authentication flows
- Scan for vulnerabilities
- Review access controls

## Troubleshooting

**CORS errors?**
- Check `CORS_ALLOWED_ORIGINS`
- Ensure credentials match configuration
- Verify HTTPS in production

**CSRF token mismatch?**
- Check token generation
- Verify session persistence
- Ensure same domain for API and client

**Rate limiting too aggressive?**
- Adjust limits per endpoint
- Implement whitelist for trusted IPs
- Use Redis for distributed rate limiting

## Next Steps

- [Monitoring](/deployment/monitoring) - Security monitoring
- [Logging](/deployment/logging) - Audit logging
- [Production Setup](/deployment/production) - Secure deployment
- [Performance](/advanced/performance) - Secure optimization
