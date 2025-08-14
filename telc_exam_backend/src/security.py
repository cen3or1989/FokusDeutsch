import os
import time
import threading
from functools import wraps
from typing import Callable, Any

from flask import request, jsonify


_rate_lock = threading.Lock()
_rate_store: dict[str, list[float]] = {}


def _now() -> float:
    return time.time()


def _make_key(limit_key: str) -> str:
    client_ip = request.headers.get("X-Forwarded-For", request.remote_addr or "?")
    return f"{client_ip}:{limit_key}"


def rate_limit(limit: int = 60, window_seconds: int = 60, key_func: Callable[[], str] | None = None):
    """Very small in-memory rate limiter (best-effort, single-process only).

    - limit: max number of requests in the window
    - window_seconds: window size in seconds
    - key_func: function to build a custom key; by default uses IP + endpoint
    """

    def decorator(func: Callable[..., Any]):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Allow turning off via env for dev or behind proper gateways
            if os.getenv("RATE_LIMIT_DISABLED", "false").lower() == "true":
                return func(*args, **kwargs)

            kf = key_func or (lambda: request.endpoint or request.path)
            key = _make_key(kf())

            with _rate_lock:
                now = _now()
                bucket = _rate_store.get(key, [])
                # purge old
                threshold = now - window_seconds
                bucket = [t for t in bucket if t > threshold]
                if len(bucket) >= limit:
                    retry_after = max(1, int(bucket[0] + window_seconds - now))
                    return (
                        jsonify({
                            "error": "rate_limited",
                            "message": "Too many requests. Please slow down.",
                            "retry_after": retry_after,
                        }),
                        429,
                        {"Retry-After": str(retry_after)},
                    )
                bucket.append(now)
                _rate_store[key] = bucket

            return func(*args, **kwargs)

        return wrapper

    return decorator


def require_admin(func: Callable[..., Any]):
    """Simple bearer token guard for admin-only endpoints.

    Reads ADMIN_TOKEN from environment. If not set, denies non-GET methods by default.
    Accepts Authorization: Bearer <token>.
    """

    @wraps(func)
    def wrapper(*args, **kwargs):
        admin_token = os.getenv("ADMIN_TOKEN", "").strip()
        auth_header = request.headers.get("Authorization", "")
        method = request.method.upper()

        if not admin_token:
            # Dev-friendly behavior: if DEBUG=true, allow all; otherwise block non-GET
            debug_enabled = os.getenv("DEBUG", "true").lower() == "true"
            if debug_enabled:
                return func(*args, **kwargs)
            if method != "GET":
                return jsonify({
                    "error": "admin_token_not_configured",
                    "message": "Admin token is not set on the server. Write operations are disabled."
                }), 403
            return func(*args, **kwargs)

        if not auth_header.startswith("Bearer "):
            return jsonify({
                "error": "unauthorized",
                "message": "Missing or invalid Authorization header."
            }), 401

        token = auth_header.split(" ", 1)[1].strip()
        if token != admin_token:
            return jsonify({
                "error": "forbidden",
                "message": "Invalid admin token."
            }), 403

        return func(*args, **kwargs)

    return wrapper


