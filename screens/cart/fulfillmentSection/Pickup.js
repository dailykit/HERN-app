import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { useState, useEffect } from 'react'
import { Alert, StyleSheet, Text, View } from 'react-native'
import { Button } from '../../../components/button'
import { useCart } from '../../../context'
import { useConfig } from '../../../lib/config'
import {
   generateMiniSlots,
   generatePickUpSlots,
   getOndemandPickupTimeValidation,
   getPickupTimeSlotValidation,
} from '../../../utils'
import { getStoresWithValidations } from '../../../utils/location/sharedLocationUtils'
import moment from 'moment'
import { TimeSlots } from './timeSlots'
import { isEmpty } from 'lodash'
import { OrderTime } from '../../../assets/orderTIme'
import appConfig from '../../../brandConfig.json'

export const Pickup = () => {
   const {
      orderTabs,
      selectedOrderTab,
      brand,
      lastStoreLocationId,
      dispatch,
      locationId,
   } = useConfig()
   const { cartState, methods } = useCart()

   const [fulfillmentType, setFulfillmentType] = useState(null)
   const [fulfillmentTabInfo, setFulfillmentTabInfo] = useState({
      orderTabId: null,
      locationId: null,
      // fulfillmentInfo: null,
   })
   const [isGetStoresLoading, setIsGetStoresLoading] = useState(true)
   const [updateFulfillmentInfoForNow, setUpdateFulfillmentInfoForNow] =
      React.useState(false)
   const [deliverySlots, setPickupSlots] = useState(null)
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
   const alertMessage = message => {
      Alert.alert(message, null, [
         {
            text: 'OK',
            onPress: () => console.log('OK Pressed'),
            style: 'cancel',
         },
      ])
   }

   // valid time slot used to get lead time
   const timeSlotInfo = React.useMemo(() => {
      if (stores?.length > 0 && fulfillmentType === 'ONDEMAND_PICKUP') {
         const timeSlot = stores[0].fulfillmentStatus.timeSlotInfo
         return timeSlot
      } else {
         null
      }
   }, [stores, fulfillmentType])

   // title to show after select time slot
   const title = React.useMemo(() => {
      switch (cartState.cart?.fulfillmentInfo?.type) {
         case 'ONDEMAND_PICKUP':
            return `Pick up after ${timeSlotInfo?.pickUpPrepTime || '...'} min.`
         case 'PREORDER_PICKUP':
            return ''
      }
   }, [cartState.cart?.fulfillmentInfo?.type, timeSlotInfo?.pickUpPrepTime])

   // selected slot validation
   React.useEffect(() => {
      if (stores && stores.length > 0) {
         const cartTimeSlotFrom = cartState.cart?.fulfillmentInfo?.slot?.from
         const cartTimeSlotTo = cartState.cart?.fulfillmentInfo?.slot?.to
         const cartFulfillmentType = cartState.cart?.fulfillmentInfo?.type
         if (
            cartTimeSlotFrom &&
            cartTimeSlotTo &&
            cartFulfillmentType == 'PREORDER_PICKUP' &&
            fulfillmentType === 'PREORDER_PICKUP' &&
            !showSlots
         ) {
            const isValid = getPickupTimeSlotValidation(
               stores[0].fulfillmentStatus.rec,
               cartTimeSlotFrom,
               cartTimeSlotTo,
               cartState.cart?.fulfillmentInfo.slot.timeslotId
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
            cartFulfillmentType == 'ONDEMAND_PICKUP' &&
            fulfillmentType === 'ONDEMAND_PICKUP' &&
            !showSlots &&
            cartState.cart?.fulfillmentInfo?.slot?.mileRangeId
         ) {
            const isValid = getOndemandPickupTimeValidation(
               stores[0].fulfillmentStatus.rec,
               cartState.cart?.fulfillmentInfo.slot.timeslotId
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

   // set fulfillment info from cart, if not available in cart then provide slot info --
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
      if (pickupRadioOptions.length === 1) {
         const availableDeliveryType = pickupRadioOptions[0].value
         setFulfillmentType(availableDeliveryType)
         const orderTabId = orderTabs.find(
            t => t.orderFulfillmentTypeLabel === `${availableDeliveryType}`
         )?.id
         setFulfillmentTabInfo(prev => {
            return { ...prev, orderTabId }
         })
      }
   }, [
      pickupRadioOptions,
      cartState.cart?.fulfillmentInfo?.type,
      cartState.cart?.locationId,
   ])

   // condition for render time slot --
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
               cartState.cart?.fulfillmentInfo?.type === 'ONDEMAND_PICKUP'
            ) {
               setIsLoading(false)
            } else {
               setShowSlots(true)
               setIsLoading(false)
            }
         }
      })()
   }, [cartState.cart?.fulfillmentInfo])

   // validate available store in cart --
   React.useEffect(() => {
      ;(async function () {
         if (brand.id && fulfillmentType) {
            async function fetchStores() {
               const brandClone = { ...brand }
               const availableStore = await getStoresWithValidations({
                  brand: brandClone,
                  fulfillmentType,
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
                  if (fulfillmentType === 'PREORDER_PICKUP') {
                     const pickupSlots = generatePickUpSlots(
                        availableStore[0].fulfillmentStatus.rec.map(
                           eachFulfillRecurrence =>
                              eachFulfillRecurrence.recurrence
                        )
                     )
                     const miniSlots = generateMiniSlots(pickupSlots.data, 60)
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
                     setPickupSlots(validMiniSlots)
                  }

                  // this will only run when fulfillment will change manually
                  if (
                     fulfillmentType === 'ONDEMAND_PICKUP' &&
                     pickupRadioOptions?.length > 1 &&
                     updateFulfillmentInfoForNow
                  ) {
                     onNowPickup({
                        timeSlotInfo:
                           availableStore[0].fulfillmentStatus.timeSlotInfo,
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
   }, [brand?.id, fulfillmentType, cartState.cart?.locationId])

   // this will run when ondemand delivery auto select --
   useEffect(() => {
      if (
         pickupRadioOptions?.length === 1 &&
         fulfillmentType === 'ONDEMAND_PICKUP' &&
         stores?.length > 0 &&
         !cartState?.cart?.fulfillmentInfo?.type
      ) {
         onNowPickup({ timeSlotInfo: stores[0].fulfillmentStatus.timeSlotInfo })
      }
   }, [
      fulfillmentType,
      stores,
      cartState?.cart?.fulfillmentInfo?.type,
      pickupRadioOptions,
   ])

   // to check validation for selected time slot to available time slots --
   React.useEffect(() => {
      const interval = setInterval(() => {
         if (stores && stores.length > 0) {
            const cartTimeSlotFrom = cartState.cart?.fulfillmentInfo?.slot?.from
            const cartTimeSlotTo = cartState.cart?.fulfillmentInfo?.slot?.to
            const cartFulfillmentType = cartState.cart?.fulfillmentInfo?.type
            if (
               cartTimeSlotFrom &&
               cartTimeSlotTo &&
               cartFulfillmentType == 'PREORDER_PICKUP' &&
               fulfillmentType === 'PREORDER_PICKUP' &&
               !showSlots
            ) {
               const isValid = getPickupTimeSlotValidation(
                  stores[0].fulfillmentStatus.rec,
                  cartTimeSlotFrom,
                  cartTimeSlotTo,
                  cartState.cart?.fulfillmentInfo?.slot?.timeslotId
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
                  alertMessage('This time slot is not available now.')
                  // Modal.warning({
                  //    title: `This time slot is not available now.`,
                  //    maskClosable: true,
                  //    centered: true,
                  // })
               }
            }
            if (
               cartFulfillmentType == 'ONDEMAND_PICKUP' &&
               cartState.cart?.fulfillmentInfo?.slot?.mileRangeId &&
               fulfillmentType === 'ONDEMAND_PICKUP' &&
               !showSlots
            ) {
               const isValid = getOndemandPickupTimeValidation(
                  stores[0].fulfillmentStatus.rec,
                  cartState.cart?.fulfillmentInfo?.slot?.timeslotId
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
   const onNowPickup = async ({ timeSlotInfo }) => {
      const slotInfo = {
         slot: {
            from: null,
            to: null,
            timeslotId: timeSlotInfo.id,
         },
         type: 'ONDEMAND_PICKUP',
      }

      methods.cart.update({
         variables: {
            id: cartState?.cart?.id,
            _set: {
               orderTabId: fulfillmentTabInfo.orderTabId,
               locationId: fulfillmentTabInfo.locationId || locationId,
               fulfillmentInfo: slotInfo,
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

   const onFulfillmentTimeClick = async timestamp => {
      let timeslotInfo = null
      stores[0].fulfillmentStatus.rec.forEach(x => {
         x.recurrence.timeSlots.forEach(timeSlot => {
            const format = 'HH:mm'
            const selectedFromTime = moment(timestamp.from).format(format)
            const selectedToTime = moment(timestamp.to).format(format)
            const fromTime = moment(timeSlot.from, format).format(format)
            const toTime = moment(timeSlot.to, format).format(format)
            const isInBetween =
               selectedFromTime >= fromTime &&
               selectedFromTime <= toTime &&
               selectedToTime <= toTime
            if (isInBetween) {
               timeslotInfo = timeSlot
            }
         })
      })

      const slotInfo = {
         slot: {
            from: timestamp.from,
            to: timestamp.to,
            timeslotId: timeslotInfo?.id || null,
         },
         type: 'PREORDER_PICKUP',
      }

      methods.cart.update({
         variables: {
            id: cartState?.cart?.id,
            _set: {
               ...fulfillmentTabInfo,
               fulfillmentInfo: slotInfo,
               locationId: locationId,
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
   const pickupRadioOptions = React.useMemo(() => {
      let options = []
      if (
         orderTabFulfillmentType &&
         orderTabFulfillmentType.includes('ONDEMAND_PICKUP')
      ) {
         options.push({
            label: 'Now',
            value: 'ONDEMAND_PICKUP',
         })
      }
      if (
         orderTabFulfillmentType &&
         orderTabFulfillmentType.includes('PREORDER_PICKUP')
      ) {
         options.push({
            label: 'Later',
            value: 'PREORDER_PICKUP',
         })
      }

      return options
   }, [orderTabFulfillmentType])

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
                  <Text style={{ marginLeft: 6, color: '#00000080' }}>
                     {title}
                     {cartState.cart?.fulfillmentInfo?.type ===
                        'PREORDER_PICKUP' ||
                     cartState.cart?.fulfillmentInfo?.type ===
                        'PREORDER_PICKUP' ? (
                        <Text>
                           {' '}
                           {moment(
                              cartState.cart?.fulfillmentInfo?.slot?.from
                           ).format('DD MMM YYYY')}
                           {' ('}
                           {moment(
                              cartState.cart?.fulfillmentInfo?.slot?.from
                           ).format('HH:mm')}
                           {'-'}
                           {moment(
                              cartState.cart?.fulfillmentInfo?.slot?.to
                           ).format('HH:mm')}
                           {')'}
                        </Text>
                     ) : null}
                  </Text>
               </View>
               {(pickupRadioOptions.length > 0 ||
                  fulfillmentType === 'PREORDER_PICKUP') && (
                  <Button
                     variant="outline"
                     isActive={true}
                     onPress={() => {
                        if (pickupRadioOptions.length > 1) {
                           setFulfillmentType(null)
                           setFulfillmentTabInfo(prev => ({
                              ...prev,
                              orderTabId: null,
                           }))
                        }
                        setShowSlots(true)
                     }}
                     textStyle={{
                        color: appConfig.brandSettings.buttonSettings
                           .activeTextColor.value,
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
               flexDirection: 'row',
               justifyContent: 'space-between',
               alignItems: 'center',
            }}
         >
            <Text>When would you like to order?</Text>
            <View style={styles.fulfillmentButtonGroup}>
               {pickupRadioOptions.map((eachOption, index) => (
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
                        if (eachOption.value === 'ONDEMAND_PICKUP') {
                           setUpdateFulfillmentInfoForNow(prev => !prev)
                        }
                     }}
                  >
                     {eachOption.label}
                  </Button>
               ))}
            </View>
         </View>
         {!fulfillmentType ? null : isGetStoresLoading ? (
            <View>
               <Text>Loading</Text>
            </View>
         ) : stores.length === 0 ? (
            <Text>{'No store available'}</Text>
         ) : fulfillmentType === 'PREORDER_PICKUP' ? (
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