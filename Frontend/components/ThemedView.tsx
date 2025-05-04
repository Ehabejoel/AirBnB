import { View } from 'react-native';

export const ThemedView = ({ children }: { children: React.ReactNode }) => {
  return <View className="flex-1 bg-white dark:bg-gray-900">{children}</View>;
};