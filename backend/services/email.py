import os
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr, BaseModel
from typing import List
from dotenv import load_dotenv

load_dotenv()

# Configuration
# Default to mock/console if vars not set, but configured for Gmail
conf = ConnectionConfig(
    MAIL_USERNAME = os.getenv("MAIL_USERNAME", ""),
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", ""),
    MAIL_FROM = os.getenv("MAIL_FROM", "noreply@auditiq.ai"),
    MAIL_PORT = int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com"),
    MAIL_STARTTLS = True,
    MAIL_SSL_TLS = False,
    USE_CREDENTIALS = True,
    VALIDATE_CERTS = True
)

async def send_email(subject: str, recipients: List[str], body: str):
    """Generic email sender with improved error handling"""
    if not os.getenv("MAIL_USERNAME") or not os.getenv("MAIL_PASSWORD"):
        print(f"⚠️ SMTP not configured (MAIL_USERNAME/PASSWORD missing). Mocking email to {recipients}: {subject}")
        print(f"Body: {body[:100]}...")
        return

    message = MessageSchema(
        subject=subject,
        recipients=recipients,
        body=body,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    try:
        await fm.send_message(message)
        print(f"📧 Email sent to {recipients}")
    except Exception as e:
        print(f"❌ Email sending failed: {e}")

async def send_verification_email(email: str, token: str):
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    if frontend_url.endswith('/'): frontend_url = frontend_url[:-1]
    
    link = f"{frontend_url}/verify-email/{token}"
    
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Bienvenue sur Audit-IQ</h1>
        <p>Merci de vérifier votre adresse email pour activer votre compte et accéder à la plateforme.</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{link}" style="padding: 12px 24px; background-color: #000000; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Vérifier mon email</a>
        </div>
        <p style="color: #666; font-size: 14px;">Ou copiez ce lien : <br>{link}</p>
    </div>
    """
    await send_email("Vérifiez votre email - Audit-IQ", [email], html)

async def send_reset_password_email(email: str, token: str):
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    if frontend_url.endswith('/'): frontend_url = frontend_url[:-1]
    
    link = f"{frontend_url}/reset-password/{token}"
    
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Réinitialisation de mot de passe</h1>
        <p>Vous avez demandé la réinitialisation de votre mot de passe Audit-IQ.</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{link}" style="padding: 12px 24px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Réinitialiser le mot de passe</a>
        </div>
        <p style="color: #666; font-size: 14px;">Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
    </div>
    """
    await send_email("Réinitialisation mot de passe - Audit-IQ", [email], html)

async def send_invitation_email(email: str, company: str, role: str):
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    if frontend_url.endswith('/'): frontend_url = frontend_url[:-1]
    
    link = f"{frontend_url}/signup?email={email}"
    
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Invitation équipe</h1>
        <p>Vous avez été invité à rejoindre l'espace de travail <strong>{company}</strong> en tant que <strong>{role}</strong> sur Audit-IQ.</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{link}" style="padding: 12px 24px; background-color: #28a745; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Accepter l'invitation</a>
        </div>
        <p>Créez votre compte pour accéder au dashboard.</p>
    </div>
    """
    await send_email(f"Invitation à rejoindre {company} - Audit-IQ", [email], html)
