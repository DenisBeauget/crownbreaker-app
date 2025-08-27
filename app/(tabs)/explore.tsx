import "@/global.css";
import { Text, TouchableOpacity, View, useColorScheme } from "react-native";

export default function Index() {
  const colorScheme = useColorScheme();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const themeStyle = colorScheme === 'light' ? 'light' : 'dark';

  
  return (
<View className="container-main">
  <Text className="text-heading">Mon titre</Text>
  <TouchableOpacity className="btn-primary">
    <Text>Action explore</Text>
  </TouchableOpacity>
  
  <View className="card">
    <Text className="text-body">Contenu de la carte</Text>
  </View>
</View>
  );
}
