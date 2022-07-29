import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import HomeScreen from '../screens/home'
import MenuScreen from '../screens/menu'
import MyOrdersScreen from '../screens/myOrders'
import AccountScreen from '../screens/account'
import LocationSelectorScreen from '../screens/locationSelector'
import RefineLocation from '../screens/refineLocation'
import CartScreen from '../screens/cart'
import PaymentOptionsScreen from '../screens/paymentOptions'
import BottomNavbar from './bottomNavbar'
import LoginScreen from '../screens/login'
import WalletScreen from '../screens/account/subscreen/wallet'
import LoyaltyPointsScreen from '../screens/account/subscreen/loyaltyScreen'
import OffersScreen from '../screens/account/subscreen/offers'
import OrderDetailScreen from '../screens/myOrders/subscreen/orderDetail'
import OrderTrackingScreen from '../screens/myOrders/subscreen/orderTracking'
import ProductSearchScreen from '../screens/productSearch'
import ProductScreen from '../screens/product'
import FulfillmentScreen from '../screens/fulfillment'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import NetInfo from '@react-native-community/netinfo'
import NoNetworkConnection from '../components/noNetworkConnection'

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

const TabNavigator = ({ isConnected }) => {
   return (
      <Tab.Navigator
         screenOptions={{ headerShown: false }}
         tabBar={props => <BottomNavbar {...props} />}
      >
         <Tab.Screen
            name="Home"
            component={isConnected ? HomeScreen : NoNetworkConnection}
         />
         <Tab.Screen
            name="Menu"
            component={isConnected ? MenuScreen : NoNetworkConnection}
         />
         <Tab.Screen
            name="Orders"
            component={isConnected ? MyOrdersScreen : NoNetworkConnection}
         />
         <Tab.Screen
            name="Account"
            component={isConnected ? AccountScreen : NoNetworkConnection}
         />
      </Tab.Navigator>
   )
}

const Navigator = ({ isConnected }) => {
   const navigation = useNavigation()

   AsyncStorage.getItem('preferredOrderTab').then(preferredOrderTab => {
      if (!preferredOrderTab) {
         navigation.reset({
            routes: [{ name: 'Fulfillment' }],
         })
      }
   })

   const TabNavigatorWrapper = () => {
      return <TabNavigator isConnected={isConnected} />
   }

   return (
      <Stack.Navigator
         screenOptions={{ headerShown: false }}
         initialRouteName={'TabMenu'}
      >
         <Stack.Screen name="Fulfillment" component={FulfillmentScreen} />
         <Stack.Screen name="TabMenu" component={TabNavigatorWrapper} />
         <Stack.Screen
            name="LocationSelector"
            component={LocationSelectorScreen}
         />
         <Stack.Screen name="RefineLocation" component={RefineLocation} />
         <Stack.Screen
            name="Cart"
            component={isConnected ? CartScreen : NoNetworkConnection}
         />
         <Stack.Screen name="PaymentOptions" component={PaymentOptionsScreen} />
         <Stack.Screen name="Login" component={LoginScreen} />
         <Stack.Screen name="Wallet" component={WalletScreen} />
         <Stack.Screen name="LoyaltyPoints" component={LoyaltyPointsScreen} />
         <Stack.Screen name="Offers" component={OffersScreen} />
         <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
         <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
         <Stack.Screen name="ProductSearch" component={ProductSearchScreen} />
         <Stack.Screen name="ProductScreen" component={ProductScreen} />
      </Stack.Navigator>
   )
}

export default Navigator
