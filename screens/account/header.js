import { useNavigation } from '@react-navigation/native'
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native'
import { useConfig } from '../../lib/config'
import useGlobalStyle from '../../globalStyle'

export const AccountHeader = () => {
   const { appConfig } = useConfig()
   const { globalStyle } = useGlobalStyle()
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
                  fontFamily: globalStyle.font.regular,
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
      fontSize: 16,
   },
})
