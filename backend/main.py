from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from db.models import PushToken, SessionLocal, TokenRequest, User, Car, CarRequest, CarResponse, UserResponse, GlobalCar, Insight, InsightBase, InsightResponse, InsightCreate, CalendarInsight, CalendarCar
from db.helpers import get_user, update_user, delete_user, get_all_makes, get_models_by_make, get_details_from_vin, read_and_clean_csv, extract_power_kw, extract_engine_l, update_unique_tables
from sqlalchemy import or_
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
import jwt
import os
import uuid
from fastapi.middleware.cors import CORSMiddleware
import base64
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from apscheduler.schedulers.background import BackgroundScheduler
import requests


#######################################################################################
#                                      Setup                                          #
#######################################################################################

SECRET_KEY = str(os.urandom(32))
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

app.add_middleware(CORSMiddleware,allow_origins=["*"],allow_credentials=True,allow_methods=["*"],allow_headers=["*"],)


scheduler = BackgroundScheduler()

def check_insights_and_notify():
    db = SessionLocal()
    try:
        # Skontroluj položky, ktorých expiry_date sa blíži
        upcoming_insights = db.query(Insight).filter(
            Insight.expiry_date <= datetime.utcnow() + timedelta(days=7),
            Insight.expiry_date > datetime.utcnow()
        ).all()

        # Skontroluj položky, ktorých end_date sa blíži
        upcoming_end_date_insights = db.query(Insight).filter(
            Insight.end_date <= datetime.utcnow() + timedelta(days=7),
            Insight.end_date > datetime.utcnow()
        ).all()

        # Skombinuj oba zoznamy insightov
        upcoming_insights.extend(upcoming_end_date_insights)

        for insight in upcoming_insights:
            # Získaj tokeny používateľa
            push_tokens = db.query(PushToken).filter(PushToken.user_id == insight.car.userId).all()
            for token in push_tokens:
                car = db.query(Car).filter(Car.carId == insight.car_id).first()

                # Použitie správneho dátumu podľa dostupnosti
                expiry_or_end_date = insight.expiry_date or insight.end_date

                send_push_notification(
                    token=token.token,
                    title=f"CarInsight Reminder - {car.make} {car.model}",
                    body=f"Your {insight.type} is set to expire on {expiry_or_end_date.strftime('%B %d, %Y')}."
                )
    finally:
        db.close()

# Spustenie cron jobu
scheduler.add_job(check_insights_and_notify, "interval", hours=24)  # Spustenie raz denne
scheduler.start()





def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(days=15))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

#######################################################################################
#                                   User Endpoints                                    #
#######################################################################################

@app.post("/register")
def register_user(username: str, email: str, password: str, db: Session = Depends(get_db)):
    if db.query(User).filter(or_(User.username == username, User.email == email)).first():
        raise HTTPException(status_code=401, detail="User is already registered")
    
    new_user = User(
        userId=str(uuid.uuid4()),
        username=username,
        email=email,
        passwordHash=pwd_context.hash(password.encode()),
        createdAt=datetime.now(),
        updatedAt=datetime.now(),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    token_data = {"user": new_user.username, "email": new_user.email, "uid": new_user.userId}
    return {"Success": True, "token" : create_access_token(token_data)}

@app.post("/login")
def login_user(username: str, password: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user or not pwd_context.verify(password, user.passwordHash):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    token_data = {"user": username, "email": user.email, "uid": user.userId}
    return {"token": create_access_token(token_data)}

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(status_code=401, detail="Could not validate credentials")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("uid")
        if user_id is None:
            raise credentials_exception
    except jwt.InvalidTokenError:
        raise credentials_exception

    user = db.query(User).filter(User.userId == user_id).first()
    if user is None:
        raise credentials_exception
    return user

@app.get("/me", response_model=UserResponse)
def read_whoami(current_user: User = Depends(get_current_user)):
    return current_user

@app.post("/me", response_model=UserResponse)
def change_info(username: str, email: str, password: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    update_user(db, username, email, pwd_context.hash(password.encode()))
    return get_user(username, email)

@app.delete("/me")
def delete_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    delete_user(db, current_user.username)
    return {"Success": "OK"}

#######################################################################################
#                                   Car Endpoints                                     #
#######################################################################################

@app.get("/cars", response_model=List[CarResponse])
def get_user_cars(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Car).filter(Car.userId == current_user.userId).all()

@app.get("/cars/{car_id}", response_model=CarResponse)
def get_car(car_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    car = db.query(Car).filter(Car.carId == car_id, Car.userId == current_user.userId).first()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    return car

@app.post("/cars", response_model=CarResponse)
def add_car(car_data: CarRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_car = Car(carId=str(uuid.uuid4()), userId=current_user.userId, **car_data.dict())
    db.add(new_car)
    db.commit()
    db.refresh(new_car)
    return new_car

@app.put("/cars/{car_id}", response_model=CarResponse)
def update_car(car_id: str, car_data: CarRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    car = db.query(Car).filter(Car.carId == car_id, Car.userId == current_user.userId).first()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    
    for key, value in car_data.dict(exclude_unset=True).items():
        setattr(car, key, value)
    
    db.commit() 
    return car

@app.delete("/cars/{car_id}")
def delete_car(car_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    car = db.query(Car).filter(Car.carId == car_id, Car.userId == current_user.userId).first()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    
    db.delete(car)
    db.commit()
    
    return {"Success": "OK"}



@app.post("/cars/images/{car_id}")
async def upload_car_image(car_id: str, image: str = Form(...), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        # Extrahovanie Base64 dát (odstránenie prefixu, ak existuje)
        if image.startswith("data:image"):
            image = image.split(",")[1]  # Odstráni prefix `data:image/jpeg;base64,`
        
        # Dekódovanie Base64
        image_data = base64.b64decode(image)

        # Hľadanie auta v databáze podľa car_id
        car = db.query(Car).filter(Car.carId == car_id).first()

        if car is None:
            raise HTTPException(status_code=404, detail="Car not found")

        # Ak auto ešte nemá obrázok, nastavíme has_image na True
        if not car.has_image:
            car.has_image = True
            db.commit()

        # Uloženie obrázka
        file_path = os.path.join("static/uploads/car_images", f"{car_id}.jpeg")
        
        # Ak už existuje obrázok, prepíše sa
        with open(file_path, "wb") as f:
            f.write(image_data)


        return {"message": "Image uploaded successfully", "file_path": file_path}

    except base64.binascii.Error:
        raise HTTPException(status_code=400, detail="Invalid Base64 data")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")


@app.get("/cars/images/{car_id}")
async def get_car_image(car_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        # Hľadanie auta v databáze podľa car_id
        car = db.query(Car).filter(Car.carId == car_id).first()

        if car is None:
            raise HTTPException(status_code=404, detail="Car not found")

        # Ak auto nemá obrázok, vrátiť chybu
        if not car.has_image:
            raise HTTPException(status_code=404, detail="Image not found for this car")

        # Cesta k obrázku
        file_path = "static/uploads/car_images/" + car.carId + ".jpeg"

        # Skontroluj, či obrázok existuje
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Image file not found on server")

        # Vrátenie obrázka ako súbor
        return FileResponse(file_path, media_type="image/jpeg")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
   


#######################################################################################
#                                  CAR DETAILS                                        #
#######################################################################################

# Function to add a single car to the GlobalCar table and update unique tables
@app.post("/add_car/")
def add_car(car_data: dict, db: Session = Depends(get_db)):
    # Generate a unique carId (UUID)
    carId = str(uuid.uuid4())

    # Extract values using helper functions
    max_power_kw = extract_power_kw(car_data.get('max_power', 'Unknown'))
    engine_l = extract_engine_l(car_data.get('engine', 'Unknown'))

    # Create a new GlobalCar object with car data
    new_car = GlobalCar(
        carId=carId,
        make=car_data.get('make', 'Unknown'),
        model=car_data.get('model', 'Unknown'),
        engine=car_data.get('engine', 'Unknown'),
    )

    try:
        # Add the car to the database
        db.add(new_car)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Error adding car to the database.")

    # Update unique tables (Makes, FuelType, Transmission)
    update_unique_tables(db)

    return {"message": "Car added successfully"}

# Function to add cars from a CSV file using add_car for each row
@app.post("/add_cars_from_csv/")
def add_cars_from_csv(file_path: str, db: Session = Depends(get_db)):
    df = read_and_clean_csv(file_path)
    for _, row in df.iterrows():
        car_data = {
            'make': row.get('Make', 'Unknown'),
            'model': row.get('Model', 'Unknown'),
            'engine': row.get('Engine', 'Unknown'),
        }
        add_car(car_data, db)
    return {"message": "Cars added from CSV successfully"}

# Endpoint to retrieve all makes
@app.get("/makes/")
def retrieve_all_makes(db: Session = Depends(get_db)):
    return get_all_makes(db)

# # Endpoint to retrieve all fuel types
# @app.get("/fuel_types/")
# def retrieve_all_fuel_types(db: Session = Depends(get_db)):
#     return get_all_fuel_types(db)

# # Endpoint to retrieve all transmissions
# @app.get("/transmissions/")
# def retrieve_all_transmissions(db: Session = Depends(get_db)):
#     return get_all_transmissions(db)

# Endpoint to retrieve all models for a given make
@app.get("/models/{make_name}")
def retrieve_models_by_make(make_name: str, db: Session = Depends(get_db)):
    return get_models_by_make(db, make_name)

# Endpoint to get car details by VIN using get_details_from_vin
@app.get("/car_details_by_vin/{vin}")
def retrieve_car_details_by_vin(vin: str):
    try:
        car_details = get_details_from_vin(vin)
        if car_details:
            return car_details
        else:
            raise HTTPException(status_code=404, detail="Car details not found for this VIN.")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error retrieving car details.") from e
    

#######################################################################################
#                                  CAR INSIGHTS                                       #
#######################################################################################

@app.post("/insights", response_model=InsightResponse)
def create_insight(insight: InsightCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_insight = Insight(insightId=str(uuid.uuid4()), **insight.dict())
    db.add(new_insight)
    db.commit()
    db.refresh(new_insight)
    return new_insight

@app.get("/insights/{car_id}", response_model=List[InsightResponse])
def get_insights_for_car(car_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    insights = (
        db.query(Insight)
        .filter(Insight.car_id == car_id)
        .order_by(Insight.expiry_date.asc())
        .all()
    )

    return insights


@app.get("/insights/detail/{insight_id}", response_model=InsightResponse)
def get_insight_by_id( insight_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    insight = db.query(Insight).filter(Insight.id == insight_id, Insight.user_id == current_user.userId).first()
    if not insight:
        raise HTTPException(status_code=404, detail="Insight not found")
    return insight


@app.put("/insights/{insight_id}", response_model=InsightResponse)
def update_insight(insight_id: str, updated_data: InsightCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    insight = db.query(Insight).filter(Insight.insightId == insight_id).first()
    if not insight:
        raise HTTPException(status_code=404, detail="Insight not found")
    for key, value in updated_data.dict().items():
        setattr(insight, key, value)
    db.commit()
    db.refresh(insight)
    return insight


@app.delete("/insights/{insight_id}")
def delete_insight(insight_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    insight = db.query(Insight).filter(Insight.insightId == insight_id).first()
    if not insight:
        raise HTTPException(status_code=404, detail="Insight not found")
    db.delete(insight)
    db.commit()
    return {"message": "Insight deleted successfully"}


@app.get("/insights/upcoming/{car_id}", response_model=List[InsightResponse])
def get_upcoming_insights_for_car(car_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    relevant_types = ["Technical Inspection", "Emissions Test", "Highway Toll Pass", "Oil Change", "Car Insurance"]

    insights = (
        db.query(Insight)
        .filter(
            Insight.car_id == car_id,
            or_(Insight.expiry_date > datetime.now(), Insight.end_date > datetime.now()),
            Insight.type.in_(relevant_types)
        )
        .order_by(Insight.expiry_date.asc(), Insight.end_date.asc())
        .all()
    )
    
    return insights

#######################################################################################
#                                    calendar                                              #
#######################################################################################

@app.get("/calendar", response_model=List[CalendarCar])
def get_user_calendar(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Query cars for the current user
    user_cars = db.query(Car).filter(Car.userId == current_user.userId).all()

    # If no cars exist for the user, return an empty calendar
    if not user_cars:
        return []

    # Initialize an empty list for the calendar
    calendar_data = []

    for car in user_cars:
        # Query insights for each car
        insights = db.query(Insight).filter(Insight.car_id == car.carId).all()

        # If no insights exist for the car, add an empty insights list
        if not insights:
            insights = []

        # Format the insights into a list of CalendarInsight
        formatted_insights = [
            CalendarInsight(
                type=insight.type,
                expiry_date=insight.expiry_date,
                end_date=insight.end_date,
                note=insight.note
            )
            for insight in insights
        ]

        # Add car and its insights to the calendar_data list
        calendar_data.append(CalendarCar(
            make=car.make,
            model=car.model,
            insights=formatted_insights,
            carId=car.carId  # Add carId here for redirection in the frontend
        ))

    # Return the populated or empty calendar data
    return calendar_data



#######################################################################################
#                                    NOTIFICATIONS                                    #
#######################################################################################



@app.post("/save-token")
def save_token(pushToken: TokenRequest, current_user: User = Depends(get_current_user)):
    db = SessionLocal()

    # Skontroluj, či už existuje token pre daného používateľa
    existing_token = db.query(PushToken).filter(PushToken.user_id == current_user.userId).first()

    if existing_token:
        # Ak token existuje, odstránime starý
        db.delete(existing_token)
        db.commit()

    # Uložíme nový token
    db_token = PushToken(token=pushToken.pushToken, user_id=current_user.userId)
    db.add(db_token)
    db.commit()
    db.refresh(db_token)
    
    db.close()
    return {"status": "Token saved"}


@app.get("/get-tokens/{user_id}")
async def get_tokens(user_id: str):
    db = SessionLocal()
    tokens = db.query(PushToken).filter(PushToken.user_id == user_id).all()
    
    if not tokens:
        raise HTTPException(status_code=404, detail="No tokens found for this user")
    
    return tokens


def send_push_notification(token: str, title: str, body: str):
    print(f"Sending notification to token: {token}, Title: {title}, Body: {body}")
    url = "https://exp.host/--/api/v2/push/send"
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
    data = {
        "to": token,
        "sound": "default",
        "title": title,
        "body": body
    }
    response = requests.post(url, json=data, headers=headers)
    print(f"Push notification response: {response.status_code}, {response.json()}")
    if response.status_code != 200:
        print(f"Error sending notification: {response.json()}")
    return response.json()


if __name__ == "__main__":
    # Spusti funkciu manuálne na testovanie
    check_insights_and_notify()

""" if __name__ == "__main__":
    import uvicorn
    from sqlalchemy.orm import Session
    from db.models import SessionLocal, User, Car, CarRequest
    from passlib.context import CryptContext
    import uuid
    from datetime import datetime

    # Open a session to interact with the database
    db = SessionLocal()
    
    try:
        
        # Example usage of logging in (you would typically use FastAPI's login endpoint for this)
        # Here, we simulate the login process and generate a token manually
        username="johndoe"
        login_user = db.query(User).filter(User.username == username).first()
        if login_user:
            token_data = {"user": username, "email": login_user.email, "uid": login_user.userId}
            token = create_access_token(token_data)
            print(f"Token for {username}: {token}")

        # Example usage of adding a car for the user
        car_data = CarRequest(
            vin="12345678901234567",  # Example VIN
            make="Toyota",
            model="Corolla",
            year=2020,
            fuel_type="Petrol",
            transmission="Automatic",
            engine="1.8L",
            max_power_kw=104.4,
        )
        new_car = Car(
            carId=str(uuid.uuid4()),
            userId=login_user.userId,
            **car_data.dict()
        )
        db.add(new_car)
        db.commit()
        db.refresh(new_car)
        print(f"Car added: {new_car.make} {new_car.model} (ID: {new_car.carId})")

        # Example usage of fetching all cars for the user
        user_cars = db.query(Car).filter(Car.userId == login_user.userId).all()
        print(f"Cars for {username}: {[car.make + ' ' + car.model for car in user_cars]}")
        
    finally:
        db.close()

    # Run the FastAPI app
    uvicorn.run(app, host="127.0.0.1", port=8000)
 """
 