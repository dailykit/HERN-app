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
import { useFonts } from 'expo-font'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'

const paddingTop = Platform.OS === 'android' ? StatusBar.currentHeight : 0

export default function App() {
   const [fontLoaded] = useFonts({
      Metropolis: require('./assets/fonts/Metropolis-Regular.otf'),
      MetropolisBold: require('./assets/fonts/Metropolis-Bold.otf'),
      MetropolisMedium: require('./assets/fonts/Metropolis-Medium.otf'),
      MetropolisSemiBold: require('./assets/fonts/Metropolis-SemiBold.otf'),
      MetropolisRegularItalic: require('./assets/fonts/Metropolis-RegularItalic.otf'),
      MetropolisMediumItalic: require('./assets/fonts/Metropolis-MediumItalic.otf'),
   })

   if (!fontLoaded) {
      return null
   }

   return (
      <SafeAreaProvider>
         <GestureHandlerRootView style={{ flex: 1 }}>
            <NavigationContainer>
               <ApolloProvider>
                  <ConfigProvider>
                     <UserProvider>
                        <OnDemandMenuProvider>
                           <CartProvider>
                              <PaymentProvider>
                                 <BottomSheetModalProvider>
                                    <Navigation />
                                 </BottomSheetModalProvider>
                              </PaymentProvider>
                           </CartProvider>
                        </OnDemandMenuProvider>
                     </UserProvider>
                  </ConfigProvider>
               </ApolloProvider>
            </NavigationContainer>
         </GestureHandlerRootView>
      </SafeAreaProvider>
   )
}
