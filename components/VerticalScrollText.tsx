import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as SpeechRecog from 'expo-av';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { transcribeSpeech } from '@/functions/transcribeSpeech';
import { recordSpeech } from '@/functions/recordSpeech';
import useWebFocus from '@/hooks/useWebFocus';
import stringSimilarity from 'string-similarity';

interface Affirmation {
  id: string;
  text: string;
}

interface VerticalScrollTextProps {
  affirmations: Affirmation[];
}

const { height, width } = Dimensions.get('window');

// Firebase configuration
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

const VerticalScrollText: React.FC<VerticalScrollTextProps> = ({ affirmations }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const isWebFocused = useWebFocus();
  const audioRecordingRef = useRef(new SpeechRecog.Audio.Recording());
  const webAudioPermissionsRef = useRef<MediaStream | null>(null);

  const handleLikePress = async (item: Affirmation) => {
    const likedAffirmation = {
      text: item.text,
      likedAt: new Date().toISOString(),
    };

    const docRef = doc(db, 'affirmation', 'liked');

    try {
      await updateDoc(docRef, {
        likedAffirmations: arrayUnion(likedAffirmation),
      });
      console.log(`Liked: ${item.text}`);
    } catch (error) {
      console.error("Error liking affirmation: ", error);
    }
  };

  const handleSavePress = async (item: Affirmation) => {
    const savedAffirmation = {
      text: item.text,
      savedAt: new Date().toISOString(),
    };

    const docRef = doc(db, 'affirmation', 'saved');

    try {
      await updateDoc(docRef, {
        savedAffirmations: arrayUnion(savedAffirmation),
      });
      console.log(`Saved: ${item.text}`);
    } catch (error) {
      console.error("Error saving affirmation: ", error);
    }
  };

  const handleSpeakPress = (item: Affirmation) => {
    Speech.speak(item.text, {
      language: 'en',
      pitch: 1.0,
      rate: 1.0,
    });
  };

  const handleRecordPress = async (item: Affirmation) => {
    setIsRecording(true);
    await recordSpeech(
      audioRecordingRef,
      setIsRecording,
      !!webAudioPermissionsRef.current
    );
  };

  const handleStopPress = async (item: Affirmation) => {
    setIsRecording(false);
    setIsTranscribing(true);
    
    try {
      const speechTranscript = await transcribeSpeech(audioRecordingRef);
      
      const processedTranscript = speechTranscript
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '');
      const processedAffirmation = item.text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '');
      
      const similarity = stringSimilarity.compareTwoStrings(processedTranscript, processedAffirmation);
      console.log(`Similarity with affirmation "${item.text}": ${(similarity * 100).toFixed(2)}%`);
      
      if (similarity > 0.8) {
        const updateStreak = updateDoc(doc(db, 'userData', 'data'), {
          streak: increment(1),
        });
        
        setModalVisible(true);
        
        await updateStreak;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTranscribing(false);
    }
  };
  

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const renderItem = ({ item }: { item: Affirmation }) => (
    <View style={styles.reelContainer}>
      <Text style={styles.reelText}>{item.text}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.likeButton} onPress={() => handleLikePress(item)}>
          <FontAwesome name="heart" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={() => handleSavePress(item)}>
          <FontAwesome name="bookmark" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.speakButton} onPress={() => handleSpeakPress(item)}>
          <FontAwesome name="volume-up" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.recordButton}
          onPressIn={() => handleRecordPress(item)}
          onPressOut={() => handleStopPress(item)}
          disabled={isRecording || isTranscribing}
        >
          {isRecording ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <FontAwesome name="microphone" size={24} color="white" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={affirmations}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        style={styles.flatList}
        contentContainerStyle={styles.flatListContent}
        snapToAlignment="center"
        decelerationRate="fast"
      />

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="none"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Affirmation done | +1 streak</Text>
            <TouchableOpacity onPress={handleCloseModal} style={styles.okButton}>
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  flatList: {
    flex: 1,
  },
  flatListContent: {
    justifyContent: 'center',
  },
  reelContainer: {
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  reelText: {
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 10,
  },
  likeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 50,
  },
  saveButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 50,
  },
  speakButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 50,
  },
  recordButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 50,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  okButton: {
    backgroundColor: '#0077b6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  okButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VerticalScrollText;
