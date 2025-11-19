from sqlalchemy import Column, String, Integer, DateTime, func
from db import Base

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    first_name = Column(String)
    last_name = Column(String)
    company_name = Column(String)
    sector = Column(String)
    company_size = Column(String)
    created_at = Column(DateTime, server_default=func.now())
