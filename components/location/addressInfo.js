import { StyleSheet, View, Text } from 'react-native'
import LocationIcon from '../../assets/locationIcon'

export const AddressInfo = props => {
   const { address } = props
   return (
      <View style={styles.addressContainer}>
         <LocationIcon fill={'#A2A2A2'} />
         <View style={{ flexShrink: 1 }}>
            <Text style={styles.addressText}>
               {address.mainText || address.line1}
            </Text>
            <Text style={styles.addressText}>
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
      fontWeight: '500',
      fontSize: 13,
   },
})
