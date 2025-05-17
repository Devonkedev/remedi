import { View } from 'react-native';
import React, { useState } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { Button, TextInput } from 'react-native-paper';
import { DatePickerInput, TimePickerModal } from 'react-native-paper-dates';
import { Dropdown } from 'react-native-paper-dropdown';
import CustomHeader from '../../components/CustomHeader';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { addReminder } from '../../config/firebase';
import * as Notifications from 'expo-notifications';
import { scheduleLocalNotification } from '../../utils/notification';


const OPTIONS = [
    { label: 'Medicine', value: 'medicine' },
    { label: 'Doctor Appointment', value: 'doctor' },
    { label: 'Vaccination', value: 'vaccination' },
    { label: 'Other', value: 'other' },
];

const AddReminderScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<string>();
    const [inputDate, setInputDate] = useState<Date | undefined>();
    const [time, setTime] = useState<string>(''); // hh:mm format
    const [detail, setDetail] = useState('');
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        if (!name || !type || !inputDate || !time) {
            alert("Please fill all required fields");
            return;
        }

        const reminderData = {
            name,
            type,
            date: inputDate.toISOString().split('T')[0],
            time,
            detail,
          };

        try {
            await addReminder(reminderData);
            await scheduleLocalNotification(reminderData); // schedule local notif

            alert("Reminder saved!");
            setLoading(false);
            navigation.navigate("ReminderScreen");
        } catch (error) {
            console.error("Error saving reminder:", error);
            setLoading(false);
            alert("Failed to save reminder");
        }
        setLoading(false);
    };

    const onDismiss = () => setVisible(false);

    const onConfirm = ({ hours, minutes }) => {
        setVisible(false);
        const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        setTime(formatted);
    };

    return (
        <ScrollView contentContainerStyle={{
            gap: wp(5),
            paddingHorizontal: wp(5),
        }}>
            <CustomHeader
                label="Add Reminder"
                subheading="Here you can add your reminders"
                image_url="https://static.vecteezy.com/system/resources/previews/029/722/371/non_2x/reminder-icon-in-trendy-flat-style-isolated-on-white-background-reminder-silhouette-symbol-for-your-website-design-logo-app-ui-illustration-eps10-free-vector.jpg"
            />

            <TextInput
                label="Enter the reminder name here"
                value={name}
                onChangeText={setName}
            />

            <Dropdown
                label="Select the reminder type here"
                placeholder="Select the reminder type here"
                options={OPTIONS}
                value={type}
                onSelect={setType}
            />

            <DatePickerInput
                locale="en"
                label="Reminder date"
                value={inputDate}
                onChange={setInputDate}
                inputMode="start"
            />

            <Button onPress={() => setVisible(true)} mode="outlined">
                {time ? `Time: ${time}` : 'Pick time'}
            </Button>

            <TimePickerModal
                visible={visible}
                onDismiss={onDismiss}
                onConfirm={onConfirm}
                hours={12}
                minutes={0}
            />

            <TextInput
                multiline
                numberOfLines={5}
                label="Reminder Detail"
                value={detail}
                onChangeText={setDetail}
                style={{ height: 100 }}
            />

            <Button icon="alarm-bell" mode="contained" loading={loading} onPress={handleSave}>
                Save Reminder
            </Button>
        </ScrollView>
    );
};

export default AddReminderScreen;
