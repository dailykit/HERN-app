import { Text, View, StyleSheet, TouchableOpacity } from 'react-native'
import CartIcon from '../assets/cartIcon'
import LocationIcon from '../assets/locationIcon'
import appConfig from '../brandConfig.json'
import { useNavigation } from '@react-navigation/native'

export const Header = () => {
   const navigation = useNavigation()
   return (
      <View
         style={[
            styles.headerContainer,
            {
               backgroundColor:
                  appConfig.brandSettings.headerSettings?.backgroundColor
                     ?.value || '#ffffff',
            },
         ]}
      >
         <TouchableOpacity
            style={styles.headerRight}
            onPress={() => {
               navigation.navigate('LocationSelector')
            }}
         >
            <LocationIcon />
            <Text
               style={[
                  styles.headerTextStyle,
                  {
                     color:
                        appConfig.brandSettings.headerSettings?.textColor
                           ?.value || '#000000',
                  },
               ]}
            >
               Select Your location
            </Text>
         </TouchableOpacity>
         <TouchableOpacity>
            <Text
               style={[
                  styles.cartItemCount,
                  {
                     backgroundColor:
                        appConfig.brandSettings.headerSettings
                           ?.cartItemCountBackgroundColor?.value,
                     color: appConfig.brandSettings.headerSettings
                        ?.cartItemCountTextColor?.value,
                  },
               ]}
            >
               1
            </Text>
            <CartIcon
               size={30}
               fill={
                  appConfig.brandSettings.headerSettings?.cartIconColor?.value
               }
            />
         </TouchableOpacity>
      </View>
   )
}

const styles = StyleSheet.create({
   headerContainer: {
      height: 64,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 10,
   },
   headerRight: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
   },
   headerTextStyle: {
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 12,
      marginHorizontal: 4,
   },
   cartItemCount: {
      position: 'absolute',
      color: '#ffffff',
      top: -5,
      paddingHorizontal: 6,
      borderRadius: 10,
      fontSize: 12,
      right: -4,
      zIndex: 1000,
   },
})
