from fastapi import APIRouter, Request, Depends, HTTPException, Response
from fastapi.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth, OAuthError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from db import AsyncSessionLocal
from models.user import User
# Import necessary config and functions from auth router
from routers.auth import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import datetime, timedelta
import os
import secrets

router = APIRouter(prefix="/api/auth/google", tags=["google_auth"])

# Setup OAuth
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

oauth = OAuth()
oauth.register(
    name='google',
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET,
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'}
)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

@router.get("/login")
async def login_via_google(request: Request):
    """
    Initie le flux OAuth2 avec Google.
    Requiert SessionMiddleware configuré.
    """
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="Google Client ID/Secret not configured")

    redirect_uri = request.url_for('auth_google_callback')
    
    # Fix pour Render/Vercel derrière proxy HTTPS
    if "onrender.com" in str(redirect_uri):
         redirect_uri = str(redirect_uri).replace("http://", "https://")
    
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/callback", name='auth_google_callback')
async def auth_google_callback(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Callback de retour de Google.
    Crée/Connecte l'utilisateur et set le cookie JWT.
    """
    try:
        token = await oauth.google.authorize_access_token(request)
    except OAuthError as error:
        raise HTTPException(status_code=400, detail=f"Google Auth Error: {error.description}")
        
    user_info = token.get('userinfo')
    if not user_info:
        user_info = await oauth.google.userinfo(token=token)

    email = user_info.get('email')
    first_name = user_info.get('given_name')
    last_name = user_info.get('family_name')
    
    if not email:
        raise HTTPException(status_code=400, detail="Email not provided by Google")

    # Check if user exists
    stmt = select(User).where(User.email == email)
    result = await db.execute(stmt)
    user = result.scalars().first()
    
    if not user:
        # Create user
        user = User(
            email=email,
            first_name=first_name or "",
            last_name=last_name or "",
            hashed_password="GOOGLE_AUTH_NO_PASSWORD", # Placeholder, login will fail with password. Good.
            is_verified=True, # Google verified
            role="reader",
            onboarding_completed=0,
            is_active=True
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    else:
        # Update verified status if not set (trust Google)
        if not user.is_verified:
            user.is_verified = True
            await db.commit()
    
    # Login logic
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id},
        expires_delta=access_token_expires
    )
    
    # Determine redirect URL
    target_url = f"{FRONTEND_URL}/dashboard"
    if user.onboarding_completed < 4:
         target_url = f"{FRONTEND_URL}/onboarding"

    response = RedirectResponse(url=target_url)
    
    # Set cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    
    return response
