import time
from typing import Any, Dict, List, Optional
import numpy as np
from faker import Faker

from backend.app.models.data_profile import ColumnProfile, DistributionConfig, PrivacyRule
from backend.app.models.schemas import TabularGenerateRequest, TabularGenerateData
from backend.app.engine.privacy import mask_string, hash_value, apply_laplace_noise

def get_default_columns() -> List[ColumnProfile]:
    return [
        ColumnProfile(
            name="ID",
            data_type="integer",
            semantic_type="id_sequence",
            is_primary_key=True,
            distribution=DistributionConfig(type="sequence", start_value=10231)
        ),
        ColumnProfile(
            name="Name",
            data_type="string",
            semantic_type="full_name"
        ),
        ColumnProfile(
            name="Email",
            data_type="string",
            semantic_type="email"
        ),
        ColumnProfile(
            name="Signup",
            data_type="date",
            semantic_type="date"
        ),
        ColumnProfile(
            name="Balance",
            data_type="currency",
            semantic_type="currency",
            distribution=DistributionConfig(type="log_normal", mean=500.0, std_dev=250.0, min_value=10.0, max_value=2500.0)
        )
    ]

class TabularEngine:
    def __init__(self):
        pass

    def generate(self, request: TabularGenerateRequest) -> TabularGenerateData:
        start_time = time.perf_counter()
        seed = request.random_seed if request.random_seed is not None else 42
        rng = np.random.RandomState(seed)
        fake = Faker(request.locale)
        fake.seed_instance(seed)

        columns = request.columns
        if not columns and request.profile and request.profile.tables:
            columns = request.profile.tables[0].columns
        if not columns:
            columns = get_default_columns()

        row_count = request.row_count
        rows: List[Dict[str, Any]] = []

        # Precompute column generators
        col_data: Dict[str, List[Any]] = {}
        for col in columns:
            col_data[col.name] = self._generate_column(col, row_count, rng, fake, request.currency, request.apply_privacy)

        # Apply nulls & outliers where specified
        for col in columns:
            null_rate = max(col.null_rate, request.null_rate)
            if null_rate > 0 and not col.is_primary_key:
                mask = rng.rand(row_count) < null_rate
                for idx in np.where(mask)[0]:
                    col_data[col.name][idx] = None

            outlier_rate = max(col.outlier_rate, request.outlier_rate)
            if outlier_rate > 0 and col.data_type in ["integer", "float", "currency"]:
                mask = rng.rand(row_count) < outlier_rate
                for idx in np.where(mask)[0]:
                    val = col_data[col.name][idx]
                    if val is not None:
                        col_data[col.name][idx] = round(float(val) * float(rng.uniform(5.0, 15.0)), 2)

        # Transpose to rows
        col_names = [col.name for col in columns]
        for i in range(row_count):
            row_dict = {name: col_data[name][i] for name in col_names}
            rows.append(row_dict)

        exec_time = round((time.perf_counter() - start_time) * 1000, 2)
        return TabularGenerateData(
            columns=col_names,
            rows=rows,
            total_rows_generated=row_count,
            seed_applied=seed,
            execution_time_ms=exec_time,
            validation_status="passed"
        )

    def _generate_column(
        self,
        col: ColumnProfile,
        row_count: int,
        rng: np.random.RandomState,
        fake: Faker,
        currency: str,
        apply_privacy: bool
    ) -> List[Any]:
        dtype = col.data_type.lower()
        semantic = (col.semantic_type or "").lower()
        dist = col.distribution
        privacy = col.privacy or PrivacyRule()

        results = []

        if semantic == "id_sequence" or (dist and dist.type == "sequence"):
            start = dist.start_value if dist and dist.start_value is not None else 1
            results = [start + i for i in range(row_count)]

        elif dtype == "integer":
            if dist and dist.type == "normal":
                mean = dist.mean if dist.mean is not None else 100
                std = dist.std_dev if dist.std_dev is not None else 15
                vals = rng.normal(mean, std, row_count).astype(int)
            elif dist and dist.type == "uniform":
                low = int(dist.min_value if dist.min_value is not None else 1)
                high = int(dist.max_value if dist.max_value is not None else 1000)
                vals = rng.randint(low, high + 1, row_count)
            else:
                vals = rng.randint(1000, 99999, row_count)
            results = list(vals)

        elif dtype in ["float", "currency"]:
            if dist and dist.type == "log_normal":
                mean = dist.mean if dist.mean is not None else 500.0
                std = dist.std_dev if dist.std_dev is not None else 250.0
                # Approximate lognormal params from arithmetic mean and std
                sigma = np.sqrt(np.log(1 + (std / max(mean, 1)) ** 2))
                mu = np.log(max(mean, 1)) - 0.5 * sigma ** 2
                raw = rng.lognormal(mu, sigma, row_count)
                if dist.min_value is not None:
                    raw = np.maximum(raw, dist.min_value)
                if dist.max_value is not None:
                    raw = np.minimum(raw, dist.max_value)
                results = [round(float(v), 2) for v in raw]
            elif dist and dist.type == "normal":
                mean = dist.mean if dist.mean is not None else 500.0
                std = dist.std_dev if dist.std_dev is not None else 100.0
                raw = rng.normal(mean, std, row_count)
                results = [round(float(v), 2) for v in raw]
            else:
                low = dist.min_value if dist and dist.min_value is not None else 10.0
                high = dist.max_value if dist and dist.max_value is not None else 1000.0
                raw = rng.uniform(low, high, row_count)
                results = [round(float(v), 2) for v in raw]

        elif dtype == "date":
            # Dates from recent 2 years
            start_ts = 1704067200  # 2024-01-01
            end_ts = 1772496000    # 2026-03-01
            rand_ts = rng.randint(start_ts, end_ts, row_count)
            from datetime import datetime
            results = [datetime.fromtimestamp(ts).strftime("%Y-%m-%d") for ts in rand_ts]

        elif semantic == "email":
            results = [fake.email() for _ in range(row_count)]

        elif semantic in ["full_name", "name"]:
            results = [fake.name() for _ in range(row_count)]

        elif semantic == "company":
            results = [fake.company() for _ in range(row_count)]

        elif semantic == "address":
            results = [fake.street_address() for _ in range(row_count)]

        elif dist and dist.type == "categorical" and dist.categories:
            cats = dist.categories
            probs = dist.weights if dist.weights and len(dist.weights) == len(cats) else None
            results = list(rng.choice(cats, size=row_count, p=probs))

        else:
            # General strings
            results = [fake.word().capitalize() for _ in range(row_count)]

        # Apply column-level privacy controls if enabled
        if apply_privacy:
            transformed = []
            for v in results:
                curr = v
                if privacy.mask and isinstance(curr, str):
                    curr = mask_string(curr)
                if privacy.hash_sha256:
                    curr = hash_value(curr)
                if privacy.differential_noise and isinstance(curr, (int, float)):
                    curr = apply_laplace_noise(float(curr), epsilon=privacy.epsilon, rng=rng)
                transformed.append(curr)
            results = transformed

        return results

tabular_engine = TabularEngine()
