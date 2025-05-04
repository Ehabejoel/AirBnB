import { ExpoRoot } from 'expo-router';
import './global.css';

export default function App() {
  return <ExpoRoot context={require.context('./app')} />;
}