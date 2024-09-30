import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Chat from './chat'; // or whatever your main component is called

export default function App() {
  return (
    <SafeAreaProvider>
      <Chat />
    </SafeAreaProvider>
  );
}