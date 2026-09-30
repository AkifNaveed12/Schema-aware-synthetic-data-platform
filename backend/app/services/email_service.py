"""
backend/app/services/email_service.py

Provides clean SMTP-based email dispatch for generated synthetic datasets.
Sends dataset artifacts (CSV, JSON, SQL) as email attachments directly to destination addresses.
"""

import asyncio
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email import encoders
import logging
import smtplib
from typing import Any, Dict, List, Optional

from backend.app.core.config import settings

logger = logging.getLogger("hackdata.email_service")


class EmailService:
    def __init__(self):
        self.host = settings.SMTP_HOST
        self.port = settings.SMTP_PORT
        self.username = settings.SMTP_USERNAME
        self.password = settings.SMTP_PASSWORD
        self.from_email = settings.SMTP_FROM_EMAIL or settings.SMTP_USERNAME
        self.from_name = settings.SMTP_FROM_NAME or "Synthetic Data Generator"

    def _send_sync(
        self,
        to_email: str,
        subject: str,
        body_text: str,
        body_html: Optional[str] = None,
        attachments: Optional[List[Dict[str, str]]] = None,
    ) -> Dict[str, Any]:
        """
        Synchronous email dispatcher with:
        1. Resend / Brevo HTTPS API support (bypasses cloud SMTP firewall blocks on port 443)
        2. Strict IPv4 socket resolution (prevents container IPv6 ENETUNREACH Errno 101)
        3. Automatic fallback between port 587 (STARTTLS) and port 465 (SSL)
        """
        import os
        import socket
        import ssl
        import urllib.request
        import json
        import base64

        # ── 1. Check HTTP-based Email Providers (Port 443 — never blocked) ──
        resend_key = os.environ.get("RESEND_API_KEY")
        if resend_key:
            try:
                logger.info("Dispatching email via Resend HTTPS API...")
                resend_payload = {
                    "from": f"{self.from_name} <onboarding@resend.dev>",
                    "to": [to_email],
                    "subject": subject,
                    "text": body_text,
                    "html": body_html or body_text,
                }
                if attachments:
                    resend_payload["attachments"] = [
                        {
                            "filename": att.get("filename", "synthetic_data.csv"),
                            "content": base64.b64encode(att.get("content", "").encode("utf-8")).decode("ascii"),
                        }
                        for att in attachments
                    ]
                req = urllib.request.Request(
                    "https://api.resend.com/emails",
                    data=json.dumps(resend_payload).encode("utf-8"),
                    headers={
                        "Authorization": f"Bearer {resend_key}",
                        "Content-Type": "application/json",
                    },
                    method="POST",
                )
                with urllib.request.urlopen(req, timeout=20) as resp:
                    resp_data = json.loads(resp.read().decode("utf-8"))
                    logger.info("Email delivered via Resend: %s", resp_data)
                    return {
                        "success": True,
                        "message": f"Dataset successfully dispatched to {to_email} via Resend",
                        "recipient": to_email,
                    }
            except Exception as resend_err:
                logger.warning("Resend dispatch failed, falling back to SMTP: %s", resend_err)

        # ── 2. Build MIME Email Message for SMTP ──────────────────────────────
        msg = MIMEMultipart("mixed")
        msg["From"] = f'"{self.from_name}" <{self.from_email}>'
        msg["To"] = to_email
        msg["Subject"] = subject

        alt_part = MIMEMultipart("alternative")
        alt_part.attach(MIMEText(body_text, "plain", "utf-8"))
        if body_html:
            alt_part.attach(MIMEText(body_html, "html", "utf-8"))
        msg.attach(alt_part)

        if attachments:
            for att in attachments:
                filename = att.get("filename", "synthetic_data.csv")
                content = att.get("content", "")
                mime_type = att.get("mime_type", "text/csv")
                main_type, sub_type = mime_type.split("/", 1) if "/" in mime_type else ("application", "octet-stream")
                part = MIMEBase(main_type, sub_type)
                part.set_payload(content.encode("utf-8"))
                encoders.encode_base64(part)
                part.add_header("Content-Disposition", f"attachment; filename=\"{filename}\"")
                msg.attach(part)

        # ── 3. Helper to resolve strictly IPv4 ────────────────────────────────
        def _get_ipv4(host: str, port: int) -> str:
            try:
                results = socket.getaddrinfo(host, port, socket.AF_INET, socket.SOCK_STREAM)
                if results:
                    return results[0][4][0]
            except Exception:
                pass
            return host

        # ── 4. Try ports: configured port first, then fallback port ───────────
        target_ports = [self.port]
        if self.port == 587 and 465 not in target_ports:
            target_ports.append(465)
        elif self.port == 465 and 587 not in target_ports:
            target_ports.append(587)

        last_exc: Optional[Exception] = None
        for p in target_ports:
            try:
                ipv4_addr = _get_ipv4(self.host, p)
                logger.info("Connecting to SMTP %s (%s):%d...", self.host, ipv4_addr, p)

                if p == 465:
                    # SSL direct
                    ctx = ssl.create_default_context()
                    raw_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                    raw_sock.settimeout(4)
                    raw_sock.connect((ipv4_addr, p))
                    ssl_sock = ctx.wrap_socket(raw_sock, server_hostname=self.host)
                    with smtplib.SMTP_SSL(timeout=4) as server:
                        server.sock = ssl_sock
                        server.file = ssl_sock.makefile('rb')
                        server.ehlo()
                        if self.username and self.password:
                            server.login(self.username, self.password)
                        server.sendmail(self.from_email, [to_email], msg.as_string())
                else:
                    # STARTTLS on 587
                    raw_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                    raw_sock.settimeout(4)
                    raw_sock.connect((ipv4_addr, p))
                    with smtplib.SMTP(timeout=4) as server:
                        server.sock = raw_sock
                        server.file = raw_sock.makefile('rb')
                        server.ehlo()
                        server.starttls()
                        server.ehlo()
                        if self.username and self.password:
                            server.login(self.username, self.password)
                        server.sendmail(self.from_email, [to_email], msg.as_string())

                logger.info("Email successfully dispatched to %s via port %d", to_email, p)
                return {
                    "success": True,
                    "message": f"Dataset successfully dispatched to {to_email}",
                    "recipient": to_email,
                }
            except smtplib.SMTPAuthenticationError as auth_err:
                logger.error("SMTP authentication failed on port %d: %s", p, auth_err)
                raise RuntimeError(f"SMTP Authentication Error: Invalid credentials ({str(auth_err)})")
            except Exception as exc:
                logger.warning("SMTP attempt on port %d failed: %s", p, exc)
                last_exc = exc

        # If all SMTP connection attempts failed
        err_str = str(last_exc) if last_exc else "Connection failed"
        if "101" in err_str or "unreachable" in err_str.lower() or "connection refused" in err_str.lower():
            logger.error("Outbound SMTP blocked by cloud provider firewall: %s", err_str)
            raise RuntimeError(
                f"Cloud network restriction: Outbound SMTP ports 587/465 are restricted by hosting provider firewall (Render Free tier policy). "
                f"To send live emails in production, set RESEND_API_KEY in Render environment variables (port 443 HTTPS), or run locally."
            )
        raise RuntimeError(f"SMTP Dispatch Error: {err_str}")



    async def send_dataset_email(
        self,
        to_email: str,
        dataset_name: str,
        row_count: int,
        files: List[Dict[str, str]],  # [{"filename": "...", "content": "...", "mime_type": "..."}]
        source_note: str = "Synthetic Data Platform"
    ) -> Dict[str, Any]:
        """Asynchronously dispatches synthetic dataset files via thread pool."""
        subject = f"Your Synthetic Dataset: {dataset_name} ({row_count:,} records)"

        body_text = f"""Hello,

Your synthetic dataset '{dataset_name}' with {row_count:,} records has been generated and is attached to this email.

Details:
- Dataset: {dataset_name}
- Total Records: {row_count:,}
- Source: {source_note}
- Platform: HackData V2 Synthetic Data Platform

Please find the attached dataset file(s).

Best regards,
{self.from_name}
"""

        body_html = f"""
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background: #ffffff; border: 1px solid #e2e8f0; rounded: 12px;">
            <div style="display: flex; align-items: center; margin-bottom: 20px;">
                <h2 style="margin: 0; color: #0f766e; font-size: 20px; font-weight: 700;">HackData V2 — Synthetic Data Platform</h2>
            </div>
            <p style="font-size: 14px; line-height: 1.6; color: #334155;">Hello,</p>
            <p style="font-size: 14px; line-height: 1.6; color: #334155;">Your synthetic dataset <strong>{dataset_name}</strong> ({row_count:,} records) has been successfully generated and attached.</p>
            <div style="background: #f8fafc; border-left: 4px solid #0d9488; padding: 12px 16px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 4px 0; font-size: 13px;"><strong>Dataset:</strong> {dataset_name}</p>
                <p style="margin: 4px 0; font-size: 13px;"><strong>Records:</strong> {row_count:,} rows</p>
                <p style="margin: 4px 0; font-size: 13px;"><strong>Generation Mode:</strong> {source_note}</p>
            </div>
            <p style="font-size: 14px; line-height: 1.6; color: #334155;">The requested dataset export files are attached to this message.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="font-size: 12px; color: #64748b; margin: 0;">Sent via {self.from_name} · Automated SMTP Service</p>
        </div>
        """

        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(
            None,
            self._send_sync,
            to_email,
            subject,
            body_text,
            body_html,
            files
        )


email_service = EmailService()
