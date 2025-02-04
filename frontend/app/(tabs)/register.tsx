import { Link } from "expo-router";
import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { Svg, Path } from "react-native-svg";
import axios from "axios";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from "../AuthContext";

export default function RegisterScreen() {
  const [password,setPassword]=useState("");
  const [confirmPassword,setConfirmPassword]=useState("");
  const [email,setEmail]=useState("");
  const [username,setUsername]=useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [warning, setWarning] = useState("");
  const router = useRouter();
  const { saveToken } = useAuth();

  const sendRegister = ()=>{
    console.log("Register function");
    setWarning("");
        
    if(password === ""|| confirmPassword === "" || email === "" || username === ""){
      console.log("All fields are required!");
      setWarning("All fields are required!");
      return;
    }
    
    if(password !== confirmPassword){
      console.log("Passwords don't match!");
      setWarning("Passwords don't match!");
      return;
    }

    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
      setWarning("Invalid email format");
      return;
    }

    axios.post(`https://insightserver-791731285499.europe-central2.run.app:8000/register?username=${username}&email=${email}&password=${password}`)  // https://insightserver-791731285499.europe-central2.run.app:8000 je pre android emulator
    .then((response) => {
      console.log("Register successful:", response.data); 

      const token = response.data.token;
      saveToken(token);
      
      router.push("/Cars");
    })
    .catch((error) => {
      if (error.response?.status === 401) {
        setWarning("Username or E-mail is already registered.");
      } else {
        setWarning("An unexpected error occurred. Please try again later.");
      }
      console.log("Register failed:", error.response?.data || error.message); 
    });

  }

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };



  return (
    <View className=" min-h-screen flex flex-col items-center justify-center bg-black gap-6">
      <Svg width="172" height="110" viewBox="0 0 172 110" fill="none">
        <Path
          d="M159.46 38.6931V39.1931H159.96H171.5V106.164H80.8748V90.8536V90.3536H80.3748H36.0693H35.5269L35.571 90.8942C35.5881 91.1045 35.6033 91.3021 35.6033 91.4958V102.945C35.6033 106.555 32.6176 109.5 28.9199 109.5H20.0045C16.3068 109.5 13.3212 106.555 13.3212 102.945V91.4958C13.3212 90.476 13.5648 89.5163 13.9841 88.6539L14.1912 88.2279L13.777 87.9981C7.13583 84.314 2.54633 76.6903 2.54633 67.8462C2.54633 60.5172 5.69428 54.0291 10.5541 49.9241L11.5983 49.0421H10.2315H5.21342C2.6026 49.0421 0.5 46.9643 0.5 44.422C0.5 41.8786 2.60367 39.7934 5.21342 39.7934H16.328C16.3975 39.7934 16.4469 39.8011 16.5205 39.8126C16.571 39.8204 16.6329 39.8301 16.7206 39.8402L17.1502 39.8899L17.2613 39.4719C19.2675 31.919 25.1318 19.9491 42.4556 16.2858H95.9131H96.2081L96.3507 16.0276C101.441 6.8168 111.681 0.5 123.509 0.5H128.866C145.788 0.5 159.46 13.405 159.46 29.2617V38.6931ZM92.4149 39.1931H92.9149V38.6931V29.2617C92.9149 26.5595 93.315 23.9477 94.057 21.475L94.2502 20.8313H93.5781H46.4197H46.3702L46.3218 20.8409C36.3921 22.8235 30.6707 27.7551 27.388 32.7381C24.1154 37.7057 23.2857 42.6933 23.0733 44.7885L23.0175 45.3389H23.5707H80.3748H80.8748V44.8389V39.1931H92.4149ZM106.443 25.0516L105.932 24.7325L105.713 25.2936C104.578 28.1951 103.955 31.3757 103.955 34.7237V39.085V39.585H104.455H116.894H117.592L117.368 38.9243C115.889 34.5692 112.816 29.0312 106.443 25.0516ZM139.004 96.9241H139.684L139.482 96.2753L132.882 75.1017C137.199 72.7741 140.141 68.2722 140.141 63.0763C140.141 55.4867 133.889 49.359 126.183 49.359C118.495 49.359 112.234 55.4867 112.234 63.0763C112.234 68.2723 115.176 72.7744 119.502 75.1019L112.893 96.2751L112.691 96.9241H113.37H139.004ZM147.92 39.585H148.42V39.085V34.7237C148.42 21.4291 138.513 10.5826 126.183 10.5826C119.365 10.5826 113.273 13.9189 109.206 19.1567L108.844 19.6227L109.363 19.9032C118.907 25.0615 122.819 33.3671 124.419 39.2169L124.519 39.585H124.901H147.92Z"
          fill="#400000"
          stroke="white"
        />
      </Svg>
      <Text className="text-4xl text-white font-bold font-mono">
        CarInsight
      </Text>

      <View className="bg-[#400000] w-[95%] mx-auto border-4 border-gray-300 flex flex-col items-center py-2 rounded-xl mt-5">
        <Text className="text-2xl text-white font-bold font-inria">
          Register
        </Text>
        <View className="flex flex-col w-[90%] gap-1 py-1">
          <Text className="text-white text-xl">Username</Text>
          <TextInput
            className="bg-[#290000] w-full h-10 rounded-xl border-2 border-black-300 text-white placeholder:text-gray-400 px-2 py-2"
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
          />
          <Text className="text-white text-xl">E-mail</Text>
          <TextInput
            className="bg-[#290000] w-full h-10 rounded-xl border-2 border-black-300 text-white placeholder:text-gray-400 px-2 py-2"
            placeholder="E-mail"
            value={email}
            onChangeText={setEmail}
          />
          <Text className="text-white text-xl">Password</Text>
          <View className="relative w-full">
            <TextInput
              className="bg-[#290000] w-full h-10 rounded-xl border-2 border-black-300 text-white placeholder:text-gray-400 px-2 py-2"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <MaterialCommunityIcons
              name={showPassword ? 'eye-off' : 'eye'}
              size={24}
              color="#aaa"
              onPress={toggleShowPassword}
              className="absolute right-3 top-2"
            />
          </View>
          <Text className="text-white text-xl">Confirm Password</Text>
          <View className="relative w-full mb-2">
            <TextInput
              className="bg-[#290000] w-full h-10 rounded-xl border-2 border-black-300 text-white placeholder:text-gray-400 px-2 py-2"
              placeholder="Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
            />
            <MaterialCommunityIcons
              name={showPassword ? 'eye-off' : 'eye'}
              size={24}
              color="#aaa"
              onPress={toggleShowPassword}
              className="absolute right-3 top-2"
            />
          </View>

          {warning && (
            <Text className="text-center text-white my-2 text-lg underline decoration-red-400 underline-offset-4">
              {warning}
            </Text>
          )}


          <View className="w-full h-4 relative">
            <Text className="absolute right-0 text-white">
              Already have account?{" "}
              <Link href={"/"} className="underline">
                Login
              </Link>
            </Text>
          </View>
        </View>
      </View>
      <Pressable className="bg-[#400000] w-40 border-rounded py-2 border-2 border-gray-300 rounded-lg"
      onPress={sendRegister}
        >
        <Text className="text-white text-center text-3xl">Register</Text>
      </Pressable>
    </View>
  );
}
