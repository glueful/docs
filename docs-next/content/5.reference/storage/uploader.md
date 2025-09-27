---
title: Uploader
description: Upload API and lifecycle hooks
---

# Uploader

High‑level secure pipeline for accepting user supplied files, validating, normalizing, persisting metadata and returning canonical access URLs.

---
## 1. Primary Responsibilities

| Stage | Responsibility | Implemented In | Failure Mode |
|-------|----------------|----------------|--------------|
| Request validation | Ensure token, user_id, file param present | `validateRequest` | 400 ValidationException |
| Normalization | Accept $_FILES or UploadedFile | `processUploadedFile` | 400 UploadException |
| Size enforcement | Compare against configured max | `processUploadedFile` | 400 ValidationException |
| MIME detection | Sniff real MIME | `detectMime` | 400 ValidationException |
| Extension policy | Allowlist + MIME cross‑check | `validateFileContent` | 400 ValidationException |
| Hazard scan | Simple heuristic (script / PHP tags) | `isFileHazardous` | 400 ValidationException |
| Secure naming | Randomized, extension preservation | `generateSecureFilename` | n/a |
| Atomic store | Stream upload & move | `moveFile` (via storage) | 500 UploadException |
| Metadata persist | Blob record creation | `saveFileRecord` | 500 UploadException |
| URL resolve | Public / CDN / signed | `storage->getUrl` | (fallback to relative) |

---
## 2. Allowed Extensions & MIME Cross‑Validation

If `filesystem.file_manager.allowed_extensions` is set, uploader treats it as source of truth and enforces:

1. Extension is in allowlist.
2. Sniffed MIME matches mapping for extension; otherwise falls back to generic allowed MIME list.

Mismatch = rejection to prevent spoofed content (e.g., `.jpg` with script payload).

---
## 3. Hazard Detection

Current heuristic: scan first 64KB for `<?php`, `<?=`, `<script`. Extend by:

- Integrating antivirus engine (e.g., clamd) here.
- Adding file type specific structural validation (PDF header, image magic bytes) for higher assurance.

---
## 4. Secure Filename Generation

Pattern: `timestamp_randomhex[.ext]` ensuring uniqueness and avoiding user controlled path injection. MIME used to derive extension if missing.

---
## 5. Base64 Upload Helper

`handleBase64Upload` converts raw base64 to a temp file path for subsequent processing. Use for API clients unable to send multipart forms. Always follow with validation path.

---
## 6. Directory Maintenance Utilities

| Method | Purpose | Notes |
|--------|---------|-------|
| getDirectoryStats | Count files, size, type distribution | Uses Finder; helpful for reporting. |
| cleanupOldFiles | Delete files older than N seconds | Returns freed space stats. |
| validateFileType | Standalone type check utility | Not wired into main flow; can preflight. |
| calculateChecksum | SHA256 of file | For integrity / dedupe indexing. |

---
## 7. Error Handling Strategy

| Exception | User Facing | Logged? | When |
|-----------|------------|--------|------|
| ValidationException | 400 + message | Optional | Input, policy, content fail |
| UploadException | 500 generic message | Yes | Internal storage / IO issues |

Separate classes allow stable client logic while preserving internal diagnostics in logs.

---
## 8. Customizing Validation

Extend by decorating or subclassing `FileUploader` and overriding:

- `validateRequest` to add auth scopes.
- `validateFileContent` to integrate scanning.
- `generateSecureFilename` to embed content hash for dedupe.

Bind your subclass into container in place of core class.

---
## 9. Example Usage

```php
$uploader = app(Glueful\Uploader\FileUploader::class);
$result = $uploader->handleUpload($token, $_GET, $_FILES);
if (isset($result['error'])) {
	http_response_code($result['code']);
	echo $result['error'];
	return;
}
echo $result['url'];
```

Base64 helper:

```php
$temp = $uploader->handleBase64Upload($request->input('image_base64'));
// Wrap $temp in an array shaped like $_FILES for reuse of pipeline.
```

---
## 10. Troubleshooting

| Symptom | Likely Cause | Resolution |
|---------|--------------|-----------|
| 400 Missing required parameters | Absent token/user_id | Ensure client sends query params. |
| 400 File extension not allowed | Policy mismatch | Update allowed_extensions or client file. |
| 400 MIME type does not match | Spoofed extension | Recreate file; ensure correct encoding. |
| 500 Upload failed | Adapter write error | Check disk config & permissions. |
| Returned URL relative | Missing base/cdn url | Set `base_url` or `cdn_base_url` in disk config. |

---
## 11. Roadmap Considerations

- Pluggable scanning chain (AV, image validation, DLP heuristics).
- Chunked / resumable uploads for very large files.
- Event dispatch points (pre-validate, post-store, post-persist) for auditing.
- Hash based deduplication and versioning.

---
## 12. Related

- See `../storage/index` for architecture & disk config.
- Security docs for validation & sanitization parallels.

