import { useNavigation } from '@react-navigation/native'
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native'
import CloseIcon from '../../../assets/closeIcon'
import useGlobalCss from '../../../globalStyle'

export const SubScreenHeader = ({ title }) => {
   const { globalCss } = useGlobalCss()
   const navigation = useNavigation()
   return (
      <View
         style={[
            styles.cartHeader,
            {
               backgroundColor: '#ffffff',
            },
         ]}
      >
         <Text
            style={[
               {
                  color: '#000000',
                  fontFamily: globalCss.font.medium,
               },
               styles.headerTextStyle,
            ]}
         >
            {title}
         </Text>
         <TouchableOpacity
            onPress={() => {
               navigation.goBack()
            }}
            style={{
               padding: 10,
            }}
         >
            <CloseIcon size={26} />
         </TouchableOpacity>
      </View>
   )
}
const styles = StyleSheet.create({
   cartHeader: {
      height: 64,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
   },
   headerTextStyle: {
      fontSize: 18,
   },
})
