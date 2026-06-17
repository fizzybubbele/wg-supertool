import { Text, View } from 'react-native';

export default function PantryScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="mb-2 text-2xl font-bold text-gray-900">Vorrat</Text>
      <Text className="text-center text-base text-gray-500">
        Vorratshaltung und Einkaufsvorschläge – kommt bald.
      </Text>
    </View>
  );
}
