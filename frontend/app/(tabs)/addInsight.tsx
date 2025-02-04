import { View, Text, Pressable, TextInput, TouchableOpacity, FlatList } from "react-native";
import { useState } from "react";
import { Modal } from "@/components/Modal";
import { MyIcon } from "@/components/MyIcon";
import axios from "axios";
import React from "react";
import { useAuth } from "../AuthContext";
import DateTimePickerModal from 'react-native-modal-datetime-picker';


const InsightTypeDropdown = ({changeInsightType} : {changeInsightType:(type: string) => void}) => {
    const [dropdownOpen, setDropdownOpen] = useState(false); // Stav pre otvorené/zatvorené menu
    const [selectedType, setSelectedType] = useState(null); // Vybraný typ
  
    const types = [
      { id: '1', label: 'Technical Inspection' },
      { id: '2', label: 'Emissions Test' },
      { id: '3', label: 'Car Insurance' },
      { id: '4', label: 'Oil Change' },
      { id: '5', label: 'Highway Toll Pass' },
      { id: '6', label: 'Service' }
    ];
  
    const toggleDropdown = () => {
      setDropdownOpen(!dropdownOpen);
    };
  
    const handleSelect = (type : any) => {
      setSelectedType(type);
      setDropdownOpen(false);
      changeInsightType(type.label);
    };
  
    return (
      <View className="bg-white rounded-md py-3 px-2 mt-4 justify-between mb-10">
        {/* Dropdown header */}
        <TouchableOpacity 
          onPress={toggleDropdown} 
          className="flex flex-row justify-between items-center"
        >
          <Text className="font-bold flex-1 text-left ml-4 text-xl">
            {selectedType ? selectedType.label : 'Select type'}
          </Text>
          <MyIcon />
        </TouchableOpacity>
  
        {/* Dropdown menu */}
        {dropdownOpen && (
          <FlatList
            data={types}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelect(item)}
                className="py-2 px-4 border-b border-gray-300"
              >
                <Text className="text-lg">{item.label}</Text>
              </TouchableOpacity>
            )}
            className="mt-4 bg-gray-200 rounded-md"
          />
        )}
      </View>
    );
  };

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
  
  export default function AddInsight(props: any){

    const [insightType, setInsightType] = useState("");
    const { token } = useAuth();

    const initialInsightData = {
      carId: props.carId,
      type: insightType,
      date: '',
      odometer: 0,
      expiry_date: '',
      station_name: '',
      note: '',
      price: 0,
      next_change: 0,
      start_date: '',
      end_date: '',
      country: '',
      service_type: '',
      description: ''
    };

    const [insightData, setInsightData] = useState<InsightData>(initialInsightData);
    const [isDatePickerVisible, setPickerVisibility] = useState(false);
    const [isEndDatePickerVisible, setEndPickerVisibility] = useState(false);
    const [warning, setWarning] = useState("");


    const changeInsightType = (type : string) => {
      setInsightType(type);
      console.log("changed type to: " + type);
      setWarning("");
    }

    const handleInputChange = (field: keyof InsightData, value: string) => {
      setInsightData(prevData => ({
        ...prevData,
        [field]: value,
      }));
    };


    const replaceEmptyWithNull = (value: any) => (value === "" ? null : value);


    const formatDateForDB = (dateString: string): string => {
      const [day, month, year] = dateString.split("."); 
  
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`; 
    };

    const submitInsight = async () => {
      setWarning("");

      //ak nezadal dátum, nastavíme dnešný
      if(insightData.date === ''){
        const today = new Date();
        const day = String(today.getDate()).padStart(2, "0"); 
        const month = String(today.getMonth() + 1).padStart(2, "0"); 
        const year = today.getFullYear(); 

        insightData.date = `${day}.${month}.${year}`;
      }

      //prepočet nasledujúcej výmeny oleja
      if(insightData.next_change === 0 && insightType === "Oil Change"){
        insightData.next_change= props.carData.odometer + 15000;
      }

      if(insightData.start_date === '' && (insightType === "Highway Toll Pass" || insightType === "Car Insurance")){
        const today = new Date();
        const day = String(today.getDate()).padStart(2, "0"); 
        const month = String(today.getMonth() + 1).padStart(2, "0"); 
        const year = today.getFullYear(); 

        insightData.start_date = `${day}.${month}.${year}`;
      }

      //prepočet nasledujúcej výmeny oleja
      if (insightData.expiry_date === '' && insightType === "Oil Change") {
        const today = new Date();
        
        const oilChangeIntervalMonths = 12;
      
        const nextOilChangeDate = new Date(
          today.getFullYear(),
          today.getMonth() + oilChangeIntervalMonths,
          today.getDate()
        );
      
        // Formátovanie dátumu do formátu "YYYY-MM-DD"
        insightData.expiry_date = `${String(nextOilChangeDate.getDate()).padStart(2, '0')}.${String(nextOilChangeDate.getMonth() + 1).padStart(2, '0')}.${nextOilChangeDate.getFullYear()}`;
      }

      //prepocet rokov do nasledujucej STK a EK
      if (insightData.expiry_date === '' && (insightType === "Technical Inspection"||insightType === "Emissions Test")) {
        const [day, month, year] = insightData.date.split('.').map(Number);   
        const InspectionIntervalYears = 2;
        const startDate = new Date(year, month - 1, day); // Month is zero-indexed
        // Add 2 years      
        const nextInspectionDate = new Date(
          startDate.getFullYear()+InspectionIntervalYears,
          startDate.getMonth(),
          startDate.getDate()
        );
        // Format the expiry date back to "day.month.year"
        insightData.expiry_date = `${String(nextInspectionDate.getDate()).padStart(2, '0')}.${String(nextInspectionDate.getMonth() + 1).padStart(2, '0')}.${nextInspectionDate.getFullYear()}`;
      }

      //prepocet rokov do nasledujucej carInsurance
      if (insightData.end_date === '' && (insightType === "Car Insurance"||insightType === "Highway Toll Pass")) {
        console.log("Please fill fields with '*'.");
        setWarning("Please fill fields with '*'.");
        return;     
      }
      if(insightData.country===''&&insightType === "Highway Toll Pass"){
        console.log("Please fill fields with '*'.");
        setWarning("Please fill fields with '*'.");
        return; 
      }
      if(insightData.service_type===''&&insightType === "Service"){
        console.log("Please fill fields with '*'.");
        setWarning("Please fill fields with '*'.");
        return; 
      }


      const data ={
        car_id: props.carId,
        type: insightType,
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
        const response = await axios.post("https://insightserver-791731285499.europe-central2.run.app:8000/insights", data, 
          {
            headers: {
              Authorization: `Bearer ${token}`, 
              "Content-Type": "application/json", 
            },
          }
        );

        console.log('Insight added');

      } catch (error) {
        console.error('Error adding insight:', error);
      }

      props.setModalOpen(false); 
      setInsightData(initialInsightData);
      setInsightType("");
    };

    const formatDateToShow = (date: Date): string => {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0"); 
      const year = date.getFullYear();
      
      return `${day}.${month}.${year}`;
    };
    

    const showDatePicker = () => setPickerVisibility(true);
    const hideDatePicker = () => setPickerVisibility(false);

    const showEndDatePicker = () => setEndPickerVisibility(true);
    const hideEndDatePicker = () => setEndPickerVisibility(false);

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

    const renderFields = () =>{
      switch (insightType) {
        case "Technical Inspection":
        case "Emissions Test":
          return (
            <View className="mb-5">
              <TouchableOpacity onPress={showDatePicker} className="bg-white rounded-md flex flex-row py-3 px-2 mt-4 justify-between">
                <Text className="font-bold flex-1 text-left ml-4  text-xl">* Date</Text>
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
                           value={String(insightData.station_name)}
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
                             value={String(insightData.station_name)}
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
                             value={String(insightData.description)}
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
                             value={String(insightData.station_name)}
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
              NEW INSIGHT
            </Text>
            <Pressable onPress={() => {props.setModalOpen(false); setInsightData(initialInsightData); setInsightType("")}}>
              <Text className="font-bold text-xl text-right text-white mb-5">
                X
              </Text>
            </Pressable>
          </View>
          
          <InsightTypeDropdown changeInsightType={changeInsightType} /> 

          {renderFields()}
          {warning && (
            <Text className="text-center text-white my-2 text-lg underline decoration-red-400 underline-offset-4">
              {warning}
            </Text>
          )}

        </View>

        <TouchableOpacity className="bg-[#400000] w-[50%] p-4 rounded-xl border-4 border-white items-center mt-2"
                          onPress={async () => {
                            await submitInsight(); 
                            props.fetchInsights(); 
                          }} >
          <Text className="text-white text-xl font-bold justify-center">Add Insight</Text>
        </TouchableOpacity>
          
      </Modal>

    );
  };