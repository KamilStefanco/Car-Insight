import { View, Text, Pressable, TextInput, TouchableOpacity, FlatList } from "react-native";
import { useState } from "react";
import { Modal } from "@/components/Modal";
import { MyIcon } from "@/components/MyIcon";
import axios from "axios";
import React from "react";
import { useAuth } from "../AuthContext";
import DateTimePickerModal from 'react-native-modal-datetime-picker';

interface InsightData {
    car_id: string,
    insightId: string,
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

export default function editInsight(props: any){
    const { token } = useAuth();
    const [isDatePickerVisible, setPickerVisibility] = useState(false);
    const [isEndDatePickerVisible, setEndPickerVisibility] = useState(false);

    const formatDateFromDBtoShow = (dateString: string): string => {
        if(dateString === null){
            return '';
        }

        const [year, month, day] = dateString.split("-");
        return `${parseInt(day, 10)}.${month}.${year}`;
    };

    const [insightData, setInsightData] = useState<InsightData>({
        car_id: props.insight.car_id,
        insightId: props.insight.insightId,
        type: props.insight.type,
        date: formatDateFromDBtoShow(props.insight.date),
        odometer: props.insight.odometer,
        expiry_date: formatDateFromDBtoShow(props.insight.expiry_date),
        station_name: props.insight.station_name,
        note: props.insight.note,
        price: props.insight.price,
        next_change: props.insight.next_change,
        start_date: formatDateFromDBtoShow(props.insight.start_date),
        end_date: formatDateFromDBtoShow(props.insight.end_date),
        country: props.insight.country,
        service_type: props.insight.service_type,
        description: props.insight.description
    });

    const showDatePicker = () => setPickerVisibility(true);
    const hideDatePicker = () => setPickerVisibility(false);

    const showEndDatePicker = () => setEndPickerVisibility(true);
    const hideEndDatePicker = () => setEndPickerVisibility(false);

    const handleInputChange = (field: keyof InsightData, value: string) => {
        setInsightData(prevData => ({
          ...prevData,
          [field]: value,
        }));
      };

    const handleConfirmDate = (selectedDate: Date) => {
      const formattedDate = formatDateToShow(selectedDate);

      handleInputChange("date", formattedDate); 
      hideDatePicker();
    };

    const handleConfirmExpiryDate = (selectedDate: Date) => {
      const formattedDate = formatDateToShow(selectedDate);

      handleInputChange("expiry_date", formattedDate); 
      hideEndDatePicker();
    };

    const handleConfirmStartDate = (selectedDate: Date) => {
      const formattedDate = formatDateToShow(selectedDate);

      handleInputChange("start_date", formattedDate); 
      hideDatePicker();
    };

    const handleConfirmEndDate = (selectedDate: Date) => {
      const formattedDate = formatDateToShow(selectedDate);

      handleInputChange("end_date", formattedDate); 
      hideEndDatePicker();
    };

    const formatDateForDB = (dateString: string): string => {
        const [day, month, year] = dateString.split("."); 
    
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`; 
    };


    const formatDateToShow = (date: Date): string => {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0"); 
        const year = date.getFullYear();
        
        return `${day}.${month}.${year}`;
    };

    const replaceEmptyWithNull = (value: any) => (value === "" ? null : value);

    const editInsight = async () => {

        const data ={
            car_id: insightData.car_id,
            type: insightData.type,
            date: formatDateForDB(insightData.date),
            odometer: Number(insightData.odometer) === 0 ? insightData.odometer=props.carData.odometer : Number(insightData.odometer),
            expiry_date: insightData.expiry_date === "" ? null : formatDateForDB(insightData.expiry_date),
            station_name: replaceEmptyWithNull(insightData.station_name),
            note: replaceEmptyWithNull(insightData.note),
            price: Number(insightData.price),
            next_change: Number(insightData.next_change),
            start_date: insightData.start_date === "" ? null : formatDateForDB(insightData.start_date),
            end_date: insightData.end_date === "" ? null : formatDateForDB(insightData.end_date),
            country: replaceEmptyWithNull(insightData.country),
            service_type: replaceEmptyWithNull(insightData.service_type),
            description: replaceEmptyWithNull(insightData.description)
        }

        console.log(data);

        try {
            const response = await axios.put(`https://insightserver-791731285499.europe-central2.run.app:8000/insights/${insightData.insightId}`, data, 
              {
                headers: {
                  Authorization: `Bearer ${token}`, 
                  "Content-Type": "application/json", 
                },
              }
            );
    
            console.log('Insight edited');
    
          } catch (error) {
            console.error('Error editing insight:', error);
          }
    
          props.setModalOpen(false); 
    }

    const renderFields = () =>{
        switch (props.insight.type) {
            case "Technical Inspection":
            case "Emissions Test":
              return (
                <View className="mb-5">
                  <TouchableOpacity onPress={showDatePicker} className="bg-white rounded-md flex flex-row py-3 px-2 mt-4 justify-between">
                    <Text className="font-bold flex-1 text-left ml-4  text-xl">Date</Text>
                    <Text className="mr-10 text-xl">{insightData.date === '' ? "Today" : insightData.date}</Text>
                    <MyIcon />
                  </TouchableOpacity>
                  <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="date"
                    onConfirm={handleConfirmDate}
                    onCancel={hideDatePicker}
                  />
    
                  <TouchableOpacity onPress={showEndDatePicker} className="bg-white rounded-md flex flex-row py-3 px-2 mt-4 justify-between">
                    <Text className="font-bold flex-1 text-left ml-4  text-xl">Expiry Date</Text>
                    <Text className="mr-10 text-xl">{insightData.expiry_date}</Text>
                    <MyIcon />
                  </TouchableOpacity>
                  <DateTimePickerModal
                    isVisible={isEndDatePickerVisible}
                    mode="date"
                    onConfirm={handleConfirmExpiryDate}
                    onCancel={hideEndDatePicker}
                  />
    
                  <View className="bg-white rounded-md flex flex-row py-3 px-2 mt-4 justify-between">
                    <Text className="font-bold flex-1 text-left ml-4 mt-2 text-xl">
                      Station name
                    </Text>
                    <TextInput className="bg-[#D9D9D9] w-[50%] h-10 rounded-xl border-2 border-black-300 text-Black placeholder:text-gray-400 px-2 py-2"
                               value={insightData.station_name}
                               onChangeText={(text) => handleInputChange('station_name', text)} 
                    />
                  </View>
                  <View className="bg-white rounded-md flex flex-row py-3 px-2 mt-4 justify-between">
                    <Text className="font-bold flex-1 text-left ml-4 mt-2 text-xl">
                      Cost €
                    </Text>
                    <TextInput className="bg-[#D9D9D9] w-[50%] h-10 rounded-xl border-2 border-black-300 text-Black placeholder:text-gray-400 px-2 py-2"
                               value={insightData.price === 0 ? '' : String(insightData.price)}
                               onChangeText={(text) => handleInputChange('price', text)} 
                    />
                  </View>
                  <View className="bg-white rounded-md flex flex-row py-3 px-2 mt-4 justify-between">
                    <Text className="font-bold flex-1 text-left ml-4 mt-2 text-xl">
                      Note
                    </Text>
                    <TextInput className="bg-[#D9D9D9] w-[50%] h-10 rounded-xl border-2 border-black-300 text-Black placeholder:text-gray-400 px-2 py-2"
                               value={insightData.note}
                               onChangeText={(text) => handleInputChange('note', text)} 
                    />
                  </View>
                </View>
              );
            case "Car Insurance":
                return (
                  <View className="mb-5">
                    <TouchableOpacity onPress={showDatePicker} className="bg-white rounded-md flex flex-row py-3 px-2 mt-4 justify-between">
                      <Text className="font-bold flex-1 text-left ml-4  text-xl">* Start Date</Text>
                      <Text className="mr-10 text-xl">{insightData.date === '' ? "Today" : insightData.date}</Text>
                      <MyIcon />
                    </TouchableOpacity>
                    <DateTimePickerModal
                      isVisible={isDatePickerVisible}
                      mode="date"
                      onConfirm={handleConfirmDate}
                      onCancel={hideDatePicker}
                    />
    
                    <TouchableOpacity onPress={showEndDatePicker} className="bg-white rounded-md flex flex-row py-3 px-2 mt-4 justify-between">
                      <Text className="font-bold flex-1 text-left ml-4  text-xl">* End Date</Text>
                      <Text className="mr-10 text-xl">{insightData.end_date}</Text>
                      <MyIcon />
                    </TouchableOpacity>
                    <DateTimePickerModal
                      isVisible={isEndDatePickerVisible}
                      mode="date"
                      onConfirm={handleConfirmEndDate}
                      onCancel={hideEndDatePicker}
                    />
    
                    <View className="bg-white rounded-md flex flex-row py-3 px-2 mt-4 justify-between">
                      <Text className="font-bold flex-1 text-left ml-4 mt-2 text-xl">
                        Price €
                      </Text>
                      <TextInput className="bg-[#D9D9D9] w-[50%] h-10 rounded-xl border-2 border-black-300 text-Black placeholder:text-gray-400 px-2 py-2"
                               value={insightData.price === 0 ? '' : String(insightData.price)}
                               onChangeText={(text) => handleInputChange('price', text)} 
                      />
                    </View>
                    <View className="bg-white rounded-md flex flex-row py-3 px-2 mt-4 justify-between">
                      <Text className="font-bold flex-1 text-left ml-4 mt-2 text-xl">
                        Provider
                      </Text>
                      <TextInput className="bg-[#D9D9D9] w-[50%] h-10 rounded-xl border-2 border-black-300 text-Black placeholder:text-gray-400 px-2 py-2"
                               value={insightData.station_name}
                               onChangeText={(text) => handleInputChange('station_name', text)} 
                      />
                    </View>
                    <View className="bg-white rounded-md flex flex-row py-3 px-2 mt-4 justify-between">
                      <Text className="font-bold flex-1 text-left ml-4 mt-2 text-xl">
                        Note
                      </Text>
                      <TextInput className="bg-[#D9D9D9] w-[50%] h-10 rounded-xl border-2 border-black-300 text-Black placeholder:text-gray-400 px-2 py-2"
                               value={insightData.note}
                               onChangeText={(text) => handleInputChange('note', text)} 
                      />
                    </View>
                  </View>
                );
            case "Oil Change":
                return (
                    <View className="mb-5">
                      <TouchableOpacity onPress={showDatePicker} className="bg-white rounded-md flex flex-row py-3 px-2 mt-4 justify-between">
                        <Text className="font-bold flex-1 text-left ml-4  text-xl">* Date of change</Text>
                        <Text className="mr-10 text-xl">{insightData.date === '' ? "Today" : insightData.date}</Text>
                        <MyIcon />
                      </TouchableOpacity>
                      <DateTimePickerModal
                        isVisible={isDatePickerVisible}
                        mode="date"
                        onConfirm={handleConfirmDate}
                        onCancel={hideDatePicker}
                      />
    
                      <View className="bg-white rounded-md flex flex-row py-3 px-2 mt-4 justify-between">
                        <Text className="font-bold flex-1 text-left ml-4 mt-2 text-xl">
                          Odometer (km)
                        </Text>
                        <TextInput className="bg-[#D9D9D9] w-[50%] h-10 rounded-xl border-2 border-black-300 text-Black placeholder:text-gray-400 px-2 py-2"
                                   placeholder={props.carData.odometer.toString()}
                                   value={insightData.odometer === 0 ? '' : String(insightData.odometer)}
                                   onChangeText={(text) => handleInputChange('odometer', text)}  
                        />
                      </View>
                      <View className="bg-white rounded-md flex flex-row py-3 px-2 mt-4 justify-between">
                        <Text className="font-bold flex-1 text-left ml-4 mt-2 text-xl">
                          Next change (km)
                        </Text>
                        <TextInput className="bg-[#D9D9D9] w-[50%] h-10 rounded-xl border-2 border-black-300 text-Black placeholder:text-gray-400 px-2 py-2"
                                     placeholder={(props.carData.odometer + 15000).toString()}
                                     value={insightData.next_change === 0 ? '' : String(insightData.next_change)}
                                     onChangeText={(text) => handleInputChange('next_change', text)}  
                          />
                      </View>
                      <View className="bg-white rounded-md flex flex-row py-3 px-2 mt-4 justify-between">
                        <Text className="font-bold flex-1 text-left ml-4 mt-2 text-xl">
                          Station name
                        </Text>
                        <TextInput className="bg-[#D9D9D9] w-[50%] h-10 rounded-xl border-2 border-black-300 text-Black placeholder:text-gray-400 px-2 py-2"
                                 value={insightData.station_name}
                                 onChangeText={(text) => handleInputChange('station_name', text)} 
                        />
                      </View>
                      <View className="bg-white rounded-md flex flex-row py-3 px-2 mt-4 justify-between">
                        <Text className="font-bold flex-1 text-left ml-4 mt-2 text-xl">
                          Cost €
                        </Text>
                        <TextInput className="bg-[#D9D9D9] w-[50%] h-10 rounded-xl border-2 border-black-300 text-Black placeholder:text-gray-400 px-2 py-2"
                                 value={insightData.price === 0 ? '' : String(insightData.price)}
                                 onChangeText={(text) => handleInputChange('price', text)} 
                        />
                      </View>
                      <View className="bg-white rounded-md flex flex-row py-3 px-2 mt-4 justify-between">
                        <Text className="font-bold flex-1 text-left ml-4 mt-2 text-xl">
                          Note
                        </Text>
                        <TextInput className="bg-[#D9D9D9] w-[50%] h-10 rounded-xl border-2 border-black-300 text-Black placeholder:text-gray-400 px-2 py-2"
                                 value={insightData.note}
                                 onChangeText={(text) => handleInputChange('note', text)} 
                        />
                      </View>
                    </View>
                  );
            case "Highway Toll Pass":
                return (
                    <View className="mb-5">
                      <TouchableOpacity onPress={showDatePicker} className="bg-white rounded-md flex flex-row py-3 px-2 mt-4 justify-between">
                        <Text className="font-bold flex-1 text-left ml-4  text-xl">* Start Date</Text>
                        <Text className="mr-10 text-xl">{insightData.date === '' ? "Today" : insightData.date}</Text>
                        <MyIcon />
                      </TouchableOpacity>
                      <DateTimePickerModal
                        isVisible={isDatePickerVisible}
                        mode="date"
                        onConfirm={handleConfirmDate}
                        onCancel={hideDatePicker}
                      />
    
                      <TouchableOpacity onPress={showEndDatePicker} className="bg-white rounded-md flex flex-row py-3 px-2 mt-4 justify-between">
                        <Text className="font-bold flex-1 text-left ml-4  text-xl">* End Date</Text>
                        <Text className="mr-10 text-xl">{insightData.end_date}</Text>
                        <MyIcon />
                      </TouchableOpacity>
                      <DateTimePickerModal
                        isVisible={isEndDatePickerVisible}
                        mode="date"
                        onConfirm={handleConfirmEndDate}
                        onCancel={hideEndDatePicker}
                      />
    
                      <View className="bg-white rounded-md flex flex-row py-3 px-2 mt-4 justify-between">
                        <Text className="font-bold flex-1 text-left ml-4 mt-2 text-xl">
                          Price €
                        </Text>
                        <TextInput className="bg-[#D9D9D9] w-[50%] h-10 rounded-xl border-2 border-black-300 text-Black placeholder:text-gray-400 px-2 py-2"
                                 value={insightData.price === 0 ? '' : String(insightData.price)}
                                 onChangeText={(text) => handleInputChange('price', text)} 
                        />
                      </View>
                      <View className="bg-white rounded-md flex flex-row py-3 px-2 mt-4 justify-between">
                        <Text className="font-bold flex-1 text-left ml-4 mt-2 text-xl">
                          * Region or country
                        </Text>
                        <TextInput className="bg-[#D9D9D9] w-[50%] h-10 rounded-xl border-2 border-black-300 text-Black placeholder:text-gray-400 px-2 py-2"
                                 value={String(insightData.country)}
                                 onChangeText={(text) => handleInputChange('country', text)} 
                        />
                      </View>
                      <View className="bg-white rounded-md flex flex-row py-3 px-2 mt-4 justify-between">
                        <Text className="font-bold flex-1 text-left ml-4 mt-2 text-xl">
                          Note
                        </Text>
                        <TextInput className="bg-[#D9D9D9] w-[50%] h-10 rounded-xl border-2 border-black-300 text-Black placeholder:text-gray-400 px-2 py-2"
                                 value={insightData.note}
                                 onChangeText={(text) => handleInputChange('note', text)} 
                        />
                      </View>
                    </View>
                  );
            case "Service":
                return (
                    <View className="mb-5">
                        <TouchableOpacity onPress={showDatePicker} className="bg-white rounded-md flex flex-row py-3 px-2 mt-4 justify-between">
                          <Text className="font-bold flex-1 text-left ml-4  text-xl">* Date of change</Text>
                          <Text className="mr-10 text-xl">{insightData.date === '' ? "Today" : insightData.date}</Text>
                          <MyIcon />
                        </TouchableOpacity>
                        <DateTimePickerModal
                          isVisible={isDatePickerVisible}
                          mode="date"
                          onConfirm={handleConfirmDate}
                          onCancel={hideDatePicker}
                        />
    
                        <View className="bg-white rounded-md flex flex-row py-3 px-2 mt-4 justify-between">
                          <Text className="font-bold flex-1 text-left ml-4 mt-2 text-xl">
                            * Service type
                          </Text>
                          <TextInput className="bg-[#D9D9D9] w-[50%] h-10 rounded-xl border-2 border-black-300 text-Black placeholder:text-gray-400 px-2 py-2"
                                 value={String(insightData.service_type)}
                                 onChangeText={(text) => handleInputChange('service_type', text)} 
                          />
                        </View>
                        <View className="bg-white rounded-md flex flex-row py-3 px-2 mt-4 justify-between">
                          <Text className="font-bold flex-1 text-left ml-4 mt-2 text-xl">
                            Description
                          </Text>
                          <TextInput className="bg-[#D9D9D9] w-[50%] h-10 rounded-xl border-2 border-black-300 text-Black placeholder:text-gray-400 px-2 py-2"
                                 value={insightData.description}
                                 onChangeText={(text) => handleInputChange('description', text)} 
                          />
                        </View>
                        <View className="bg-white rounded-md flex flex-row py-3 px-2 mt-4 justify-between">
                          <Text className="font-bold flex-1 text-left ml-4 mt-2 text-xl">
                            Cost €
                          </Text>
                          <TextInput className="bg-[#D9D9D9] w-[50%] h-10 rounded-xl border-2 border-black-300 text-Black placeholder:text-gray-400 px-2 py-2"
                                 value={insightData.price === 0 ? '' : String(insightData.price)}
                                 onChangeText={(text) => handleInputChange('price', text)} 
                          />
                        </View>
                        <View className="bg-white rounded-md flex flex-row py-3 px-2 mt-4 justify-between">
                          <Text className="font-bold flex-1 text-left ml-4 mt-2 text-xl">
                            Odometer (km)
                          </Text>
                          <TextInput className="bg-[#D9D9D9] w-[50%] h-10 rounded-xl border-2 border-black-300 text-Black placeholder:text-gray-400 px-2 py-2"
                                   placeholder={props.carData.odometer.toString()}
                                   value={insightData.odometer === 0 ? '' : String(insightData.odometer)}
                                   onChangeText={(text) => handleInputChange('odometer', text)}  
                          />
                        </View>
                        <View className="bg-white rounded-md flex flex-row py-3 px-2 mt-4 justify-between">
                          <Text className="font-bold flex-1 text-left ml-4 mt-2 text-xl">
                            Station name
                          </Text>
                          <TextInput className="bg-[#D9D9D9] w-[50%] h-10 rounded-xl border-2 border-black-300 text-Black placeholder:text-gray-400 px-2 py-2"
                                 value={insightData.station_name}
                                 onChangeText={(text) => handleInputChange('station_name', text)} 
                          />
                        </View>
                        <View className="bg-white rounded-md flex flex-row py-3 px-2 mt-4 justify-between">
                          <Text className="font-bold flex-1 text-left ml-4 mt-2 text-xl">
                            Note
                          </Text>
                          <TextInput className="bg-[#D9D9D9] w-[50%] h-10 rounded-xl border-2 border-black-300 text-Black placeholder:text-gray-400 px-2 py-2"
                                 value={insightData.note}
                                 onChangeText={(text) => handleInputChange('note', text)} 
                          />
                        </View>
                      </View>
                    );
            default:
              return null;
        }
    }

    return (
      <Modal isOpen={props.modalOpen}>
        <View className="bg-[#400000] w-[99%] p-4 rounded-xl border-4 border-white">
            <View className="flex-row justify-between items-center w-full">
                <Text className="font-bold text-center text-2xl flex-1 text-white mb-5">
                    EDIT INSIGHT
                </Text>
                <Pressable onPress={() => {props.setModalOpen(false)}}>
                <Text className="font-bold text-xl text-right text-white mb-5">
                    X
                </Text>
                </Pressable>
            </View>

            <View className="bg-white rounded-md flex flex-row py-3 px-2 mt-4 justify-between">
                <Text className="font-bold flex-1 text-left ml-4  text-2xl text-center">
                  {insightData.type}
                </Text>        
            </View>
          
            {renderFields()}

        </View>

        <TouchableOpacity className="bg-[#400000] w-[50%] p-4 rounded-xl border-4 border-white items-center mt-2"
                          onPress={async () => {
                            await editInsight(); 
                            props.fetchInsights(); 
                          }} >
          <Text className="text-white text-xl font-bold justify-center">Confirm</Text>
        </TouchableOpacity>
          
      </Modal>

    );
}