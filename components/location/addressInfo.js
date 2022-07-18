import { StyleSheet, View, Text } from 'react-native'
import LocationIcon from '../../assets/locationIcon'
import useGlobalCss from '../../globalStyle'
export const AddressInfo = props => {
   const { globalCss } = useGlobalCss()
   const { address } = props
   return (
      <View style={styles.addressContainer}>
         <LocationIcon fill={globalCss.color.grey} />
         <View style={{ flexShrink: 1 }}>
            <Text
               style={[
                  styles.addressText,
                  { fontFamily: globalCss.font.regular },
               ]}
            >
               {address.mainText || address.line1}
            </Text>
            <Text
               style={[
                  styles.addressText,
                  { fontFamily: globalCss.font.regular },
               ]}
            >
               {address.secondaryText ||
                  `${address?.city || ''} ${address?.state || ''} ${
                     address?.country || ''
                  }`}{' '}
               {address.zipcode}
            </Text>
         </View>
      </View>
   )
}

const styles = StyleSheet.create({
   addressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 8,
   },
   addressText: {
      color: 'rgba(0, 0, 0, 0.6)',
      fontSize: 13,
   },
})
