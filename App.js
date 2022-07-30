// import { StatusBar } from 'expo-status-bar'
import { NavigationContainer, useNavigation } from '@react-navigation/native'
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
import { useNetInfo } from '@react-native-community/netinfo'
import { useEffect, useState } from 'react'
import { isEmpty } from 'lodash'
import AsyncStorage from '@react-native-async-storage/async-storage'

const paddingTop = Platform.OS === 'android' ? StatusBar.currentHeight : 0

export default function App() {
   const { isConnected } = useNetInfo()
   const [navigationInitialState, setNavigationInitialState] = useState({})

   const [fontLoaded] = useFonts({
      Metropolis: require('./assets/fonts/Metropolis-Regular.otf'),
      MetropolisBold: require('./assets/fonts/Metropolis-Bold.otf'),
      MetropolisMedium: require('./assets/fonts/Metropolis-Medium.otf'),
      MetropolisSemiBold: require('./assets/fonts/Metropolis-SemiBold.otf'),
      MetropolisRegularItalic: require('./assets/fonts/Metropolis-RegularItalic.otf'),
      MetropolisMediumItalic: require('./assets/fonts/Metropolis-MediumItalic.otf'),
   })

   useEffect(() => {
      AsyncStorage.getItem('preferredOrderTab').then(preferredOrderTab => {
         if (!preferredOrderTab) {
            setNavigationInitialState(prev => ({
               routes: [{ name: 'Fulfillment' }],
            }))
         } else {
            setNavigationInitialState(prev => ({
               routes: [{ name: 'TabMenu' }],
            }))
         }
      })
   }, [])

   if (!fontLoaded || isEmpty(navigationInitialState)) {
      return null
   }

   return (
      <SafeAreaProvider>
         <GestureHandlerRootView style={{ flex: 1 }}>
            <NavigationContainer initialState={navigationInitialState}>
               <ApolloProvider>
                  <ConfigProvider>
                     <UserProvider>
                        <OnDemandMenuProvider>
                           <CartProvider>
                              <PaymentProvider>
                                 <BottomSheetModalProvider>
                                    <Navigation isConnected={isConnected} />
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
