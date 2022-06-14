import { StatusBar } from 'expo-status-bar'
import { NavigationContainer } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import 'react-native-gesture-handler'
import Navigation from './navigation'
import { ApolloProvider } from './lib/apollo'
const paddingTop = Platform.OS === 'android' ? StatusBar.currentHeight : 0

export default function App() {
   return (
      <SafeAreaProvider>
         <ApolloProvider>
            <NavigationContainer>
               <Navigation />
            </NavigationContainer>
         </ApolloProvider>
      </SafeAreaProvider>
   )
}
