import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Image, Text } from "react-native";

type Car = {
    carId: string;
    make: string;
    model: string;
    year: string;
    has_image: boolean;
}

export const PerviewCard = ({ car }: { car: Car }) => {

    const imageSource = car.has_image 
        ? { uri: `https://insightserver-791731285499.europe-central2.run.app:8000/static/uploads/car_images/${car.carId}.jpeg` } 
        : require("@/assets/images/skoda-octavia.png"); // Placeholder obrázok, ak auto nemá obrázok

    return (
        <SafeAreaView style={{ flex: 1, alignItems: 'center', marginVertical: 10 }}>
            <View
                style={{
                    backgroundColor: '#400000',
                    borderColor: 'gray',
                    borderWidth: 4,
                    borderRadius: 15,
                    paddingHorizontal: 20, // Padding na oboch stranách
                    paddingVertical: 20,   // Padding hore a dole
                    alignItems: 'center',  // Zarovnanie na stred
                }}
            >
                {/* Obrázok */}
                <Image
                    resizeMode="cover"
                    style={{
                        width: 220,
                        height: 100,
                        marginBottom: 20, // Priestor medzi obrázkom a textom
                        borderRadius: 10
                    }}
                    source={imageSource}
                />

                {/* Text */}
                <Text
                    style={{
                        textAlign: 'center',
                        backgroundColor: 'black',
                        color: 'white',
                        fontSize: 18,
                        fontWeight: 'bold',
                        padding: 15,
                        paddingVertical: 8,
                        borderRadius: 10,
                        flexWrap: 'wrap', // Zalamovanie textu
                        maxWidth: 250,    // Maximálna šírka textu
                    }}
                >
                    {car.make} {car.model} {car.year}
                </Text>
            </View>
        </SafeAreaView>
    )
}
