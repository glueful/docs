# Glueful

::section{class="hero-section"}
![Glueful Framework](/src/assets/logo_full.svg)

# Modern API Development, Simplified

Glueful is a modern, secure, and scalable PHP API framework designed for building robust applications. With its powerful extension system, comprehensive security features, and developer-friendly tools, Glueful helps you create production-ready APIs in less time.

:buttons
:button{to="/installation" primary} Get Started
:button{to="https://github.com/glueful/framework"} GitHub
::

::section{class="key-benefits"}

# Why Developers Choose Glueful

::grid{cols=3}
::card{icon="🏗️" title="Modern Architecture"}
Built for PHP 8.2+ with modern coding practices, PSR-15 middleware system, and RESTful endpoints that automatically generate OpenAPI documentation.
::

::card{icon="🔐" title="Comprehensive Security"}
Built-in RBAC, JWT authentication, audit logging for security-critical operations, rate limiting, and SQL injection protection with prepared statements.
::

::card{icon="🚀" title="Developer Experience"}
Powerful CLI tools, database migrations, automatic API documentation, extension marketplace, and comprehensive error logging and debugging.
::
::

::section{class="getting-started"}

# Start Building in 3 Simple Steps

::steps
::step{number="1" title="Create a New Project"}

```bash
composer create-project glueful/glueful my-api
```

::

::step{number="2" title="Configure Your Environment"}

```bash
cp .env.example .env
php glueful db:migrate
```

::

::step{number="3" title="Launch Your API"}

```bash
php -S localhost:8000 -t public
```

Start building your endpoints with Glueful's powerful features!
::
::

::section{class="features"}

# Powerful Features at Your Fingertips

::features-grid{cols=3}
::feature{icon="🔑" title="Authentication & Authorization"}
Secure JWT-based auth with comprehensive role management
::

::feature{icon="💾" title="Database Management"}
Migrations, schema tools, and backup utilities
::

::feature{icon="🧩" title="Extension System"}
Modular extensions with dependency management
::

::feature{icon="📚" title="API Documentation"}
Automatic OpenAPI/Swagger generation
::

::feature{icon="⚡" title="CLI Tools"}
Rich command-line interface for system tasks
::

::feature{icon="📁" title="File Management"}
Built-in file storage and handling
::

::feature{icon="🛡️" title="Rate Limiting"}
Protect your API from overuse
::

::feature{icon="🔄" title="Middleware System"}
PSR-15 compliant middleware architecture
::

::feature{icon="✅" title="Validation"}
Comprehensive request validation
::
::

::section{class="extensible"}

# Extensible by Design

Glueful's powerful extension system allows you to easily add new features to your API without modifying core code.

```bash
# Create a new extension
php glueful extensions create MyExtension

# Enable your extension
php glueful extensions enable MyExtension
```

Leverage the extension marketplace to find and share reusable components for common API functionality.
::

::section{class="api-endpoints"}

# Ready-to-Use API Endpoints

Glueful provides a comprehensive set of RESTful API endpoints out-of-the-box:

::endpoints{cols=2}
::endpoint{title="Authentication"}
Login, token refresh, password reset
::

::endpoint{title="User Management"}
CRUD operations for users
::

::endpoint{title="Roles & Permissions"}
Complete RBAC implementation
::

::endpoint{title="File Management"}
Upload, download, and manage files
::

::endpoint{title="System Administration"}
Migrations, logs, and scheduled jobs
::
::
::

::section{class="requirements"}

# System Requirements

::requirements-list

- PHP 8.2 or higher
- MySQL 5.7+ or PostgreSQL 12+
- Required PHP Extensions:
  - PDO
  - OpenSSL
  - JSON
  - Mbstring
- Composer 2.0+
  ::
  ::

::section{class="learn-more"}

# Learn More

:links-grid{cols=4}
:link-card{to="/installation"} Installation Guide
:link-card{to="/api"} API Documentation
:link-card{to="/extensions"} Extension Development
:link-card{to="/security"} Security Features
:link-card{to="/database"} Database Schema
:
::
