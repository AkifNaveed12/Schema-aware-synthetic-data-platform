"""
backend/app/models/adapters/tvae_adapter.py

TVAEAdapter — wrapper around SDV's TVAE tabular synthesizer.
Same Python 3.14 compatibility limitation as CTGANAdapter.
"""
from __future__ import annotations

from typing import Any, Dict, Optional

import pandas as pd

from backend.app.models.model_adapter import AdapterCapabilities, BenchmarkMetrics, ModelAdapter
from backend.app.models.data_profile import DataProfile

_AVAILABLE = False
_UNAVAILABLE_REASON = (
    "TVAE requires 'sdv' and 'torch' packages. "
    "These are not installed in this environment (Python 3.14 not yet supported by SDV/PyTorch). "
    "Install sdv>=1.0 and torch in a Python <=3.11 environment to enable this adapter."
)

try:
    from sdv.single_table import TVAESynthesizer
    from sdv.metadata import SingleTableMetadata
    _AVAILABLE = True
    _UNAVAILABLE_REASON = ""
except ImportError:
    TVAESynthesizer = None  # type: ignore
    SingleTableMetadata = None  # type: ignore


class TVAEAdapter(ModelAdapter):
    """
    TVAE-backed tabular synthesizer.
    Status: architecturally present; runtime availability depends on sdv+torch installation.
    """

    def __init__(self, epochs: int = 300, batch_size: int = 500) -> None:
        self._epochs = epochs
        self._batch_size = batch_size
        self._model: Any = None
        self._fitted = False
        self._columns = []

    def capabilities(self) -> AdapterCapabilities:
        return AdapterCapabilities(
            name="TVAE",
            version="sdv>=1.0",
            supports_tabular=True,
            supports_relational=False,
            supports_document=False,
            requires_training=True,
            min_rows_for_training=100,
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
        if len(df) < 100:
            raise ValueError(f"TVAE requires at least 100 training rows; got {len(df)}")

        metadata = SingleTableMetadata()
        metadata.detect_from_dataframe(df)

        epochs = (config or {}).get("epochs", self._epochs)
        batch_size = (config or {}).get("batch_size", self._batch_size)

        self._model = TVAESynthesizer(
            metadata,
            epochs=epochs,
            batch_size=batch_size,
        )
        self._model.fit(df)
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
            raise RuntimeError("TVAEAdapter.sample() called before fit()")
        return self._model.sample(num_rows)

    def diagnostics(self) -> Dict[str, Any]:
        return {
            "adapter": "TVAE",
            "available": _AVAILABLE,
            "fitted": self._fitted,
            "epochs": self._epochs,
            "batch_size": self._batch_size,
            "unavailable_reason": _UNAVAILABLE_REASON if not _AVAILABLE else None,
        }
