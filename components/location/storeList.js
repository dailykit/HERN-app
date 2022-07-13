import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import DistanceIcon from '../../assets/distanceIcon'
import LocationIcon from '../../assets/locationIcon'
import { useConfig } from '../../lib/config'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from '@react-navigation/native'
import React from 'react'
export const StoreList = ({ stores, address, fulfillmentType }) => {
   const { dispatch, orderTabs } = useConfig()
   const navigation = useNavigation()
   const selectedOrderTab = React.useMemo(() => {
      return orderTabs.find(
         x => x.orderFulfillmentTypeLabel === fulfillmentType
      )
   }, [orderTabs])
   return (
      <View style={{ marginVertical: 8 }}>
         <Text
            style={{
               fontWeight: '600',
               fontSize: 16,
               fontFamily: 'Metropolis',
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
                           <LocationIcon fill={'#A2A2A2'} />
                        </View>
                        <View style={{ flex: 11 }}>
                           <Text style={styles.storeLabel}>{label}</Text>
                           <View>
                              <Text style={{ fontFamily: 'Metropolis' }}>
                                 {line1}
                              </Text>
                              <Text style={{ fontFamily: 'Metropolis' }}>
                                 {line2}
                              </Text>
                              <View>
                                 <Text style={{ fontFamily: 'Metropolis' }}>
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
                           <Text style={styles.mileText}>
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
      fontFamily: 'Metropolis',
      fontSize: 16,
   },
   storeCard: {
      marginVertical: 8,
   },
   mileText: {
      marginLeft: 4,
      color: 'rgba(0, 0, 0, 0.6)',
      fontSize: 12,
      fontFamily: 'Metropolis',
   },
})
