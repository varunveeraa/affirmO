import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import VerticalScrollText from '@/components/VerticalScrollText'; // Adjust the import path as needed

// Initialize Firebase
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

export default function App() {
  const [affirmations, setAffirmations] = useState([]);

  useEffect(() => {
    const fetchAffirmations = async () => {
      const docRef = doc(db, 'affirmation', 'dump');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        // Assuming the affirmations are stored as an array of strings
        const formattedAffirmations = data.affirmations.map((text: String, index: Number) => ({
          id: index.toString(),
          text,
        }));
        setAffirmations(formattedAffirmations);
      } else {
        console.log('No such document!');
      }
    };

    fetchAffirmations();
  }, []);

  return (
    <View style={styles.container}>
      <VerticalScrollText affirmations={affirmations} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'grey', // Grey background for the overall effect
  },
});
