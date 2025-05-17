import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export const scheduleLocalNotification = async (reminderData) => {
  const { name, detail, date, time } = reminderData;

  const [hours, minutes] = time.split(':').map(Number);

  const dateTime = new Date();
  dateTime.setHours(hours);
  dateTime.setMinutes(minutes);
  dateTime.setSeconds(0);

  console.log(reminderData);
  // console.log(time.minutes);
  

  // const dateTime = new Date();
  // dateTime.setMinutes(dateTime.getMinutes() + 1);

  // dateTime.setHours(14); // 2 PM
  // dateTime.setMinutes(45); // 30 minutes
  // dateTime.setSeconds(0); // 0 seconds

  // const dateTime = new Date(Date.now() + 3000); // 10 seconds from now


  // Use the 'date' trigger type for scheduling with a specific time
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Reminder: ${name}`,
      body: detail || 'You have a reminder!',
      sound: true,
      data: { reminderData },
    },
    trigger: {
      // Date trigger
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      // seconds: 3,
      date: dateTime,  // Correct trigger type for a specific date/time
    },
  });
};

export const registerForPushNotificationsAsync = async () => {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('myNotificationChannel', {
      name: 'Reminder Notifications',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    try {
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log(token);
    } catch (e) {
      token = `${e}`;
    }
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});
