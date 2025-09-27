---
title: Adapters
description: Local and cloud storage adapters
---

# Adapters

Abstraction over multiple storage backends via Flysystem. Each disk is a logical name mapped to a configured adapter.

---
## 1. Built‑In Adapters

| Driver | Package Needed | Supports | Signed URLs | Notes |
|--------|----------------|----------|-------------|-------|
| local | core only | read/write, stream, list | n/a | Private by default; add CDN via `base_url`. |
| memory | core only | volatile storage | n/a | Testing only. |
| s3 | `league/flysystem-aws-s3-v3` + AWS SDK | versioned buckets, large objects | Yes (if `signed_urls`) | Presigned via AWS client. |
| azure | `league/flysystem-azure-blob-storage` | blob containers | Limited | Uses provided connection string / adapter. |
| gcs | `league/flysystem-google-cloud-storage` | GCS buckets | Indirect (custom) | Adapter created from client/bucket. |

Missing dependency libs surface an explicit exception instructing the `composer require` command to run.

---
## 2. Disk Configuration Example

`config/storage.php` excerpt:

```php
return [
	'default' => env('STORAGE_DEFAULT_DISK', 'uploads'),
	'disks' => [
		'uploads' => [
			'driver' => 'local',
			'root' => config('app.paths.uploads'),
			'visibility' => 'private',
			'base_url' => config('app.urls.cdn'),
		],
		's3' => [
			'driver' => 's3',
			'key' => env('S3_ACCESS_KEY_ID'),
			'secret' => env('S3_SECRET_ACCESS_KEY'),
			'region' => env('S3_REGION', 'us-east-1'),
			'bucket' => env('S3_BUCKET'),
			'endpoint' => env('S3_ENDPOINT'),
			'signed_urls' => env('S3_SIGNED_URLS', true),
			'signed_ttl' => env('S3_SIGNED_URL_TTL', 3600),
			'cdn_base_url' => env('S3_CDN_BASE_URL'),
		],
	],
];
```

---
## 3. Selecting a Disk

The app resolves a disk lazily when first accessed:

```php
$manager = app(Glueful\Storage\StorageManager::class);
$fs = $manager->disk(); // default
$gcs = $manager->disk('gcs');
```

If the disk driver is unavailable (missing package), an exception is thrown early, keeping failures explicit.

---
## 4. JSON Helpers & Atomic Writes

`StorageManager` adds `putJson`, `getJson`, and `putStream`. Atomic write pattern:

1. Write to a temp path with `writeStream`.
2. Move the temp object to final path.
3. Cleanup temp if leftover.

Benefits: readers never observe partial file contents.

---
## 5. Implementing a Custom Adapter

You can wire a custom driver (e.g., for on‑prem object storage) in three steps:

1. Provide a Flysystem adapter instance via config: 
	 ```php
	 'disks' => [
		 'internal' => [
			 'driver' => 'custom',
			 'adapter' => new MyCompany\Flysystem\InternalAdapter($options),
		 ],
	 ];
	 ```
2. Extend `StorageManager::createDisk` adding a `case 'custom'` branch returning `new Filesystem($adapter)`.
3. (Optional) Add metadata keys your `UrlGenerator` override can use.

Keep adapter creation side‑effect free and fast; heavy clients (HTTP) should reuse persistent connections internally.

---
## 6. Signed URL Strategy

Currently implemented for S3 by delegating to AWS SDK `createPresignedRequest`. For other providers you can:

- Override `FlysystemStorage::getSignedUrl` in a subclass.
- Or implement a new `StorageInterface` adapter and bind it when constructing `FileUploader`.

Return plain URL gracefully if signing not supported to keep callers simple.

---
## 7. Performance Considerations

| Aspect | Guidance |
|--------|----------|
| Small files (<10MB) | Single `putStream` is adequate. |
| Large files | Consider future multipart support (not yet implemented). |
| Metadata calls | Cache disk config lookups when in hot path. |
| Listing | Use `listContents` carefully; for large trees implement pagination. |
| Memory adapter | Avoid outside tests; no persistence. |

---
## 8. Error Handling

Most adapter layer failures are normalized to `StorageException` through helpers; uploader wraps these into generic 500 responses to avoid leaking environment specifics.

---
## 9. Migration & Testing Tips

- Use memory adapter for fast unit tests around higher level services.
- In integration tests against S3, scope bucket prefix to test run id to allow cleanup.
- Add health checks that attempt a zero‑byte write & delete for critical disks at startup.

---
## 10. Next Steps

Proceed to the `./uploader` reference for the secure upload pipeline & validation details.

