import { View, Text, Pressable, TextInput, TouchableOpacity, FlatList, ScrollView, SafeAreaView } from "react-native";
import { useEffect, useState } from "react";
import { Modal } from "@/components/Modal";
import { MyIcon } from "@/components/MyIcon";
import axios from "axios";
import React from "react";
import { useAuth } from "../AuthContext";
import { SafeAreaProvider } from "react-native-safe-area-context";


export default function editCar(props: any){
    const { token } = useAuth();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedField, setSelectedField] = useState("");
    const [warning, setWarning] = useState("");
    const [options, setOptions] = useState<string[]>([]);

    interface FieldOptions {
        Make: string[];
        Model: string[];
        Year: string[];
        Type: string[];
        Fuel: string[];
        Transmission: string[];
    }

    const [selectedOptions, setSelectedOptions] = useState({
      Make: props.car.make,
      Model: props.car.model,
      Year: props.car.year,
      Engine: props.car.engine,
      Performance: props.car.max_power_kw,
      Type: props.car.car_type,
      Fuel: props.car.fuel_type,
      Vin: props.car.vin,
      Transmission: props.car.transmission,
      Odometer: props.car.odometer,
      License_plate: props.car.license_plate
    });


    const [fieldOptions, setFieldOptions] = useState<FieldOptions>({
      Make: [],
      Model: [],
      Year: [],
      Type: ["Sedan","Liftback","Hatchback","Combi","SUV","Van","Cabrio","Coupé","Pick up","Minibus","Limousine", "Caravan"],
      Fuel: ["Petrol","Diesel","Electric","Hybrid","Hydrogen","Petrol + LPG"],
      Transmission: ["Manual","Automatic"],
    });

    useEffect(() => {
        fetchMakes();
        getModelsForMake(props.car.make);
    
        const modelYears = generateModelYears();
        setFieldOptions((prev) => ({
          ...prev,
          Year: modelYears,
        }));
    
      }, []);


    const fetchMakes = async () => {
      try {
        const response = await axios.get("https://insightserver-791731285499.europe-central2.run.app:8000/makes");
        setFieldOptions((prev) => ({
          ...prev,
          Make: response.data, 
        }));
      } catch (error) {
        console.error("Error fetching makes:", error);
      }
    };
    
    const getModelsForMake = async (item: string) => {
      try {
        const response = await axios.get(`https://insightserver-791731285499.europe-central2.run.app:8000/models/${item}`);
        setFieldOptions((prev) => ({
          ...prev,
          Model: response.data,
        }));
      } catch (error) {
        console.error("Error fetching models:", error);
      }
    };

    const generateModelYears = (numYears = 30) => {
      const currentYear = new Date().getFullYear();
      return Array.from({ length: numYears }, (_, i) => (currentYear - i).toString());
    };

    const handleVinChange = (vin: string) => {
      setSelectedOptions((prevOptions) => ({
        ...prevOptions,
        Vin: vin,
      }));
    };

    const handleEngineChange = (engine: string) => {
      setSelectedOptions((prevOptions) => ({
        ...prevOptions,
        Engine: engine,
      }));
    };

    const handleLicenseChange = (license_plate: string) => {
      setSelectedOptions((prevOptions) => ({
        ...prevOptions,
        License_plate: license_plate,
      }));
    };

    const handleFieldPress = (field: keyof typeof fieldOptions) => {
      setSelectedField(field);
      setOptions(fieldOptions[field] || []);
      setModalVisible(true);
    };

    const editCar = async () => {

      setWarning("");


      if(selectedOptions.Make===""||selectedOptions.Model===""||selectedOptions.Year===""||selectedOptions.Odometer===0){
        console.log("Please fill fields with '*'.");
        setWarning("Please fill fields with '*'.");
        return;
      }

      const data ={
        vin: selectedOptions.Vin,
        make: selectedOptions.Make,
        model: selectedOptions.Model,
        year: Number(selectedOptions.Year),
        fuel_type: selectedOptions.Fuel,
        transmission: selectedOptions.Transmission,
        engine: selectedOptions.Engine,
        max_power_kw: Number(selectedOptions.Performance),
        odometer: Number(selectedOptions.Odometer),
        car_type: selectedOptions.Type,
        license_plate: selectedOptions.License_plate
      }


      try {
          const response = await axios.put(`https://insightserver-791731285499.europe-central2.run.app:8000/cars/${props.car.carId}`, data, 
            {
              headers: {
                Authorization: `Bearer ${token}`, 
                "Content-Type": "application/json", 
              },
            }
          );
  
          console.log('Car edited');
  
        } catch (error) {
          console.error('Error editing car:', error);
        }
        
        props.setModalOpen(false); 
    }

 

    return (
      <Modal isOpen={props.modalOpen}>
        <View className="bg-[#400000] w-[97%] h-[80%] p-4 rounded-xl border-4 border-white mt-20">
          <SafeAreaProvider>
              <SafeAreaView>
                <ScrollView >

                  <View className="flex-row justify-between items-center w-full">
                      <Text className="font-bold text-center text-2xl flex-1 text-white mb-5">
                          EDIT CAR
                      </Text>
                      <Pressable onPress={() => {props.setModalOpen(false)}}>
                      <Text className="font-bold text-xl text-right text-white mb-5">
                          X
                      </Text>
                      </Pressable>
                  </View>



                  {/* Dynamické zobrazenie parametrov */}
                  {Object.keys(fieldOptions).map((field) => (
                    <TouchableOpacity
                      key={field}
                      onPress={() =>
                        handleFieldPress(field as keyof typeof fieldOptions)
                      }
                      className="bg-white rounded-md flex flex-row py-5 px-2 mt-4 mx-4"
                    >
                      <Text className="font-bold flex-1 text-left ml-4">{(field === "Make" || field === "Model" || field === "Year") ? `* ${field}` : field}</Text>
                      <Text className="flex-1 text-right mr-4">
                      {selectedOptions[field as keyof typeof selectedOptions] != null &&
                       selectedOptions[field as keyof typeof selectedOptions] !== "" ? (
                        selectedOptions[field as keyof typeof selectedOptions]
                      ) : (
                        <MyIcon />
                      )}
                      </Text>
                    </TouchableOpacity>
                  ))}

                  <TouchableOpacity className="bg-white rounded-md flex flex-row py-3 px-2 mt-4 mx-4 items-center">
                    <Text className="font-bold flex-1 text-left ml-4">Engine</Text>
                    <TextInput
                      placeholder="Enter engine model"
                      className="text-right mr-4"
                      value={selectedOptions.Engine}
                      onChangeText={handleEngineChange}
                    />
                  </TouchableOpacity>
                
                  <TouchableOpacity className="bg-white rounded-md flex flex-row py-3 px-2 mt-4 mx-4 items-center">
                    <Text className="font-bold flex-1 text-left ml-4">Performance (kW)</Text>
                    <TextInput
                      placeholder="Enter performance"
                      className="text-right mr-4"
                      value={String(selectedOptions.Performance)}
                      onChangeText={(text) => {
                        // Validácia vstupu - povolené len čísla
                        if (/^\d*$/.test(text)) {
                          setSelectedOptions((prevOptions) => ({
                            ...prevOptions,
                            Performance: text === '' ? '' : Number(text),
                          }));
                        }
                      }}
                      keyboardType="numeric" // Klávesnica pre čísla
                    />
                    <Text className="ml-1 mr-2 text-gray-600">kW</Text>
                  </TouchableOpacity>
                    
                  <TouchableOpacity className="bg-white rounded-md flex flex-row py-3 px-2 mt-4 mx-4 items-center">
                    <Text className="font-bold flex-1 text-left ml-4">* Odometer (km)</Text>
                    <TextInput
                      placeholder="Enter driven kilometers"
                      className="text-right mr-4"
                      value={String(selectedOptions.Odometer)}
                      onChangeText={(text) => {
                        // Validácia vstupu - povolené len čísla
                        if (/^\d*$/.test(text)){
                          setSelectedOptions((prevOptions) => ({
                            ...prevOptions,
                            Odometer: text === '' ? '' : Number(text),
                          }));
                        }
                      }}
                      keyboardType="numeric" // Klávesnica pre čísla
                    />
                    <Text className="ml-1 mr-2 text-gray-600">km</Text>
                  </TouchableOpacity>

                  {/* License plate*/}
                  <TouchableOpacity className="bg-white rounded-md flex flex-row py-3 px-2 mt-4 mx-4 items-center">
                    <Text className="font-bold flex-1 text-left ml-4">License plate</Text>
                    <TextInput
                      placeholder="Enter license plate"
                      className="text-right mr-4"
                      value={selectedOptions.License_plate}
                      onChangeText={handleLicenseChange}
                    />
                  </TouchableOpacity>
                    
                  {/* VIN input*/}
                  <TouchableOpacity className="bg-white rounded-md flex flex-row py-3 px-2 mt-4 mx-4 items-center">
                    <Text className="font-bold flex-1 text-left ml-4">VIN</Text>
                    <TextInput
                      placeholder="Enter VIN number"
                      className="text-right mr-4"
                      value={selectedOptions.Vin}
                      onChangeText={handleVinChange}
                    />
                  </TouchableOpacity>
                    
                    
                  {warning && (
                    <Text className="text-center text-white my-2 text-lg underline decoration-red-400 underline-offset-4">
                      {warning}
                    </Text>
                  )}

                  {/* Modálne okno pre výber možností */}
                  <Modal
                    isOpen={modalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setModalVisible(false)}
                  >
                    <View className="w-[90%] h-[90%]">
                      <View className="bg-white w-full h-full rounded-md p-4">
                        <Text className="font-bold text-lg mt-5 mb-5 text-center">
                          Select {selectedField}
                        </Text>
                        <FlatList
                          data={options}
                          keyExtractor={(item) => item}
                          renderItem={({ item }) => (
                            <TouchableOpacity
                              onPress={() => {
                                console.log(`You selected ${selectedField}: ${item}`);
                                setModalVisible(false);
                                setSelectedOptions((prevOptions) => {
                                  const newOptions = {
                                    ...prevOptions,
                                    [selectedField]: item,
                                  };
                                  console.log("Updated selectedOptions:", newOptions); 
                                  return newOptions;
                                });

                                if (selectedField === "Make") {
                                  getModelsForMake(item);
                                }
                              }}
                              className="py-2"
                            >
                              <Text className="text-lg">{item}</Text>
                            </TouchableOpacity>
                          )}
                          ListEmptyComponent={
                            <Text className="text-lg text-center">No options</Text>
                          }
                          ItemSeparatorComponent={() => (
                            <View className="h-0.5 bg-[#CED0CE]" />
                          )}
                        />
                      </View>
                    </View>
                  </Modal>

              </ScrollView>
            </SafeAreaView>
          </SafeAreaProvider>

        </View>

        <TouchableOpacity className="bg-[#400000] w-[50%] p-4 rounded-xl border-4 border-white items-center mt-2"
                          onPress={async () => {
                            await editCar(); 
                            props.fetchCars();
                          }} >
          <Text className="text-white text-xl font-bold justify-center">Confirm</Text>
        </TouchableOpacity>
          
      </Modal>

    );
}