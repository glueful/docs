---
title: File Uploads
description: Handle file uploads with validation and storage
---

Securely accept and store file uploads with automatic validation, storage, and URL generation.

The framework ships a ready-made **blob API** (`/blobs`) backed by the `blobs` table, plus the
`FileUploader` service for building your own upload endpoints.

## Blob HTTP API

Registered by the framework under your API prefix (e.g. `/api/v1/blobs`) while
`uploads.enabled` (`UPLOADS_ENABLED`) is true:

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/blobs` | Upload a file |
| `GET` | `/blobs/{uuid}` | Serve the file (Range, ETag; optional resize) |
| `GET` | `/blobs/{uuid}/info` | Blob metadata |
| `DELETE` | `/blobs/{uuid}` | Delete the file and mark the blob deleted |
| `POST` | `/blobs/{uuid}/signed-url?ttl=3600` | Temporary URL for a private blob (auth required; TTL capped at 7 days) |

### Upload

Multipart form data, field `file`, with optional `visibility` (`public` | `private`, default
`UPLOADS_DEFAULT_VISIBILITY`) and `path_prefix`:

```bash
curl -X POST https://api.example.com/api/v1/blobs \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@photo.jpg" \
  -F "visibility=public"
```

Or JSON with base64 content:

```json
{ "type": "base64", "data": "iVBORw0KGgo...", "filename": "photo.png", "mime_type": "image/png" }
```

The `201` response carries `blob_uuid`, `url`, `thumb_url`, `type`, `mime_type`, `size_bytes`,
`width`, `height`, `duration_s`, `filename`, `path` and `visibility`.

### Serve and resize

`GET /blobs/{uuid}` streams the file. Images accept `?width=`, `?height=`, `?quality=`, `?fit=`
(`contain`, `cover`, `fill`) and `?format=`; resized variants are cached (`uploads.image_processing`).
Resizing needs the `glueful/media` extension — without it the original is served, and only an
explicit `format` conversion answers `415`.

### Access control

`uploads.access` (`UPLOADS_ACCESS`) sets the route middleware:

| Mode | Upload / delete | View / info |
|---|---|---|
| `private` (default) | auth | auth (info), or a public blob / valid signed URL (view) |
| `upload_only` | auth | public |
| `public` | none | none (not recommended) |

Uploads and retrievals are rate limited (`UPLOADS_RATE_LIMIT`, default 30/min;
`UPLOADS_RETRIEVAL_RATE_LIMIT`, default 200/min). `API_RATE_LIMITING_ENABLED=false` switches these
limits off along with every other rate limit.

### Signed URLs

`POST /blobs/{uuid}/signed-url` returns `signed_url` (the blob's `GET` route, API prefix included —
e.g. `https://api.example.com/api/v1/blobs/{uuid}?expires=…&signature=…`), `expires_in` and
`expires_at`. Signatures are
HMACs over the path and query keyed on `UPLOADS_SIGNED_SECRET` (falling back to `APP_KEY`) — use a
distinct secret per environment, since a signature is valid on any host that shares it.

For disks whose driver can presign natively (the `glueful/storage-*` packs), opt in per disk under
`uploads.native_urls.disks` to add a `native_url` that points straight at the bucket or CDN. It is a
bearer link that bypasses app-side access control; private blobs are capped at
`UPLOADS_NATIVE_MAX_PRIVATE_TTL` (900 s).

::u-alert{color="neutral" variant="subtle" icon="i-lucide-info"}
**Since 1.91:** signed URLs issued by earlier releases pointed at `/blobs/{uuid}` without the API
prefix, a path no route serves. Generate new ones.
::

## Uploading from Your Own Controller

```php
use Glueful\Http\Response;
use Glueful\Uploader\FileUploader;

public function upload(): Response
{
    if ($this->currentUser === null) {
        return $this->unauthorized();
    }

    $uploader = app($this->getContext(), FileUploader::class);

    $result = $uploader->handleUpload(
        token: $this->currentUser->uuid(),
        getParams: ['user_id' => $this->currentUser->uuid()],
        fileParams: $this->request->files->all()
    );

    if (isset($result['error'])) {
        return Response::error($result['error'], $result['code']);
    }

    return Response::created([
        'uuid' => $result['uuid'],
        'url' => $result['url'],
    ]);
}
```

`handleUpload(string $token, array $getParams, mixed $fileParams)` requires a non-empty token and
`user_id`. `$fileParams` is a Symfony `UploadedFile`, a `$_FILES`-style entry, or a keyed set such as
`$request->files->all()`. A keyed set holding one file uses it; with several files, pass `key` in
`$getParams` to name the field — otherwise the call returns a `400` naming the keys it found. It
returns `['uuid', 'url']` on success, or `['error', 'code']` — `400` for a validation failure, `500`
for an invalid upload or a storage failure.

### Multiple Files

```php
foreach (array_keys($this->request->files->all()) as $field) {
    $result = $uploader->handleUpload(
        token: $this->currentUser->uuid(),
        getParams: ['user_id' => $this->currentUser->uuid(), 'key' => $field],
        fileParams: $this->request->files->all()
    );

    if (!isset($result['error'])) {
        $uploaded[] = $result;
    }
}
```

## Media Uploads

For images, videos, and audio files, use `uploadMedia()` to store the file, record the blob and get
its metadata. It throws `Glueful\Validation\ValidationException` or `Glueful\Uploader\UploadException`
instead of returning an error array.

::u-alert{color="warning" variant="subtle" icon="i-lucide-package"}
**Thumbnails and rich metadata require the `glueful/media` extension.**
The upload pipeline (`FileUploader`, `handleUpload()`, `uploadMedia()`) and the `MediaMetadata`
value object stay in core, but thumbnail generation and dimension/duration extraction live in
[`glueful/media`](https://github.com/glueful/media).

Without `glueful/media` installed and enabled, `uploadMedia()` still succeeds, but the result has
`thumb_url => null` and a **type-only** metadata result (no `width`, `height`, or `duration_s`). To
enable thumbnails and full metadata:

```bash
composer require glueful/media
php glueful extensions:enable media
```
::

### Basic Media Upload

```php
use Glueful\Validation\ValidationException;

public function uploadMedia(string $postUuid): Response
{
    $uploader = app($this->getContext(), FileUploader::class);
    $file = $this->request->files->get('file');

    try {
        $result = $uploader->uploadMedia($file, 'posts/' . $postUuid, [
            'visibility' => 'public',
        ]);
    } catch (ValidationException $e) {
        return Response::error($e->getMessage(), 422);
    }

    // [
    //     'type' => 'image',             // image, video, audio, or file
    //     'url' => 'https://...',
    //     'thumb_url' => 'https://...',  // null without glueful/media
    //     'mime_type' => 'image/jpeg',
    //     'size_bytes' => 245678,
    //     'width' => 1920,               // null without glueful/media
    //     'height' => 1080,
    //     'duration_s' => null,          // video/audio duration
    //     'filename' => '1704123456_abc123.jpg',
    //     'path' => 'posts/uuid/1704123456_abc123.jpg',
    //     'blob_uuid' => 'abc123def456',
    // ]

    return Response::created($result);
}
```

### Media Upload Options

```php
$result = $uploader->uploadMedia($file, 'gallery/', [
    'generate_thumbnail' => true,   // Default: true for images
    'thumbnail_width' => 800,       // Default: 400
    'thumbnail_height' => 600,      // Default: 400
    'thumbnail_quality' => 90,      // Default: 80
    'save_to_blobs' => true,        // Default: true
    'visibility' => 'private',      // Default: uploads.default_visibility
]);
```

Thumbnail defaults come from `filesystem.uploader` (`THUMBNAIL_ENABLED`, `THUMBNAIL_WIDTH`,
`THUMBNAIL_HEIGHT`, `THUMBNAIL_QUALITY`, `THUMBNAIL_SUBDIRECTORY`). The blob API itself only
generates thumbnails when `uploads.thumbnails.enabled` (`UPLOADS_THUMBNAILS`, default `false`) is on.

## Validation

`config/uploads.php`:

```php
return [
    'enabled' => env('UPLOADS_ENABLED', true),
    'allowed_types' => ['image/*', 'video/*', 'audio/*', 'application/pdf'], // wildcards supported
    'max_size' => env('UPLOADS_MAX_SIZE', 10 * 1024 * 1024),
    'access' => env('UPLOADS_ACCESS', 'private'),
    'disk' => env('UPLOADS_DISK', 'uploads'),
    'default_visibility' => env('UPLOADS_DEFAULT_VISIBILITY', 'private'),
    'purge_deleted_after_days' => (int) env('UPLOADS_PURGE_DELETED_AFTER_DAYS', 30),
    'security' => [
        'scan_uploads' => true,
        'strip_exif' => env('UPLOADS_STRIP_EXIF', true),
    ],
    // also: signed_urls, native_urls, image_processing, thumbnails, rate_limits, response
];
```

**Precedence.** `uploads.max_size` and `uploads.allowed_types` win; the older
`filesystem.security.max_upload_size` (`MAX_FILE_UPLOAD_SIZE`) and
`filesystem.uploader.allowed_mime_types` apply only when the `uploads.*` keys are unset. When
`FILE_ALLOWED_EXTENSIONS` is set, the original extension must also be listed and match the
detected MIME type.

### Custom Validation

```php
$file = $this->request->files->get('file');

if ($file === null || $file->getSize() > 5 * 1024 * 1024) {
    return Response::error('File too large', 422);
}

if (!in_array($file->getMimeType(), ['image/jpeg', 'image/png', 'application/pdf'], true)) {
    return Response::error('Invalid file type', 422);
}
```

## Security

- **MIME detection** — the type is detected from content with `finfo`, not taken from the client.
- **Content scan** — a file whose first 64 KB contain `<?php`, `<?=` or `<script` is refused
  (`uploads.security.scan_uploads`).
- **EXIF stripping** — GPS position, camera, timestamps and other embedded metadata (EXIF, XMP,
  IPTC, comments) are removed from JPEG, PNG and WebP images before they are stored, without
  re-encoding; a JPEG keeps its orientation. On by default; `UPLOADS_STRIP_EXIF=false` keeps it.
- **Random filenames** — stored names are generated (`{timestamp}_{random}.{ext}`).
- **Path validation** — storage paths go through `PathGuard` (no traversal, null bytes, or absolute
  paths).

### Blob Policy Seams

Extensions can shape the blob API without replacing the controller — bind or register these in
your provider:

| Contract (`Glueful\Uploader\Contracts\…`) | Use |
|---|---|
| `BlobAccessPolicy` via `BlobAccessPolicyRegistry::register($id, $policy)` | Extra allow/deny check per action (`view`, `info`, `delete`, `sign`); every registered policy must allow |
| `BlobRouteMiddlewareProvider` | Add middleware to the blob routes per `BlobRouteAction` |
| `BlobCreatedHook` | `onBlobCreated($blobUuid, $uploaderUserUuid)` after an upload |
| `BlobPublicUrlProvider` | Base URL used for signed URLs (`publicBaseUrl($blob)`) |

```php
use Glueful\Uploader\Contracts\{BlobAccessContext, BlobAccessPolicy, BlobAccessPolicyRegistry, BlobAction};

final class OwnerOnlyDelete implements BlobAccessPolicy
{
    public function authorizeAccess(array $blob, BlobAccessContext $context): bool
    {
        if ($context->action !== BlobAction::DELETE) {
            return true;
        }
        return $context->authenticatedUserUuid !== null
            && $context->authenticatedUserUuid === ($blob['created_by'] ?? null);
    }
}

// In your ServiceProvider::boot()
$this->app->get(BlobAccessPolicyRegistry::class)->register('acme.owner-delete', new OwnerOnlyDelete());
```

## Deleting and Purging

`DELETE /blobs/{uuid}` removes the file and marks the row `deleted`. Rows marked deleted are kept
for `uploads.purge_deleted_after_days` (`UPLOADS_PURGE_DELETED_AFTER_DAYS`, 30), then purged — any
remaining file through the disk the blob names, then the row:

```bash
php glueful blobs:purge                 # uses uploads.purge_deleted_after_days
php glueful blobs:purge --days=7 --limit=500
```

The scheduled `blob_purge` job runs this daily (`BLOB_PURGE_ENABLED`). An app with its own
`config/schedule.php` must list `blob_purge` itself — see
[Task Scheduling](/features/scheduling#built-in-jobs).

## Storage Backends

Uploads are written to `uploads.disk` (`UPLOADS_DISK`, default `uploads`), a disk from
`config/storage.php`. Core ships the `local` and `memory` drivers; cloud drivers come as
first-party packs:

```bash
composer require glueful/storage-s3     # S3, R2, MinIO, Spaces, Wasabi
composer require glueful/storage-gcs    # Google Cloud Storage
composer require glueful/storage-azure  # Azure Blob Storage
```

A disk using a driver whose pack isn't installed fails fast with a `composer require glueful/storage-*`
hint. Disk configuration, native signed URLs and the `storage:test` diagnostic are covered in
[Storage](/cookbook/storage).

### Working with Storage

`StorageManager::disk()` returns a Flysystem v3 `FilesystemOperator`:

```php
use Glueful\Storage\StorageManager;

$storage = app($this->getContext(), StorageManager::class);
$disk = $storage->disk();

$disk->write('avatars/user123.jpg', $fileContent);
$content = $disk->read('avatars/user123.jpg');

if ($disk->fileExists('avatars/user123.jpg')) {
    $disk->delete('avatars/user123.jpg');
}

foreach ($storage->listContents('avatars') as $attr) {
    echo $attr->path();
}
```

### Signed URLs from Code

```php
use Glueful\Storage\StorageManager;
use Glueful\Storage\Support\UrlGenerator;
use Glueful\Uploader\Storage\FlysystemStorage;

$disk = new FlysystemStorage(
    app($this->getContext(), StorageManager::class),
    app($this->getContext(), UrlGenerator::class),
    's3'
);

$signedUrl = $disk->getSignedUrl('documents/invoice.pdf', 3600);
```

The disk's driver must implement `Glueful\Storage\Contracts\NativeSignedUrlProviderInterface` (the
storage packs do); otherwise you get the plain public URL.

## Utilities

```php
$uploader = app($this->getContext(), FileUploader::class);

$tempPath = $uploader->handleBase64Upload($base64);          // base64 → temp file path
$stats = $uploader->getDirectoryStats('uploads/');
$cleanup = $uploader->cleanupOldFiles('temp/', 2592000);      // older than 30 days
$checksum = $uploader->calculateChecksum($filePath);          // SHA-256 hex
```

## Best Practices

### Use Signed URLs for Private Files

Keep blobs `private` and hand out short-lived signed URLs instead of making them public.

### Queue Processing

```php
// ✅ Good - async processing
$result = $uploader->uploadMedia($file, 'images/');
app($this->getContext(), \Glueful\Queue\QueueManager::class)
    ->push(ProcessImageJob::class, ['path' => $result['path']]);

// ❌ Bad - blocks response
$this->processImage($result['path']); // Slow!
```

## Troubleshooting

**Upload fails with 413?**
- Increase `upload_max_filesize` and `post_max_size` in php.ini
- Check web server limits (nginx: `client_max_body_size`)
- Check `UPLOADS_MAX_SIZE`

**File type rejected?**
- Add the MIME type to `uploads.allowed_types`
- If `FILE_ALLOWED_EXTENSIONS` is set, add the extension there too

**`handleUpload()` returns 400 "Several files were uploaded"?**
- Pass `key` in `getParams` naming the file field (see [Multiple Files](#multiple-files))

**`handleUpload()` returns "Upload failed"?**
- The named field is missing or the upload itself failed (PHP upload error, empty `tmp_name`); check
  the error log

**Signed URLs return plain URLs?**
- Use the blob API's `/blobs/{uuid}/signed-url`, or install the disk's `glueful/storage-*` pack

**Deleted files still on disk?**
- Run `php glueful blobs:purge`, and make sure `blob_purge` is in your `config/schedule.php`

## Next Steps

- [Queues & Jobs](/features/queues-jobs) - Process uploads async
- [Storage](/cookbook/storage) - Disks, cloud packs, URLs
- [Image Processing](/cookbook/image-processing) - Resize and transform with `glueful/media`
- [Security](/cookbook/security) - Upload security
