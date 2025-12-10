"""
EDA Alerting Service
Gère l'envoi d'alertes par email et Slack
"""

import os
import aiohttp
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)

class AlertService:
    """
    Service d'alertes pour Auto EDA
    Supporte email et Slack
    """
    
    def __init__(self):
        # Configuration email
        self.smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.smtp_user = os.getenv('SMTP_USER', '')
        self.smtp_password = os.getenv('SMTP_PASSWORD', '')
        self.from_email = os.getenv('ALERT_FROM_EMAIL', self.smtp_user)
        
        # Configuration Slack
        self.slack_webhook_url = os.getenv('SLACK_WEBHOOK_URL', '')
    
    async def send_critical_alert(self, source, report: Dict):
        """
        Envoyer une alerte critique (email + Slack)
        """
        logger.info(f"🚨 Sending CRITICAL alert for source: {source.name}")
        
        subject = f"🚨 ALERTE CRITIQUE - Auto EDA: {source.name}"
        message = self._format_alert_message(report, severity='critical')
        
        # Email
        if self.smtp_user:
            await self._send_email(subject, message)
        
        # Slack
        if self.slack_webhook_url:
            await self._send_slack(subject, message, color='danger')
    
    async def send_high_alert(self, source, report: Dict):
        """
        Envoyer une alerte importante (email ou Slack selon config)
        """
        logger.info(f"⚠️ Sending HIGH alert for source: {source.name}")
        
        subject = f"⚠️ Alerte Importante - Auto EDA: {source.name}"
        message = self._format_alert_message(report, severity='high')
        
        # Slack uniquement pour les alertes "high"
        if self.slack_webhook_url:
            await self._send_slack(subject, message, color='warning')
    
    def _format_alert_message(self, report: Dict, severity: str) -> str:
        """
        Formater le message d'alerte
        """
        message_parts = [
            f"**{report['title']}**\n",
            f"**Résumé:** {report['summary']}\n",
            f"\n**Top Anomalies:**\n"
        ]
        
        for finding in report.get('findings', [])[:3]:
            message_parts.append(
                f"• {finding['metric']} - {finding['severity'].upper()}\n"
                f"  Observé: {finding['observed']}, Attendu: {finding['expected']}\n"
                f"  Écart: {finding['deviation']}\n"
            )
            if finding.get('probable_cause'):
                message_parts.append(f"  Cause: {finding['probable_cause']}\n")
        
        if report.get('recommendations'):
            message_parts.append("\n**Recommandations:**\n")
            for rec in report['recommendations'][:3]:
                message_parts.append(f"• {rec}\n")
        
        return ''.join(message_parts)
    
    async def _send_email(self, subject: str, body: str):
        """
        Envoyer un email via SMTP
        """
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.from_email
            msg['To'] = self.from_email  # TODO: Configurer destinataires
            
            # Version texte
            text_part = MIMEText(body, 'plain')
            msg.attach(text_part)
            
            # Version HTML
            html_body = body.replace('\n', '<br>').replace('**', '<strong>').replace('**', '</strong>')
            html_part = MIMEText(f'<html><body>{html_body}</body></html>', 'html')
            msg.attach(html_part)
            
            # Envoyer
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            
            logger.info(f"✅ Email sent: {subject}")
            
        except Exception as e:
            logger.error(f"❌ Error sending email: {e}")
    
    async def _send_slack(self, title: str, message: str, color: str = 'warning'):
        """
        Envoyer une notification Slack via webhook
        """
        try:
            payload = {
                "attachments": [
                    {
                        "color": color,  # 'danger', 'warning', 'good'
                        "title": title,
                        "text": message,
                        "footer": "Auto EDA Alert System",
                        "ts": int(datetime.now().timestamp())
                    }
                ]
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(self.slack_webhook_url, json=payload) as response:
                    if response.status == 200:
                        logger.info(f"✅ Slack notification sent: {title}")
                    else:
                        logger.error(f"❌ Slack error: {response.status}")
            
        except Exception as e:
            logger.error(f"❌ Error sending Slack notification: {e}")

from datetime import datetime
