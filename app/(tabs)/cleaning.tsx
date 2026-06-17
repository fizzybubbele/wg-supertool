import { Text, View } from 'react-native';

export default function CleaningScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="mb-2 text-2xl font-bold text-gray-900">Putzplan</Text>
      <Text className="text-center text-base text-gray-500">
        Rotierender Putzplan für die WG – kommt bald.
      </Text>
    </View>
  );
}
