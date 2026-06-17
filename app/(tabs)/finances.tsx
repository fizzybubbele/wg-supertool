import { Text, View } from 'react-native';

export default function FinancesScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="mb-2 text-2xl font-bold text-gray-900">Finanzen & Einkäufe</Text>
      <Text className="text-center text-base text-gray-500">
        Ausgaben, Kassenzettel und Einkaufsliste kommen hier hin.
      </Text>
    </View>
  );
}
