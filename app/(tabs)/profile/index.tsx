import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBENrBbfWvzNRNhhVRfybLZPFroiQFhP40",
  authDomain: "affirmo-589c1.firebaseapp.com",
  projectId: "affirmo-589c1",
  storageBucket: "affirmo-589c1.appspot.com",
  messagingSenderId: "323790851651",
  appId: "1:323790851651:web:0835fec5c863ed0e9d4ef6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ProfilePage = () => {
  const [affirmations, setAffirmations] = useState([]);
  const [viewing, setViewing] = useState(''); // '' for none, 'liked' or 'saved'

  const fetchAffirmations = async (type) => {
    const docRef = doc(db, 'affirmation', type);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      setAffirmations(data[`${type}Affirmations`] || []);
    } else {
      console.log(`No ${type} affirmations found!`);
      setAffirmations([]);
    }
  };

  const handleViewAffirmations = (type) => {
    setViewing(type);
    fetchAffirmations(type);
  };

  const renderAffirmationItem = ({ item }) => (
    <View style={styles.affirmationItem}>
      <Text style={styles.affirmationText}>{item.text}</Text>
      <Text style={styles.dateText}>Date: {item.likedAt || item.savedAt}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Page</Text>

      {!viewing && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleViewAffirmations('liked')}
          >
            <Text style={styles.buttonText}>View Liked Affirmations</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => handleViewAffirmations('saved')}
          >
            <Text style={styles.buttonText}>View Saved Affirmations</Text>
          </TouchableOpacity>
        </View>
      )}

      {viewing && (
        <FlatList
          data={affirmations}
          renderItem={renderAffirmationItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {viewing && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setViewing('')}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#0077b6',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 20,
  },
  affirmationItem: {
    backgroundColor: '#e0f7fa',
    padding: 20,
    marginVertical: 10,
    borderRadius: 10,
  },
  affirmationText: {
    fontSize: 18,
    color: '#0077b6',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 14,
    color: '#555',
  },
  backButton: {
    backgroundColor: '#0077b6',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginVertical: 10,
    width: '80%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProfilePage;
