import { View, Text, TouchableOpacity } from 'react-native'
import { StyleSheet } from 'react-native'
import HomeIcon from '../assets/homeIcon'
import MenuIcon from '../assets/menuIcon'
import MyOrdersIcon from '../assets/myOrdersIcon'
import AccountIcon from '../assets/accountIcon'
import useGlobalStyle from '../globalStyle'

const ICONS = (routeName, props = {}) => {
   switch (routeName) {
      case 'Home':
         return <HomeIcon {...props} />
      case 'Menu':
         return <MenuIcon {...props} />
      case 'My Orders':
         return <MyOrdersIcon {...props} />
      case 'Account':
         return <AccountIcon {...props} />
   }
}

function BottomNavbar({ state, descriptors, navigation }) {
   const { globalStyle } = useGlobalStyle()
   return (
      <View style={styles.container}>
         {state.routes.map((route, index) => {
            const { options } = descriptors[route.key]
            const label =
               options.tabBarLabel !== undefined
                  ? options.tabBarLabel
                  : options.title !== undefined
                  ? options.title
                  : route.name

            const isFocused = state.index === index

            const onPress = () => {
               const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
               })

               if (!isFocused && !event.defaultPrevented) {
                  // The `merge: true` option makes sure that the params inside the tab screen are preserved
                  navigation.navigate({ name: route.name, merge: true })
               }
            }

            const onLongPress = () => {
               navigation.emit({
                  type: 'tabLongPress',
                  target: route.key,
               })
            }

            return (
               <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  testID={options.tabBarTestID}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  style={{ flex: 1 }}
                  key={route.name}
               >
                  <View style={styles.tab}>
                     <View style={styles.icon}>
                        {ICONS(route.name, {
                           fill: isFocused
                              ? globalStyle.color.primary
                              : '#ffffff',
                        })}
                     </View>
                     <Text
                        style={[
                           styles.tabText,
                           {
                              color: isFocused
                                 ? globalStyle.color.primary
                                 : '#fff',
                              fontFamily: globalStyle.font.regular,
                           },
                        ]}
                     >
                        {label}
                     </Text>
                  </View>
               </TouchableOpacity>
            )
         })}
      </View>
   )
}

export default BottomNavbar

const styles = StyleSheet.create({
   container: {
      flexDirection: 'row',
      height: 64,
      alignItems: 'center',
      backgroundColor: '#000',
   },
   tab: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
   },
   tabText: {
      textAlign: 'center',

      fontSize: 10,
      lineHeight: 10,
      color: '#fff',
   },
   icon: {},
})
