import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, TextInput } from 'react-native';
import { useRouter } from 'expo-router';

const EmoScreen = () => {
  const router = useRouter();

  const emotions = [
    'Joy', 'Gratitude', 'Serenity', 'Interest', 'Hope',
    'Pride', 'Eagerness', 'Euphoria', 'Contentment', 'Enjoyment',
    'Anger', 'Fear', 'Sadness', 'Guilt', 'Shame',
    'Jealousy', 'Anxiety', 'Frustration', 'Loneliness', 'Resentment'
  ];

  const [selectedEmotions, setSelectedEmotions] = useState<{ emotion: string, text?: string }[]>([]);
  const [inputTexts, setInputTexts] = useState<{ [key: string]: string }>({});
  const scrollViewRef = useRef<ScrollView | null>(null);

  const negativeEmotions = ['Anger', 'Fear', 'Sadness', 'Guilt', 'Shame', 'Jealousy', 'Anxiety', 'Frustration', 'Loneliness', 'Resentment'];

  const toggleEmotion = (emotion: string) => {
    if (selectedEmotions.find(e => e.emotion === emotion)) {
      setSelectedEmotions(selectedEmotions.filter(e => e.emotion !== emotion));
      const updatedInputTexts = { ...inputTexts };
      delete updatedInputTexts[emotion];
      setInputTexts(updatedInputTexts);
    } else {
      setSelectedEmotions([...selectedEmotions, { emotion }]);
      if (negativeEmotions.includes(emotion)) {
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 300);
      }
    }
  };

  const handleInputChange = (text: string, emotion: string) => {
    setInputTexts({
      ...inputTexts,
      [emotion]: text,
    });
    setSelectedEmotions(selectedEmotions.map(e =>
      e.emotion === emotion ? { ...e, text } : e
    ));
  };

  const handleSubmit = async () => {
    console.log('Selected Emotions:', selectedEmotions);

    try {
      const { GoogleGenerativeAI } = require("@google/generative-ai");

      const apiKey = 'AIzaSyCbh-ey-MPn-wk3ey3yb15Zf-qqWCbca6w';

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const keywords = selectedEmotions.map(emotion => `"${emotion.emotion}${emotion.text ? ` (${emotion.text})` : ''}"`).join(', ');

      const prompt = `Based on these keywords ${keywords}, generate 8 morning affirmations, return only array of objects the object should have "id" and "text" i want to have affirmations inside "text" field, dont format it for anything for json i just want the raw txt`;
      console.log(prompt);
      const result = await model.generateContent(prompt);
      const text = await result.response.text();

      console.log('API Response:', text);

      const affirmation = JSON.parse(JSON.stringify(text));
      console.log(typeof(affirmation));

      router.push({ pathname: '/affirmReel', params: { affirmations: affirmation } });

    } catch (error) {
      console.error('Error generating content:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Emotions</Text>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollViewContent}
      >
        {emotions.map((emotion, index) => (
          <Animated.View
            key={index}
            style={[
              styles.emotionContainer,
              index % 3 === 0 ? styles.large : styles.small, // Varying size
              index % 2 === 0 ? styles.offset : null,
            ]}
          >
            <TouchableOpacity
              style={[
                styles.emotionButton,
                selectedEmotions.find(e => e.emotion === emotion) && styles.selectedButton
              ]}
              onPress={() => toggleEmotion(emotion)}
            >
              <Text style={styles.buttonText}>{emotion}</Text>
            </TouchableOpacity>
            {negativeEmotions.includes(emotion) && selectedEmotions.find(e => e.emotion === emotion) && (
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Talk about it (optional)..."
                  value={inputTexts[emotion] || ''}
                  onChangeText={(text) => handleInputChange(text, emotion)}
                  autoFocus
                />
              </View>
            )}
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
    paddingBottom: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emotionContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  large: {
    width: '48%',
    height: 100,
  },
  small: {
    width: '48%',
    height: 70,
  },
  offset: {
    marginTop: 30,
  },
  emotionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#87CEEB',
    backgroundColor: '#e0f7fa',
    alignItems: 'center',
    justifyContent: 'center',
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
  textInputContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  textInput: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#87CEEB',
    borderRadius: 10,
    backgroundColor: '#fff',
    color: '#333',
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
