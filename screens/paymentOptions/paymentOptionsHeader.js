import { useNavigation } from '@react-navigation/native'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { LeftArrow } from '../../assets/arrowIcon'
import { formatCurrency } from '../../utils'
import { useConfig } from '../../lib/config'
import useGlobalStyle from '../../globalStyle'

export const PaymentOptionsHeader = ({ totalToPay = 0 }) => {
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
         <TouchableOpacity
            onPress={() => {
               navigation.goBack()
            }}
            style={{
               padding: 10,
            }}
         >
            <LeftArrow
               size={26}
               fill={
                  appConfig?.brandSettings.headerSettings?.textColor?.value ||
                  '#000000'
               }
            />
         </TouchableOpacity>
         <Text
            style={[
               {
                  color: globalStyle.color.primary || '#000000',
                  fontFamily: globalStyle.font.regular,
               },
               styles.headerTextStyle,
            ]}
         >
            Bill Total: {formatCurrency(totalToPay) || 0}
         </Text>
      </View>
   )
}
const styles = StyleSheet.create({
   cartHeader: {
      height: 64,
      flexDirection: 'row',
      alignItems: 'center',
   },
   headerTextStyle: {
      fontSize: 16,
   },
})
