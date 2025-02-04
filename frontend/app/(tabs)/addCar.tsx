import { Link } from "expo-router";
import React, { useState, useEffect, useCallback } from "react";
import { ScrollView, View, Text, Image, Alert, TouchableOpacity, Modal, FlatList, TextInput, Button} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { Navbar } from "@/components/Navbar";
import { Svg, Path } from "react-native-svg";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { useRouter } from "expo-router";
import { useAuth } from '../AuthContext';

export default function addCar() {
  const [imageUri, setImageUri] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedField, setSelectedField] = useState("");
  const [warning, setWarning] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const router = useRouter();
  const { token } = useAuth();

  interface FieldOptions {
    Make: string[];
    Model: string[];
    Year: string[];
    Type: string[];
    Fuel: string[];
    Transmission: string[];
  }

  const [selectedOptions, setSelectedOptions] = useState({
    Make: "",
    Model: "",
    Year: "",
    Engine: "",
    Performance: "",
    Type: "",
    Fuel: "",
    Vin: "",
    Transmission: "",
    Odometer: "",
    License_plate:""
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

    const modelYears = generateModelYears();
    setFieldOptions((prev) => ({
      ...prev,
      Year: modelYears,
    }));

  }, []);

  useFocusEffect(
    useCallback(() => {
      // Resetovanie políčok pri návrate na obrazovku
      setSelectedOptions({
        Make: "",
        Model: "",
        Year: "",
        Engine: "",
        Performance: "",
        Type: "",
        Fuel: "",
        Vin: "",
        Transmission: "",
        Odometer: "",
        License_plate: ""
      });
      setImageUri(null); // Reset obrázka
    }, [])
  );

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

  const handleFieldPress = (field: keyof typeof fieldOptions) => {
    setSelectedField(field);
    setOptions(fieldOptions[field] || []);
    setModalVisible(true);
  };

  const handleImagePick = async () => {
    // Požiadame o povolenie na prístup k galérii
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    // Otvoríme galériu na výber obrázka
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
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

  async function saveCar() {
    console.log("Adding car");
    setWarning("");


    if(selectedOptions.Make===""||selectedOptions.Model===""||selectedOptions.Year===""||selectedOptions.Odometer===""){
      console.log("Please fill fields with '*'.");
      setWarning("Please fill fields with '*'.");
      return;
    }

    const carData = {
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
    };

    console.log(carData);

    if(token){
      try {
        const response = await axios.post(
          "https://insightserver-791731285499.europe-central2.run.app:8000/cars", 
          carData, 
          {
            headers: {
              Authorization: `Bearer ${token}`, 
              "Content-Type": "application/json", 
            },
          }
        );
  
        console.log("Car added successfully:", response.data);

      // Ak je obrázok priložený, odošleme ho ako Base64
      if (imageUri) {
        try {
          const cleanedUri = imageUri.replace("file://", ""); // Odstránenie prefixu "file://"
          console.log("cleanedUri: " + cleanedUri);

          // Načítanie obrázka ako Base64
          const responseBlob = await fetch(imageUri);
          const blob = await responseBlob.blob();
          const reader = new FileReader();

          reader.onloadend = async () => {
            const base64Image = reader.result.split(",")[1]; // Získanie Base64 dát (bez prefixu)
            console.log("Base64 image length:", base64Image.length);

            const base64Payload = {
              image: `data:image/jpeg;base64,${base64Image}`, // Prefix pre správny typ obrázka
            };
            //console.log(base64Payload.image);

            console.log("Base64 payload pripravený.");

            // Odoslanie obrázka na backend
            await axios.post(
              `https://insightserver-791731285499.europe-central2.run.app:8000/cars/images/${response.data.carId}`,
              base64Payload,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/x-www-form-urlencoded",
                },
              }
            );

            console.log("Image uploaded successfully");
          };

          reader.onerror = (error) => {
            console.error("Error reading image file as Base64:", error);
            setWarning("Failed to process image. Please try again.");
          };

          reader.readAsDataURL(blob); // Spustenie čítania súboru ako Base64
        } catch (imageError) {
          console.error("Error uploading image:", imageError);
          setWarning("Failed to upload image. Please try again.");
        }
      }
    
        // Resetovanie polí po úspešnom pridaní auta
        setSelectedOptions({
          Make: "",
          Model: "",
          Year: "",
          Engine: "",
          Performance: "",
          Type: "",
          Fuel: "",
          Vin: "",
          Transmission: "",
          Odometer: "",
          License_plate: ""
        });
        setImageUri(null); // Reset obrázka
        setWarning(""); // Vyčisti varovanie
      
        router.push("/Cars");
      
        return response.data;
      } catch (error) {
        console.error("Error adding car/image:", error);
        throw error;
      }
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-black">
        <ScrollView className="flex-1">
          <Navbar current={10} title={"Add new car"} />
          <View className="h-20 -z-10" />

          {/* Pridanie obrázka */}
          <View className="w-[95%] h-[15rem] bg-[#494644] border-2 border-[#7C7C7C] mx-auto mb-5">
            <TouchableOpacity onPress={handleImagePick} style={{ flex: 1 }}>
              <Image
                className="w-full h-full object-cover"
                source={
                  imageUri
                    ? { uri: imageUri }
                    : require("@/assets/images/add_car_placeholder.png")
                }
              />
            </TouchableOpacity>
          </View>

          <View className="w-[95%] h-full bg-[#400000] border-4 border-gray-300 mx-auto my-6">
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
                  {selectedOptions[field as keyof typeof selectedOptions] &&
                  selectedOptions[field as keyof typeof selectedOptions]
                    .length > 0 ? (
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
                value={selectedOptions.Performance}
                onChangeText={(text) => {
                  // Validácia vstupu - povolené len čísla
                  if (/^\d*$/.test(text)) {
                    setSelectedOptions((prevOptions) => ({
                      ...prevOptions,
                      Performance: text,
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
                value={selectedOptions.Odometer}
                onChangeText={(text) => {
                  // Validácia vstupu - povolené len čísla
                  if (/^\d*$/.test(text)){
                    setSelectedOptions((prevOptions) => ({
                      ...prevOptions,
                      Odometer: text,
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

            {/* Submit button*/}
            <View className="p-10 ">
              <TouchableOpacity
                className="py-5 px-10 rounded-md bg-white border-4 border-gray-300"
                onPress={saveCar}
              >
                <Text className="text-center text-xl font-bold">Add car</Text>
              </TouchableOpacity>
            </View>

            {/* Modálne okno pre výber možností */}
            <Modal
              visible={modalVisible}
              animationType="slide"
              transparent={true}
              onRequestClose={() => setModalVisible(false)}
            >
              <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
                <View className="bg-white w-[90%] rounded-md p-4">
                  <Text className="font-bold text-lg mt-5 mb-5">
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
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const MyIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 448 512">
    <Path
      d="M201.4 374.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 306.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"
      fill="#000000"
    />
  </Svg>
);
