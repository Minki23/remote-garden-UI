import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "./app/login";
import Dashboard from "./app/dashboard";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const Stack = createStackNavigator();
function App() {
  return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Dashboard" component={Dashboard} />
        </Stack.Navigator>
      </NavigationContainer>
  );
}
export default App;
