import { useNavigation } from '@react-navigation/native'
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native'
import { LeftArrow } from '../../assets/arrowIcon'
import appConfig from '../../brandConfig.json'

export const AccountHeader = () => {
   const navigation = useNavigation()
   return (
      <View
         style={[
            styles.cartHeader,
            {
               backgroundColor:
                  appConfig.brandSettings.headerSettings?.backgroundColor
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
                  appConfig.brandSettings.headerSettings?.textColor?.value ||
                  '#000000'
               }
            />
         </TouchableOpacity>
         <Text
            style={[
               {
                  color:
                     appConfig.brandSettings.headerSettings?.textColor?.value ||
                     '#000000',
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
   },
   headerTextStyle: {
      fontSize: 16,
      fontWeight: '500',
   },
})
