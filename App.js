import { SafeAreaProvider } from 'react-native-safe-area-context';
import Chat from './chat'; 

export default function App() {
  return (
    <SafeAreaProvider>
      <Chat />
    </SafeAreaProvider>
  );
}