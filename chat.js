import React, { useState, useCallback, useEffect } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import io from 'socket.io-client';

const ENDPOINT = 'https://countia.mahabot.in'; // Replace with your actual backend URL

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const newSocket = io(ENDPOINT);
    setSocket(newSocket);

    newSocket.on('chat message', (data) => {
      if (data.sender !== phoneNumber) {
        setMessages((previousMessages) =>
          GiftedChat.append(previousMessages, [{
            _id: data.created_at,
            text: data.content,
            createdAt: new Date(data.created_at),
            user: {
              _id: data.sender,
              name: data.sender,
            },
          }])
        );
      }
    });

    return () => newSocket.close();
  }, [phoneNumber]);

  const onJoinChat = useCallback(() => {
    if (phoneNumber.trim()) {
      socket.emit('join chat', phoneNumber);
      setIsLoggedIn(true);
    } else {
      alert('Please enter a valid phone number');
    }
  }, [socket, phoneNumber]);

  const onSend = useCallback((newMessages = []) => {
    const { text } = newMessages[0];

    if (recipientPhone.trim()) {
      socket.emit('chat message', {
        recipientPhone: recipientPhone,
        message: text
      });

      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, newMessages)
      );
    } else {
      alert('Please enter a recipient phone number');
    }
  }, [socket, recipientPhone]);

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loginContainer}>
          <Text style={styles.title}>Welcome to Chat</Text>
          <TextInput
            placeholder="Enter your phone number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            style={styles.input}
            keyboardType="phone-pad"
          />
          <TouchableOpacity style={styles.button} onPress={onJoinChat}>
            <Text style={styles.buttonText}>Join Chat</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerLabel}>Your number:</Text>
        <Text style={styles.headerPhoneNumber}>{phoneNumber}</Text>
      </View>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <GiftedChat
          messages={messages}
          onSend={(messages) => onSend(messages)}
          user={{
            _id: phoneNumber,
          }}
          renderAvatar={null}
        />
        <View style={styles.recipientContainer}>
          <TextInput
            placeholder="Recipient's phone number"
            value={recipientPhone}
            onChangeText={setRecipientPhone}
            style={styles.recipientInput}
            keyboardType="phone-pad"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerLabel: {
    color: '#666',
    fontSize: 14,
    marginRight: 4,
  },
  headerPhoneNumber: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  recipientContainer: {
    padding: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  recipientInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
});