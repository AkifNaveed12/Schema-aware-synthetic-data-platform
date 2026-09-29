"""
backend/app/core/email_utils.py

Provides realistic email generation replacing placeholder domains (example.com, test.com)
with authentic public and enterprise mail services (gmail.com, yahoo.com, outlook.com, etc.).
"""

import re
from typing import Optional
from faker import Faker
import numpy as np

REAL_DOMAINS = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "icloud.com",
    "proton.me",
    "live.com",
]

PAKISTAN_DOMAINS = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "nayatel.pk",
    "ptcl.net.pk",
    "cyber.net.pk",
]

def generate_realistic_email(
    fake: Faker,
    rng: Optional[np.random.RandomState] = None,
    name: Optional[str] = None,
    is_pakistan: bool = False
) -> str:
    """Generate authentic email with real domains (gmail.com, yahoo.com, outlook.com, etc.)."""
    domains = PAKISTAN_DOMAINS if is_pakistan else REAL_DOMAINS
    domain = rng.choice(domains) if rng is not None else fake.random_element(domains)

    if name:
        parts = [p.lower() for p in re.sub(r"[^a-zA-Z\s]", "", name).split() if p]
        if len(parts) >= 2:
            num = rng.randint(10, 999) if rng is not None else fake.random_int(10, 999)
            pattern_choice = rng.randint(0, 3) if rng is not None else fake.random_int(0, 2)
            if pattern_choice == 0:
                user = f"{parts[0]}.{parts[-1]}{num}"
            elif pattern_choice == 1:
                user = f"{parts[0][0]}{parts[-1]}{num}"
            else:
                user = f"{parts[0]}_{parts[-1]}"
            return f"{user}@{domain}"

    # Use Faker username and attach real domain
    user_name = fake.user_name().replace(".", "").lower()
    num = rng.randint(12, 98) if rng is not None else fake.random_int(12, 98)
    return f"{user_name}{num}@{domain}"
