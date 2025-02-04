import { View, Text, Image, ScrollView, Pressable, TextInput, TouchableOpacity, Button, FlatList, Alert } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { Navbar } from "@/components/Navbar";
import { useCallback, useEffect, useState } from "react";
import { Modal } from "@/components/Modal";
import { useAuth } from "../../AuthContext";
import axios from "axios";
import { useLocalSearchParams } from 'expo-router'
import React from "react";
import AddInsight from "../addInsight";
import UpcomingInsights from "../upcomingInsights"
import EditInsight from "../editInsight";
import { useFocusEffect } from "@react-navigation/native";
  
const InfoCard = ({ insight }: { insight: any }) => {

  const formatDate = (dateString: string): string => {
    const [year, month, day] = dateString.split("-");
    return `${parseInt(day, 10)}.${month}.${year}`;
  };

  switch(insight.type){
    case 'Technical Inspection':
      return (
        <View className="border-4 border-orange-300 bg-white rounded-xl flex flex-row py-5 px-2 mt-4">
          <View className="h-full">
            <Image className="" source={require("@/assets/images/miniAuto.png")} />
          </View>
          <View className="flex flex-col gap-2">
            <View className="flex flex-row  w-full">
              <Text className="pl-4 text-2xl font-bold ">{formatDate(insight.date)}</Text>
              <Text className="font-bold text-2xl ml-5">{insight.type}</Text>
            </View>
            {insight.station_name && (
              <View className="flex flex-row justify-start w-full ml-5">
                <Text className="text-xl font-bold">Station:</Text>
                <Text className="text-xl ml-2">{insight.station_name}</Text>
              </View>
            )}
            {insight.note && (
              <View className="flex flex-row justify-start w-full ml-5">
                <Text className="text-xl font-bold">Note:</Text>
                <Text className="text-xl ml-2">{insight.note}</Text>
              </View>
            )}
            <View className="w-full h-[2px] bg-black mx-auto" />
            <View className="flex flex-row justify-around w-full">
              <Text className="text-xl text-black font-bold">Expiry Date : {insight.expiry_date === null ? '' : formatDate(insight.expiry_date)}</Text>
              <Text className="text-xl">
                <Text className="font-bold">Price:</Text> {insight.price ? `${insight.price}€` : "- €"}
              </Text>             
            </View>
          </View>
        </View>
      );
    
    case 'Emissions Test':
      return (
        <View className="border-4 border-orange-300 bg-white rounded-xl flex flex-row py-5 px-2 mt-4">
          <View className="h-full">
            <Image className="" source={require("@/assets/images/emissions.png")} />
          </View>
          <View className="flex flex-col gap-2">
            <View className="flex flex-row  w-full">
              <Text className="pl-4 text-2xl font-bold">{formatDate(insight.date)}</Text>
              <Text className="font-bold text-2xl ml-14">{insight.type}</Text>
            </View>
            {insight.station_name && (
              <View className="flex flex-row justify-start w-full ml-5">
                <Text className="text-xl font-bold">Station:</Text>
                <Text className="text-xl ml-2">{insight.station_name}</Text>
              </View>
            )}
            {insight.note && (
              <View className="flex flex-row justify-start w-full ml-5">
                <Text className="text-xl font-bold">Note:</Text>
                <Text className="text-xl ml-2">{insight.note}</Text>
              </View>
            )}
            <View className="w-full h-[2px] bg-black mx-auto" />
            <View className="flex flex-row justify-around w-full">
              <Text className="text-xl text-black font-bold">Expiry Date : {insight.expiry_date === null ? '' : formatDate(insight.expiry_date)}</Text>
              <Text className="text-xl">
                <Text className="font-bold">Price:</Text> {insight.price ? `${insight.price}€` : "- €"}
              </Text>            
            </View>
          </View>
        </View>
      );
    case 'Car Insurance':
      return (
        <View className="border-4 border-green-300 bg-white rounded-xl flex flex-row py-5 px-2 mt-4">
          <View className="h-full">
            <Image className="" source={require("@/assets/images/insurance.png")} />
          </View>
          <View className="flex flex-col gap-2">
            <View className="flex flex-row  w-full">
              <Text className="pl-4 text-2xl font-bold">{formatDate(insight.date)}</Text>
              <Text className="font-bold text-2xl ml-12">{insight.type.toUpperCase()}</Text>
            </View>
            {insight.station_name && (
              <View className="flex flex-row justify-start w-full ml-5">
                <Text className="text-xl font-bold">Provider:</Text>
                <Text className="text-xl ml-2">{insight.station_name}</Text>
              </View>
            )}
            {insight.note && (
              <View className="flex flex-row justify-start w-full ml-5">
                <Text className="text-xl font-bold">Note:</Text>
                <Text className="text-xl ml-2">{insight.note}</Text>
              </View>
            )}
            <View className="w-full h-[2px] bg-black mx-auto" />
            <View className="flex flex-row justify-around w-full">
              <Text className="text-xl font-bold">End Date: {formatDate(insight.end_date)}</Text>
              <Text className="text-xl">
                <Text className="font-bold">Price:</Text> {insight.price ? `${insight.price}€` : "- €"}
              </Text>
            </View>
          </View>
        </View>
      );
    case 'Oil Change':
      return (
        <View className="border-4 border-black-100 bg-white rounded-xl flex flex-row py-5 px-2 mt-4">
          <View className="h-full">
            <Image className="" source={require("@/assets/images/fuel.png")} />
          </View>
          <View className="flex flex-col gap-2">
            <View className="flex flex-row  w-full">
              <Text className="pl-4 text-2xl font-bold">{formatDate(insight.date)}</Text>
              <Text className="font-bold text-2xl ml-20">{insight.type.toUpperCase()}</Text>
            </View>
            {insight.station_name && (
              <View className="flex flex-row justify-start w-full ml-5">
                <Text className="text-xl font-bold">Station:</Text>
                <Text className="text-xl ml-2">{insight.station_name}</Text>
              </View>
            )}
            {insight.note && (
              <View className="flex flex-row justify-start w-full ml-5">
                <Text className="text-xl font-bold">Note:</Text>
                <Text className="text-xl ml-2">{insight.note}</Text>
              </View>
            )}
            <View className="flex flex-row justify-start w-full ml-5">
              <Text className="text-xl font-bold">State(km): </Text>
              <Text className="text-xl">{formatNumberWithSpaces(insight.odometer)} km</Text>
            </View>
            <View className="w-full h-[2px] bg-black mx-auto" />
            <View className="flex flex-row justify-around w-full">
              <Text className="text-xl text-black font-bold">Next Change: {formatNumberWithSpaces(insight.next_change)} km</Text>
              <Text className="text-xl">
                <Text className="font-bold">Price:</Text> {insight.price ? `${insight.price}€` : "- €"}
              </Text>            
            </View>
          </View>
        </View>
      );
    
      case 'Highway Toll Pass':
        return (
        <View className="border-4 border-green-300 bg-white rounded-xl flex flex-row py-5 px-2 mt-4">
            <View className="h-full">
              <Image className="" source={require("@/assets/images/ticket.png")} />
            </View>
            <View className="flex flex-col gap-2">
              <View className="flex flex-row  w-full">
                <Text className="pl-4 text-2xl font-bold">{formatDate(insight.date)}</Text>
                <Text className="font-bold text-2xl ml-8">{insight.type}</Text>
              </View>
              {insight.country && (
                <View className="flex flex-row justify-start w-full ml-5">
                  <Text className="text-xl font-bold">Country:</Text>
                  <Text className="text-xl ml-2">{insight.country}</Text>
                </View>
              )}
              {insight.note && (
                <View className="flex flex-row justify-start w-full ml-5">
                  <Text className="text-xl font-bold">Note:</Text>
                  <Text className="text-xl ml-2">{insight.note}</Text>
                </View>
              )}
              <View className="w-full h-[2px] bg-black mx-auto" />
              <View className="flex flex-row justify-around w-full">
                <Text className="text-xl font-bold">End Date: {formatDate(insight.end_date)}</Text>
                <Text className="text-xl">
                  <Text className="font-bold">Price:</Text> {insight.price ? `${insight.price}€` : "- €"}
                </Text>
              </View>
            </View>
          </View>
        );
    
    case 'Service':
      return (
        <View className="border-4 border-red-300 bg-white rounded-xl flex flex-row py-5 px-2 mt-4">
          <View className="h-full">
            <Image className="" source={require("@/assets/images/wrench.png")} />
          </View>
          <View className="flex flex-col gap-2">
            <View className="flex flex-row  w-full">
              <Text className="pl-4 text-2xl font-bold">{formatDate(insight.date)}</Text>
              <Text className="font-bold text-2xl ml-32">{insight.type.toUpperCase()}</Text>
            </View>
            {insight.service_type && (
                <View className="flex flex-row justify-start w-full ml-5">
                  <Text className="text-xl font-bold">Service type:</Text>
                  <Text className="text-xl ml-2">{insight.service_type}</Text>
                </View>
            )}
            {insight.description && (
              <View className="flex flex-row justify-start w-full ml-5">
                <Text className="text-xl font-bold">Description:</Text>
                <Text className="text-xl ml-2">{insight.description}</Text>
              </View>
            )}
            {insight.station_name && (
              <View className="flex flex-row justify-start w-full ml-5">
                <Text className="text-xl font-bold">Station:</Text>
                <Text className="text-xl ml-2">{insight.station_name}</Text>
              </View>
            )}
            {insight.note && (
                <View className="flex flex-row justify-start w-full ml-5">
                  <Text className="text-xl font-bold">Note:</Text>
                  <Text className="text-xl ml-2">{insight.note}</Text>
                </View>
              )}
            <View className="flex flex-row justify-start w-full ml-5">
              <Text className="text-xl font-bold">State(km): </Text>
              <Text className="text-xl">{formatNumberWithSpaces(insight.odometer)} km</Text>
            </View>
            <View className="w-full h-[2px] bg-black mx-auto" />
            <View className="flex flex-row justify-around w-full">
                <Text className="text-xl">
                  <Text className="font-bold">Cost:</Text> {insight.price ? `${insight.price}€` : "- €"}
                </Text>
              </View>
          </View>
        </View>
      );
    default:
      return(
        <View className="bg-white rounded-xl flex items-center py-5 px-2 mt-4">
          <Text className="text-xl">Unknown</Text>
          <Text className="text-xl">Details unavailable</Text>
        </View>
      );

    }
  };
  

  function formatNumberWithSpaces(number: any) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }
  
  
  const CarInfo = ( {carData, fetchCarData}: {carData: Car, fetchCarData: Function}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [odometer, setOdometer] = useState(carData.odometer.toString());
    const [newOdometer, setNewOdometer] = useState(carData.odometer.toString());
    const { token } = useAuth();
    const { carId } = useLocalSearchParams();

    const handleKilometerUpdate = async () => {

      console.log("Updating kilometers, new odometer:", newOdometer);

      const carData = {
        odometer: Number(newOdometer)
      };
  
      if(token){
        try {
          const response = await axios.put(
            `https://insightserver-791731285499.europe-central2.run.app:8000/cars/${carId}`, 
            carData, 
            {
              headers: {
                Authorization: `Bearer ${token}`, 
                "Content-Type": "application/json", 
              },
            }
          );
         
          console.log("Kilometers updated successfully:", response.data);
        } catch (error) {
          console.error("Error updating kilometers:", error);
          throw error;
        }
      }

      setIsModalOpen(false);
      fetchCarData(); 
    };

    return (
      <View className="mb-5">

        <View className="bg-white rounded-md flex flex-row py-3 px-2 my-4 justify-between items-center">
          <View className="flex flex-row items-center">
            <Text className="font-bold ml-4">Driven kilometers:</Text>
            <Text className="ml-3">{formatNumberWithSpaces(odometer)} km</Text>
          </View>
          <TouchableOpacity className="border p-3 rounded" onPress={() => setIsModalOpen(true)}><Text>Update</Text></TouchableOpacity>
        </View>

        {/* Modal */}
        <Modal isOpen={isModalOpen} withInput={true} onRequestClose={() => setIsModalOpen(false)}>
          <View className="bg-white rounded-md p-5 w-full max-w-md">
            <Text className="text-lg font-bold mb-4">Update Kilometers</Text>
            <TextInput
              className="border p-2 rounded mb-4"
              placeholder="Enter new odometer value"
              keyboardType="numeric"
              value={newOdometer}
              onChangeText={setNewOdometer}
            />
            <View className="flex flex-row justify-between">
              <Button title="Cancel" onPress={() => {setIsModalOpen(false); setNewOdometer(odometer)}} />
              <Button title="Update" onPress={() => {handleKilometerUpdate(); setOdometer(newOdometer)}} />
            </View>
          </View>
        </Modal>

        <View className="bg-white rounded-md flex flex-row py-5 px-2 mt-4 justify-between">
          <Text className="font-bold flex-1 text-left ml-4">Make</Text>
          <Text className="flex-1 text-right mr-4">{carData.make}</Text>
        </View>
        <View className="bg-white rounded-md flex flex-row py-5 px-2 mt-4 justify-between">
          <Text className="font-bold flex-1 text-left ml-4">Model</Text>
          <Text className="flex-1 text-right mr-4">{carData.model}</Text>
        </View>
        <View className="bg-white rounded-md flex flex-row py-5 px-2 mt-4">
          <Text className="font-bold flex-1 text-left ml-4">Model year</Text>
          <Text className="flex-1 text-right mr-4"> {carData.year}</Text>
        </View>
        <View className="bg-white rounded-md flex flex-row py-5 px-2 mt-4">
          <Text className="font-bold flex-1 text-left ml-4">Performance</Text>
          <Text className="flex-1 text-right mr-4">{carData.max_power_kw} kw</Text>
        </View>
        <View className="bg-white rounded-md flex flex-row py-5 px-2 mt-4">
          <Text className="font-bold flex-1 text-left ml-4">Engine</Text>
          <Text className="flex-1 text-right mr-4">{carData.engine}</Text>
        </View>
        <View className="bg-white rounded-md flex flex-row py-5 px-2 mt-4">
          <Text className="font-bold flex-1 text-left ml-4">Transmission</Text>
          <Text className="flex-1 text-right mr-4">{carData.transmission}</Text>
        </View>
        <View className="bg-white rounded-md flex flex-row py-5 px-2 mt-4">
          <Text className="font-bold flex-1 text-left ml-4">Type</Text>
          <Text className="flex-1 text-right mr-4">{carData.car_type}</Text>
        </View>
        <View className="bg-white rounded-md flex flex-row py-5 px-2 mt-4">
          <Text className="font-bold flex-1 text-left ml-4">Fuel</Text>
          <Text className="flex-1 text-right mr-4">{carData.fuel_type}</Text>
        </View>
        <View className="bg-white rounded-md flex flex-row py-5 px-2 mt-4">
          <Text className="font-bold flex-1 text-left ml-4">License plate</Text>
          <Text className="flex-1 text-right mr-4">{carData.license_plate}</Text>
        </View>
        <View className="bg-white rounded-md flex flex-row py-5 px-2 mt-4">
          <Text className="font-bold flex-1 text-left ml-4">VIN</Text>
          <Text className="flex-1 text-right mr-4">{carData.vin}</Text>
        </View>
      </View>
    );
  };

  type Car = {
    make: string;
    model: string;
    year: number;
    max_power_kw: number;
    engine: string;
    transmission: string;
    fuel_type: string;
    vin: string;
    odometer: string;
    has_image: boolean;
    car_type: string;
    license_plate: string;
  };

  type InsightData = {
    insightId: string;
    carId: string,
    type: string,
    date: string,
    odometer: Number,
    expiry_date: string,
    station_name: string,
    note: string,
    price: Number,
    next_change: Number,
    start_date: string,
    end_date: string,
    country: string,
    service_type: string,
    description: string
  };
  
  export default function DetailScreen() {
    const [selectedTab, setSelectedTab] = useState("Insights");
    const [carData, setCarData] = useState<Car>({
      make: '',
      model: '',
      year: 0,
      max_power_kw: 0,
      engine: '',
      transmission: '',
      fuel_type: '',
      vin: '',
      odometer: '',
      has_image: false,
      car_type: '',
      license_plate: '',
    });
    const { carId } = useLocalSearchParams();
    const { token } = useAuth(); 
    const [modalOpen, setModalOpen] = useState(false);
    const [insights, setInsights] = useState<InsightData[]>([]);
    const [selectedInsight, setSelectedInsight] = useState(null);
    const [isOptionsModalVisible, setOptionsModalVisible] = useState(false);
    const [isEditModalVisible, setEditModalVisible] = useState(false);
  
    const handleTabClick = (tab: any) => {
      setSelectedTab(tab);
    };

    async function fetchCarData(){
        console.log("Fetching car data...");
        try {
          const response = await axios.get(`https://insightserver-791731285499.europe-central2.run.app:8000/cars/${carId}`, {  
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
    
          //console.log("Fetched car data:", response.data);
          setCarData(response.data); 
    
        }catch (error) {
          console.error("Error fetching car data:", error);
        } 
    }

    async function fetchCarInsights(){
      console.log("Fetching car insights...");
      try {
        const response = await axios.get(`https://insightserver-791731285499.europe-central2.run.app:8000/insights/${carId}`, {    
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        //console.log("Fetched car insights:", response.data);
        setInsights(response.data); 
  
      }catch (error) {
        console.error("Error fetching car insights:", error);
      } 
  }


    useFocusEffect(
      useCallback(() => {
        fetchCarData();
        fetchCarInsights();
      }, [])
    );
  


    const handleLongPress = (insight: any) => {
      setSelectedInsight(insight);
      setOptionsModalVisible(true);
    };

    const handleEdit = (insight: any) => {
      setSelectedInsight(insight);
      setEditModalVisible(true);
    };

    const handleDelete = (insight: any) => {
      Alert.alert(
        "Confirm Delete",
        "Are you sure you want to delete this insight?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                await axios.delete(`https://insightserver-791731285499.europe-central2.run.app:8000/insights/${insight.insightId}`, {   
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                });
                
                setInsights((prev) =>
                  prev.filter((item) => item.insightId !== insight.insightId)
                );

                console.log("Deleted insight");

              } catch (error) {
                console.error("Error deleting insight:", error);
              }
            },
          },
        ]
      );
    };
    

    const renderInsights = () => {
      // Skupina podľa mesiaca a roka
      const groupedInsights = insights.reduce((acc: any, insight: any) => {
        const date = new Date(insight.date);
        const monthYear = date.toLocaleString("en-US", { month: "long", year: "numeric" });
        
        if (!acc[monthYear]) {
          acc[monthYear] = [];
        }
        acc[monthYear].push(insight);
        return acc;
      }, {});
    
      // Vypísanie výsledkov so skupinami
      return Object.keys(groupedInsights).map((monthYear) => (
        <View key={monthYear}>
          <Text className="text-white font-bold py-2 text-xl">{monthYear}</Text>
          {groupedInsights[monthYear].map((insight: any, idx: number) => (
            <TouchableOpacity
              key={`${monthYear}-${idx}`}
              onLongPress={() => {handleLongPress(insight)}}
            >
              <InfoCard insight={insight} />
            </TouchableOpacity>
          ))}
        </View>
      ));
    };

    const imageSource = carData.has_image 
        ? { uri: `https://insightserver-791731285499.europe-central2.run.app:8000/static/uploads/car_images/${carId}.jpeg` } 
        : require("@/assets/images/skoda-octavia.png"); // Placeholder obrázok, ak auto nemá obrázok
  
    return (
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 bg-black">
          <ScrollView
            className={`flex-1 ${
              modalOpen || isEditModalVisible ? "opacity-50 " : "opacity-100"
            }`}
          >
            <Navbar current={10} title={`${carData.make} ${carData.model} ${carData.year}`} />
            <View className="h-20 -z-10" />
  
            <View className="flex flex-row items-center justify-end w-full">
              <Pressable
                className="flex-row items-center"
                onPress={() => {
                  setModalOpen(true);
                }}
              >
                <Image
                  className="resize w-[3.2rem] h-[3rem]"
                  source={require("@/assets/images/plusBtn.png")}
                />
                <Text className="text-white text-xl font-bold text-right mr-5">
                  {" "}
                  Add new insight
                </Text>
              </Pressable>
            </View>
  
            <AddInsight modalOpen={modalOpen} setModalOpen={setModalOpen} carId={carId} carData={carData} fetchInsights={fetchCarInsights} />
              
  
            <Image
              className="resize w-[22rem] h-[10rem] mx-auto mt-10 mb-10 rounded-md"
              source={imageSource}
            />
  
            <View className="bg-black mx-auto h-20 w-[95%] flex flex-row gap-2 py-1 border-4 border-[#400000] px-1 justify-between items-center">
              <Pressable
                onPress={() => handleTabClick("Insights")}
                className={`flex-1 mx-1 rounded h-[3.5rem] ${
                  selectedTab === "Insights" ? "bg-[#400000]" : "bg-[#40000060]"
                }`}
              >
                <Text className="text-lg text-white font-bold text-center my-auto">
                  Insights
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleTabClick("Info")}
                className={`flex-1 mx-1 rounded h-[3.5rem] ${
                  selectedTab === "Info" ? "bg-[#400000]" : "bg-[#40000060]"
                }`}
              >
                <Text className="text-lg text-white font-bold text-center my-auto">
                  Info
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleTabClick("UpcomingInsights")}
                className={`flex-1 mx-1 rounded h-[3.5rem] ${
                  selectedTab === "UpcomingInsights"
                    ? "bg-[#400000]"
                    : "bg-[#40000060]"
                }`}
              >
                <Text className="text-lg text-white font-bold text-center my-auto">
                  Upcoming Insights
                </Text>
              </Pressable>
            </View>
  
            {selectedTab === "Insights" ? (
              <ScrollView className="bg-[#400000] border-4 border-gray-300 flex flex-col  px-2 py-4 rounded-xl mb-5">

                { insights.length > 0 ? (
                  renderInsights() 
                ) : (
                  <View className="bg-white rounded-xl flex flex-row py-5 px-2 mt-5 justify-center mb-5">
                    <Text className="text-xl font-bold">No insights yet</Text>
                  </View>
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
                        handleEdit(selectedInsight);
                      }}
                      className="p-3 bg-blue-500 rounded-lg mb-3"
                    >
                      <Text className="text-white text-center">Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setOptionsModalVisible(false);
                        handleDelete(selectedInsight);
                      }}
                      className="p-3 bg-red-500 rounded-lg"
                    >
                      <Text className="text-white text-center">Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>

              {isEditModalVisible && (
                  <EditInsight
                      modalOpen={isEditModalVisible}
                      setModalOpen={setEditModalVisible}
                      insight={selectedInsight}
                      carData={carData}
                      fetchInsights={fetchCarInsights}
                  />
              )}
               
                
              </ScrollView>
            ) : selectedTab === "Info" ? (
              <ScrollView className="bg-[#400000] border-4 border-gray-300 flex flex-col px-2 py-4">
                <CarInfo carData={carData} fetchCarData={fetchCarData} />
              </ScrollView>
            ) : (
              <ScrollView className="bg-[#400000] border-4 border-gray-300 flex flex-col px-2 py-4 rounded-xl">

                <UpcomingInsights carId={carId} carData={carData} />
                
              </ScrollView>
            )}
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }
