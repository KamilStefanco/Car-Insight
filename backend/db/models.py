
from sqlalchemy import create_engine, Column, Integer, String, Float, exists, TIMESTAMP
from sqlalchemy import Column, String, Integer, Boolean, Date, ForeignKey, Float, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from pydantic import BaseModel
from datetime import date, datetime
from typing import List, Optional


Base = declarative_base()

#######################################################################################
#                                    USER                                             #
#######################################################################################

# User Model
class User(Base):
    __tablename__ = 'users'
    userId = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    passwordHash = Column(String, nullable=False)
    createdAt = Column(Date, nullable=False)
    updatedAt = Column(Date)

    cars = relationship('Car', back_populates='owner')
    push_tokens = relationship('PushToken', back_populates='user')

class UserResponse(BaseModel):
    userId: str
    username: str
    email: str
    createdAt: date
    updatedAt: Optional[date]

    class Config:
        orm_mode = True

#######################################################################################
#                                    CAR                                              #
#######################################################################################

# Car Model
class Car(Base):
    __tablename__ = 'cars'
    carId = Column(String, primary_key=True)
    userId = Column(String, ForeignKey('users.userId'))
    vin = Column(String(17), nullable=True)
    make = Column(String(512), nullable=True)  # Make is optional
    model = Column(String(512), nullable=True) # Model is optional
    year = Column(Integer)
    fuel_type = Column(String(512))
    transmission = Column(String(512))
    engine = Column(String(512))
    max_power_kw = Column(Integer)
    odometer = Column(Integer)
    has_image = Column(Boolean, default=False)
    car_type = Column(String(512), nullable=True)
    license_plate = Column(String(512), nullable=True)

    owner = relationship('User', back_populates='cars')
    insights = relationship('Insight', back_populates='car')

class CarRequest(BaseModel):
    vin: Optional[str] = None
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    fuel_type: Optional[str] = None
    transmission: Optional[str] = None
    engine: Optional[str] = None
    max_power_kw: Optional[int] = None
    odometer: Optional[int] = None
    has_image: Optional[bool] = None
    car_type: Optional[str] = None
    license_plate: Optional[str] = None

    class Config:
        orm_mode = True

class CarResponse(CarRequest):
    carId: str
    userId: str

#######################################################################################
#                                    INSIGHT                                          #
#######################################################################################

# Insight Model
class Insight(Base):
    __tablename__ = 'insights'
    insightId = Column(String, primary_key=True)
    car_id = Column(String, ForeignKey('cars.carId'), nullable=False)       
    type = Column(String, nullable=False)                                   
    date = Column(Date, nullable=True)                                     
    odometer = Column(Integer, nullable=True)                               
    expiry_date = Column(Date, nullable=True)                               
    station_name = Column(String, nullable=True)                            
    note = Column(String, nullable=True)                                      
    price = Column(Float, nullable=True)                                    
    next_change = Column(Integer, nullable=True)                            
    start_date = Column(Date, nullable=True)                                
    end_date = Column(Date, nullable=True)                                  
    country = Column(String, nullable=True)                                 
    service_type = Column(String, nullable=True)                            
    description = Column(String, nullable=True)                               
    created_at = Column(TIMESTAMP, default=datetime.utcnow)                 
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)  

    car = relationship('Car', back_populates='insights')

class InsightBase(BaseModel):
    car_id: str
    type: str
    date: date
    odometer: int | None = None
    expiry_date: date | None = None
    station_name: str | None = None
    note: str | None = None
    price: float | None = None
    next_change: int | None = None
    start_date: date | None = None
    end_date: date | None = None
    country: str | None = None
    service_type: str | None = None
    description: str | None = None

class InsightCreate(InsightBase):
    pass

class InsightResponse(InsightBase):
    insightId: str

    class Config:
        orm_mode = True

#######################################################################################
#                                 NOTIFICATION                                        #
#######################################################################################

# Notification Model
class PushToken(Base):
    __tablename__ = 'push_tokens'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey('users.userId'), nullable=False)  # Vzťah na User
    token = Column(String, nullable=False)
    
    user = relationship("User", back_populates="push_tokens")


class TokenRequest(BaseModel):
    pushToken: str
    

#######################################################################################
#                                 AUTH MODELS                                        #
#######################################################################################

# Authorization data models
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str
    email: str
    uid: str



#######################################################################################
#                                  CAR DETAILS                                        #
#######################################################################################

# Define the GlobalCar class with the specified columns, including vin and engine_l
class GlobalCar(Base):
    __tablename__ = 'carDetails'
    
    carId = Column(String, primary_key=True)
    make = Column(String(512), nullable=False)
    model = Column(String(512), nullable=False)
    engine = Column(String(512))

# Define the Makes, FuelType, and Transmission tables
class Makes(Base):
    __tablename__ = 'makes'
    make = Column(String, primary_key=True)

# class FuelType(Base):
#     __tablename__ = 'fuel_types'
#     fuel_type = Column(String, primary_key=True)

# class Transmission(Base):
#     __tablename__ = 'transmissions'
#     transmission_type = Column(String, primary_key=True)



#######################################################################################
#                                    calendar                                              #
#######################################################################################

# CalendarInsight model
class CalendarInsight(BaseModel):
    type: str
    expiry_date: Optional[date] = None
    end_date: Optional[date] = None
    note: Optional[str] = None

    class Config: 
        orm_mode = True

# CalendarCar model with carId included
class CalendarCar(BaseModel):
    make: str
    model: str
    insights: List[CalendarInsight] = []
    carId: str  # Add carId field to include in the response

    class Config:
        orm_mode = True
 

#######################################################################################
#                                  DATABASE CONNECTION                                #
#######################################################################################
# Database connection setup
# PRODUCTION DATABASE
DATABASE_URL = "postgresql://postgres:UO8oQVmWGYNXVg@34.133.181.177:5432"
#DATABASE_URL = "sqlite:///./test.db" 
# DATABASE_URL = "sqlite:///:memory:" 
engine = create_engine(DATABASE_URL, echo=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)


