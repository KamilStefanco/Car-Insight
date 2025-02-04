from sqlalchemy import or_
from db.models import User, Makes, GlobalCar
import pandas as pd
import re
import requests
from sqlalchemy.orm import Session


def get_user(db, username: str, email: str):
    user = db.query(User).filter(or_(User.username == username, User.email == email)).first()
    return user

def update_user(db, username: str, email: str, password: str):
   user =  db.query(User).filter(User.username).first()
   if user:
    user.update({User.username: username, User.email: email, User.passwordHash: password})
    db.commit()

def delete_user(db, username: str):
    user = db.query(User).filter(User.username == username).first()
    if user:
       user.delete()
       db.commmit()



#######################################################################################
#                                  CAR DETAILS                                        #
#######################################################################################

# Function to read and clean the CSV file
def read_and_clean_csv(file_path):
    df = pd.read_csv(file_path)
    df.columns = df.columns.str.strip()
    return df

# Helper function to extract the first numeric value in max_power and convert it to kilowatts
def extract_power_kw(max_power_str):
    if max_power_str is not None:
        max_power_str = str(max_power_str)
        match = re.search(r"\d+(\.\d+)?", max_power_str)
        if match:
            power_bhp = float(match.group())
            power_kw = power_bhp * 0.7457  # Convert to kW
            return power_kw
    return None

# Helper function to extract the engine displacement in liters from the engine string
def extract_engine_l(engine_str):
    if engine_str is not None:
        engine_str = str(engine_str)
        match = re.search(r"\d+(\.\d+)?", engine_str)
        if match:
            displacement_cc = float(match.group())
            displacement_l = displacement_cc / 1000  # Convert cc to liters
            return displacement_l
    return None

# Function to update Makes, FuelType, and Transmission tables based on the GlobalCar table
def update_unique_tables(db: Session):
    makes_in_global = db.query(GlobalCar.make).distinct().all()
    for make_tuple in makes_in_global:
        make_name = make_tuple[0]
        if not db.query(db.query(Makes).filter(Makes.make == make_name).exists()).scalar():
            new_make = Makes(make=make_name)
            db.add(new_make)

    # fuel_types_in_global = db.query(GlobalCar.fuel_type).distinct().all()
    # for fuel_type_tuple in fuel_types_in_global:
    #     fuel_type_name = fuel_type_tuple[0]
    #     if not db.query(db.query(FuelType).filter(FuelType.fuel_type == fuel_type_name).exists()).scalar():
    #         new_fuel_type = FuelType(fuel_type=fuel_type_name)
    #         db.add(new_fuel_type)

    # transmissions_in_global = db.query(GlobalCar.transmission).distinct().all()
    # for transmission_tuple in transmissions_in_global:
    #     transmission_type = transmission_tuple[0]
    #     if not db.query(db.query(Transmission).filter(Transmission.transmission_type == transmission_type).exists()).scalar():
    #         new_transmission = Transmission(transmission_type=transmission_type)
    #         db.add(new_transmission)

    db.commit()

# Function to retrieve all makes
def get_all_makes(db):
    makes = db.query(Makes).all()
    return [make.make for make in makes]

# # Function to retrieve all fuel types
# def get_all_fuel_types(db):
#     fuel_types = db.query(FuelType).all()
#     return [{"fuel_type": fuel_type.fuel_type} for fuel_type in fuel_types]

# # Function to retrieve all transmissions
# def get_all_transmissions(db):
#     transmissions = db.query(Transmission).all()
#     return [{"transmission_type": transmission.transmission_type} for transmission in transmissions]

# Function to retrieve all models for a given make
def get_models_by_make(db, make_name):
    models = db.query(GlobalCar.model).filter(GlobalCar.make == make_name).distinct().all()
    return [model[0] for model in models]

# Function to decode VIN using NHTSA API
def decode_vin(vin):
    url = f"https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVIN/{vin}?format=json"
    response = requests.get(url)
    data = response.json()
    
    details = {
        "Make": next((item["Value"] for item in data["Results"] if item["Variable"] == "Manufacturer Name"), "Unknown"),
        "Model": next((item["Value"] for item in data["Results"] if item["Variable"] == "Model"), "Unknown"),
        "Trim Level": next((item["Value"] for item in data["Results"] if item["Variable"] == "Trim"), "Unknown"),
        "Year": next((item["Value"] for item in data["Results"] if item["Variable"] == "Model Year"), "Unknown"),
        "Type": next((item["Value"] for item in data["Results"] if item["Variable"] == "Vehicle Type"), "Unknown"),
        "Manufacturing Location": {
            "Plant City": next((item["Value"] for item in data["Results"] if item["Variable"] == "Plant City"), "Unknown"),
            "Plant Country": next((item["Value"] for item in data["Results"] if item["Variable"] == "Plant Country"), "Unknown")
        },
        "Performance": {
            "max_power": next((item["Value"] for item in data["Results"] if item["Variable"] == "Engine Brake (hp) From"), "Unknown"),
            "Engine Number of Cylinders": next((item["Value"] for item in data["Results"] if item["Variable"] == "Engine Number of Cylinders"), "Unknown"),
            "Engine": next((item["Value"] for item in data["Results"] if item["Variable"] == "Displacement (L)"), "Unknown"),
            "Engine Configuration": next((item["Value"] for item in data["Results"] if item["Variable"] == "Engine Configuration"), "Unknown"),
            "Drive Type": next((item["Value"] for item in data["Results"] if item["Variable"] == "Drive Type"), "Unknown"),
            "Fuel Type": next((item["Value"] for item in data["Results"] if item["Variable"] == "Fuel Type - Primary"), "Unknown"),
            "Fuel Delivery Type": next((item["Value"] for item in data["Results"] if item["Variable"] == "Fuel Delivery / Fuel Injection Type"), "Unknown"),
            "Transmissions": next((item["Value"] for item in data["Results"] if item["Variable"] == "Transmission Style"), "Unknown"),
            "Transmission Speeds": next((item["Value"] for item in data["Results"] if item["Variable"] == "Transmission Speeds"), "Unknown"),
            "Anti-lock Braking System (ABS)": next((item["Value"] for item in data["Results"] if item["Variable"] == "Anti-lock Braking System (ABS)"), "Unknown"),
            "Brake System Type": next((item["Value"] for item in data["Results"] if item["Variable"] == "Brake System Type"), "Unknown")
        },
        "Capacity": {
            "Doors": next((item["Value"] for item in data["Results"] if item["Variable"] == "Doors"), "Unknown"),
            "Gross Vehicle Weight Rating": next((item["Value"] for item in data["Results"] if item["Variable"] == "Gross Vehicle Weight Rating From"), "Unknown"),
            "Body Class": next((item["Value"] for item in data["Results"] if item["Variable"] == "Body Class"), "Unknown")
        },
        "Dimensions": {
            "Vehicle Length": next((item["Value"] for item in data["Results"] if item["Variable"] == "Vehicle Length"), "Unknown"),
            "Vehicle Width": next((item["Value"] for item in data["Results"] if item["Variable"] == "Vehicle Width"), "Unknown")
        },
        "Safety Features": {
            "Air Bag Location": next((item["Value"] for item in data["Results"] if item["Variable"] == "Air Bag Loc Front"), "Unknown")
        }
    }
    
    return details



# Helper function to convert engine displacement from liters to cc
def convert_engine_to_cc(engine_liters):
    if engine_liters and isinstance(engine_liters, str):
        match = re.search(r"\d+(\.\d+)?", engine_liters)
        if match:
            displacement_l = float(match.group())
            displacement_cc = int(displacement_l * 1000)  # Convert liters to cc
            return displacement_cc
    return None

# Function to get relevant car details from VIN for database insertion
def get_details_from_vin(vin):
    # Decode VIN to get the raw car details
    decoded_data = decode_vin(vin)

    # Extract the engine displacement and convert it from liters to cc if available
    engine_liters = decoded_data["Performance"].get("Engine", "Unknown")
    engine_cc = convert_engine_to_cc(engine_liters)
    max_power_bhp = decoded_data["Performance"].get("max_power", "Unknown")

    # Extract relevant details for adding car to the database
    details = {
        "vin": vin,
        "make": decoded_data.get("Make", "Unknown"),
        "model": decoded_data.get("Model", "Unknown"),
        "year": decoded_data.get("Year", None),
        "fuel_type": decoded_data["Performance"].get("Fuel Type", "Unknown"),
        "transmissions": decoded_data["Performance"].get("Transmissions", "Unknown"),
        "color": "Unknown",  # Default color if not provided
        "engine": f"{engine_cc} cc" if engine_cc is not None else "Unknown",
        "max_power": f"{max_power_bhp} bhp" if max_power_bhp is not None else "Unknown",
        "fuel_tank_capacity": None  # Default value for fuel tank capacity if missing
    }

    return details

