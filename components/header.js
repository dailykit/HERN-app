import { Text, View, StyleSheet, TouchableOpacity } from 'react-native'
import CartIcon from '../assets/cartIcon'
import LocationIcon from '../assets/locationIcon'
import { useNavigation } from '@react-navigation/native'
import { useConfig } from '../lib/config'
import { useCart } from '../context/cart'
import React, { useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const Header = () => {
   const navigation = useNavigation()
   const {
      dispatch,
      orderTabs,
      selectedOrderTab,
      userLocation,
      storeStatus,
      locationId,
      appConfig,
   } = useConfig()
   const { cartState } = useCart()
   React.useEffect(() => {
      if (orderTabs?.length > 0) {
         ;(async function () {
            const orderTab = await AsyncStorage.getItem('orderTab')
            const storeLocationId = await AsyncStorage.getItem(
               'storeLocationId'
            )
            const userLocation = await AsyncStorage.getItem('userLocation')
            const storeLocation = await AsyncStorage.getItem('storeLocation')
            if (storeLocationId) {
               dispatch({
                  type: 'SET_LOCATION_ID',
                  payload: storeLocationId,
               })
               const selectedOrderTab = orderTabs.find(
                  x => x.orderFulfillmentTypeLabel == orderTab
               )

               dispatch({
                  type: 'SET_SELECTED_ORDER_TAB',
                  payload: selectedOrderTab,
               })
               dispatch({
                  type: 'SET_USER_LOCATION',
                  payload:
                     orderTab == 'ONDEMAND_DELIVERY' ||
                     orderTab == 'PREORDER_DELIVERY'
                        ? JSON.parse(userLocation)
                        : JSON.parse(storeLocation),
               })
               dispatch({
                  type: 'SET_STORE_STATUS',
                  payload: {
                     status: true,
                     message: 'Store available on your location.',
                     loading: false,
                  },
               })
            } else {
               if (!locationId) {
                  dispatch({
                     type: 'SET_STORE_STATUS',
                     payload: {
                        status: false,
                        message: 'Select your location',
                        loading: false,
                     },
                  })
               }
            }
         })()
      }
   }, [orderTabs, selectedOrderTab])

   const label = React.useMemo(() => {
      if (selectedOrderTab?.orderFulfillmentTypeLabel) {
         const fulfillmentType = selectedOrderTab.orderFulfillmentTypeLabel
         switch (fulfillmentType) {
            case 'ONDEMAND_DELIVERY':
               return 'Delivery At'
            case 'PREORDER_DELIVERY':
               return 'Delivery At'
            case 'PREORDER_PICKUP':
               return 'Pickup From'
            case 'ONDEMAND_PICKUP':
               return 'Pickup From'
            case 'PREORDER_DINEIN':
               return 'Dine In At'
            case 'ONDEMAND_DINEIN':
               return 'Dine In At'
         }
      } else {
         return null
      }
   }, [selectedOrderTab])

   return (
      <View
         style={[
            styles.headerContainer,
            {
               backgroundColor:
                  appConfig?.brandSettings.headerSettings?.backgroundColor
                     ?.value || '#ffffff',
            },
         ]}
      >
         <TouchableOpacity
            style={styles.headerRight}
            onPress={() => {
               navigation.navigate('LocationSelector')
            }}
         >
            <LocationIcon />
            <View>
               {storeStatus.loading ? (
                  <Text
                     style={{
                        color:
                           appConfig?.brandSettings.headerSettings?.textColor
                              ?.value || '#000000',
                        fontFamily: 'MetropolisRegularItalic',
                     }}
                  >
                     Getting your location
                  </Text>
               ) : storeStatus.status ? (
                  <View>
                     <Text
                        style={{
                           color:
                              appConfig?.brandSettings.headerSettings?.textColor
                                 ?.value || '#000000',
                           fontFamily: 'MetropolisSemiBold',
                        }}
                     >
                        {label}
                     </Text>
                     <Text
                        style={{
                           color:
                              appConfig?.brandSettings.headerSettings?.textColor
                                 ?.value || '#000000',
                           fontFamily: 'Metropolis',
                        }}
                     >
                        {userLocation?.label
                           ? userLocation?.label
                           : userLocation?.line1}
                     </Text>
                  </View>
               ) : (
                  <Text
                     style={[
                        styles.headerTextStyle,
                        {
                           color:
                              appConfig?.brandSettings.headerSettings?.textColor
                                 ?.value || '#000000',
                        },
                     ]}
                  >
                     Select Your location
                  </Text>
               )}
            </View>
         </TouchableOpacity>
         <TouchableOpacity
            onPress={() => {
               navigation.navigate('Cart')
            }}
         >
            {cartState?.cart?.cartItems_aggregate?.aggregate?.count > 0 ? (
               <Text
                  style={[
                     styles.cartItemCount,
                     {
                        backgroundColor:
                           appConfig?.brandSettings.headerSettings
                              ?.cartItemCountBackgroundColor?.value,
                        color: appConfig?.brandSettings.headerSettings
                           ?.cartItemCountTextColor?.value,
                        fontFamily: 'Metropolis',
                     },
                  ]}
               >
                  {cartState?.cart?.cartItems_aggregate?.aggregate?.count}
               </Text>
            ) : null}
            <CartIcon
               size={30}
               fill={
                  appConfig?.brandSettings.headerSettings?.cartIconColor
                     ?.value || '#ffffff'
               }
            />
         </TouchableOpacity>
      </View>
   )
}

const styles = StyleSheet.create({
   headerContainer: {
      height: 64,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 10,
   },
   headerRight: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
   },
   headerTextStyle: {
      fontFamily: 'Metropolis',
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 12,
      marginHorizontal: 4,
   },
   cartItemCount: {
      position: 'absolute',
      color: '#ffffff',
      top: -5,
      paddingHorizontal: 6,
      borderRadius: 10,
      fontSize: 12,
      right: -4,
      zIndex: 1000,
   },
})
