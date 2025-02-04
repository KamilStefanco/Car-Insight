import { View, Text, Image, ScrollView,Alert,ActivityIndicator } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { Navbar } from '@/components/Navbar';
import { Svg, Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import LottieView from 'lottie-react-native';


type User = {
    username: string;
    email: string;
}

const DetailCard = (props : any) => {
    return (
        <View
            className='bg-white flex flex-row rounded justify-between px-4 h-10'
        >
            <Text className='text-2xl font-bold my-auto'>{props.Key}</Text>
            <Text className='text-xl text-gray-500 my-auto'>{props.Value}</Text>
        </View>
    )
}

export default function ProfileSection() {
    const { token } = useAuth();

    const [user, setUser] = useState<User>();
    const [totalCars, setTotalCars] = useState(0);
    const [loading, setLoading] = useState(false);

    // Načítanie údajov o používateľovi
    const fetchUser = async () => {
        console.log("Fetching user for profile Section...");
        try {
        setLoading(true);
        const response = await axios.get("https://insightserver-791731285499.europe-central2.run.app:8000/me", {
            headers: {
            Authorization: `Bearer ${token}`, // Token pre autentifikáciu
            },
        });
        setUser(response.data);
        } catch (error) {
        console.error("Error fetching user for profile Section:", error);
        Alert.alert("Error", "Unable to fetch user details. Please try again later.");
        } finally {
        setLoading(false);
        }
    };

    const fetchCountOfCars = async () => {
        try {
            setLoading(true);
            const response = await axios.get("https://insightserver-791731285499.europe-central2.run.app:8000/cars", {
                headers: {
                Authorization: `Bearer ${token}`, // Token pre autentifikáciu
                },
            });
            setTotalCars(response.data.length);
            } catch (error) {
            console.error("Error fetching count of cars:", error);
            Alert.alert("Error", "Unable to fetch count of cars details. Please try again later.");
            } finally {
            setLoading(false);
            } 
    };
    
    useFocusEffect(
        useCallback(() => {
            fetchUser();
            fetchCountOfCars();
        }, [])
      );
    

    // Ak sú údaje ešte nenačítané, zobraz loader
    if (loading || !user) {
        return (
        <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#ffffff" />
            <Text className="text-white mt-4">Loading...</Text>
        </View>
        );
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView>
                <ScrollView className='min-h-screen bg-black'>
                    <Navbar current={0} title={"PROFILE"} />
                    <View className='h-30 -z-10 resize w-20 h-20 mx-auto my-8' />
                    <View className="items-center mb-[30px]">
                        <LottieView
                            source={require('../../assets/images/profileAnimation.json')} // Add your Lottie animation
                            loop={false}
                            autoPlay
                            style={{  width: 100, height: 100 }}
                        />
                    </View>
                        
                    <View className='bg-[#400000] border-4 rounded-xl border-gray-300 flex flex-col gap-4 my-auto px-6 py-6 mx-4'>
                        <DetailCard Key={"Name"} Value={user.username}/>
                        <DetailCard Key={"Email"} Value={user.email}/>
                        <DetailCard Key={"Cars"} Value={totalCars}/>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}