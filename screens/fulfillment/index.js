import React, { useEffect, useState } from 'react'
import {
   View,
   Text,
   TouchableWithoutFeedback,
   StyleSheet,
   ScrollView,
   Image,
   Button,
   Linking,
   ActivityIndicator,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import DeliveryIcon from '../../assets/deliveryIcon'
import PickupIcon from '../../assets/pickupIcon'
import { useConfig } from '../../lib/config'
import AsyncStorage from '@react-native-async-storage/async-storage'

const Fulfillment = () => {
   const { orderTabs, appConfig } = useConfig()
   const { brandSettings } = appConfig
   const navigation = useNavigation()
   const [isDeliveryPressed, setDeliveryPressed] = useState(false)
   const [isPickupPressed, setPickupPressed] = useState(false)

   const handleSubmit = async fulfillmentType => {
      if (fulfillmentType === 'DELIVERY') {
         setDeliveryPressed(true)
      } else {
         setPickupPressed(true)
      }
      let preferredOrderTab
      let orderTabLabels = new Set(
         orderTabs.map(t => t.orderFulfillmentTypeLabel)
      )
      if (
         orderTabLabels.has(`ONDEMAND_${fulfillmentType}`) &&
         orderTabLabels.has(`PREORDER_${fulfillmentType}`)
      ) {
         preferredOrderTab = `ONDEMAND_${fulfillmentType}`
      } else if (orderTabLabels.has(`ONDEMAND_${fulfillmentType}`)) {
         preferredOrderTab = `ONDEMAND_${fulfillmentType}`
      } else if (orderTabLabels.has(`PREORDER_${fulfillmentType}`)) {
         preferredOrderTab = `PREORDER_${fulfillmentType}`
      }
      preferredOrderTab &&
         (await AsyncStorage.setItem('preferredOrderTab', preferredOrderTab))
      navigation.reset({
         routes: [{ name: 'TabMenu' }],
      })
   }

   return (
      <View style={styles.container}>
         <Image
            source={{
               uri:
                  brandSettings?.brandLogo?.value ||
                  brandSettings?.brandLogo?.defaultValue,
            }}
            style={styles.logo}
         />
         {orderTabs && orderTabs.length > 0 ? (
            <>
               <Text style={[styles.headingText, styles.commonText]}>
                  Choose Between
               </Text>
               <View style={styles.row}>
                  {orderTabs.findIndex(t =>
                     ['ONDEMAND_DELIVERY', 'PREORDER_DELIVERY'].includes(
                        t.orderFulfillmentTypeLabel
                     )
                  ) != -1 ? (
                     <TouchableWithoutFeedback
                        onPress={() => handleSubmit('DELIVERY')}
                        disabled={isDeliveryPressed || isPickupPressed}
                     >
                        <View
                           style={[
                              styles.col,
                              isDeliveryPressed
                                 ? {
                                      ...styles.pressedBtn,
                                      backgroundColor: `${
                                         brandSettings?.brandColor?.value ||
                                         '#fff'
                                      }33`,
                                   }
                                 : null,
                           ]}
                        >
                           <DeliveryIcon
                              fill={
                                 (isDeliveryPressed &&
                                    brandSettings?.brandColor?.value) ||
                                 '#fff'
                              }
                           />
                           <Text
                              style={[
                                 styles.commonText,
                                 {
                                    color:
                                       (isDeliveryPressed &&
                                          brandSettings?.brandColor?.value) ||
                                       '#fff',
                                 },
                              ]}
                           >
                              {orderTabs.find(
                                 t =>
                                    'ONDEMAND_DELIVERY' ===
                                    t.orderFulfillmentTypeLabel
                              )?.label ||
                                 orderTabs.find(
                                    t =>
                                       'PREORDER_DELIVERY' ===
                                       t.orderFulfillmentTypeLabel
                                 )?.label}
                           </Text>
                        </View>
                     </TouchableWithoutFeedback>
                  ) : null}
                  {orderTabs.findIndex(t =>
                     ['ONDEMAND_PICKUP', 'PREORDER_PICKUP'].includes(
                        t.orderFulfillmentTypeLabel
                     )
                  ) != -1 ? (
                     <TouchableWithoutFeedback
                        onPress={() => handleSubmit('PICKUP')}
                        disabled={isDeliveryPressed || isDeliveryPressed}
                     >
                        <View
                           style={[
                              styles.col,
                              isPickupPressed
                                 ? {
                                      ...styles.pressedBtn,
                                      backgroundColor: `${
                                         brandSettings?.brandColor?.value ||
                                         '#fff'
                                      }33`,
                                   }
                                 : null,
                           ]}
                        >
                           <PickupIcon
                              fill={
                                 (isPickupPressed &&
                                    brandSettings?.brandColor?.value) ||
                                 '#fff'
                              }
                           />
                           <Text
                              style={[
                                 styles.commonText,
                                 {
                                    color:
                                       (isPickupPressed &&
                                          brandSettings?.brandColor?.value) ||
                                       '#fff',
                                 },
                              ]}
                           >
                              {orderTabs.find(
                                 t =>
                                    'ONDEMAND_PICKUP' ===
                                    t.orderFulfillmentTypeLabel
                              )?.label ||
                                 orderTabs.find(
                                    t =>
                                       'PREORDER_PICKUP' ===
                                       t.orderFulfillmentTypeLabel
                                 )?.label}
                           </Text>
                        </View>
                     </TouchableWithoutFeedback>
                  ) : null}
               </View>
               <Text style={[styles.commonText, styles.subHeadingText]}>
                  You can change your preference on the checkout page
               </Text>
            </>
         ) : (
            <ActivityIndicator
               size={'large'}
               color={brandSettings?.brandColor?.value || '#fff'}
               style={{ marginVertical: 60 }}
            />
         )}
      </View>
   )
}

export default Fulfillment

const styles = StyleSheet.create({
   row: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
   },
   col: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 15,
      marginVertical: 60,
      width: 120,
      height: 120,
   },
   container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      height: '100%',
      backgroundColor: '#000',
   },
   logo: {
      width: 100,
      height: 52.5,
      marginTop: 100,
      marginBottom: 69,
   },
   headingText: {
      fontFamily: 'Metropolis',
      fontSize: 28,
      fontWeight: '600',
      lineHeight: 28,
   },
   subHeadingText: {
      fontFamily: 'Metropolis',
      fontSize: 14,
      lineHeight: 18,
      fontWeight: '500',
      width: '80%',
      textAlign: 'center',
      marginHorizontal: 'auto',
   },
   commonText: {
      color: '#fff',
   },
   pressedBtn: {
      padding: 30,
      borderRadius: 100,
   },
})
