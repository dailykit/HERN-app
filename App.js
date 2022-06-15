// import { StatusBar } from 'expo-status-bar'
import { NavigationContainer } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import 'react-native-gesture-handler'
import { Platform, StatusBar } from 'react-native'
import Navigation from './navigation'
import { ApolloProvider } from './lib/apollo'
import { ConfigProvider } from './lib/config'
const paddingTop = Platform.OS === 'android' ? StatusBar.currentHeight : 0

export default function App() {
   return (
      <SafeAreaProvider style={{ paddingTop: paddingTop }}>
         <ApolloProvider>
            <ConfigProvider>
               <NavigationContainer>
                  <Navigation />
               </NavigationContainer>
            </ConfigProvider>
         </ApolloProvider>
      </SafeAreaProvider>
   )
}
