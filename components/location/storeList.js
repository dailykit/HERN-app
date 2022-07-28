import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import DistanceIcon from '../../assets/distanceIcon'
import LocationIcon from '../../assets/locationIcon'
import { useConfig } from '../../lib/config'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from '@react-navigation/native'
import React from 'react'
import useGlobalStyle from '../../globalStyle'
import { useCart } from '../../context'

export const StoreList = ({ stores, address, fulfillmentType }) => {
   const { dispatch, orderTabs } = useConfig()
   const { globalStyle } = useGlobalStyle()
   const navigation = useNavigation()
   const { storedCartId, methods, cartState } = useCart()
   const selectedOrderTab = React.useMemo(() => {
      return orderTabs.find(
         x => x.orderFulfillmentTypeLabel === fulfillmentType
      )
   }, [orderTabs])
   return (
      <View style={{ marginVertical: 8 }}>
         <Text
            style={{
               fontSize: 16,
               fontFamily: globalStyle.font.medium,
            }}
         >
            Select Store
         </Text>
         <ScrollView>
            {stores.map(eachStore => {
               const {
                  location: {
                     label,
                     id,
                     locationAddress,
                     city,
                     state,
                     country,
                     zipcode,
                  },
                  aerialDistance,
                  distanceUnit,
               } = eachStore
               const { line1, line2 } = locationAddress
               if (!eachStore['fulfillmentStatus'].status) {
                  return null
               }
               return (
                  <TouchableOpacity
                     onPress={async () => {
                        if (eachStore['fulfillmentStatus'].status) {
                           const storeAddress = eachStore.location
                           const addressToBeSaveInCart = {
                              line1: storeAddress.locationAddress.line1,
                              line2: storeAddress.locationAddress.line2,
                              city: storeAddress.city,
                              state: storeAddress.state,
                              country: storeAddress.country,
                              zipcode: storeAddress.zipcode,
                              notes: '',
                              label: storeAddress.label,
                              lat: storeAddress.lat.toString(),
                              lng: storeAddress.lng.toString(),
                              landmark: '',
                              searched: address?.searched || '',
                           }
                           const cartIdInLocal = await AsyncStorage.getItem(
                              'cart-id'
                           )
                           if (cartIdInLocal || storedCartId) {
                              const finalCartId = cartIdInLocal
                                 ? JSON.parse(cartIdInLocal)
                                 : storedCartId
                              methods.cart.update({
                                 variables: {
                                    id: finalCartId,
                                    _set: {
                                       address: addressToBeSaveInCart,
                                       locationId: storeAddress.id,
                                       orderTabId: selectedOrderTab.id,
                                       fulfillmentInfo: null,
                                    },
                                 },
                                 optimisticResponse: {
                                    updateCart: {
                                       address: addressToBeSaveInCart,
                                       fulfillmentInfo: null,
                                       id: storedCartId,
                                       customerInfo:
                                          cartState?.cart?.customerInfo,
                                       orderTabId: selectedOrderTab.id,
                                       locationId: storeAddress.id,
                                       __typename: 'order_cart',
                                    },
                                 },
                              })
                           }
                           dispatch({
                              type: 'SET_LOCATION_ID',
                              payload: eachStore.location.id,
                           })
                           dispatch({
                              type: 'SET_SELECTED_ORDER_TAB',
                              payload: selectedOrderTab,
                           })
                           dispatch({
                              type: 'SET_USER_LOCATION',
                              payload: address,
                           })
                           dispatch({
                              type: 'SET_STORE_STATUS',
                              payload: {
                                 status: true,
                                 message: 'Store available on your location.',
                                 loading: false,
                              },
                           })
                           try {
                              await AsyncStorage.setItem(
                                 'orderTab',
                                 fulfillmentType
                              )
                              await AsyncStorage.setItem(
                                 'storeLocationId',
                                 eachStore.location.id.toString()
                              )
                              await AsyncStorage.setItem(
                                 'userLocation',
                                 JSON.stringify({
                                    ...address,
                                 })
                              )
                              await AsyncStorage.setItem(
                                 'storeLocation',
                                 JSON.stringify(addressToBeSaveInCart)
                              )
                              navigation.goBack()
                           } catch (err) {
                              console.error('storeSelect', err)
                           }
                        }
                     }}
                     key={eachStore.id}
                     style={styles.storeCard}
                  >
                     <View style={{ flexDirection: 'row' }}>
                        {/* <StoreIcon /> */}
                        <View style={{ flex: 1 }}>
                           <LocationIcon fill={globalStyle.color.grey} />
                        </View>
                        <View style={{ flex: 11 }}>
                           <Text
                              style={[
                                 styles.storeLabel,
                                 { fontFamily: globalStyle.font.medium },
                              ]}
                           >
                              {label}
                           </Text>
                           <View>
                              <Text
                                 style={{
                                    fontFamily: globalStyle.font.medium,
                                 }}
                              >
                                 {line1}
                              </Text>
                              <Text
                                 style={{
                                    fontFamily: globalStyle.font.medium,
                                 }}
                              >
                                 {line2}
                              </Text>
                              <View>
                                 <Text
                                    style={{
                                       fontFamily: globalStyle.font.medium,
                                    }}
                                 >
                                    {city} {state} {country}
                                    {' ('}
                                    {zipcode}
                                    {')'}
                                 </Text>
                              </View>
                           </View>
                        </View>
                        <View
                           style={{
                              flex: 3,
                              flexDirection: 'row',
                           }}
                        >
                           <DistanceIcon />
                           <Text
                              style={[
                                 styles.mileText,
                                 { fontFamily: globalStyle.font.medium },
                              ]}
                           >
                              {aerialDistance} {distanceUnit}
                           </Text>
                        </View>
                     </View>
                  </TouchableOpacity>
               )
            })}
         </ScrollView>
      </View>
   )
}

const styles = StyleSheet.create({
   storeLabel: {
      fontSize: 16,
   },
   storeCard: {
      marginVertical: 8,
   },
   mileText: {
      marginLeft: 4,
      color: 'rgba(0, 0, 0, 0.6)',
      fontSize: 12,
   },
})
