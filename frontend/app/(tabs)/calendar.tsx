import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Agenda } from 'react-native-calendars';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import { Navbar } from '@/components/Navbar';
import { useRouter } from 'expo-router';

const BasicAgenda = () => {
  const [items, setItems] = useState({});
  const [markedDates, setMarkedDates] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reloadKey, setReloadKey] = useState(0);
  const { token } = useAuth();
  const router = useRouter();

  const carTypeColors = {
    "Technical Inspection": "#15d300",
    "Highway Toll Pass": "#007fd3",
    "Car Insurance": "#d35400",
    "Emissions Test": "#bd00d3",
  };

  const monthNames = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];

  const fetchCalendarData = async () => {
    setItems({});
    setMarkedDates({});
    try {
      const response = await axios.get('https://insightserver-791731285499.europe-central2.run.app:8000/calendar', { 
        headers: { Authorization: `Bearer ${token}` },
      });

      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      const startRange = new Date(currentYear, currentMonth, 1);
      const endRange = new Date(currentYear, currentMonth + 2, 0);

      const formattedEvents = {};
      const marks = {};

      for (let date = new Date(startRange); date <= endRange; date.setDate(date.getDate() + 1)) {
        const dateString = date.toISOString().split('T')[0];
        formattedEvents[dateString] = [];
      }

      response.data.forEach((car) => {
        car.insights?.forEach((insight) => {
          const eventDate = insight.expiry_date || insight.end_date;
          if (eventDate) {
            const eventDateString = new Date(eventDate).toISOString().split('T')[0];

            if (new Date(eventDate) >= startRange && new Date(eventDate) <= endRange) {
              formattedEvents[eventDateString].push({
                name: `${car.make} ${car.model}: ${insight.type}`,
                details: `Note: ${insight.note || 'No details available'}`,
                height: 100,
                backgroundColor: carTypeColors[insight.type] || "#4e0303",
                carId: car.carId,
              });
              marks[eventDateString] = { marked: true, dotColor: carTypeColors[insight.type] || "#4e0303" };
            }
          }
        });
      });

      setItems(formattedEvents);
      setMarkedDates(marks);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      Alert.alert('Error', 'Unable to fetch calendar data. Please try again later.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      setReloadKey((prevKey) => prevKey + 1);
    }, [])
  );

  const MemoizedItem = React.memo(({ reservation }) => (
    <TouchableOpacity
      style={[styles.item, { height: reservation.height, backgroundColor: reservation.backgroundColor }]}
      onPress={() => router.push(`/(tabs)/details/${reservation.carId}`)}
    >
      <Text style={styles.itemText}>{reservation.name}</Text>
      <Text style={styles.itemText}>{reservation.details}</Text>
    </TouchableOpacity>
  ), (prevProps, nextProps) => prevProps.reservation.name === nextProps.reservation.name);

  const renderItem = useCallback((reservation) => <MemoizedItem reservation={reservation} />, []);

  const renderEmptyDate = useCallback(() => (
    <View style={styles.emptyDate}>
      <Text style={styles.emptyText}>No events on this day!</Text>
    </View>
  ), []);

  const renderEmptyData = useCallback(() => <View style={styles.emptyData}></View>, []);

  const rowHasChanged = useCallback((r1, r2) => r1.name !== r2.name, []);

  return (
    <SafeAreaProvider key={reloadKey}>
      <SafeAreaView style={styles.container}>
        <Navbar current={2} title={"CALENDAR"} />
        <View style={styles.calendarContainer}>
          <View style={styles.selectedMonthContainer}>
            <Text style={styles.selectedMonthText}>
                {monthNames[selectedMonth]}
            </Text>
          </View>
          <Agenda
            items={items}
            loadItemsForMonth={fetchCalendarData}
            onDayPress={(day) => setSelectedMonth(new Date(day.dateString).getMonth())}
            onDayChange={(day) => setSelectedMonth(new Date(day.dateString).getMonth())} 
            markedDates={markedDates}
            renderItem={renderItem}
            renderEmptyDate={renderEmptyDate}
            renderEmptyData={renderEmptyData}
            rowHasChanged={rowHasChanged}
            selected={selectedDate}
            pastScrollRange={1}
            futureScrollRange={2}
            showClosingKnob={true}
            initialNumToRender={5}
            maxToRenderPerBatch={5}
            windowSize={10}
            removeClippedSubviews={true}
            theme={{
                backgroundColor: '#000000',
                calendarBackground: '#290000',
                dayTextColor: '#e0e0e0',
                todayTextColor: 'white',
                todayBackgroundColor: '#004040',
                selectedDayBackgroundColor: '#947c7c',
                selectedDayTextColor: '#e0e0e0',
                monthTextColor: 'white',
                arrowColor: '#e0e0e0',
                dotColor: 'green',
                indicatorColor: '#ff4500',
                agendaDayTextColor: 'white',
                agendaDayNumColor: 'white',
                agendaTodayColor: 'teal',
                textDisabledColor: '#555555',  // Použi tlmenú farbu pre dni mimo aktuálneho mesiaca

                agendaKnobColor: '#412d2d',
                reservationsBackgroundColor: "#000000",
                buttonColor: '#2f3b5d',
                warningTextColor: '#b22222',
                borderColor: '#444444',
                softAccentColor: '#f5c500',
                softBackgroundColor: '#947c7c',
              }}
              style={{ backgroundColor: '#000000', 
                  reservationsBackgroundColor: "#000000",
              }}
            />
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  };
  
  
  const styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: '#000000',
      },
      calendarContainer: {
        flex: 1,
        marginTop: 56,
      },
      item: {
        flex: 1,
        borderRadius: 5,
        padding: 10,
        marginRight: 10,
        marginTop: 17,
        borderColor: '#fff',
        borderWidth: 4,
      },
      itemText: {
        fontSize: 16,
        color: 'black',  // Set text color to black
        //fontWeight: 'bold',  // Make text bold
      },
      emptyDate: {
          backgroundColor: 'rgba(64, 0, 0, 0.5)', // 50% transparent
          flex: 1,
          borderRadius: 5,
          padding: 10,
          marginRight: 10,
          marginTop: 17,
          borderWidth: 3,
          borderColor: '#2d0000',
        },
      emptyText: {
        fontSize: 16,
        color: '#d9cccc',
      },
      monthContainer: {
        backgroundColor: '#000000',
        paddingVertical: 5,
        paddingHorizontal: 10,
        alignItems: 'center',
      },
      monthText: {
        fontSize: 24,
        color: '#4e0303',
        fontWeight: 'bold',
      },
      selectedMonthContainer: {
        backgroundColor: 'black',
        paddingVertical: 5,
        paddingHorizontal: 5,
        alignItems: 'center',
        marginBottom: 3,
        borderWidth: 2,
        borderColor: '#fff',
      },
      selectedMonthText: {
        fontSize: 15,
        color: '#fff',
        fontWeight: 'bold',
      },
    });
export default BasicAgenda;