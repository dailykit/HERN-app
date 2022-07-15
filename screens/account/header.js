import { useNavigation } from '@react-navigation/native'
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native'
import { useConfig } from '../../lib/config'
import global from '../../globalStyles'

export const AccountHeader = () => {
   const { appConfig } = useConfig()
   const navigation = useNavigation()
   return (
      <View
         style={[
            styles.cartHeader,
            {
               backgroundColor:
                  appConfig?.brandSettings.headerSettings?.backgroundColor
                     ?.value || '#ffffff',
            },
         ]}
      >
         <Text
            style={[
               {
                  color:
                     appConfig?.brandSettings.headerSettings?.textColor
                        ?.value || '#000000',
               },
               styles.headerTextStyle,
            ]}
         >
            Account
         </Text>
      </View>
   )
}
const styles = StyleSheet.create({
   cartHeader: {
      height: 64,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
   },
   headerTextStyle: {
      fontFamily: global.regular,
      fontSize: 16,
   },
})
