import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import HomeScreen from '../screens/home'
import MenuScreen from '../screens/menu'
import MyOrdersScreen from '../screens/myOrders'
import AccountScreen from '../screens/account'
import LocationSelectorScreen from '../screens/locationSelector'
import RefineLocation from '../screens/refineLocation'
import CartScreen from '../screens/cart'
import BottomNavbar from './bottomNavbar'

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

const TabNavigator = () => (
   <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={props => <BottomNavbar {...props} />}
   >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Menu" component={MenuScreen} />
      <Tab.Screen name="My Orders" component={MyOrdersScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
   </Tab.Navigator>
)

const Navigator = () => {
   return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
         <Stack.Screen name="TabMenu" component={TabNavigator} />
         <Stack.Screen
            name="LocationSelector"
            component={LocationSelectorScreen}
         />
         <Stack.Screen name="RefineLocation" component={RefineLocation} />
         <Stack.Screen name="Cart" component={CartScreen} />
      </Stack.Navigator>
   )
}

export default Navigator
