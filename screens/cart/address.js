import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { EditIcon } from '../../assets/editIcon'
import LocationIcon from '../../assets/locationIcon'
import { useCart } from '../../context'
import { useConfig } from '../../lib/config'
import { DownVector } from '../../assets/vector'
import { useNavigation } from '@react-navigation/native'
import global from '../../globalStyles'

export const Address = () => {
   const { orderTabs, selectedOrderTab, appConfig } = useConfig()
   const navigation = useNavigation()
   const { cartState: { cart } = {} } = useCart()
   const [numberOfLines, setNumberOfLines] = React.useState(1)
   const selectedFulfillment = React.useMemo(
      () =>
         selectedOrderTab
            ? selectedOrderTab.orderFulfillmentTypeLabel
                 .replace('_', ' ')
                 .split(' ')[1]
            : orderTabs.length == 0
            ? null
            : orderTabs[0].orderFulfillmentTypeLabel
                 .replace('_', ' ')
                 .split(' ')[1],
      [orderTabs, selectedOrderTab]
   )
   const fulfillmentLabel = React.useMemo(() => {
      switch (selectedFulfillment) {
         case 'DELIVERY':
            return 'Delivery at'
         case 'PICKUP':
            return 'Pickup from'
         case 'DINEIN':
            return 'DineIn At'
      }
   }, [selectedFulfillment])

   const address = React.useMemo(() => {
      if (cart?.address) {
         return cart?.address
      } else {
         return JSON.parse(localStorage.getItem('userLocation'))
      }
   }, [cart])

   return (
      <View style={styles.addressContainer}>
         <View
            style={{
               flex: 1,
               flexDirection: 'row',
               alignItems: 'center',
               height: '100%',
            }}
         >
            <TouchableOpacity
               style={{
                  flex: 3,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
               }}
               onPress={() => {
                  navigation.navigate('LocationSelector')
               }}
            >
               <LocationIcon fill={global.greyColor} />
               <Text
                  style={{
                     fontFamily: global.regular,
                     color: '#00000060',
                     marginRight: 3,
                  }}
               >
                  {fulfillmentLabel}
               </Text>
               <DownVector size={12} stroke={'#00000060'} />
            </TouchableOpacity>
            <TouchableOpacity
               style={{ flex: 6, flexShrink: 1, marginLeft: 30 }}
               onPress={() => {
                  setNumberOfLines(prev => (prev == 1 ? 2 : 1))
               }}
            >
               <Text
                  numberOfLines={numberOfLines}
                  style={{ fontFamily: global.medium, color: '#00000060' }}
               >
                  {`${address?.line1} ${address?.city} ${address?.state} ${address?.country},${address?.zipcode}`}
               </Text>
            </TouchableOpacity>
            <TouchableOpacity
               style={{
                  flex: 1,
                  alignItems: 'center',
                  height: '100%',
                  justifyContent: 'center',
               }}
               onPress={() => {
                  navigation.navigate('RefineLocation', {
                     address: {
                        ...address,
                        latitude: address?.lat,
                        longitude: address?.lng,
                     },
                     fulfillmentType:
                        selectedOrderTab.orderFulfillmentTypeLabel,
                  })
               }}
            >
               <EditIcon
                  fill={
                     appConfig.brandSettings.buttonSettings.buttonBGColor.value
                  }
                  size={18}
               />
            </TouchableOpacity>
         </View>
      </View>
   )
}
const styles = StyleSheet.create({
   addressContainer: {
      height: 50,
      marginHorizontal: 17,
      marginBottom: 12,
      marginTop: 12,
      //   shadowColor: '#00000060',
      //   shadowOffset: { width: 0, height: 2 },
      //   shadowRadius: 6,
      //   elevation: 3,
      paddingVertical: 4,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: '#00000030',
   },
})
