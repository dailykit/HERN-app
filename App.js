import { StatusBar } from 'expo-status-bar'
import { NavigationContainer } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import 'react-native-gesture-handler'
import Navigation from './navigation'

const paddingTop = Platform.OS === 'android' ? StatusBar.currentHeight : 0

export default function App() {
   return (
      <SafeAreaProvider>
         <NavigationContainer>
            <Navigation />
         </NavigationContainer>
      </SafeAreaProvider>
   )
}
