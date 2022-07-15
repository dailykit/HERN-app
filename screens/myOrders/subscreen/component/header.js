import { useNavigation } from '@react-navigation/native'
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native'
import CloseIcon from '../../../../assets/closeIcon'
import global from '../../../../globalStyles'

export const SubScreenHeader = ({ title }) => {
   const navigation = useNavigation()
   return (
      <View
         style={[
            styles.myOrderHeader,
            {
               backgroundColor: '#ffffff',
            },
         ]}
      >
         <Text
            style={[
               {
                  color: '#000000',
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
   myOrderHeader: {
      height: 64,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
   },
   headerTextStyle: {
      fontFamily: global.semibold,
      fontSize: 18,
   },
})
