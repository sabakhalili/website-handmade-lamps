#!/usr/bin/env python3
"""Local preview server that mirrors two things Vercel does in production,
so what you see locally matches what you'll see once deployed:

1. Clean URLs (vercel.json's "cleanUrls": true) — a request for an
   extensionless path like /about is served from about.html on disk, the
   same way Vercel resolves it. Plain `python3 -m http.server` has no idea
   about this and 404s on every nav link, which is why About/Contact looked
   "missing" when testing directly with http.server.
2. The same security headers as vercel.json (kept in sync by hand), plus
   Cache-Control: no-store so edits always show up on refresh instead of
   being served from a stale cache.

Usage: python3 dev-server.py [port]  (default port 4173)
"""

import os
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlsplit

SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Frame-Options": "DENY",
    "Permissions-Policy": (
        "camera=(), microphone=(), geolocation=(), payment=(), usb=(), "
        "interest-cohort=()"
    ),
    "Content-Security-Policy": (
        "default-src 'self'; script-src 'self'; style-src 'self'; "
        "img-src 'self'; connect-src 'self'; form-action 'none'; "
        "frame-ancestors 'none'; base-uri 'self'; object-src 'none'"
    ),
    # Strict-Transport-Security omitted locally — meaningless over plain
    # http://localhost.
}


class CleanUrlHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        self._resolve_clean_url()
        super().do_GET()

    def do_HEAD(self):
        self._resolve_clean_url()
        super().do_HEAD()

    def _resolve_clean_url(self):
        parsed = urlsplit(self.path)
        path = parsed.path
        last_segment = path.rsplit("/", 1)[-1]
        if path.endswith("/") or "." in last_segment:
            return
        fs_path = self.translate_path(path)
        if not os.path.isfile(fs_path) and os.path.isfile(fs_path + ".html"):
            new_path = path + ".html"
            if parsed.query:
                new_path += "?" + parsed.query
            self.path = new_path

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        for key, value in SECURITY_HEADERS.items():
            self.send_header(key, value)
        super().end_headers()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 4173
    HTTPServer(("", port), CleanUrlHandler).serve_forever()
