// import { StatusBar } from 'expo-status-bar'
import { NavigationContainer } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import 'react-native-gesture-handler'
import { Platform, StatusBar } from 'react-native'
import Navigation from './navigation'
import { ApolloProvider } from './lib/apollo'
import { ConfigProvider } from './lib/config'
import { OnDemandMenuProvider } from './context'
import { CartProvider } from './context/cart'
import { UserProvider } from './context/user'
import { PaymentProvider } from './lib/payment'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
const paddingTop = Platform.OS === 'android' ? StatusBar.currentHeight : 0

export default function App() {
   return (
      <SafeAreaProvider style={{ paddingTop: paddingTop }}>
         <GestureHandlerRootView style={{ flex: 1 }}>
            <ApolloProvider>
               <ConfigProvider>
                  <UserProvider>
                     <OnDemandMenuProvider>
                        <CartProvider>
                           <PaymentProvider>
                              <NavigationContainer>
                                 <Navigation />
                              </NavigationContainer>
                           </PaymentProvider>
                        </CartProvider>
                     </OnDemandMenuProvider>
                  </UserProvider>
               </ConfigProvider>
            </ApolloProvider>
         </GestureHandlerRootView>
      </SafeAreaProvider>
   )
}
