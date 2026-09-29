import time
import threading
from typing import Dict, Any, Tuple

class AIRateLimiter:
    def __init__(self, max_requests_per_minute: int = 60, burst_limit: int = 15):
        self.max_rpm = max_requests_per_minute
        self.burst_limit = burst_limit
        self.window_seconds = 60.0
        self._timestamps = []
        self._lock = threading.Lock()
        self.total_allowed = 0
        self.total_throttled = 0

    def acquire(self) -> Tuple[bool, float]:
        now = time.time()
        with self._lock:
            cutoff = now - self.window_seconds
            self._timestamps = [ts for ts in self._timestamps if ts > cutoff]

            if len(self._timestamps) >= self.max_rpm:
                oldest = self._timestamps[0]
                wait_seconds = max(0.1, round(self.window_seconds - (now - oldest), 2))
                self.total_throttled += 1
                return False, wait_seconds

            self._timestamps.append(now)
            self.total_allowed += 1
            return True, 0.0

    def stats(self) -> Dict[str, Any]:
        now = time.time()
        with self._lock:
            cutoff = now - self.window_seconds
            active = len([ts for ts in self._timestamps if ts > cutoff])
            return {
                'active_requests_in_window': active,
                'max_rpm': self.max_rpm,
                'total_allowed': self.total_allowed,
                'total_throttled': self.total_throttled
            }

ai_rate_limiter = AIRateLimiter()
