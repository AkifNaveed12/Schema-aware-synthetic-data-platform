"""
backend/app/pipeline/ingestion.py

Dataset ingestion: file bytes → modality detection → parser → raw DataFrame.
Security: validates file type, size, and content before any pandas parsing.
"""
import hashlib
import io
import json
from typing import Dict, Optional, Tuple

import pandas as pd

# ── Constants ─────────────────────────────────────────────────────────────────
MAX_FILE_BYTES = 10 * 1024 * 1024      # 10 MB hard limit
MAX_ROWS_PROFILING = 100_000           # rows cap for profiling
SUPPORTED_MIME = {
    "text/csv", "text/plain", "application/json",
    "application/vnd.ms-excel",          # .csv opened as Excel
}
SUPPORTED_EXTENSIONS = {".csv", ".tsv", ".txt", ".json"}


class IngestionError(ValueError):
    """Raised when a file cannot be safely ingested."""
    pass


def detect_modality(filename: str, content_type: str, preview: bytes) -> str:
    """
    Determine the data modality from filename extension and content peek.
    Returns 'tabular' or 'document' (relational handled separately via multi-table upload).
    """
    fname = filename.lower()
    if fname.endswith((".csv", ".tsv")):
        return "tabular"
    if fname.endswith(".json"):
        # Peek — if top-level is a list of dicts it's tabular
        try:
            obj = json.loads(preview[:4096])
            if isinstance(obj, list) and len(obj) > 0 and isinstance(obj[0], dict):
                return "tabular"
        except Exception:
            pass
        return "tabular"
    if fname.endswith(".txt"):
        # Treat as CSV if it contains commas/tabs
        sample = preview[:2048].decode("utf-8", errors="replace")
        if "," in sample or "\t" in sample:
            return "tabular"
    return "tabular"  # default


def _validate_filename(filename: str) -> None:
    """Security: reject path traversal and dangerous filenames."""
    bad_chars = set("/\\%\x00\n\r<>|?*:")
    if any(c in bad_chars for c in filename) or filename.startswith(".") or ".." in filename:
        raise IngestionError(f"Invalid filename: '{filename}'")
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in SUPPORTED_EXTENSIONS:
        raise IngestionError(
            f"Unsupported file extension '{ext}'. "
            f"Supported: {', '.join(sorted(SUPPORTED_EXTENSIONS))}"
        )


def _validate_size(data: bytes) -> None:
    if len(data) == 0:
        raise IngestionError("Uploaded file is empty (0 bytes).")
    if b"\x00" in data:
        raise IngestionError("File contains invalid null byte characters.")
    if len(data) > MAX_FILE_BYTES:
        mb = len(data) / (1024 * 1024)
        raise IngestionError(
            f"File too large ({mb:.1f} MB). Maximum allowed size is 10 MB."
        )


def parse_csv(data: bytes, delimiter: str = ",") -> pd.DataFrame:
    """Parse CSV bytes safely into a DataFrame."""
    try:
        text = data.decode("utf-8", errors="replace")
        df = pd.read_csv(
            io.StringIO(text),
            sep=delimiter,
            engine="python",
            on_bad_lines="skip",
            nrows=MAX_ROWS_PROFILING,
        )
        return df
    except Exception as exc:
        raise IngestionError(f"CSV parse failed: {exc}") from exc


def parse_json(data: bytes) -> pd.DataFrame:
    """Parse JSON bytes safely into a DataFrame."""
    try:
        obj = json.loads(data.decode("utf-8", errors="replace"))
    except Exception as exc:
        raise IngestionError(f"JSON parse failed: {exc}") from exc

    if isinstance(obj, list):
        if len(obj) == 0:
            raise IngestionError("JSON file contains an empty array.")
        if not isinstance(obj[0], dict):
            raise IngestionError("JSON array elements must be objects.")
        return pd.DataFrame(obj[:MAX_ROWS_PROFILING])

    if isinstance(obj, dict):
        # Try nested: {data: [...], records: [...]}
        for key in ("data", "records", "rows", "items", "results"):
            if key in obj and isinstance(obj[key], list):
                return pd.DataFrame(obj[key][:MAX_ROWS_PROFILING])
        # Flat dict of lists (column-oriented)
        try:
            return pd.DataFrame(obj).head(MAX_ROWS_PROFILING)
        except Exception as exc:
            raise IngestionError(f"JSON object could not be converted to tabular form: {exc}") from exc

    raise IngestionError("JSON content is not a recognised tabular format (expected array of objects or column dict).")


def ingest(
    data: bytes,
    filename: str,
    content_type: Optional[str] = None,
) -> Tuple[pd.DataFrame, str, str]:
    """
    Main ingestion entry point.

    Parameters
    ----------
    data         : raw file bytes
    filename     : original filename (used for modality detection + security check)
    content_type : MIME type from upload (optional, used for secondary check)

    Returns
    -------
    (df, modality, source_fingerprint_hex)
        df                    : parsed DataFrame (NOT cleaned yet)
        modality              : 'tabular' | 'document'
        source_fingerprint    : SHA-256 hex of the original bytes
    """
    _validate_filename(filename)
    _validate_size(data)

    fingerprint = hashlib.sha256(data).hexdigest()
    modality = detect_modality(filename, content_type or "", data[:4096])

    fname_lower = filename.lower()
    if fname_lower.endswith(".json"):
        df = parse_json(data)
    elif fname_lower.endswith((".tsv", ".txt")):
        df = parse_csv(data, delimiter="\t" if fname_lower.endswith(".tsv") else ",")
    else:
        df = parse_csv(data)

    if len(df) == 0:
        raise IngestionError("File parsed to zero rows. Ensure the file has a header and data rows.")
    if len(df.columns) == 0:
        raise IngestionError("File parsed to zero columns.")

    # Sanitize and deduplicate column names if needed
    cols = [str(c).strip() for c in df.columns]
    cols = [f"col_{i+1}" if c == "" else c for i, c in enumerate(cols)]
    seen = {}
    deduped = []
    for c in cols:
        if c in seen:
            seen[c] += 1
            deduped.append(f"{c}_{seen[c]}")
        else:
            seen[c] = 0
            deduped.append(c)
    df.columns = deduped

    return df, modality, fingerprint
