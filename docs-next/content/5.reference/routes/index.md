---
title: Routes
description: HTTP route surface of the Glueful framework
navigation:
  icon: i-lucide-network
---

# HTTP Routes Reference

Framework-provided HTTP routes and their characteristics.

<!-- GENERATED:routes -->
Generated 26 routes across 4 groups (13 auth-protected, 11 rate-limited).

### authentication

| Method | Path | Summary | Auth | Rate Limit | Tag | Source |
|--------|------|---------|------|------------|-----|--------|
|POST|/auth/forgot-password|Forgot Password|no|-|authentication|auth.php|
|POST|/auth/login|User Login|no|rate_limit:5,60|authentication|auth.php|
|POST|/auth/logout|User Logout|yes|-|authentication|auth.php|
|POST|/auth/refresh-permissions|Refresh User Permissions|yes|-|authentication|auth.php|
|POST|/auth/refresh-token|Refresh Token|no|-|authentication|auth.php|
|POST|/auth/resend-otp|Resend OTP|no|rate_limit:2,120|authentication|auth.php|
|POST|/auth/reset-password|Reset Password|no|-|authentication|auth.php|
|POST|/auth/validate-token|Validate Token|yes|-|authentication|auth.php|
|POST|/auth/verify-email|Verify Email|no|-|authentication|auth.php|
|POST|/auth/verify-otp|Verify OTP|no|rate_limit:3,60|authentication|auth.php|

### health

| Method | Path | Summary | Auth | Rate Limit | Tag | Source |
|--------|------|---------|------|------------|-----|--------|
|GET|/health|System Health Check|no|rate_limit:60,60|health|health.php|
|GET|/health/cache|Cache Health Check|no|rate_limit:30,60|health|health.php|
|GET|/health/database|Database Health Check|no|rate_limit:30,60|health|health.php|
|GET|/health/detailed|Detailed Health Metrics|yes|rate_limit:10|health|health.php|
|GET|/health/middleware|Middleware Pipeline Health|yes|rate_limit:20|health|health.php|
|GET|/health/response-api|Response API Health|yes|rate_limit:15|health|health.php|
|GET|/healthz|Liveness Check|no|rate_limit:60,60|health|health.php|
|GET|/ready|Readiness Check|no|rate_limit:30|health|health.php|

### resources

| Method | Path | Summary | Auth | Rate Limit | Tag | Source |
|--------|------|---------|------|------------|-----|--------|
|GET|/{resource}|List Resources|yes|-|resources|resource.php|
|POST|/{resource}|Create Resource|yes|-|resources|resource.php|
|DELETE|/{resource}/bulk|Bulk Delete Resources|yes|-|resources|resource.php|
|PUT|/{resource}/bulk|Bulk Update Resources|yes|-|resources|resource.php|
|DELETE|/{resource}/{uuid}|Delete Resource|yes|-|resources|resource.php|
|GET|/{resource}/{uuid}|Get Single Resource|yes|-|resources|resource.php|
|PUT|/{resource}/{uuid}|Update Resource|yes|-|resources|resource.php|

### security

| Method | Path | Summary | Auth | Rate Limit | Tag | Source |
|--------|------|---------|------|------------|-----|--------|
|GET|/csrf-token|Get CSRF Token|no|-|security|auth.php|

<!-- END GENERATED:routes -->

## Overview
Routing patterns and grouping logic.

## Middleware
Authentication, rate limiting, CSRF, custom middleware.

## Extending
Adding custom routes & route groups.
