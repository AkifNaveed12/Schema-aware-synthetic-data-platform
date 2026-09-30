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
        """Synchronous SMTP email dispatcher."""
        msg = MIMEMultipart("mixed")
        msg["From"] = f'"{self.from_name}" <{self.from_email}>'
        msg["To"] = to_email
        msg["Subject"] = subject

        # Body container
        alt_part = MIMEMultipart("alternative")
        alt_part.attach(MIMEText(body_text, "plain", "utf-8"))
        if body_html:
            alt_part.attach(MIMEText(body_html, "html", "utf-8"))
        msg.attach(alt_part)

        # Attachments
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

        try:
            logger.info("Connecting to SMTP server %s:%s...", self.host, self.port)
            # Use SMTP_SSL for port 465; STARTTLS for 587/25/2525
            if self.port == 465:
                import ssl as _ssl
                ctx = _ssl.create_default_context()
                with smtplib.SMTP_SSL(self.host, self.port, timeout=30, context=ctx) as server:
                    server.ehlo()
                    if self.username and self.password:
                        server.login(self.username, self.password)
                    server.sendmail(self.from_email, [to_email], msg.as_string())
            else:
                with smtplib.SMTP(self.host, self.port, timeout=30) as server:
                    server.ehlo()
                    if self.port in (587, 25, 2525):
                        server.starttls()
                        server.ehlo()
                    if self.username and self.password:
                        server.login(self.username, self.password)
                    server.sendmail(self.from_email, [to_email], msg.as_string())

            logger.info("Email successfully dispatched to %s", to_email)
            return {
                "success": True,
                "message": f"Dataset successfully dispatched to {to_email}",
                "recipient": to_email,
            }
        except smtplib.SMTPAuthenticationError as e:
            logger.error("SMTP authentication failed: %s", str(e))
            raise RuntimeError(f"SMTP Authentication Error: Invalid credentials ({str(e)})")
        except smtplib.SMTPConnectError as e:
            logger.error("SMTP connection failed: %s", str(e))
            raise RuntimeError(f"SMTP Connection Error: Cannot reach {self.host}:{self.port} ({str(e)})")
        except Exception as e:
            logger.error("Failed to send SMTP email: %s", str(e), exc_info=True)
            raise RuntimeError(f"SMTP Dispatch Error: {str(e)}")


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
