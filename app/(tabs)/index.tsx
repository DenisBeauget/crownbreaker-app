import "@/global.css";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
export default function Index() {

  
  return (
<View className="container-main">
  <Text className="text-heading">Mon titre</Text>
  <TouchableOpacity className="btn-primary">
    <Text>Action principale</Text>
  </TouchableOpacity>
  
  <View className="card">
    <Text className="text-body">Contenu de la carte</Text>
  </View>
</View>
  );
}
