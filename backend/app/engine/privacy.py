import hashlib
import re
from typing import Any, Optional
import numpy as np

def mask_email(email: str) -> str:
    if not isinstance(email, str) or "@" not in email:
        return email
    parts = email.split("@", 1)
    username, domain = parts[0], parts[1]
    if len(username) <= 2:
        masked_user = username[0] + "***"
    else:
        masked_user = username[:2] + "****"
    return f"{masked_user}@{domain}"

def mask_name(name: str) -> str:
    if not isinstance(name, str):
        return name
    parts = name.split()
    masked_parts = []
    for part in parts:
        if len(part) <= 1:
            masked_parts.append(part)
        else:
            masked_parts.append(part[0] + "*" * (len(part) - 1))
    return " ".join(masked_parts)

def mask_string(val: str, pattern: Optional[str] = None) -> str:
    if not isinstance(val, str):
        val = str(val)
    if "@" in val:
        return mask_email(val)
    if " " in val:
        return mask_name(val)
    if len(val) <= 2:
        return "*" * len(val)
    return val[:1] + "*" * (len(val) - 2) + val[-1:]

def hash_value(val: Any) -> str:
    raw = str(val).encode("utf-8")
    return hashlib.sha256(raw).hexdigest()

def apply_laplace_noise(val: float, epsilon: float = 1.0, sensitivity: float = 1.0, rng: Optional[np.random.RandomState] = None) -> float:
    if epsilon <= 0:
        epsilon = 0.1
    scale = sensitivity / epsilon
    if rng is not None:
        noise = rng.laplace(0, scale)
    else:
        noise = np.random.laplace(0, scale)
    return round(float(val + noise), 2)
