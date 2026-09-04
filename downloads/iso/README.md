# ISO folder

Put the installable image here (e.g. `kratos-os-0.9.7-x86_64.iso`), then in
`assets/data/releases.json`:

1. Set `"status": "available"` for that release.
2. Fill in `"sha256"` with the real checksum.
3. Make sure `"file"` matches the filename in this folder.

Until `status` is `"available"`, the Downloads page will keep showing
"ISO coming soon" for that release, even if the entry exists in the
manifest.

To generate a checksum:

```
sha256sum kratos-os-0.9.7-x86_64.iso
```
