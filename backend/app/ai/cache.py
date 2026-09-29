import time
import hashlib
import json
import threading
from typing import Any, Dict, Optional

class AICache:
    def __init__(self, max_size: int = 500, default_ttl: int = 3600):
        self.max_size = max_size
        self.default_ttl = default_ttl
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._lock = threading.Lock()
        self.hits = 0
        self.misses = 0
        self.evictions = 0

    def _hash_key(self, raw_key: str) -> str:
        return hashlib.sha256(raw_key.encode('utf-8')).hexdigest()

    def get(self, key: str) -> Optional[Any]:
        hashed = self._hash_key(key)
        now = time.time()
        with self._lock:
            if hashed in self._cache:
                entry = self._cache[hashed]
                if entry['expires_at'] > now:
                    self.hits += 1
                    entry['last_accessed'] = now
                    return entry['data']
                else:
                    del self._cache[hashed]
            self.misses += 1
            return None

    def set(self, key: str, value: Any, ttl_seconds: Optional[int] = None) -> None:
        hashed = self._hash_key(key)
        now = time.time()
        ttl = ttl_seconds if ttl_seconds is not None else self.default_ttl
        with self._lock:
            if len(self._cache) >= self.max_size and hashed not in self._cache:
                oldest_key = min(self._cache.keys(), key=lambda k: self._cache[k]['last_accessed'])
                del self._cache[oldest_key]
                self.evictions += 1

            self._cache[hashed] = {
                'data': value,
                'created_at': now,
                'last_accessed': now,
                'expires_at': now + ttl
            }

    def clear(self) -> None:
        with self._lock:
            self._cache.clear()
            self.hits = 0
            self.misses = 0
            self.evictions = 0

    def stats(self) -> Dict[str, Any]:
        with self._lock:
            total = self.hits + self.misses
            hit_rate = (self.hits / total) if total > 0 else 0.0
            return {
                'current_size': len(self._cache),
                'max_size': self.max_size,
                'hits': self.hits,
                'misses': self.misses,
                'hit_rate': round(hit_rate, 4),
                'evictions': self.evictions
            }

ai_cache = AICache()
