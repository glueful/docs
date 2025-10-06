---
title: File Uploads
description: Handle file uploads with validation and storage
---

Securely accept and store file uploads with automatic validation, storage, and URL generation.

## Quick Start

```php
use Glueful\Uploader\FileUploader;
use Glueful\Storage\Support\UrlGenerator;

public function upload()
{
    $uploader = app(FileUploader::class);

    $result = $uploader->handleUpload(
        token: $this->request->input('token'),
        // Include user_id as required by uploader validation
        getParams: array_merge($this->request->query->all(), [
            'user_id' => (string) ($this->auth?->user()->uuid ?? '')
        ]),
        fileParams: $this->request->files->all()
    );

    if (isset($result['error'])) {
        return Response::error($result['error'], 422);
    }

    return Response::created([
        'uuid' => $result['uuid'],
        'url' => $result['url']
    ]);
}
```

## Storage Configuration

`config/storage.php`:

```php
return [
    'default' => env('STORAGE_DEFAULT_DISK', env('STORAGE_DRIVER', 'uploads')),

    'disks' => [
        'uploads' => [
            'driver' => 'local',
            'root' => config('app.paths.uploads'),
            'visibility' => 'private',
            // Used by UrlGenerator for public URLs
            'base_url' => config('app.urls.cdn'),
        ],

        's3' => [
            'driver' => 's3',
            'key' => env('S3_ACCESS_KEY_ID'),
            'secret' => env('S3_SECRET_ACCESS_KEY'),
            'region' => env('S3_REGION', 'us-east-1'),
            'bucket' => env('S3_BUCKET'),
            'endpoint' => env('S3_ENDPOINT'),
            'use_path_style_endpoint' => true,
            'signed_urls' => true,
            'signed_ttl' => 3600,
            'cdn_base_url' => env('S3_CDN_BASE_URL'),
        ],
    ],
];
```

## File Upload Form

```html
<form action="/api/upload" method="POST" enctype="multipart/form-data">
    <input type="file" name="file" required>
    <button type="submit">Upload</button>
</form>
```

## Handling Uploads

### Simple Upload

```php
public function uploadAvatar()
{
    $uploader = app(FileUploader::class);

    $result = $uploader->handleUpload(
        token: $this->auth->user()->uuid,
        getParams: [
            'type' => 'avatar',
            'user_id' => (string) $this->auth->user()->uuid
        ],
        fileParams: $this->request->files->all()
    );

    if (isset($result['error'])) {
        return Response::error($result['error'], 422);
    }

    // Update user avatar
    $this->getConnection()->table('users')
        ->where(['uuid' => $this->auth->user()->uuid])
        ->update(['avatar' => $result['url']]);

    return Response::success(['url' => $result['url']]);
}
```

### Multiple Files

```php
public function uploadGallery()
{
    $uploader = app(FileUploader::class);
    $files = $this->request->files->all();
    $uploaded = [];

    foreach ($files as $file) {
        $result = $uploader->handleUpload(
            token: $this->auth->user()->uuid,
            getParams: ['user_id' => (string) $this->auth->user()->uuid],
            fileParams: ['file' => $file]
        );

        if (!isset($result['error'])) {
            $uploaded[] = $result;
        }
    }

    return Response::success($uploaded);
}
```

## Validation

### Size Limits

Configure in `config/filesystem.php`:

```php
'security' => [
    'max_upload_size' => env('MAX_FILE_UPLOAD_SIZE', 10485760), // 10MB
],
```

### Allowed Extensions

In `config/filesystem.php` (referenced by the uploader):

```php
return [
    'security' => [
        'max_upload_size' => env('MAX_FILE_UPLOAD_SIZE', 10485760), // 10MB
        'scan_uploads' => true,
    ],

    'file_manager' => [
        'allowed_extensions' => explode(',', env(
            'FILE_ALLOWED_EXTENSIONS',
            'jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx,txt'
        )),
    ],
];
```

### Custom Validation

```php
public function upload()
{
    $file = $this->request->file('file');

    // Validate size
    if ($file->getSize() > 5242880) { // 5MB
        return Response::error('File too large', 422);
    }

    // Validate type
    $allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!in_array($file->getMimeType(), $allowedTypes)) {
        return Response::error('Invalid file type', 422);
    }

    // Process upload
    $result = $uploader->handleUpload(...);

    return Response::created($result);
}
```

## Storage Backends

### Local Storage

```php
'uploads' => [
    'driver' => 'local',
    'root' => storage_path('uploads'),
    'visibility' => 'private',
],
```

### Amazon S3

```php
's3' => [
    'driver' => 's3',
    'key' => env('S3_ACCESS_KEY_ID'),
    'secret' => env('S3_SECRET_ACCESS_KEY'),
    'region' => env('S3_REGION'),
    'bucket' => env('S3_BUCKET'),
    'endpoint' => env('S3_ENDPOINT'), // For MinIO, etc.
],
```

### Azure Blob

```php
'azure' => [
    'driver' => 'azure',
    'connection_string' => env('AZURE_STORAGE_CONNECTION_STRING'),
    'container' => env('AZURE_STORAGE_CONTAINER'),
],
```

### Google Cloud Storage

```php
'gcs' => [
    'driver' => 'gcs',
    'key_file' => env('GCS_KEY_FILE'),
    'bucket' => env('GCS_BUCKET'),
],
```

## Working with Storage

### Store File

```php
use Glueful\Storage\StorageManager;

$storage = app(StorageManager::class);

// Store file content
$storage->disk()->put('avatars/user123.jpg', $fileContent);

// Store uploaded file
$path = $this->request->file('avatar')->store('avatars');
```

### Retrieve File

```php
// Get file content
$content = $storage->disk()->get('avatars/user123.jpg');

// Check if exists
if ($storage->disk()->exists('avatars/user123.jpg')) {
    // File exists
}
```

### Delete File

```php
$storage->disk()->delete('avatars/user123.jpg');
```

### List Files

```php
// Returns iterable of StorageAttributes
$files = $storage->listContents('avatars');

foreach ($files as $attr) {
    echo $attr->path();
}
```

## URL Generation

### Public URLs

```php
use Glueful\Storage\Support\UrlGenerator;

$urls = app(UrlGenerator::class);

$publicUrl = $urls->url('avatars/user123.jpg', 'uploads');
// https://cdn.example.com/avatars/user123.jpg
```

### Signed URLs

For private files, generate temporary signed URLs:

```php
use Glueful\Uploader\Storage\FlysystemStorage;
use Glueful\Storage\StorageManager;

$storage = app(StorageManager::class);
$disk = new FlysystemStorage($storage, $urls, 's3');

$signedUrl = $disk->getSignedUrl('documents/invoice.pdf', 3600);
// https://s3.amazonaws.com/bucket/documents/invoice.pdf?signature=...
```

## Common Patterns

### Profile Avatar

```php
public function updateAvatar()
{
    $uploader = app(FileUploader::class);

    $result = $uploader->handleUpload(
        token: $this->auth->user()->uuid,
        getParams: [],
        fileParams: $this->request->files->all()
    );

    if (isset($result['error'])) {
        return Response::error($result['error'], 422);
    }

    // Delete old avatar
    $storage = app(\Glueful\Storage\StorageManager::class);
    $user = $this->auth->user();
    if ($user->avatar) {
        $storage->disk()->delete($user->avatar);
    }

    // Update user
    $this->getConnection()->table('users')
        ->where(['uuid' => $user->uuid])
        ->update(['avatar' => $result['path']]);

    return Response::success(['url' => $result['url']]);
}
```

### Document Upload

```php
public function uploadDocument()
{
    // Validate file type
    $file = $this->request->file('document');
    $allowedTypes = ['application/pdf', 'application/msword'];

    if (!in_array($file->getMimeType(), $allowedTypes)) {
        return Response::error('Only PDF and DOC files allowed', 422);
    }

    $result = $uploader->handleUpload(
        token: $this->auth->user()->uuid,
        getParams: [
            'type' => 'document',
            'user_id' => (string) $this->auth->user()->uuid
        ],
        fileParams: $this->request->files->all()
    );

    // Store metadata
    $this->getConnection()->table('documents')->insert([
        'uuid' => $result['uuid'],
        'user_uuid' => $this->auth->user()->uuid,
        'filename' => $file->getClientOriginalName(),
        'path' => $result['path'],
        'size' => $file->getSize(),
        'mime_type' => $file->getMimeType()
    ]);

    return Response::created($result);
}
```

### Image Gallery

```php
public function uploadGalleryImage()
{
    $file = $this->request->file('image');

    // Validate image
    if (!str_starts_with($file->getMimeType(), 'image/')) {
        return Response::error('Only images allowed', 422);
    }

    // Upload original
    $result = $uploader->handleUpload(
        token: $this->auth->user()->uuid,
        getParams: [
            'type' => 'gallery',
            'user_id' => (string) $this->auth->user()->uuid
        ],
        fileParams: $this->request->files->all()
    );

    // Queue thumbnail generation
    app(\Glueful\Queue\QueueManager::class)
        ->push(GenerateThumbnailJob::class, ['path' => $result['path']]);

    return Response::created($result);
}
```

## Base64 Uploads

For API clients sending base64-encoded files, convert to a temp file and pass through the same uploader pipeline so validation, naming, and storage logic are reused:

```php
use Glueful\Uploader\FileUploader;
use Glueful\Storage\StorageManager;

public function uploadBase64()
{
    $base64 = (string) $this->request->input('file');
    $uploader = app(FileUploader::class);

    try {
        // 1) Convert base64 to a temporary file path
        $tempPath = $uploader->handleBase64Upload($base64);
    } catch (\Glueful\Uploader\ValidationException|\Glueful\Uploader\UploadException $e) {
        return Response::error($e->getMessage(), 422);
    }

    // 2) Build a synthetic $_FILES-like array for the uploader
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $tempPath) ?: 'application/octet-stream';
    finfo_close($finfo);

    $synthetic = [
        'name' => 'upload',
        'type' => $mime,
        'tmp_name' => $tempPath,
        'error' => UPLOAD_ERR_OK,
        'size' => (int) (filesize($tempPath) ?: 0),
    ];

    // 3) Reuse the same handleUpload() path with required getParams
    $result = $uploader->handleUpload(
        token: (string) $this->auth->user()->uuid,
        getParams: ['user_id' => (string) $this->auth->user()->uuid],
        fileParams: $synthetic
    );

    // 4) Clean up temp file (handleUpload moves the file)
    @unlink($tempPath);

    if (isset($result['error'])) {
        return Response::error($result['error'], 422);
    }

    return Response::created($result);
}
```

## Security

### Path Validation

All paths are validated against traversal:

```php
// ✅ Safe
$storage->disk()->put('avatars/user123.jpg', $content);

// ❌ Blocked - path traversal
$storage->disk()->put('../../../etc/passwd', $content);
```

### MIME Type Verification

Files are validated using actual content, not extensions:

```php
// Validates real MIME type with finfo
$uploader->handleUpload(...);
```

### Allowed Extensions

Only whitelisted extensions are accepted:

```env
FILE_ALLOWED_EXTENSIONS=jpg,jpeg,png,gif,pdf,doc,docx
```

### Random Filenames

Generated filenames prevent guessing:

```php
// Format: {timestamp}_{random}.{ext}
// Example: 1704123456_a1b2c3d4e5f6.jpg
```

## Cleanup

### Delete Old Files

```php
use Glueful\Uploader\FileUploader;

$uploader = app(FileUploader::class);

// Delete files older than 30 days
$freed = $uploader->cleanupOldFiles('temp/', 2592000);

logger()->info('Freed ' . $freed . ' bytes');
```

### Directory Stats

```php
$stats = $uploader->getDirectoryStats('uploads/');

// Returns:
// [
//     'count' => 1234,
//     'total_size' => 12345678,
//     'by_type' => ['image' => 800, 'pdf' => 434]
// ]
```

## Best Practices

### Validate Early

```php
// ✅ Good - validate before upload
if ($file->getSize() > $maxSize) {
    return Response::error('File too large', 422);
}
$result = $uploader->handleUpload(...);

// ❌ Bad - upload then validate
$result = $uploader->handleUpload(...);
if ($file->getSize() > $maxSize) {
    $storage->delete($result['path']);
}
```

### Use Signed URLs for Private Files

```php
// ✅ Good - temporary access
$url = $disk->getSignedUrl($path, 3600);

// ❌ Bad - permanent public access
$url = $urls->url($path);
```

### Queue Processing

```php
// ✅ Good - async processing
$result = $uploader->handleUpload(...);
Queue::push(new ProcessImageJob($result['path']));

// ❌ Bad - blocks response
$result = $uploader->handleUpload(...);
$this->processImage($result['path']); // Slow!
```

## Troubleshooting

**Upload fails with 413?**
- Increase `upload_max_filesize` in php.ini
- Increase `post_max_size` in php.ini
- Check web server limits (nginx: `client_max_body_size`)

**File type rejected?**
- Add extension to `FILE_ALLOWED_EXTENSIONS`
- Verify MIME type matches extension

**Signed URLs return plain URLs?**
- Enable `signed_urls` in disk config
- Install AWS SDK: `composer require aws/aws-sdk-php`

**Memory errors on large files?**
- Files are streamed by default
- Check `memory_limit` in php.ini

## Next Steps

- [Queues & Jobs](/features/queues-jobs) - Process uploads async
- [Storage](/advanced/storage) - Advanced storage features
- [Security](/advanced/security) - Upload security
