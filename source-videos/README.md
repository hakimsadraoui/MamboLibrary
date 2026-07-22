# Source videos

Drop your long-form teaching videos in this folder (sub-folders are fine).

Supported formats: `.mp4`, `.mov`, `.mkv`, `.avi`, `.webm`, `.m4v`

Then run:

```bash
npm run pipeline
```

Rules honoured by the pipeline:

- Files in this folder are **never modified, moved, renamed or deleted**.
- Every file is fingerprinted (size + mtime + probe data), so re-running the
  pipeline only processes **new or changed** files.
- Web-compatible working copies are written to `public/sources/` — the
  originals stay untouched.

> **Note on GitHub:** one-hour videos are far larger than GitHub's 100 MB
> file limit. Either keep the videos local-only (this folder is gitignored),
> use **Git LFS** (`git lfs install` — `.gitattributes` is already set up),
> or attach them to a GitHub **Release** and download them into this folder.

The `demo/` sub-folder contains a tiny synthetic lesson video used to
validate the pipeline end-to-end. Delete it once real footage is in place.
