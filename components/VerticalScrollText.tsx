import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as SpeechRecog from 'expo-av';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, arrayUnion } from 'firebase/firestore';
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
      const similarity = stringSimilarity.compareTwoStrings(speechTranscript, item.text);
      console.log(`Similarity with affirmation "${item.text}": ${(similarity * 100).toFixed(2)}%`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTranscribing(false);
    }
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
});

export default VerticalScrollText;
