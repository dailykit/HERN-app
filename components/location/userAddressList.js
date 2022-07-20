import React from 'react'
import {
   View,
   Text,
   ScrollView,
   TouchableWithoutFeedback,
   StyleSheet,
} from 'react-native'
import { useUser } from '../../context'
import useGlobalStyle from '../../globalStyle'

export const UserAddressList = ({ onAddressSelect }) => {
   const { user } = useUser()
   const { globalStyle } = useGlobalStyle()
   const [selectedAddressId, setSelectedAddressId] = React.useState(null)

   const addresses = user?.platform_customer?.addresses || []
   const onAddressClick = address => {
      onAddressSelect({
         ...address,
         latitude: address.lat,
         longitude: address.lng,
      })
      setSelectedAddressId(address?.id)
   }
   if (!user?.keycloakId) {
      return null
   }
   return (
      <View style={styles.addressList}>
         {addresses.map(address => {
            return (
               <TouchableWithoutFeedback
                  key={address?.id}
                  onPress={() => {
                     onAddressClick(address)
                  }}
               >
                  <View
                     style={[
                        styles.address,
                        address?.id === selectedAddressId && {
                           borderColor: globalStyle?.color?.primary,
                        },
                     ]}
                  >
                     <Text style={[styles.commonText, styles.label]}>
                        {address?.label}
                     </Text>
                     <Text style={[styles.commonText]}>{address?.line1}</Text>
                     {address?.line2 ? (
                        <Text style={[styles.commonText]}>
                           {address?.line2}
                        </Text>
                     ) : null}
                     <View>
                        <Text style={[styles.commonText]}>
                           {address?.state}, {address?.country},{' '}
                           {address?.zipcode}
                        </Text>
                     </View>
                  </View>
               </TouchableWithoutFeedback>
            )
         })}
      </View>
   )
}

const styles = StyleSheet.create({
   addressList: {
      marginVertical: 8,
   },
   address: {
      borderWidth: 1,
      borderColor: '#959595',
      borderRadius: 8,
      padding: 10,
      width: '100%',
      marginBottom: 10,
   },
   label: {
      fontSize: 15,
      fontFamily: 'MetropolisBold',
      marginBottom: 3,
   },
   commonText: {
      fontSize: 12.5,
      fontFamily: 'MetropolisMedium',
   },
})
