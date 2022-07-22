import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useConfig } from '../../../lib/config'
import { Delivery } from './Delivery'
import { Pickup } from './Pickup'
import useGlobalStyle from '../../../globalStyle'
import { OrderTime } from '../../../assets/orderTIme'

export const FulfillmentSection = ({ deliveryTimePopUp, cartState }) => {
   const { orderTabs, selectedOrderTab } = useConfig()
   const { globalStyle } = useGlobalStyle()

   // check whether user select fulfillment type or not
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
            return 'Delivery Time'
         case 'PICKUP':
            return 'Pickup Time'
         case 'DINEIN':
            return 'Dine In Time'
      }
   }, [selectedFulfillment])

   return (
      <View style={styles.fulfillmentContainer}>
         {cartState?.cart?.fulfillmentInfo && (
            <View style={{ flex: 1, flexDirection: 'row', marginLeft: 3 }}>
               <OrderTime size={20} />
               <View>
                  <Text
                     style={{
                        fontFamily: globalStyle.font.medium,
                        // color: '#00000080',
                        marginLeft: 4,
                     }}
                  >
                     {fulfillmentLabel}
                  </Text>
               </View>
            </View>
         )}
         {selectedFulfillment === 'DELIVERY' ? (
            <Delivery deliveryTimePopUp={deliveryTimePopUp} />
         ) : null}
         {selectedFulfillment === 'PICKUP' ? (
            <Pickup deliveryTimePopUp={deliveryTimePopUp} />
         ) : null}
      </View>
   )
}

const styles = StyleSheet.create({
   fulfillmentContainer: {
      marginHorizontal: 2,
      marginBottom: 10,
      padding: 6,
      // borderRadius: 5,
      // borderWidth: 1,
      // borderColor: '#00000030',
   },
})
