import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';
import { useRouter } from 'expo-router';

const EmoScreen = () => {
  const router = useRouter();

  const emotions = [
    'Joy', 'Gratitude', 'Serenity', 'Interest', 'Hope',
    'Pride', 'Eagerness', 'Euphoria', 'Contentment', 'Enjoyment',
    'Anger', 'Fear', 'Sadness', 'Guilt', 'Shame',
    'Jealousy', 'Anxiety', 'Frustration', 'Loneliness', 'Resentment'
  ];

  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [scaleValue] = useState(new Animated.Value(1));

  const toggleEmotion = (emotion: string) => {
    if (selectedEmotions.includes(emotion)) {
      setSelectedEmotions(selectedEmotions.filter(e => e !== emotion));
    } else {
      setSelectedEmotions([...selectedEmotions, emotion]);
      Animated.spring(scaleValue, {
        toValue: 1.1,
        friction: 2,
        useNativeDriver: true,
      }).start(() => {
        Animated.spring(scaleValue, {
          toValue: 1,
          friction: 2,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const handleSubmit = async () => {
    console.log('Selected Emotions:', selectedEmotions);
  
    try {
      const { GoogleGenerativeAI } = require("@google/generative-ai");
  
      const apiKey = 'AIzaSyCbh-ey-MPn-wk3ey3yb15Zf-qqWCbca6w';
      
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
      const keywords = selectedEmotions.map(emotion => `"${emotion}"`).join(', ');
  
      const prompt = `Based on these keywords ${keywords}, generate 8 morning affirmations, return only array of objects the object should have "id" and "text" i want to have affirmations inside "text" field, dont format it for anything for json i just want the raw txt`;
  
      const result = await model.generateContent(prompt);
      const text = await result.response.text();
  
      console.log('API Response:', text);

      // Attempt to parse the text as JSON
      const affirmation = JSON.parse(JSON.stringify(text));
      console.log(typeof(affirmation));
  
      // Use the correct path "/affirmReel" and pass the affirmations as a string
      router.push({ pathname: '/affirmReel', params: { affirmations: affirmation } });
  
    } catch (error) {
      console.error('Error generating content:', error);
    }
  };
  
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Emotions</Text>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {emotions.map((emotion, index) => (
          <Animated.View key={index} style={{ transform: [{ scale: scaleValue }] }}>
            <TouchableOpacity
              style={[
                styles.emotionButton,
                selectedEmotions.includes(emotion) && styles.selectedButton
              ]}
              onPress={() => toggleEmotion(emotion)}
            >
              <Text style={styles.buttonText}>{emotion}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
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
  scrollViewContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  emotionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    margin: 8,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#87CEEB',
    backgroundColor: '#e0f7fa',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  selectedButton: {
    backgroundColor: '#87CEEB',
    borderColor: '#0077b6',
  },
  buttonText: {
    fontSize: 16,
    color: '#0077b6',
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: '#0077b6',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EmoScreen;
