import {
   Text,
   Dimensions,
   View,
   StyleSheet,
   TouchableOpacity,
   ScrollView,
   TextInput,
} from 'react-native'
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps'
import React, { useState, useEffect } from 'react'
import MapMarker from '../../assets/mapMarker'
import { getFormattedAddress } from '../../utils/getFormattedAddress'
import { AddressInfo } from '../../components/location/addressInfo'
import { get_env } from '../../utils/get_env'
import CloseIcon from '../../assets/closeIcon'
import { Button } from '../../components/button'
import { useNavigation, useRoute } from '@react-navigation/native'
import { getStoresWithValidations } from '../../utils/location/sharedLocationUtils'
import { useConfig } from '../../lib/config'
import { useUser } from '../../context'
import SearchIcon from '../../assets/searchIcon'
import { GooglePlacesAutocompleteWrapper } from '../../components/location/googlePlaceAutoComplete'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useCart } from '../../context'
import { SafeAreaView } from 'react-native-safe-area-context'
import useGlobalStyle from '../../globalStyle'
import { useMutation } from '@apollo/client'
import { MUTATIONS } from '../../graphql'
import { Spinner } from '../../assets/loaders'

const RefineLocation = () => {
   const { globalStyle } = useGlobalStyle()
   const navigation = useNavigation()
   const route = useRoute()
   const { methods, storedCartId } = useCart()
   const { user } = useUser()
   const navAddress = route.params.address
   const navFulfillmentType = route.params.fulfillmentType

   const { brand, orderTabs, dispatch } = useConfig()
   const [address, setAddress] = React.useState(navAddress)
   const [isGetStoresLoading, setIsGetStoresLoading] = useState(true)
   const [searchedLocation, setSearchedLocation] = React.useState(
      navAddress.searched || ''
   )
   const [isStoreAvailableOnAddress, setIsStoreAvailableOnAddress] =
      React.useState(true)
   const [selectedStore, setSelectedStore] = useState(null)
   const [isSettingLocation, setIsSettingLocation] = useState(false)
   const [runInitialMapChange, setRunInitialMapChange] = useState(false) // used to stop getting new address on first time map render (stop to run onChangeMap)

   const [showGoogleAutoComplete, setShowGoogleAutoComplete] = useState(false)
   const [googlePlaceAutoCompleteError, setGooglePlaceAutoCompleteError] =
      useState({
         error: false,
         message: '',
      })
   const [defaultProps, setDefaultProps] = useState({
      center: {
         latitude: +navAddress.latitude || +navAddress.lat,
         longitude: +navAddress.longitude || +navAddress.lng,
      },
      pitch: 1,
      heading: 1,
      altitude: 3,
      zoom: 16,
   })

   const [additionalAddressInfo, setAdditionalAddressInfo] = useState({
      line1: '',
      landmark: '',
      label: '',
      notes: '',
   })
   React.useEffect(() => {
      if (address?.line1) {
         setAdditionalAddressInfo(prev => ({
            ...prev,
            line1: address.line1 || '',
         }))
      }
   }, [address])

   useEffect(() => {
      if (address && brand.id) {
         async function fetchStores() {
            const brandClone = { ...brand }
            const availableStore = await getStoresWithValidations({
               brand: brandClone,
               fulfillmentType: navFulfillmentType,
               address,
               autoSelect: true,
            })
            if (availableStore.length === 0) {
               setIsStoreAvailableOnAddress(false)
               setSelectedStore(null)
            } else {
               setIsStoreAvailableOnAddress(true)
               setSelectedStore(availableStore[0])
               setIsGetStoresLoading(false)
            }
         }
         fetchStores()
      }
   }, [address, navFulfillmentType, brand])
   const onChangeMap = center => {
      if (!runInitialMapChange) {
         setRunInitialMapChange(true)
         return
      }
      fetch(
         `https://maps.googleapis.com/maps/api/geocode/json?latlng=${
            center.latitude
         },${center.longitude}&key=${get_env(
            'GOOGLE_API_KEY'
         )}&result_type=street_address|point_of_interest&location_type=ROOFTOP`
      )
         .then(res => res.json())
         .then(data => {
            if (data.status === 'OK' && data.results.length > 0) {
               setIsGetStoresLoading(true)
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
                  setAddress({
                     mainText,
                     secondaryText,
                     latitude: center.latitude,
                     longitude: center.longitude,
                     ...getAddressResult.address,
                     searched: searchedLocation,
                  })
               }
            }
         })
         .catch(e => {
            console.error('error', e)
         })
   }

   const SERVER_URL = React.useMemo(() => {
      return __DEV__ ? get_env('BASE_BRAND_DEV_URL') : get_env('BASE_BRAND_URL')
   }, [])

   const formatAddress = async input => {
      try {
         const response = await fetch(
            `${SERVER_URL}/server/api/place/details/json?key=${get_env(
               'GOOGLE_API_KEY'
            )}&placeid=${input.place_id}&language=en`
         )
         const data = await response.json()
         // console.log('datain', data)
         if (data.status === 'OK' && data.result) {
            const result = data.result
            result.address_components.forEach(node => {
               if (node.types.includes('postal_code')) {
                  address.zipcode = node.long_name
               }
            })
            if (address.zipcode) {
               setDefaultProps(prev => ({
                  ...prev,
                  center: {
                     latitude: +result.geometry.location.lat.toString(),
                     longitude: +result.geometry.location.lng.toString(),
                  },
               }))
               setSearchedLocation(input.description)
               setShowGoogleAutoComplete(false)
            } else {
               setGooglePlaceAutoCompleteError({
                  error: true,
                  message: 'Please enter precise location',
               })
            }
         }
      } catch (err) {
         console.error('error', err)
         setGooglePlaceAutoCompleteError({
            error: true,
            message: 'Unable to find location',
         })
      }
   }

   const [createAddress] = useMutation(MUTATIONS.CUSTOMER.ADDRESS.CREATE, {
      onCompleted: () => {
         console.log('==> User Address Created!')
         // addToast(t('Address has been saved.'), {
         //    appearance: 'success',
         // })
      },
      onError: error => {
         // addToast(error.message, {
         //    appearance: 'error',
         // })
      },
   })

   const handleSubmit = async () => {
      setIsSettingLocation(true)
      const selectedOrderTab = orderTabs.find(
         x => x.orderFulfillmentTypeLabel === navFulfillmentType
      )
      // console.log('address', { ...address, ...additionalAddressInfo })
      const customerAddress = {
         line1: additionalAddressInfo?.line1 || '',
         line2: address.line2 || '',
         city: address.city,
         state: address.state,
         country: address.country,
         zipcode: address.zipcode,
         notes: additionalAddressInfo?.notes || '',
         label: additionalAddressInfo?.label || '',
         lat: address.latitude.toString(),
         lng: address.longitude.toString(),
         landmark: additionalAddressInfo?.landmark || '',
         searched: searchedLocation,
      }
      if (user?.keycloakId) {
         createAddress({
            variables: {
               object: { ...customerAddress, keycloakId: user?.keycloakId },
            },
         })
      }
      const cartIdInLocal = await AsyncStorage.getItem('cart-id')
      if (cartIdInLocal || storedCartId) {
         const finalCartId = cartIdInLocal
            ? JSON.parse(cartIdInLocal)
            : storedCartId
         methods.cart.update({
            variables: {
               id: finalCartId,
               _set: {
                  address: customerAddress,
                  locationId: selectedStore.location.id,
                  orderTabId: selectedOrderTab.id,
                  fulfillmentInfo: null,
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
         await AsyncStorage.setItem('orderTab', navFulfillmentType)
         const storeLocationIdInLocal = await AsyncStorage.getItem(
            'storeLocationId'
         )
         if (
            storeLocationIdInLocal &&
            storeLocationIdInLocal != selectedStore.location.id
         ) {
            const lastStoreLocationId = await AsyncStorage.getItem(
               'storeLocationId'
            )
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
               ...additionalAddressInfo,
               searched: searchedLocation,
            })
         )
         await AsyncStorage.removeItem('storeLocation')
         const states = navigation.getState()
         const lastRoute = states.routes[states.routes.length - 2]
         if (lastRoute.name === 'LocationSelector') {
            const secondLastRoute = states.routes[states.routes.length - 3]
            navigation.navigate(secondLastRoute.name)
         } else {
            navigation.goBack()
         }
      } catch (err) {
         console.error('refineLocationSubmit', err)
      }
   }

   return (
      <SafeAreaView style={{ backgroundColor: '#fff', flex: 1 }}>
         <View style={[styles.refineLocationSelectorHeader, { flex: 1 }]}>
            <Text
               style={[
                  styles.refineLocationText,
                  { fontFamily: globalStyle.font.semibold },
               ]}
            >
               Refine Location
            </Text>
            <TouchableOpacity
               onPress={() => {
                  navigation.goBack()
               }}
               style={{ padding: 8 }}
            >
               <CloseIcon />
            </TouchableOpacity>
         </View>
         <View style={{ position: 'relative', flex: 10 }}>
            <MapView
               style={styles.map}
               provider={PROVIDER_GOOGLE}
               camera={defaultProps}
               onRegionChangeComplete={onChangeMap}
            />
            <View style={styles.mapMarker}>
               <MapMarker />
            </View>
         </View>
         <View style={{ flex: 10 }}>
            {showGoogleAutoComplete ? (
               <View>
                  <View
                     style={{
                        justifyContent: 'space-between',
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginHorizontal: 8,
                        marginTop: 8,
                     }}
                  >
                     <GooglePlacesAutocompleteWrapper
                        formatAddress={formatAddress}
                        showGPSicon={false}
                        googleContainerStyle={{
                           width: '90%',
                        }}
                     />
                     <TouchableOpacity
                        style={{ padding: 8 }}
                        onPress={() => {
                           setShowGoogleAutoComplete(false)
                        }}
                     >
                        <CloseIcon />
                     </TouchableOpacity>
                  </View>
                  {googlePlaceAutoCompleteError.error ? (
                     <Text
                        style={{
                           marginHorizontal: 8,
                           color: 'red',
                           fontFamily: globalStyle.font.mediumItalic,
                        }}
                     >
                        {googlePlaceAutoCompleteError.message}
                     </Text>
                  ) : null}
               </View>
            ) : null}
            <ScrollView>
               {showGoogleAutoComplete ? null : (
                  <View
                     style={{
                        justifyContent: 'space-between',
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginHorizontal: 8,
                     }}
                  >
                     <View style={{ flex: 16 }}>
                        <AddressInfo address={address} />
                     </View>
                     <TouchableOpacity
                        style={{ padding: 8, flex: 1 }}
                        onPress={() => {
                           setShowGoogleAutoComplete(true)
                        }}
                     >
                        <SearchIcon />
                     </TouchableOpacity>
                  </View>
               )}
               <AddressForm
                  setAdditionalAddressInfo={setAdditionalAddressInfo}
                  additionalAddressInfo={additionalAddressInfo}
               />
            </ScrollView>
         </View>
         <Button
            style={{ flex: 1 }}
            buttonStyle={{ height: 40, margin: 12, marginVertical: 6 }}
            textStyle={{
               fontSize: 18,
            }}
            disabled={
               !isStoreAvailableOnAddress ||
               !additionalAddressInfo?.line1 ||
               !additionalAddressInfo?.label ||
               isGetStoresLoading
            }
            onPress={handleSubmit}
         >
            {isGetStoresLoading ? (
               'Searching store'
            ) : isStoreAvailableOnAddress ? (
               isSettingLocation ? (
                  <Spinner color={'#ffffff'} />
               ) : (
                  'Save & Proceed'
               )
            ) : (
               'No store available'
            )}
         </Button>
      </SafeAreaView>
   )
}

const AddressForm = ({ setAdditionalAddressInfo, additionalAddressInfo }) => {
   const [addressWarnings, setAddressWarnings] = React.useState({
      line1: false,
   })
   const [showOtherLabelField, setShowOtherLabelField] = React.useState(false)
   const { globalStyle } = useGlobalStyle()
   return (
      <View style={{ paddingHorizontal: 12 }}>
         <View>
            <Text
               style={[
                  styles.formLabel,
                  {
                     fontFamily: globalStyle.font.medium,
                     color: globalStyle.color.grey,
                  },
               ]}
            >
               Apartment/Building Info/Street info*
            </Text>
            {addressWarnings.line1 ? (
               <Text
                  style={[
                     styles.formLabel,
                     { color: 'red', fontFamily: globalStyle.font.medium },
                  ]}
               >
                  fill this field
               </Text>
            ) : null}
            <TextInput
               style={[
                  styles.inputField,
                  { fontFamily: globalStyle.font.medium },
               ]}
               placeholder="Enter apartment/building info/street info"
               value={additionalAddressInfo.line1}
               onChangeText={text => {
                  setAdditionalAddressInfo(prev => ({
                     ...prev,
                     line1: text,
                  }))
                  if (text.length === 0) {
                     setAddressWarnings(prev => ({ ...prev, line1: true }))
                  }
               }}
            />
         </View>
         <View>
            <Text
               style={[
                  styles.formLabel,
                  {
                     fontFamily: globalStyle.font.medium,
                     color: globalStyle.color.grey,
                  },
               ]}
            >
               Landmark
            </Text>
            <TextInput
               style={[
                  styles.inputField,
                  { fontFamily: globalStyle.font.medium },
               ]}
               placeholder="Enter landmark"
               value={additionalAddressInfo.landmark}
               onChangeText={text =>
                  setAdditionalAddressInfo(prev => ({
                     ...prev,
                     landmark: text,
                  }))
               }
            />
         </View>
         <View>
            <Text
               style={[
                  styles.formLabel,
                  {
                     fontFamily: globalStyle.font.medium,
                     color: globalStyle.color.grey,
                  },
               ]}
            >
               Label*
            </Text>
            <View
               style={{
                  flexDirection: 'row',
                  marginVertical: 8,
               }}
            >
               <Button
                  variant="outline"
                  buttonStyle={{ marginRight: 13 }}
                  onPress={() => {
                     setShowOtherLabelField(false)
                     setAdditionalAddressInfo(prev => ({
                        ...prev,
                        label: 'Home',
                     }))
                  }}
                  isActive={additionalAddressInfo.label === 'Home'}
               >
                  Home
               </Button>
               <Button
                  variant="outline"
                  buttonStyle={{ marginRight: 13 }}
                  onPress={() => {
                     setShowOtherLabelField(false)
                     setAdditionalAddressInfo(prev => ({
                        ...prev,
                        label: 'Office',
                     }))
                  }}
                  isActive={additionalAddressInfo.label === 'Office'}
               >
                  Office
               </Button>
               <Button
                  variant="outline"
                  buttonStyle={{ marginRight: 13 }}
                  onPress={() => {
                     setShowOtherLabelField(true)
                     setAdditionalAddressInfo(prev => ({
                        ...prev,
                        label: '',
                     }))
                  }}
                  isActive={showOtherLabelField}
               >
                  Other
               </Button>
            </View>
            {showOtherLabelField ? (
               <TextInput
                  style={[
                     styles.inputField,
                     { fontFamily: globalStyle.font.medium },
                  ]}
                  placeholder="Enter label for this address"
                  value={additionalAddressInfo.label}
                  onChangeText={text =>
                     setAdditionalAddressInfo(prev => ({
                        ...prev,
                        label: text,
                     }))
                  }
               />
            ) : null}
         </View>
         <View>
            <Text
               style={[
                  styles.formLabel,

                  {
                     fontFamily: globalStyle.font.medium,
                     color: globalStyle.color.grey,
                  },
               ]}
            >
               Dropoff Instructions
            </Text>
            <TextInput
               style={[
                  styles.inputField,
                  { fontFamily: globalStyle.font.medium },
               ]}
               placeholder="Enter dropoff instructions"
               value={additionalAddressInfo.notes}
               onChangeText={text =>
                  setAdditionalAddressInfo(prev => ({
                     ...prev,
                     notes: text,
                  }))
               }
            />
         </View>
      </View>
   )
}
export default RefineLocation
const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: '#F9F9F9',
      alignItems: 'center',
      justifyContent: 'center',
   },
   map: {
      //   width: Dimensions.get('window').width,
      //   height: Dimensions.get('window').height / 2.3,
      flex: 1,
   },
   mapMarker: {
      left: '50%',
      marginLeft: -24,
      marginTop: -48,
      position: 'absolute',
      top: '50%',
   },
   refineLocationSelectorHeader: {
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexDirection: 'row',
      padding: 12,
   },
   refineLocationText: {
      fontSize: 16,
      lineHeight: 16,
   },
   formLabel: {
      fontSize: 12,
   },
   inputField: {
      height: 40,
      backgroundColor: '#ffffff',
      borderRadius: 6,
      marginVertical: 8,
      elevation: 1,
      shadowColor: '#00000060',
      paddingHorizontal: 12,
   },
})
