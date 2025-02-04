import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, FlatList } from "react-native";
import { MyIcon } from "./MyIcon";
//import { Button } from "@material-tailwind/react";

function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);

  // Define list as an array of objects
  const list = [
    { type: "Oil", emoticon: "🔧" },
    { type: "Brakes", emoticon: "🛢️" },
    { type: "STK", emoticon: "🚗" },
    { type: "EK", emoticon: "🚗" },
    { type: "Oil", emoticon: "🔧" },
    { type: "Brakes", emoticon: "🛢️" },
    { type: "STK", emoticon: "🚗" },
    { type: "EK", emoticon: "🚗" },
    { type: "Oil", emoticon: "🔧" },
    { type: "Brakes", emoticon: "🛢️" },
    { type: "STK", emoticon: "🚗" },
    { type: "EK", emoticon: "🚗" },
    { type: "Oil", emoticon: "🔧" },
    { type: "Brakes", emoticon: "🛢️" },
    { type: "STK", emoticon: "🚗" },
    { type: "EK", emoticon: "🚗" },
  ];

  return (
    <View className="relative bg-white rounded-md flex flex-row py-3 px-2 mt-4 justify-between">
      <Text className="font-bold flex-1 text-left ml-4 text-xl">
        Choose Icon
      </Text>

      <Pressable onPress={() => setIsOpen((prev) => !prev)}>
        <MyIcon />
      </Pressable>

      {isOpen && (
        <View className="absolute right-0 bg-transparent rounded-lg mt-10 p-2 z-10">
          <FlatList
            data={list}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View className="bg-white border-2 border-black rounded-xl items-center py-2 px-2 inline-flex mb-1">
                <Text className="text-3xl">{item.emoticon}</Text>
              </View>
            )}
            style={{ maxHeight: 200 }}
            scrollEnabled
          />
        </View>
      )}
    </View>
  );
}

export default Dropdown;
