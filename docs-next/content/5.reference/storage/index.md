---
title: Storage (API)
description: Adapters and the uploader API
navigation:
  icon: i-lucide-folder
---

# Storage API Reference

Unified abstraction over local and cloud object/file storage plus a secure, policy‑aware upload pipeline.

This page orients you to the moving parts. Deep dives:

- `./adapters` – Capabilities & implementing custom adapters
- `./uploader` – Upload lifecycle, validation & security controls

---

## 1. Architecture Overview

```
┌───────────────────────────────────────────────────────────────┐
│                           Application                          │
│                 (services, controllers, jobs)                  │
└───────────────▲──────────────────────┬────────────────────────┘
    │ uses                 │
    │                      │ (optionally) presigned URLs
  ┌───────┴───────┐      ┌───────┴────────┐
  │  FileUploader │      │  UrlGenerator  │
  └───────▲───┬───┘      └────────▲───────┘
    │   │ resolves disks     │ reads disk meta
    │   │                    │
    ┌─────┴───▼─────┐   public URLs │
    │ FlysystemStorage│◄────────────┘
    └─────▲───┬─────┘
    │   │ putStream/list/delete
  ┌───────┴───▼──────────────────────────────────────────┐
  │                   StorageManager                     │
  │  lazy creates disk adapters from config (local/S3/…) │
  └───────▲──────────────────────────────────────────────┘
    │ reads
  ┌───────┴──────────────────────────────────────────────┐
  │                    storage.php config                │
  └──────────────────────────────────────────────────────┘
```

Key Principles:

- Lazy Disk Resolution – adapters only instantiated when first used.
- Path Guarding – all user‑influenced paths validated before IO.
- Atomic Writes – large file writes happen via temp + move to avoid partial reads.
- Adapter Capability Detection – certain features (signed URLs) only active if libs installed.

---
## 2. Core Concepts

| Concept | Responsibility | Notes |
|---------|----------------|-------|
| Disk | Logical named filesystem (local, memory, s3, azure, gcs) | Configured in `storage.php` under `disks`. |
| StorageManager | Factory + registry for disks | Adds helpers (JSON put/get, streaming writes). |
| FileUploader | High‑level secure upload workflow | Validation, MIME/extension enforcement, random naming. |
| FlysystemStorage | Bridge from uploader to StorageManager | Implements `StorageInterface`. |
| UrlGenerator | Builds public/CDN/signed URLs | Uses disk cfg: `cdn_base_url`, `base_url`, S3 details. |
| PathGuard | Normalizes & validates paths | Prevents traversal & restricted locations. |

---
## 3. Built‑In Disk Types

| Driver | Dependencies | Typical Use | Special Capabilities |
|--------|--------------|-------------|----------------------|
| local | none | Private app uploads | Fast, on‑disk atomic ops |
| memory | none | Testing, ephemeral | Non‑persistent; useful in tests |
| s3 | `league/flysystem-aws-s3-v3`, AWS SDK | Durable, scalable storage | Signed URLs, CDN integration |
| azure | `league/flysystem-azure-blob-storage` | Azure Blob scenarios | Container based organization |
| gcs | `league/flysystem-google-cloud-storage` | GCP deployments | IAM, regional buckets |

Missing adapter libs trigger explicit exceptions with install hint.

---
## 4. Upload Flow (High Level)

1. Validate request (token, user id, file presence).
2. Normalize $_FILES or framework `UploadedFile` object.
3. Enforce size and extension policy (config driven fallback list).
4. MIME sniff & cross‑check against extension mapping.
5. Optional content scan (PHP/script markers).
6. Generate cryptographically random filename (timestamp + random bytes).
7. Stream to disk via `putStream` (atomic temp write then move).
8. Persist metadata record (BlobRepository) for auditing & serving.
9. Return canonical URL (may be absolute if CDN configured).

Error surfaces are normalized into validation (400) vs upload (500) style failures.

---
## 5. Configuration Reference

See `config/storage.php` & `config/filesystem.php`.

| Key | Location | Purpose | Notes |
|-----|----------|---------|-------|
| storage.default | storage.php | Default disk name | Fallback to env `STORAGE_DRIVER`. |
| storage.disks.*.driver | storage.php | Adapter driver | One of local, memory, s3, azure, gcs. |
| storage.disks.*.base_url | storage.php | Public base URL | For unsigned public URLs. |
| storage.disks.*.cdn_base_url | storage.php | CDN distribution base | Preferred over base_url when present. |
| storage.disks.s3.signed_urls | storage.php | Enable presigned links | Requires AWS SDK. |
| filesystem.security.max_upload_size | filesystem.php | Upload size ceiling | Used by `FileUploader`. |
| filesystem.file_manager.allowed_extensions | filesystem.php | Extension allowlist | Drives MIME cross‑validation. |
| filesystem.security.scan_uploads | filesystem.php | Content scanning toggle | Basic heuristic (PHP/script markers). |
| filesystem.paths.uploads | filesystem.php | Local uploads root | Used in default local disk.

---
## 6. Extension Points

| Point | How to Extend | Notes |
|-------|---------------|-------|
| Disk driver | Add case to `StorageManager::createDisk` or supply adapter via config | Keep adapter detection explicit. |
| URL strategy | Enhance `UrlGenerator` | Add new key(s) (e.g., per‑file cache busting). |
| Upload validation | Decorate `FileUploader` or subclass | Keep side‑effects (DB writes) last. |
| Signed URL generation | Implement in `StorageInterface` impl | Only if underlying adapter supports. |
| File metadata persistence | Replace `BlobRepository` binding | Maintain same create() contract. |

---
## 7. Hardening & Best Practices

- Enforce explicit extension allowlist in production.
- Rotate S3 credentials; prefer IAM roles over static keys.
- Use private ACL + signed URLs for sensitive objects.
- Consider antivirus/clamd integration in `validateFileContent` (hook point: after MIME check).
- Monitor upload error rates & size distributions (log anomalies). 
- Apply CDN caching for immutable assets; version filename if content addressable.

---
## 8. Troubleshooting

| Symptom | Likely Cause | Resolution |
|---------|--------------|-----------|
| "Disk 'x' is not configured" | Missing entry in `storage.php` | Add disk config or fix default env var. |
| Upload returns 400 | ValidationException (size/type/token) | Check extension list & size limit config. |
| Upload returns 500 | Underlying adapter failure | Inspect logs for Flysystem exception chain. |
| Signed URL identical to plain URL | Adapter lacks signing support | Verify adapter libs & `signed_urls` flag. |
| Random temp files accumulating | Crash before atomic move cleanup | Investigate application shutdown/log errors. |

---
## 9. Performance Notes

- Atomic stream write prevents partial reads but adds an extra move; acceptable for typical upload sizes.
- Prefer streaming (putStream) to buffering entire file in memory.
- GCS & S3 adapters benefit from larger multipart thresholds (future enhancement: configurable chunking).
- Memory adapter limited to testing; not suitable for real workloads.

---
## 10. Related Reading

- Security: See `../security/index` for validation & scanning parallels.
- Performance Principles (forthcoming) for IO optimization patterns.
- Extensions guide for adding custom services consumed during upload.

---
## 11. Minimal Usage Example

```php
$uploader = app(Glueful\Uploader\FileUploader::class);
$result = $uploader->handleUpload($token, $_GET, $_FILES);
if (isset($result['error'])) {
    // handle failure
}
echo $result['url'];
```

---
