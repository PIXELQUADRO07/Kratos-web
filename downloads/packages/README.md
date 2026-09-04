# Packages folder

Put the real `.kpkg` package files here (e.g. `wpa_supplicant-2.12-x86_64.kpkg`),
then add a matching entry to `assets/data/packages.json` with the correct
`file` path and `sha256` checksum.

The entries currently in `packages.json` are examples — replace the
`sha256` value (`REPLACE_WITH_REAL_SHA256`) and make sure the file listed
in `file` actually exists here before publishing.

To generate a checksum:

```
sha256sum wpa_supplicant-2.12-x86_64.kpkg
```
