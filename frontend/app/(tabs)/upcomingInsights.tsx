import { View, Text, Image, ScrollView, Pressable, TextInput, TouchableOpacity, Button, FlatList } from "react-native";
import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import axios from "axios";
import React from "react";

export default function upcomingInsights(props: any){
  
    interface InsightData {
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

    const [upcomingInsights, setUpcomingInsights] = useState<InsightData[]>([]);
    const { token } = useAuth();

    async function fetchUpcomingInsights(){
        console.log("Fetching upcoming insights...");
        try {
          const response = await axios.get(`https://insightserver-791731285499.europe-central2.run.app:8000/insights/upcoming/${props.carId}`, {    
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
    
          //console.log("Fetched upcoming insights:", response.data);
          setUpcomingInsights(response.data); 
    
        }catch (error) {
          console.error("Error fetching upcoming insights:", error);
        } 
    }

    useEffect(() => {
        fetchUpcomingInsights();
    }, []);


    const UpcomingInsightCard = ({ insight }: { insight: any }) => {

      switch(insight.type){
          case 'Technical Inspection':
          case 'Emissions Test':
              return (
                  <View className="bg-white rounded-xl flex flex-row py-5 px-2 mt-4">
                    <View style={{ height: 50, width: 50, justifyContent: "center", alignItems: "center" }}>
                      { insight.type === 'Technical Inspection' ? <Image
                        source={require("@/assets/images/miniAuto.png")}
                        style={{
                          height: 30, 
                          width: 30,  
                          resizeMode: "contain", 
                        }}/> :
                        <Image
                        source={require("@/assets/images/emissions.png")}
                        style={{
                          height: 30, 
                          width: 30,  
                          resizeMode: "contain", 
                        }}
                        />
                      }
                    </View>
                    <View className="flex flex-col flex-1 gap-2 ml-4">
                      {/* Textové pole pre dátum */}
                      <Text className="text-xl font-bold flex-wrap">{formatDateToShow(insight.expiry_date)}</Text>
                    
                      {/* Text pre popis s automatickým zalomením */}
                      <Text
                        className="text-base flex-wrap"
                        numberOfLines={2} // Limit na počet riadkov (voliteľné)
                        ellipsizeMode="tail" // Skrytie zvyšného textu s "..."
                      >
                        {insight.type}
                      </Text>
                    
                      {/* Text pre zostávajúce dni */}
                      <Text className="text-gray-600 text-base flex-wrap">
                        {calculateRemainingDays(insight.expiry_date)} days remaining
                      </Text>
                    
                      <View className="w-full h-[2px] bg-black mx-auto" />
                    </View>
                  </View>
              );
          case 'Car Insurance':
            return (
                <View className="bg-white rounded-xl flex flex-row py-5 px-2 mt-4">
                  <View style={{ height: 50, width: 50, justifyContent: "center", alignItems: "center" }}>
                    <Image
                      source={require("@/assets/images/insurance.png")}
                      style={{
                        height: 30, 
                        width: 30,  
                        resizeMode: "contain", 
                      }}
                    />
                  </View>
                  <View className="flex flex-col flex-1 gap-2 ml-4">
                    {/* Textové pole pre dátum */}
                    <Text className="text-xl font-bold flex-wrap">{formatDateToShow(insight.start_date)} - {formatDateToShow(insight.end_date)}</Text>
                  
                    {/* Text pre popis s automatickým zalomením */}
                    <Text
                      className="text-base flex-wrap"
                      numberOfLines={2} // Limit na počet riadkov (voliteľné)
                      ellipsizeMode="tail" // Skrytie zvyšného textu s "..."
                    >
                      {insight.type} - {insight.station_name}
                    </Text>
                  
                    {/* Text pre zostávajúce dni */}
                    <Text className="text-gray-600 text-base flex-wrap">
                      {calculateRemainingDays(insight.end_date)} days remaining
                    </Text>
                  
                    <View className="w-full h-[2px] bg-black mx-auto" />
                  </View>
                </View>
            );
          case 'Oil Change':
              return (
                  <View className="bg-white rounded-xl flex flex-row py-5 px-2 mt-4">
                    <View style={{ height: 50, width: 50, justifyContent: "center", alignItems: "center" }}>
                      <Image
                        source={require("@/assets/images/fuel.png")}
                        style={{
                          height: 30, 
                          width: 30,  
                          resizeMode: "contain", 
                        }}
                      />
                    </View>
                    <View className="flex flex-col flex-1 gap-2 ml-4">
                      {/* Textové pole pre dátum */}
                      <Text className="text-xl font-bold flex-wrap">Changed on {formatDateToShow(insight.date)}</Text>
                    
                      {/* Text pre popis s automatickým zalomením */}
                      <Text
                        className="text-base flex-wrap"
                        numberOfLines={2} // Limit na počet riadkov (voliteľné)
                        ellipsizeMode="tail" // Skrytie zvyšného textu s "..."
                      >
                        {insight.type}
                      </Text>
                    
                      {/* Text pre zostávajúce dni */}
                      <Text className="text-gray-600 text-base flex-wrap">
                        {formatNumberWithSpaces(insight.next_change - props.carData.odometer)} km or {calculateRemainingDays(insight.expiry_date)} days remaining
                      </Text>
                    
                      <View className="w-full h-[2px] bg-black mx-auto" />
                    </View>
                  </View>
              );
          case 'Highway Toll Pass':
              return (
                <View className="bg-white rounded-xl flex flex-row py-5 px-2 mt-4">
                  <View style={{ height: 50, width: 50, justifyContent: "center", alignItems: "center" }}>
                    <Image
                      source={require("@/assets/images/ticket.png")}
                      style={{
                        height: 30, 
                        width: 30,  
                        resizeMode: "contain", 
                      }}
                    />
                  </View>
                  <View className="flex flex-col flex-1 gap-2 ml-4">
                    {/* Textové pole pre dátum */}
                    <Text className="text-xl font-bold flex-wrap">{formatDateToShow(insight.start_date)} - {formatDateToShow(insight.end_date)}</Text>
                  
                    {/* Text pre popis s automatickým zalomením */}
                    <Text
                      className="text-base flex-wrap"
                      numberOfLines={2} // Limit na počet riadkov (voliteľné)
                      ellipsizeMode="tail" // Skrytie zvyšného textu s "..."
                    >
                      {insight.type} - {insight.country}
                    </Text>
                  
                    {/* Text pre zostávajúce dni */}
                    <Text className="text-gray-600 text-base flex-wrap">
                      {calculateRemainingDays(insight.end_date)} days remaining
                    </Text>
                  
                    <View className="w-full h-[2px] bg-black mx-auto" />
                  </View>
                </View>
              );
          default:
              return null;
      }
    };

    const calculateRemainingDays = (expiryDate: string): number => {
        const today = new Date();
        const expiry = new Date(expiryDate);
      
        // Vypočítanie rozdielu v milisekundách
        const diffInMs = expiry.getTime() - today.getTime();
      
        // Prevod milisekúnd na dni
        const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
      
        return diffInDays;
    };

    function formatNumberWithSpaces(number: any) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      }

    const formatDateToShow = (dateString: string): string => {
        const [year, month, day] = dateString.split("-");
        return `${parseInt(day, 10)}.${month}.${year}`;
    };

    //const renderUpcomingInsights = () =>{
    //    return upcomingInsights.map((insight,idx) => (
    //        <UpcomingInsightCard key={idx} insight={insight} />
    //    ));
    //}

    const renderUpcomingInsights = () => {
        return upcomingInsights
          .sort((a, b) => new Date(a.date || a.end_date || a.expiry_date).getTime() - new Date(b.date || b.end_date || b.expiry_date).getTime())
          .map((insight, idx) => (
            <UpcomingInsightCard key={idx} insight={insight} />
        ));
    };


    return(
        <View>
            {upcomingInsights.length > 0 ? renderUpcomingInsights():
            <View className="bg-white rounded-xl flex flex-row py-5 px-2 mt-5 justify-center mb-5">
              <Text className="text-xl font-bold">No upcoming insights</Text>
            </View>
            }
        </View>
    );
}