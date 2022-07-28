import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { useState, useEffect } from 'react'
import { Alert, StyleSheet, Text, View, ActivityIndicator } from 'react-native'
import { Button } from '../../../components/button'
import { useCart } from '../../../context'
import { useConfig } from '../../../lib/config'
import {
   generateDeliverySlots,
   generateMiniSlots,
   getOnDemandValidation,
   getTimeSlotsValidation,
} from '../../../utils'
import { getStoresWithValidations } from '../../../utils/location/sharedLocationUtils'
import moment from 'moment'
import { TimeSlots } from './timeSlots'
import { isEmpty } from 'lodash'
import { OrderTime } from '../../../assets/orderTIme'
import useGlobalStyle from '../../../globalStyle'
import { gql, useQuery } from '@apollo/client'

export const Delivery = () => {
   const {
      orderTabs,
      selectedOrderTab,
      brand,
      lastStoreLocationId,
      dispatch,
      appConfig,
   } = useConfig()
   const { globalStyle } = useGlobalStyle()
   const { cartState, methods, storedCartId } = useCart()

   const [fulfillmentType, setFulfillmentType] = useState(
      selectedOrderTab?.orderFulfillmentTypeLabel || null
   )
   const [fulfillmentTabInfo, setFulfillmentTabInfo] = useState({
      orderTabId: null,
      locationId: null,
      // fulfillmentInfo: null,
   })
   const [isGetStoresLoading, setIsGetStoresLoading] = useState(true)
   const [updateFulfillmentInfoForNow, setUpdateFulfillmentInfoForNow] =
      React.useState(false)
   const [deliverySlots, setDeliverySlots] = useState(null)
   const [selectedSlot, setSelectedSlot] = useState(null)
   const [stores, setStores] = useState(null)
   const [showSlots, setShowSlots] = React.useState(false)
   const [isLoading, setIsLoading] = React.useState(true)

   const orderTabFulfillmentType = React.useMemo(
      () =>
         orderTabs
            ? orderTabs.map(eachTab => eachTab.orderFulfillmentTypeLabel)
            : null,
      [orderTabs]
   )
   const consumerAddress = React.useMemo(async () => {
      if (cartState.cart?.address) {
         return {
            ...cartState.cart?.address,
            latitude:
               cartState.cart?.address?.lat ||
               cartState.cart?.address?.latitude,
            longitude:
               cartState.cart?.address?.lng ||
               cartState.cart?.address?.longitude,
         }
      } else {
         return JSON.parse(await AsyncStorage.getItem('userLocation'))
      }
   }, [
      cartState.cart?.address?.lat,
      cartState.cart?.address?.lng,
      cartState.cart?.address?.latitude,
      cartState.cart?.address?.longitude,
   ])

   // valid mile range used to get prep time
   const validMileRangeInfo = React.useMemo(() => {
      if (
         stores &&
         stores.length > 0 &&
         fulfillmentType === 'ONDEMAND_DELIVERY'
      ) {
         return stores[0].fulfillmentStatus.mileRangeInfo
      } else {
         null
      }
   }, [stores, fulfillmentType])

   // selected slot validation
   React.useEffect(() => {
      if (stores && stores.length > 0) {
         const cartTimeSlotFrom = cartState.cart?.fulfillmentInfo?.slot?.from
         const cartTimeSlotTo = cartState.cart?.fulfillmentInfo?.slot?.to
         const cartFulfillmentType = cartState.cart?.fulfillmentInfo?.type
         if (
            cartTimeSlotFrom &&
            cartTimeSlotTo &&
            cartFulfillmentType == 'PREORDER_DELIVERY' &&
            fulfillmentType === 'PREORDER_DELIVERY' &&
            !showSlots
         ) {
            const isValid = getTimeSlotsValidation(
               stores[0].fulfillmentStatus.rec,
               cartTimeSlotFrom,
               cartTimeSlotTo,
               cartState.cart?.fulfillmentInfo.slot.mileRangeId
            )
            // console.log('isValid', isValid)
            if (!isValid.status) {
               methods.cart.update({
                  variables: {
                     id: cartState?.cart?.id,
                     _set: {
                        fulfillmentInfo: null,
                     },
                  },
               })
               setFulfillmentType(null)
               setFulfillmentTabInfo({
                  orderTabId: null,
                  locationId: null,
               })
               alertMessage('This time slot is not available now')
               //    Modal.warning({
               //       title: `This time slot is not available now.`,
               //       maskClosable: true,
               //       centered: true,
               //    })
            }
         }
         if (
            cartFulfillmentType == 'ONDEMAND_DELIVERY' &&
            fulfillmentType === 'ONDEMAND_DELIVERY' &&
            !showSlots &&
            cartState.cart?.fulfillmentInfo?.slot?.mileRangeId
         ) {
            const isValid = getOnDemandValidation(
               stores[0].fulfillmentStatus.rec,
               cartState.cart?.fulfillmentInfo.slot.mileRangeId
            )
            if (!isValid.status) {
               methods.cart.update({
                  variables: {
                     id: cartState?.cart?.id,
                     _set: {
                        fulfillmentInfo: null,
                     },
                  },
               })
               setFulfillmentType(null)
               setFulfillmentTabInfo({
                  orderTabId: null,
                  locationId: null,
               })
               alertMessage('This time slot expired.')
               //    Modal.warning({
               //       title: `This time slot expired.`,
               //       maskClosable: true,
               //       centered: true,
               //    })
            }
         }
      } else {
         if (
            stores?.length === 0 &&
            cartState.cart?.fulfillmentInfo &&
            !showSlots
         ) {
            methods.cart.update({
               variables: {
                  id: cartState?.cart?.id,
                  _set: {
                     fulfillmentInfo: null,
                  },
               },
            })
            setFulfillmentType(null)
            setFulfillmentTabInfo(prev => ({
               orderTabId: null,
               locationId: null,
            }))
            setStores(null)
            alertMessage(
               'This time slot is not available now. Please select new time.'
            )
            // Modal.warning({
            //    title: `This time slot is not available now. Please select new time.`,
            //    maskClosable: true,
            //    centered: true,
            // })
            setShowSlots(true)
            setIsLoading(false)
         }
      }
   }, [stores, cartState.cart?.fulfillmentInfo])

   // set fulfillment info from cart, if not available in cart then provide slot info
   React.useEffect(() => {
      if (cartState.cart?.fulfillmentInfo?.type) {
         setFulfillmentType(cartState.cart?.fulfillmentInfo?.type)
         const orderTabId = orderTabs.find(
            t =>
               t.orderFulfillmentTypeLabel ===
               `${cartState.cart?.fulfillmentInfo?.type}`
         )?.id
         setFulfillmentTabInfo(prev => {
            return {
               ...prev,
               orderTabId,
               locationId: cartState.cart?.locationId,
            }
         })
         return
      }
      if (deliveryRadioOptions.length === 1) {
         const availableDeliveryType = deliveryRadioOptions[0].value
         setFulfillmentType(availableDeliveryType)
         const orderTabId = orderTabs.find(
            t => t.orderFulfillmentTypeLabel === `${availableDeliveryType}`
         )?.id
         setFulfillmentTabInfo(prev => {
            return { ...prev, orderTabId }
         })
      }
   }, [deliveryRadioOptions, cartState.cart?.fulfillmentInfo?.type])

   // condition for render time slot
   React.useEffect(() => {
      ;(async function () {
         if (!isEmpty(cartState.cart)) {
            if (
               cartState.cart?.fulfillmentInfo?.slot?.to &&
               cartState.cart?.fulfillmentInfo?.slot?.from
            ) {
               const showTimeSlots = Boolean(
                  !lastStoreLocationId == null ||
                     (await AsyncStorage.getItem('lastStoreLocationId'))
               )
               setShowSlots(showTimeSlots)
               setIsLoading(false)
            } else if (
               cartState.cart?.fulfillmentInfo?.type === 'ONDEMAND_DELIVERY'
            ) {
               setIsLoading(false)
            } else {
               setShowSlots(true)
               setIsLoading(false)
            }
         }
      })()
   }, [cartState.cart?.fulfillmentInfo])

   // validate available store in cart
   React.useEffect(() => {
      ;(async function () {
         if ((await consumerAddress) && brand.id && fulfillmentType) {
            async function fetchStores() {
               const brandClone = { ...brand }
               const availableStore = await getStoresWithValidations({
                  brand: brandClone,
                  fulfillmentType,
                  address: consumerAddress['_W'],
                  autoSelect: true,
                  locationId: cartState.cart?.locationId || null,
               })
               if (availableStore.length > 0) {
                  setFulfillmentTabInfo(prev => {
                     return {
                        ...prev,
                        locationId: availableStore[0].location.id,
                     }
                  })
                  if (fulfillmentType === 'PREORDER_DELIVERY') {
                     const deliverySlots = generateDeliverySlots(
                        availableStore[0].fulfillmentStatus.rec.map(
                           eachFulfillRecurrence =>
                              eachFulfillRecurrence.recurrence
                        )
                     )
                     const miniSlots = generateMiniSlots(deliverySlots.data, 60)
                     const validMiniSlots = miniSlots.map(eachMiniSlot => {
                        const eachMiniSlotDate = moment(
                           eachMiniSlot.date
                        ).format('YYYY-MM-DD')
                        const currentDate = moment().format('YYYY-MM-DD')
                        const isSameDate = moment(currentDate).isSame(
                           moment(eachMiniSlotDate)
                        )
                        if (isSameDate) {
                           let newMiniSlots = []
                           eachMiniSlot.slots.forEach(eachSlot => {
                              const slot = moment(eachSlot.time, 'HH:mm')
                                 .add(eachSlot.intervalInMinutes, 'm')
                                 .format('HH:mm')
                              const isSlotIsValidForCurrentTime =
                                 slot > moment().format('HH:mm')
                              if (isSlotIsValidForCurrentTime) {
                                 newMiniSlots.push(eachSlot)
                              }
                           })
                           return {
                              ...eachMiniSlot,
                              slots: newMiniSlots,
                           }
                        } else {
                           return eachMiniSlot
                        }
                     })
                     setDeliverySlots(validMiniSlots)
                  }

                  // this will only run when fulfillment will change manually
                  if (
                     fulfillmentType === 'ONDEMAND_DELIVERY' &&
                     deliveryRadioOptions?.length > 1 &&
                     updateFulfillmentInfoForNow
                  ) {
                     onNowClick({
                        mileRangeId:
                           availableStore[0].fulfillmentStatus.mileRangeInfo.id,
                        locationId: availableStore[0].location.id,
                     })
                  }
               }
               setStores(availableStore)
               // console.log('availableStore', availableStore)
               setIsGetStoresLoading(false)
               setUpdateFulfillmentInfoForNow(false)
            }
            fetchStores()
         }
      })()
   }, [
      consumerAddress,
      brand?.id,
      fulfillmentType,
      updateFulfillmentInfoForNow,
   ])

   // this will run when ondemand delivery auto select
   useEffect(() => {
      if (
         deliveryRadioOptions?.length === 1 &&
         fulfillmentType === 'ONDEMAND_DELIVERY' &&
         stores?.length > 0 &&
         !cartState?.cart?.fulfillmentInfo?.type
      ) {
         onNowClick({
            mileRangeId: stores[0].fulfillmentStatus.mileRangeInfo.id,
            locationId: stores[0].location.id,
         })
      }
   }, [
      fulfillmentType,
      stores,
      cartState?.cart?.fulfillmentInfo?.type,
      deliveryRadioOptions,
   ])
   const alertMessage = message => {
      Alert.alert(message, null, [
         {
            text: 'OK',
            onPress: () => console.log('OK Pressed'),
            style: 'cancel',
         },
      ])
   }
   // to check validation for selected time slot to available time slots
   React.useEffect(() => {
      const interval = setInterval(() => {
         if (stores && stores.length > 0) {
            const cartTimeSlotFrom = cartState.cart?.fulfillmentInfo?.slot?.from
            const cartTimeSlotTo = cartState.cart?.fulfillmentInfo?.slot?.to
            const cartFulfillmentType = cartState.cart?.fulfillmentInfo?.type
            if (
               cartTimeSlotFrom &&
               cartTimeSlotTo &&
               cartFulfillmentType == 'PREORDER_DELIVERY' &&
               fulfillmentType === 'PREORDER_DELIVERY' &&
               !showSlots
            ) {
               const isValid = getTimeSlotsValidation(
                  stores[0].fulfillmentStatus.rec,
                  cartTimeSlotFrom,
                  cartTimeSlotTo,
                  cartState.cart?.fulfillmentInfo?.slot?.mileRangeId
               )
               if (!isValid.status) {
                  methods.cart.update({
                     variables: {
                        id: cartState?.cart?.id,
                        _set: {
                           fulfillmentInfo: null,
                        },
                     },
                  })
                  setFulfillmentType(null)
                  setFulfillmentTabInfo({
                     orderTabId: null,
                     locationId: null,
                  })
                  alertMessage(`This time slot is not available now.`)
                  // Modal.warning({
                  //    title: `This time slot is not available now.`,
                  //    maskClosable: true,
                  //    centered: true,
                  // })
               }
            }
            if (
               cartFulfillmentType == 'ONDEMAND_DELIVERY' &&
               cartState.cart?.fulfillmentInfo?.slot?.mileRangeId &&
               fulfillmentType === 'ONDEMAND_DELIVERY' &&
               !showSlots
            ) {
               const isValid = getOnDemandValidation(
                  stores[0].fulfillmentStatus.rec,
                  cartState.cart?.fulfillmentInfo?.slot?.mileRangeId
               )
               if (!isValid.status) {
                  methods.cart.update({
                     variables: {
                        id: cartState?.cart?.id,
                        _set: {
                           fulfillmentInfo: null,
                        },
                     },
                  })
                  setFulfillmentType(null)
                  setFulfillmentTabInfo({
                     orderTabId: null,
                     locationId: null,
                  })
                  alertMessage('This time slot expired.')
                  // Modal.warning({
                  //    title: `This time slot expired.`,
                  //    maskClosable: true,
                  //    centered: true,
                  // })
               }
            }
         }
      }, 10000)
      return () => {
         clearInterval(interval)
      }
   }, [stores, cartState.cart?.fulfillmentInfo])

   // this fn will run just after available stores length > 0
   const onNowClick = async ({ mileRangeId, locationId }) => {
      const slotInfo = {
         slot: {
            from: null,
            to: null,
            mileRangeId: mileRangeId,
         },
         type: 'ONDEMAND_DELIVERY',
      }

      await methods.cart.update({
         variables: {
            id: cartState?.cart?.id,
            _set: {
               fulfillmentInfo: slotInfo,
               orderTabId: fulfillmentTabInfo.orderTabId,
               locationId: fulfillmentTabInfo.locationId || locationId,
               // locationId: locationId,
               // address: consumerAddress,
            },
         },
         optimisticResponse: {
            updateCart: {
               id: cartState?.cart?.id,
               customerInfo: cartState?.cart?.customerInfo,
               fulfillmentInfo: {
                  ...fulfillmentTabInfo,
                  fulfillmentInfo: slotInfo,
               },
               address: cartState?.cart?.address,
               orderTabId: cartState?.cart?.id,
               locationId: cartState?.cart?.locationId,
               __typename: 'order_cart',
            },
         },
      })
      setShowSlots(false)
      // setIsEdit(false)
   }

   const onFulfillmentTimeClick = async (timestamp, mileRangeId) => {
      const slotInfo = {
         slot: {
            from: timestamp.from,
            to: timestamp.to,
            mileRangeId: mileRangeId,
         },
         type: 'PREORDER_DELIVERY',
      }

      await methods.cart.update({
         variables: {
            id: cartState?.cart?.id,
            _set: {
               ...fulfillmentTabInfo,
               fulfillmentInfo: slotInfo,
               // address: consumerAddress,
               // locationId: locationId,
            },
         },
         optimisticResponse: {
            updateCart: {
               id: cartState?.cart?.id,
               customerInfo: cartState?.cart?.customerInfo,
               fulfillmentInfo: {
                  ...fulfillmentTabInfo,
                  fulfillmentInfo: slotInfo,
               },
               address: cartState?.cart?.address,
               orderTabId: cartState?.cart?.id,
               locationId: cartState?.cart?.locationId,
               __typename: 'order_cart',
            },
         },
      })
      await AsyncStorage.removeItem('lastStoreLocationId')
      dispatch({
         type: 'SET_LAST_LOCATION_ID',
         payload: null,
      })
      setShowSlots(false)
      // setIsEdit(false)
   }
   const deliveryRadioOptions = React.useMemo(() => {
      let options = []
      if (
         orderTabFulfillmentType &&
         orderTabFulfillmentType.includes('ONDEMAND_DELIVERY')
      ) {
         options.push({
            label: 'Now',
            value: 'ONDEMAND_DELIVERY',
         })
      }
      if (
         orderTabFulfillmentType &&
         orderTabFulfillmentType.includes('PREORDER_DELIVERY')
      ) {
         options.push({
            label: 'Later',
            value: 'PREORDER_DELIVERY',
         })
      }

      return options
   }, [orderTabFulfillmentType])

   const { data } = useQuery(GET_FULFILLMENT_INFO, {
      variables: {
         where: {
            id: {
               _eq: storedCartId,
            },
         },
      },
   })
   // title to show after select time slot
   const title = React.useMemo(() => {
      switch (data?.carts?.[0]?.fulfillmentInfo?.type) {
         case 'ONDEMAND_DELIVERY':
            return `Delivering in ${validMileRangeInfo?.prepTime || '...'} min.`
         default:
            return ''
      }
   }, [data?.carts?.[0]?.fulfillmentInfo?.type, validMileRangeInfo?.prepTime])

   if (!showSlots) {
      return (
         <View>
            <View
               style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
               }}
            >
               <View style={{ flexDirection: 'row' }}>
                  <OrderTime size={20} />
                  {/* &nbsp;&nbsp; */}
                  <Text
                     style={{
                        marginLeft: 6,
                        color: '#00000080',
                        fontFamily: globalStyle.font.medium,
                     }}
                  >
                     {title}
                     {data?.carts?.[0]?.fulfillmentInfo?.type ===
                        'PREORDER_PICKUP' ||
                     data?.carts?.[0]?.fulfillmentInfo?.type ===
                        'PREORDER_DELIVERY' ? (
                        <Text style={{ fontFamily: globalStyle.font.medium }}>
                           {' '}
                           {moment(
                              data.carts?.[0]?.fulfillmentInfo?.slot?.from
                           ).format('DD MMM YYYY')}
                           {' ('}
                           {moment(
                              data.carts?.[0]?.fulfillmentInfo?.slot?.from
                           ).format('HH:mm')}
                           {'-'}
                           {moment(
                              data.carts?.[0]?.fulfillmentInfo?.slot?.to
                           ).format('HH:mm')}
                           {')'}
                        </Text>
                     ) : null}
                  </Text>
               </View>
               {(deliveryRadioOptions.length > 0 ||
                  fulfillmentType === 'PREORDER_DELIVERY') && (
                  <Button
                     variant="outline"
                     isActive={true}
                     onPress={() => {
                        if (deliveryRadioOptions.length > 1) {
                           setFulfillmentTabInfo(prev => ({
                              ...prev,
                              orderTabId: null,
                           }))
                        }
                        setShowSlots(true)
                     }}
                     textStyle={{
                        color:
                           appConfig.brandSettings.buttonSettings
                              .activeTextColor.value || '#000000',
                     }}
                  >
                     {'Change'}
                  </Button>
               )}
            </View>
         </View>
      )
   }
   return (
      <View>
         <View
            style={{
               flexDirection: 'column',
               justifyContent: 'space-between',
               alignItems: 'center',
            }}
         >
            <Text
               style={{
                  fontFamily: globalStyle.font.semibold,
                  alignSelf: 'flex-start',
                  marginBottom: 5,
               }}
            >
               When would you like to order?
            </Text>
            <View style={styles.fulfillmentButtonGroup}>
               {deliveryRadioOptions.map((eachOption, index) => (
                  <Button
                     key={eachOption.value}
                     variant="outline"
                     showRadio={true}
                     isActive={fulfillmentType === eachOption.value}
                     buttonStyle={{
                        ...(index > 0 ? { marginLeft: 8 } : null),
                        height: 28,
                     }}
                     textStyle={{
                        fontFamily: globalStyle.font.medium,
                        fontSize: 11,
                        paddingHorizontal: 7,
                     }}
                     radioStyle={{
                        paddingLeft: 7,
                     }}
                     onPress={() => {
                        setFulfillmentType(eachOption.value)
                        const orderTabId = orderTabs.find(
                           t =>
                              t.orderFulfillmentTypeLabel ===
                              `${eachOption.value}`
                        )?.id
                        setFulfillmentTabInfo(prev => {
                           return { ...prev, orderTabId }
                        })
                        setIsGetStoresLoading(true)
                        if (eachOption.value === 'ONDEMAND_DELIVERY') {
                           setUpdateFulfillmentInfoForNow(true)
                        }
                     }}
                  >
                     {eachOption.label}
                  </Button>
               ))}
            </View>
         </View>
         {!fulfillmentType ? null : isGetStoresLoading ? (
            <ActivityIndicator
               size={'small'}
               color={appConfig?.brandSettings?.brandColor?.value || '#000000'}
               style={{ marginVertical: 6 }}
            />
         ) : stores.length === 0 ? (
            <Text
               style={{
                  textAlign: 'center',
                  marginVertical: 8,
                  fontFamily: globalStyle.font.semibold,
               }}
            >
               No store available
            </Text>
         ) : fulfillmentType === 'PREORDER_DELIVERY' ? (
            <TimeSlots
               onFulfillmentTimeClick={onFulfillmentTimeClick}
               selectedSlot={selectedSlot}
               availableDaySlots={deliverySlots}
               setSelectedSlot={setSelectedSlot}
               timeSlotsFor={'Delivery'}
            />
         ) : null}
      </View>
   )
}

const styles = StyleSheet.create({
   fulfillmentButtonGroup: {
      flexDirection: 'row',
   },
})

const GET_FULFILLMENT_INFO = gql`
   query cart($where: order_cart_bool_exp!) {
      carts(where: $where) {
         id
         fulfillmentInfo
      }
   }
`
