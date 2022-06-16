import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
const Stack = createStackNavigator()
import HomeScreen from '../screens/home'
import MenuScreen from '../screens/menu'
import LocationSelectorScreen from '../screens/locationSelector'

const Navigation = () => {
   return (
      <Stack.Navigator
         screenOptions={{
            headerShown: false,
         }}
      >
         <Stack.Screen
            options={{ headerShown: false }}
            name="Home"
            component={HomeScreen}
         />
         <Stack.Screen name="Menu" component={MenuScreen} />
         <Stack.Screen
            name="LocationSelector"
            component={LocationSelectorScreen}
         />
      </Stack.Navigator>
   )
}
export default Navigation
