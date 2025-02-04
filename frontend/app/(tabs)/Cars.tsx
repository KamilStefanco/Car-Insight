import { ScrollView, View, Text, Image, Pressable, Button, Alert, ActivityIndicator, TouchableOpacity} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { Navbar } from "@/components/Navbar";
import { PerviewCard } from "@/components/carCard";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import axios from "axios";
import { Modal } from "@/components/Modal";
import EditCar from "./editCar";
import { useFocusEffect } from "@react-navigation/native";

export default function ListCars() {
  const router = useRouter();

  const { token } = useAuth(); 
  const [isOptionsModalVisible, setOptionsModalVisible] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);

  type Car = {
    carId: string; 
    make: string;
    model: string;
    year: string;
    has_image: boolean;
  };

  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchCars() {
    console.log("Fetching cars..."); 
    try {
      setLoading(true);
      const response = await axios.get("https://insightserver-791731285499.europe-central2.run.app:8000/cars", {    
        headers: {
          Authorization: `Bearer ${token}`, // Token pre autentifikáciu
        },
      });

      //console.log("Fetched cars:", response.data);
      setCars(response.data); 

    } catch (error) {

      console.error("Error fetching cars:", error);
      Alert.alert("Error", "Unable to fetch cars. Please try again later.");

    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchCars();
    }, [])
  );


  const handleLongPress = (car: any) => {
    setSelectedCar(car);
    setOptionsModalVisible(true);
  };

  const handleEdit = (car: any) => {
    setSelectedCar(car);
    setEditModalVisible(true);
  };

  const handleDelete = (car: any) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this car?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`https://insightserver-791731285499.europe-central2.run.app:8000/cars/${car.carId}`, {    
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              
              setCars((prev) =>
                prev.filter((item) => item.carId !== car.carId)
              );

              console.log("Deleted car");

            } catch (error) {
              console.error("Error deleting car:", error);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-black">
        <ScrollView className={`flex-1 ${
              isOptionsModalVisible || isEditModalVisible ? "opacity-50 " : "opacity-100"
            }`}>
          <Navbar current={1} title={"YOUR CARS"} />
          <View className="h-20 -z-10" />

          {loading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : cars.length > 0 ? (
            cars.map((car) => (
              <TouchableOpacity
                key={car.carId}
                onLongPress={() => handleLongPress(car)}
                onPress={() => {
                  console.log("Navigating...")
                  console.log("Selected car ID:", car.carId); // Výpis car.carId do konzoly
                  try {
                    router.push(`/(tabs)/details/${car.carId}`); // Navigácia na stránku detailov
                  } catch (error) {
                    console.error("Navigation error:", error);
                    Alert.alert("Error", "Unable to navigate to car details. Please try again.");
                  }
                }}
                className="text-center flex items-center justify-center my-auto mx-auto mt-4"
              >

                <PerviewCard car={car} />
              </TouchableOpacity>
            ))
          ) : (
            <Text className="text-white text-center mt-4">No cars found</Text>
          )}

          <Modal
            isOpen={isOptionsModalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setOptionsModalVisible(false)}
          >
            <View className="flex justify-center items-center w-[100%] h-[100%] bg-black/50">
              <View className="bg-white rounded-lg w-3/4 p-5">
                <Text className="text-xl font-bold mb-4 text-center">Choose an option</Text>
                <TouchableOpacity
                  onPress={() => {
                    setOptionsModalVisible(false);
                    handleEdit(selectedCar);
                    console.log(selectedCar)
                  }}
                  className="p-3 bg-blue-500 rounded-lg mb-3"
                >
                  <Text className="text-white text-center">Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setOptionsModalVisible(false);
                    handleDelete(selectedCar);
                  }}
                  className="p-3 bg-red-500 rounded-lg"
                >
                  <Text className="text-white text-center">Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {isEditModalVisible && (
            <ScrollView>
              <EditCar
                  modalOpen={isEditModalVisible}
                  setModalOpen={setEditModalVisible}
                  car={selectedCar}
                  fetchCars={fetchCars}
              />
            </ScrollView>
          )}


          <Pressable
            onPress={() => {
              router.push("/addCar");
            }}
            className="text-center flex items-center justify-center my-auto mx-auto mt-4"
          >
            <Image
              className="resize w-[6.4rem] h-[6rem] mb-14"
              source={require("@/assets/images/plusBtn.png")}
              resizeMode="contain" // alebo "cover"
            />
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
