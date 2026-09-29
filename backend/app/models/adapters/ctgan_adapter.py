"""
backend/app/models/adapters/ctgan_adapter.py

CTGANAdapter — wrapper around SDV's CTGAN tabular synthesizer.

Python 3.14 compatibility note:
   SDV / CTGAN / PyTorch do not currently support Python 3.14.
   This adapter is architecturally present and will activate if the
   libraries become compatible. Until then, it reports itself as
   unavailable via capabilities() and raises explicitly rather than
   silently falling back to wrong data.

   To install when compatible:
       pip install sdv ctgan
"""
from __future__ import annotations

from typing import Any, Dict, Optional

import pandas as pd

from backend.app.models.model_adapter import AdapterCapabilities, BenchmarkMetrics, ModelAdapter
from backend.app.models.data_profile import DataProfile

_AVAILABLE = False
_UNAVAILABLE_REASON = (
    "CTGAN requires 'sdv' and 'torch' packages. "
    "These are not installed in this environment (Python 3.14 not yet supported by SDV/PyTorch). "
    "Install sdv>=1.0 and torch in a Python <=3.11 environment to enable this adapter."
)

try:
    from sdv.single_table import CTGANSynthesizer
    from sdv.metadata import SingleTableMetadata
    _AVAILABLE = True
    _UNAVAILABLE_REASON = ""
except ImportError:
    CTGANSynthesizer = None  # type: ignore
    SingleTableMetadata = None  # type: ignore


class CTGANAdapter(ModelAdapter):
    """
    CTGAN-backed tabular synthesizer using SDV.
    """

    def __init__(self, epochs: int = 10, batch_size: int = 50) -> None:
        self._epochs = epochs
        self._batch_size = batch_size
        self._model: Any = None
        self._metadata: Any = None
        self._fitted = False
        self._columns = []

    def capabilities(self) -> AdapterCapabilities:
        return AdapterCapabilities(
            name="CTGAN",
            version="sdv>=1.0",
            supports_tabular=True,
            supports_relational=False,
            supports_document=False,
            requires_training=True,
            min_rows_for_training=10,
            max_rows_for_training=500_000,
            available=_AVAILABLE,
            unavailable_reason=_UNAVAILABLE_REASON if not _AVAILABLE else None,
        )

    def fit(
        self,
        df: pd.DataFrame,
        profile: DataProfile,
        config: Optional[Dict[str, Any]] = None,
    ) -> None:
        if not _AVAILABLE:
            raise RuntimeError(_UNAVAILABLE_REASON)
        if len(df) < 10:
            raise ValueError(f"CTGAN requires at least 10 training rows; got {len(df)}")

        metadata = SingleTableMetadata()
        metadata.detect_from_dataframe(df)

        epochs = int((config or {}).get("epochs", self._epochs))
        batch_size = int((config or {}).get("batch_size", self._batch_size))
        # Ensure batch_size is an even integer <= len(df)
        batch_size = min(batch_size, len(df))
        if batch_size % 2 != 0 and batch_size > 2:
            batch_size -= 1

        self._model = CTGANSynthesizer(
            metadata,
            epochs=epochs,
            batch_size=batch_size,
        )
        self._model.fit(df)
        self._metadata = metadata
        self._columns = list(df.columns)
        self._fitted = True


    def sample(
        self,
        num_rows: int,
        seed: Optional[int] = None,
        conditions: Optional[Dict[str, Any]] = None,
    ) -> pd.DataFrame:
        if not _AVAILABLE:
            raise RuntimeError(_UNAVAILABLE_REASON)
        if not self._fitted:
            raise RuntimeError("CTGANAdapter.sample() called before fit()")
        return self._model.sample(num_rows)

    def diagnostics(self) -> Dict[str, Any]:
        return {
            "adapter": "CTGAN",
            "available": _AVAILABLE,
            "fitted": self._fitted,
            "epochs": self._epochs,
            "batch_size": self._batch_size,
            "unavailable_reason": _UNAVAILABLE_REASON if not _AVAILABLE else None,
        }
