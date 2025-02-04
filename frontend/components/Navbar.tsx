import React, { useEffect, useState, useRef } from 'react';
import { Svg, Rect, Circle, Path } from 'react-native-svg';
import { View, Text, Pressable, Image,Alert,Animated } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../app/AuthContext';
import axios from 'axios';
import { useRouter } from 'expo-router';




export const Navbar = (props: any) => {
    const { token } = useAuth();
    const [isExpanded, expand] = useState(false)
    const [user, setUser] = useState(null);
    const slideAnim = useRef(new Animated.Value(-300)).current; // pociatocna pozicia
    const router = useRouter(); // For navigation

    useEffect(() => {
        if (isExpanded) {
            // Slide in animation
            Animated.timing(slideAnim, {
                toValue: 0, // Final position
                duration: 300, // Animation duration in milliseconds
                useNativeDriver: true,
            }).start();
        } else {
            // Slide out animation
            Animated.timing(slideAnim, {
                toValue: -300, // Back to off-screen position
                duration: 300,
                useNativeDriver: true,
            }).start();
        } 
    }, [isExpanded]);
    
    const handleLinkPress = () => {
        // Slide out and then navigate
        Animated.timing(slideAnim, {
            toValue: -300,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            // Navigate after the animation completes
            expand(false);
        });
    };


    // Načítanie údajov o používateľovi
    const fetchUser = async () => {
        console.log("Fetching user for Navbar...");
        try {
        const response = await axios.get("https://insightserver-791731285499.europe-central2.run.app:8000/me", {
            headers: {
            Authorization: `Bearer ${token}`, // Token pre autentifikáciu
            },
        });
        setUser(response.data);
        } catch (error) {
        console.error("Error fetching user:", error);
        Alert.alert("Error", "Unable to fetch user details. Please try again later.");
        } 
    };

    let output = <View></View>

    useEffect(() => {
        fetchUser();
    },[token]);

    if (!isExpanded) {
        output = (
            <View className='absolute  top-0 h-40 px-3 py-2 bg-[#400000] w-full flex flex-row justify-between mb-8'>
                <Pressable
                    onPress={() => { expand(true) }}
                    className='ml-2 '
                >
                    <Svg width="43" height="43" viewBox="0 0 43 46" fill="none">
                        <Rect width="43" height="43" rx="4" fill="white" />
                        <Rect x="8" y="30" width="28" height="3.2" fill="black" />
                        <Rect x="8" y="20" width="28" height="3.2" fill="black" />
                        <Rect x="8" y="10" width="28" height="3.2" fill="black" />
                    </Svg>
                </Pressable>    
                <Text className='ml-4 text-white text-xl font-bold my-auto'>{props.title}</Text>
                
                <Image
                    style={{width: 40, height:40}}
                    className="resize mr-2 h-10 w-10 px-2"
                    source={require("@/assets/images/pfp.png")}
                />

            </View >

        )
    } else {
        output = (
            <Pressable className='min-h-screen z-8'
                onPress={() => { handleLinkPress() }}
            >
                 <Animated.View
                        style={{
                            transform: [{ translateX: slideAnim }],
                            zIndex: 10,
                            height: '100%',
                            backgroundColor: '#400000',
                            width: '50%',
                        }}
                    >
                    <View className='z-10 h-full bg-[#400000] w-[100%]'>
                        <View className='w-full bg-[#290000] h-40 py-4 px-2 border-b-4'>
                            <Image
                                resizeMode='cover'
                                style={{width: 60, height: 60 }}
                                className='flex w-12 h-12 mx-auto'
                                source={require("@/assets/images/pfp.png")}
                            />
                            <Text className='text-white text-center text-2xl font-bold mt-4'>{user.username}</Text>
                        </View>
                        <View className="w-full h-[2px] bg-black " />

                        <View className='flex flex-col  '>
                            <Link
                                onPress={() => { handleLinkPress() }}
                                href={"/profile"}
                                className={' h-14  ' + (props.current == 0 ? ('bg-[#290000] border-white border-2 rounded-xl') : (''))}>
                                <View className='flex flex-row pl-6 gap-6 justify-center items-center'>
                                    <View className='ml-2 mt-2 mb-2'>
                                        <Image
                                            resizeMode='contain'
                                            style={{width: 40, height:40}}
                                            className=' flex mx-auto'
                                            source={require("@/assets/images/pfp.png")}
                                        />
                                    </View>
                                    <Text className='text-2xl text-white font-bold'>Profile</Text>
                                </View>
                            </Link>
                            <View className="w-full h-[2px] bg-black " />

                            <Link
                                onPress={() => { handleLinkPress() }}
                                href={"/Cars"}
                                className={' h-14  ' + (props.current == 1 ? ('bg-[#290000] border-white border-2 rounded-xl') : (''))}>
                                <View className='flex flex-row pl-6 gap-6 justify-center items-center'>
                                    <View className='ml-2 mt-2 mb-2'>
                                        <Svg width="40" height="40" viewBox="0 0 29 24" fill="none">
                                            <Path d="M27.9047 7.34221H25.9037L25.9198 7.30029L25.7046 6.8553C25.0414 5.48489 22.7336 0.946393 20.9028 0.101573L20.6861 0H8.3155L8.09868 0.101573C6.2647 0.946393 3.96024 5.48489 3.29538 6.8553L3.08013 7.30029L3.09786 7.34221H1.09687C0.493035 7.34221 0 7.76944 0 8.29826V9.31238C0 9.83958 0.493035 10.2685 1.09687 10.2685H1.73281C1.66697 10.5909 1.62358 10.923 1.62358 11.2713V15.8243C1.62358 17.1915 2.16639 18.3942 2.99184 19.1375V22.9005C2.99184 23.5099 3.48323 24 4.08706 24H6.5554C7.15923 24 7.6507 23.5099 7.6507 22.9005V19.9194H21.3493V22.9005C21.3493 23.5099 21.8407 24 22.4462 24H24.9113C25.5199 24 26.0081 23.5099 26.0081 22.9005V19.1375C26.8367 18.3942 27.378 17.1915 27.378 15.8243V11.2713C27.378 10.923 27.3346 10.5909 27.2672 10.2685H27.9047C28.5101 10.2685 29 9.83959 29 9.31399V8.29826C29 7.76944 28.5101 7.34221 27.9047 7.34221ZM8.84872 2.20073H20.1496C20.8996 2.76824 22.3161 5.02862 23.4129 7.17453H5.59184C6.68548 5.02862 8.10196 2.76824 8.84872 2.20073Z" fill="#FEFEFE" />
                                        </Svg>

                                    </View>
                                    <Text className='text-2xl text-white font-bold'>Cars</Text>
                                </View>
                            </Link>
                            <View className="w-full h-[2px] bg-black " />

                            <Link
                                onPress={() => { handleLinkPress() }}
                                href={"/calendar"} // link to your Calendar page
                                className={'h-14 ' + (props.current == 2 ? 'bg-[#290000] border-white border-2 rounded-xl' : '')}>
                                <View className='flex flex-row pl-6 gap-6 justify-center items-center'>
                                    <View className='ml-2 mt-2 mb-2'>
                                        <Svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                                            <Path d="M5 0C3.9 0 3 0.9 3 2V22C3 23.1 3.9 24 5 24H19C20.1 24 21 23.1 21 22V2C21 0.9 20.1 0 19 0H5ZM5 2H19V22H5V2ZM7 4H9V6H7V4ZM11 4H13V6H11V4ZM15 4H17V6H15V4ZM7 8H9V10H7V8ZM11 8H13V10H11V8ZM15 8H17V10H15V8ZM7 12H9V14H7V12ZM11 12H13V14H11V12ZM15 12H17V14H15V12ZM7 16H9V18H7V16ZM11 16H13V18H11V16ZM15 16H17V18H15V16Z" fill="#FEFEFE" />
                                        </Svg>
                                    </View>
                                    <Text className='text-2xl text-white font-bold'>Calendar</Text>
                                </View>
                            </Link>
                            <View className="w-full h-[2px] bg-black" />

                            <Link
                                href={"/"}
                                className={'h-14' + (props.current == 3 ? ('bg-[#290000]') : (''))}>
                                <View className='felx flex-row gap-6 pl-6 justify-center items-center'>
                                    <View className='ml-2 mt-2 mb-2'>
                                        <Image
                                            resizeMode='contain'
                                            style={{width: 40, height:40}}
                                            className='flex mx-auto'
                                            source={require("@/assets/images/logout.png")}
                                        />
                                    </View>
                                    <Text className='text-2xl text-white font-bold'>Logout</Text>
                                </View>
                            </Link>
                            <View className="w-full h-[2px] bg-black " />

                        </View>
                    </View>
                </Animated.View>
            </Pressable>
        )
    }

    return (
        output
    )
}