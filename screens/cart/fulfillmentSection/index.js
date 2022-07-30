import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useConfig } from '../../../lib/config'
import { Delivery } from './Delivery'
import { Pickup } from './Pickup'
import useGlobalStyle from '../../../globalStyle'
import { OrderTime } from '../../../assets/orderTIme'

export const FulfillmentSection = ({
   deliveryTimePopUp,
   pickupTimePopUp,
   setMode,
   cartState,
}) => {
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

   return (
      <View style={styles.fulfillmentContainer}>
         {selectedFulfillment === 'DELIVERY' ? (
            <Delivery deliveryTimePopUp={deliveryTimePopUp} />
         ) : null}
         {selectedFulfillment === 'PICKUP' ? (
            <Pickup pickupTimePopUp={pickupTimePopUp} />
         ) : null}
         {selectedFulfillment === 'DELIVERY'
            ? setMode('DELIVERY')
            : setMode('PICKUP')}
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
