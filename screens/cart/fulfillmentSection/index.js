import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useConfig } from '../../../lib/config'
import { Delivery } from './Delivery'
import { Pickup } from './Pickup'

export const FulfillmentSection = () => {
   const { orderTabs, selectedOrderTab } = useConfig()

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
         <View>
            <Text
               style={{ fontFamily: 'MetropolisMedium', color: '#00000080' }}
            >
               {fulfillmentLabel}
            </Text>
         </View>
         {selectedFulfillment === 'DELIVERY' ? <Delivery /> : null}
         {selectedFulfillment === 'PICKUP' ? <Pickup /> : null}
      </View>
   )
}

const styles = StyleSheet.create({
   fulfillmentContainer: {
      marginHorizontal: 17,
      marginBottom: 10,
      padding: 6,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: '#00000030',
   },
})
