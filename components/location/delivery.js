import {
   Image,
   ScrollView,
   StyleSheet,
   Text,
   TouchableOpacity,
   View,
} from 'react-native'
import * as Location from 'expo-location'
import React, { useEffect, useState } from 'react'
import { GooglePlacesAutocompleteWrapper } from './googlePlaceAutoComplete'
import { get_env } from '../../utils/get_env'
import { useConfig } from '../../lib/config'
import AsyncStorage from '@react-native-async-storage/async-storage'
import LocationIcon from '../../assets/locationIcon'
import { getStoresWithValidations } from '../../utils/location/sharedLocationUtils'
import { getFormattedAddress } from '../../utils/getFormattedAddress'
import { AddressInfo } from './addressInfo'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Button } from '../button'
import useGlobalStyle from '../../globalStyle'
import { UserAddressList } from './userAddressList'
import { useCart } from '../../context'
import { Spinner } from '../../assets/loaders'

export const Delivery = ({ redirect }) => {
   const navigation = useNavigation()
   const route = useRoute()
   const { orderTabs, brand, appConfig, dispatch } = useConfig()
   const { globalStyle } = useGlobalStyle()
   const { methods, storedCartId, cartState } = useCart()

   const [userCoordinate, setUserCoordinate] = useState({
      latitude: null,
      longitude: null,
   })
   const [locationSearching, setLocationSearching] = useState({
      error: false,
      loading: false,
      errorType: '',
   })
   const [address, setAddress] = useState(null)
   const orderTabFulfillmentType = React.useMemo(
      () =>
         orderTabs
            ? orderTabs.map(eachTab => eachTab.orderFulfillmentTypeLabel)
            : null,
      [orderTabs]
   )

   const deliveryRadioOptions = React.useMemo(() => {
      let options = []
      if (
         orderTabFulfillmentType &&
         orderTabFulfillmentType.includes('ONDEMAND_DELIVERY')
      ) {
         options.push({ label: 'Now', value: 'ONDEMAND_DELIVERY' })
      }
      if (
         orderTabFulfillmentType &&
         orderTabFulfillmentType.includes('PREORDER_DELIVERY')
      ) {
         options.push({ label: 'Later', value: 'PREORDER_DELIVERY' })
      }

      return options
   }, [orderTabFulfillmentType])

   const [fulfillmentType, setFulfillmentType] = useState(
      orderTabFulfillmentType.includes('ONDEMAND_DELIVERY')
         ? 'ONDEMAND_DELIVERY'
         : 'PREORDER_DELIVERY'
   )

   const [
      selectedLocationInputDescription,
      setSelectedLocationInputDescription,
   ] = useState(null)
   const [showRefineLocation, setShowRefineLocation] = useState(false)
   const [isGetStoresLoading, setIsGetStoresLoading] = useState(true)
   const [stores, setStores] = useState(null)
   const [isSettingLocation, setIsSettingLocation] = useState(false)
   const [isUserExistingAddressSelected, setIsUserExistingAddressSelected] =
      useState(false)

   useEffect(() => {
      if (route?.params?.resetStores) {
         setStores(null)
         setAddress(null)
         navigation.setParams({ resetStores: false })
      }
   }, [route?.params?.resetStores])

   useEffect(() => {
      if (address && brand.id) {
         async function fetchStores() {
            const brandClone = { ...brand }
            const availableStore = await getStoresWithValidations({
               brand: brandClone,
               fulfillmentType,
               address,
               autoSelect: true,
            })
            setStores(availableStore)
            setIsGetStoresLoading(false)
            if (availableStore.length > 0) {
               if (!isUserExistingAddressSelected) {
                  navigation.navigate('RefineLocation', {
                     address: address,
                     fulfillmentType: fulfillmentType,
                     redirect: redirect,
                  })
               } else {
                  setIsSettingLocation(true)
                  const selectedStore = availableStore[0]
                  const selectedOrderTab = orderTabs.find(
                     x => x.orderFulfillmentTypeLabel === fulfillmentType
                  )
                  const cartIdInLocal = await AsyncStorage.getItem('cart-id')
                  if (cartIdInLocal || storedCartId) {
                     const finalCartId = cartIdInLocal
                        ? JSON.parse(cartIdInLocal)
                        : storedCartId
                     methods.cart.update({
                        variables: {
                           id: finalCartId,
                           _set: {
                              address: address,
                              locationId: selectedStore.location.id,
                              orderTabId: selectedOrderTab.id,
                              fulfillmentInfo: null,
                           },
                        },
                        optimisticResponse: {
                           updateCart: {
                              address: address,
                              fulfillmentInfo: null,
                              id: storedCartId,
                              customerInfo: cartState?.cart?.customerInfo,
                              orderTabId: selectedOrderTab.id,
                              locationId: selectedStore.location.id,
                              __typename: 'order_cart',
                           },
                        },
                     })
                  }
                  dispatch({
                     type: 'SET_LOCATION_ID',
                     payload: selectedStore.location.id,
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
                     await AsyncStorage.setItem('orderTab', fulfillmentType)
                     const storeLocationIdInLocal = await AsyncStorage.getItem(
                        'storeLocationId'
                     )
                     if (
                        storeLocationIdInLocal &&
                        storeLocationIdInLocal != selectedStore.location.id
                     ) {
                        const lastStoreLocationId = storeLocationIdInLocal
                        await AsyncStorage.setItem(
                           'lastStoreLocationId',
                           lastStoreLocationId
                        )
                        dispatch({
                           type: 'SET_LAST_LOCATION_ID',
                           payload: lastStoreLocationId,
                        })
                     }
                     await AsyncStorage.setItem(
                        'storeLocationId',
                        selectedStore.location.id.toString()
                     )
                     await AsyncStorage.setItem(
                        'userLocation',
                        JSON.stringify({
                           ...address,
                        })
                     )
                     await AsyncStorage.removeItem('storeLocation')
                  } catch (err) {
                     console.error('ExistingLocationSelectSubmit', err)
                  }
                  navigation.goBack()
                  if (route.params?.redirect && route.params?.redirect?.to) {
                     navigation.navigate(
                        route.params.redirect.to,
                        route.params.redirect?.params || {}
                     )
                  }
               }
            }
         }
         fetchStores()
      }
   }, [address, fulfillmentType, brand])

   const getLocationFromDevice = async () => {
      setLocationSearching(prev => ({
         ...prev,
         loading: !prev.loading,
         error: false,
      }))
      let { status } = await Location.requestForegroundPermissionsAsync()
      // let { status: status2 } = await Location.enableNetworkProviderAsync()
      if (status !== 'granted') {
         console.log('Permission to access location was denied')
         setLocationSearching(prev => ({
            ...prev,
            loading: !prev.loading,
            error: true,
            errorType: 'blockByPermission',
         }))
         return
      }

      let location = await Location.getCurrentPositionAsync({
         accuracy: Location.Accuracy.Highest,
         maximumAge: 10000,
      })
      setUserCoordinate(prev => ({
         latitude: location.coords.latitude,
         longitude: location.coords.longitude,
         errorMessage: '',
      }))
   }

   // get address from user current location
   useEffect(() => {
      if (
         userCoordinate.latitude &&
         userCoordinate.longitude &&
         locationSearching.loading
      ) {
         fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${
               userCoordinate.latitude
            },${userCoordinate.longitude}&key=${get_env('GOOGLE_API_KEY')}`
         )
            .then(res => res.json())
            .then(data => {
               if (data.status === 'OK' && data.results.length > 0) {
                  const formatted_address =
                     data.results[0].formatted_address.split(',')
                  const mainText = formatted_address
                     .slice(0, formatted_address.length - 3)
                     .join(',')
                  const secondaryText = formatted_address
                     .slice(formatted_address.length - 3)
                     .join(',')
                  const getAddressResult = getFormattedAddress(data.results[0])
                  if (getAddressResult.status) {
                     setIsGetStoresLoading(true)
                     setAddress(prev => ({
                        mainText,
                        secondaryText,
                        ...getAddressResult.address,
                        latitude: userCoordinate.latitude,
                        longitude: userCoordinate.longitude,
                        searched: '',
                     }))
                     setLocationSearching(prev => ({
                        ...prev,
                        loading: false,
                        error: false,
                     }))
                  } else {
                     console.log('Error: ', getAddressResult.message)
                     setLocationSearching(prev => ({
                        ...prev,
                        loading: false,
                        error: true,
                        errorType: 'zipcodeNotFound',
                     }))
                  }
               }
            })
            .catch(e => {
               console.log('error', e)
               setLocationSearching(prev => ({
                  ...prev,
                  loading: false,
                  error: true,
                  errorType: 'fetchAddress',
               }))
            })
      }
   }, [userCoordinate])

   // console.log('address', address, stores, fulfillmentType)

   const SERVER_URL = React.useMemo(() => {
      return __DEV__ ? get_env('BASE_BRAND_DEV_URL') : get_env('BASE_BRAND_URL')
   }, [])

   const formatAddress = async input => {
      // save user's search text
      setSelectedLocationInputDescription(input.description)
      try {
         const response = await fetch(
            `${SERVER_URL}/server/api/place/details/json?key=${get_env(
               'GOOGLE_API_KEY'
            )}&placeid=${input.place_id}&language=en`
         )

         const data = await response.json()
         // console.log('this is data', data)
         if (data.status === 'OK' && data.result) {
            const result = data.result
            const userCoordinate = {
               latitude: result.geometry.location.lat.toString(),
               longitude: result.geometry.location.lng.toString(),
            }
            const address = {
               mainText: input.structured_formatting.main_text,
               secondaryText: input.structured_formatting.secondary_text,
            }
            const getAddressResult = getFormattedAddress(result)
            if (getAddressResult.status) {
               setUserCoordinate(prev => ({ ...prev, ...userCoordinate }))
               setIsGetStoresLoading(true)
               setAddress({
                  ...userCoordinate,
                  ...address,
                  ...getAddressResult.address,
                  searched: input.description,
               })
            } else {
               console.log('error', getAddressResult.message)
               setLocationSearching(prev => ({
                  ...prev,
                  loading: false,
                  error: true,
                  errorType: 'zipcodeNotFound',
               }))
            }
         }
      } catch (err) {
         console.log('form', err)
      }
   }

   const onAddressSelect = addressFromUserAddressList => {
      setIsUserExistingAddressSelected(true)
      setAddress(addressFromUserAddressList)
   }

   return (
      <View style={{ paddingHorizontal: 12 }}>
         <View style={styles.deliveryTime}>
            <Text style={{ fontFamily: globalStyle.font.medium }}>
               Delivery Time
            </Text>
            <View style={{ flexDirection: 'row' }}>
               {deliveryRadioOptions.map((option, index) => (
                  <Button
                     onPress={() => {
                        setFulfillmentType(option.value)
                        setIsGetStoresLoading(true)
                     }}
                     buttonStyle={{ marginLeft: 10 }}
                     variant="outline"
                     showRadio={true}
                     isActive={option.value === fulfillmentType}
                     key={index}
                     radioSize={12}
                     textStyle={{ paddingVertical: 5 }}
                  >
                     {option.label}
                  </Button>
               ))}
            </View>
         </View>
         <GooglePlacesAutocompleteWrapper
            formatAddress={formatAddress}
            onGPSiconClick={getLocationFromDevice}
            resetTextInput={route?.params?.resetStores}
         />
         <ScrollView style={{ height: '76%' }}>
            <View style={{ zIndex: -10 }}>
               {locationSearching.loading ? (
                  <Text style={{ fontFamily: globalStyle.font.mediumItalic }}>
                     Getting your location
                  </Text>
               ) : locationSearching.error ? (
                  <Text
                     style={{
                        color: 'red',
                        fontFamily: globalStyle.font.medium,
                     }}
                  >
                     {locationSearching.errorType === 'blockByPermission'
                        ? locationSearching.errorType === 'zipcodeNotFound'
                           ? 'Please select precise location'
                           : 'Permission to access location was denied'
                        : 'Unable to get your location'}
                  </Text>
               ) : address ? (
                  <AddressInfo address={address} />
               ) : null}
            </View>
            <View>
               {!address ? null : isGetStoresLoading ? (
                  <View style={styles.searchingStoreStyle}>
                     <Text
                        style={[
                           styles.findingTextStyle,
                           { fontFamily: globalStyle.font.medium },
                        ]}
                     >
                        Finding your nearest store...
                     </Text>
                     <Image
                        style={{ width: 150, height: 150 }}
                        source={require('../../assets/locationSearchGif.gif')}
                     />
                  </View>
               ) : stores?.length === 0 ? (
                  <View style={styles.noStoreContainer}>
                     <Text
                        style={[
                           styles.noStoreText1,
                           { fontFamily: globalStyle.font.medium },
                        ]}
                     >
                        Store service not found at your location
                     </Text>
                     <Text
                        style={[
                           styles.noStoreText2,
                           {
                              fontFamily: globalStyle.font.medium,
                              color: globalStyle.color.grey,
                           },
                        ]}
                     >
                        Try other Locations
                     </Text>
                     <Image
                        source={require('../../assets/noStore.png')}
                        style={{
                           height: 300,
                           width: '100%',
                        }}
                     />
                  </View>
               ) : null}
            </View>
            {!isSettingLocation ? (
               (stores == null || stores?.length == 0) && (
                  <UserAddressList onAddressSelect={onAddressSelect} />
               )
            ) : (
               <Spinner
                  text={'Setting Your Location'}
                  showText={true}
                  size={'large'}
               />
            )}
         </ScrollView>
      </View>
   )
}

const styles = StyleSheet.create({
   deliveryTime: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexDirection: 'row',
      marginVertical: 18,
   },

   searchingStoreStyle: { marginVertical: 15, alignItems: 'center' },
   findingTextStyle: {
      fontSize: 18,
      color: 'rgba(0, 0, 0, 0.8)',
      marginBottom: 16,
   },
   noStoreContainer: {
      alignItems: 'center',
      marginVertical: 8,
   },
   noStoreText1: {
      fontSize: 16,
      marginVertical: 4,
   },
   noStoreText2: {
      fontSize: 12,
      marginVertical: 4,
   },
})
