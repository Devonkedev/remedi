import React, { useState } from 'react';
import { ScrollView, StyleSheet, Alert, Image } from 'react-native';
import { Appbar, Button, TextInput } from 'react-native-paper';
import { Dropdown } from 'react-native-paper-dropdown';
import * as ImagePicker from 'expo-image-picker';
import { addPrescription } from '../../config/firebase'; // Firestore function

const OPTIONS = [
  { label: 'Medicine', value: 'medicine' },
  { label: 'X-ray', value: 'x-ray' },
  { label: 'MRI', value: 'mri' },
  { label: 'Lab Report', value: 'lab' },
  { label: 'Other', value: 'other' },
];

const AddPrescriptionScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [doctor, setDoctor] = useState('');
  const [detail, setDetail] = useState('');
  const [type, setType] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);

  const takePicture = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission denied', 'Camera access is required.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      setImageBase64(`data:image/jpeg;base64,${asset.base64}`);
    }
  };

  const handleSave = async () => {
    if (!name || !doctor || !detail || !type || !imageBase64) {
      Alert.alert('Missing Info', 'Please fill all fields and capture an image.');
      return;
    }

    setLoading(true);

    try {
      const prescription = {
        name,
        doctor,
        detail,
        type,
        imageBase64, // storing directly in Firestore
        createdAt: new Date(),
      };

      await addPrescription(prescription);

      Alert.alert('Success', 'Prescription saved!');
      navigation.navigate('PrescriptionScreen');
    } catch (error) {
      console.error('Error saving prescription:', error);
      Alert.alert('Error', 'Something went wrong while saving.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Add Prescription" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        <TextInput
          label="Prescription Name"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Doctor Name"
          value={doctor}
          onChangeText={setDoctor}
          mode="outlined"
          style={styles.input}
        />

        <Dropdown
          label="Select the prescription type here"
          placeholder="Select the prescription type here"
          options={OPTIONS}
          value={type}
          onSelect={setType}
        />

        <TextInput
          label="Prescription Detail"
          value={detail}
          onChangeText={setDetail}
          mode="outlined"
          multiline
          numberOfLines={5}
          style={[styles.input, { height: 120 }]}
        />

        <Button icon="camera" mode="outlined" onPress={takePicture}>
          Click Prescription Image
        </Button>

        {imageUri && (
          <Image
            source={{ uri: imageUri }}
            style={{ width: '100%', height: 200, marginVertical: 16, borderRadius: 8 }}
            resizeMode="cover"
          />
        )}

        <Button mode="contained" loading={loading} onPress={handleSave} style={styles.button}>
          Save Prescription
        </Button>
      </ScrollView>
    </>
  );
};

export default AddPrescriptionScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 12,
  },
});
