import React, { useState, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import CloseIcon from '../../assets/closeIcon'
import { useConfig } from '../../lib/config'
import { Button } from '../button'
import { Delivery } from './delivery'
import { Pickup } from './pickup'

export const LocationSelector = () => {
   const navigation = useNavigation()

   const { brand, orderTabs } = useConfig()

   const orderTabFulfillmentType = React.useMemo(
      () =>
         orderTabs
            ? orderTabs.map(eachTab => eachTab.orderFulfillmentTypeLabel)
            : null,
      [orderTabs]
   )

   const [fulfillmentType, setFulfillmentType] = useState(
      orderTabFulfillmentType[0]?.split('_')[1]
   )
   if (!orderTabFulfillmentType) {
      return <Text>Loading</Text>
   }

   return (
      <View style={styles.locationSelectorContainer}>
         <View style={styles.locationSelectorHeader}>
            <Text style={styles.locationText}>Location</Text>
            <TouchableOpacity
               onPress={() => {
                  navigation.goBack()
               }}
               style={{ padding: 5 }}
            >
               <CloseIcon />
            </TouchableOpacity>
         </View>
         <View style={styles.fulfillmentTypes}>
            {orderTabFulfillmentType.includes('ONDEMAND_DELIVERY') ||
            orderTabFulfillmentType.includes('PREORDER_DELIVERY') ? (
               <Button
                  onPress={() => setFulfillmentType('DELIVERY')}
                  buttonStyle={{ marginLeft: 10 }}
                  variant="outline"
                  showRadio={true}
                  isActive={fulfillmentType === 'DELIVERY'}
               >
                  {
                     orderTabs.find(
                        x =>
                           x.orderFulfillmentTypeLabel ===
                              'ONDEMAND_DELIVERY' ||
                           x.orderFulfillmentTypeLabel === 'PREORDER_DELIVERY'
                     ).label
                  }
               </Button>
            ) : null}
            {orderTabFulfillmentType.includes('ONDEMAND_PICKUP') ||
            orderTabFulfillmentType.includes('PREORDER_PICKUP') ? (
               <Button
                  onPress={() => setFulfillmentType('PICKUP')}
                  buttonStyle={{ marginLeft: 10 }}
                  variant="outline"
                  showRadio={true}
                  isActive={fulfillmentType === 'PICKUP'}
               >
                  {
                     orderTabs.find(
                        x =>
                           x.orderFulfillmentTypeLabel === 'ONDEMAND_PICKUP' ||
                           x.orderFulfillmentTypeLabel === 'PREORDER_PICKUP'
                     ).label
                  }
               </Button>
            ) : null}
            {orderTabFulfillmentType.includes('ONDEMAND_DINEIN') ||
            orderTabFulfillmentType.includes('PREORDER_DINEIN') ? (
               <Button
                  onPress={() => setFulfillmentType('DINEIN')}
                  buttonStyle={{ marginLeft: 10 }}
                  variant="outline"
                  showRadio={true}
                  isActive={fulfillmentType === 'DINEIN'}
               >
                  {
                     orderTabs.find(
                        x =>
                           x.orderFulfillmentTypeLabel === 'ONDEMAND_DINEIN' ||
                           x.orderFulfillmentTypeLabel === 'PREORDER_DINEIN'
                     ).label
                  }
               </Button>
            ) : null}
         </View>
         <View>
            {fulfillmentType === 'DELIVERY' && <Delivery />}
            {fulfillmentType === 'PICKUP' && <Pickup />}
            {fulfillmentType === 'DINEIN' && <DineIn />}
         </View>
      </View>
   )
}

const styles = StyleSheet.create({
   locationSelectorContainer: {
      backgroundColor: '#ffffff',
      height: '100%',
   },
   locationSelectorHeader: {
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexDirection: 'row',
      padding: 12,
   },
   locationText: {
      fontFamily: 'Metropolis',
      fontWeight: '600',
      fontSize: 16,
      lineHeight: 16,
   },
   fulfillmentTypes: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
   },
})
