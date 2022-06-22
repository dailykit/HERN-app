// import { rrulestr } from 'rrule'
import { isPointInPolygon, convertDistance } from 'geolib'
// import { isClient, get_env } from '../../index'
import axios from 'axios'
import moment from 'moment'
import { isDateValidInRRule } from '../isDateValidInRRule'
import sortBy from 'lodash/sortBy'
import { get_env } from '../get_env'

const drivableDistanceBetweenStoreAndCustomerFn = () => ({
   value: null,
   isValidated: false,
})
// return delivery status of store (with recurrences, mileRange info, timeSlot info and drivable distance if store available for on demand delivery)
export const isStoreOnDemandDeliveryAvailable = async (
   finalRecurrences,
   eachStore,
   address
) => {
   let fulfilledRecurrences = []
   let finalRecurrencesClone = JSON.parse(JSON.stringify(finalRecurrences))
   for (let rec in finalRecurrences) {
      const now = new Date() // now
      const drivableDistanceBetweenStoreAndCustomer =
         drivableDistanceBetweenStoreAndCustomerFn()
      const isValidDay = isDateValidInRRule(
         finalRecurrences[rec].recurrence.rrule
      )
      if (isValidDay) {
         if (finalRecurrences[rec].recurrence.timeSlots.length) {
            const sortedTimeSlots = sortBy(
               finalRecurrences[rec].recurrence.timeSlots,
               [
                  function (slot) {
                     return moment(slot.from, 'HH:mm')
                  },
               ]
            )
            let validTimeSlots = []
            for (let timeslot of sortedTimeSlots) {
               const timeSlotClone = JSON.parse(JSON.stringify(timeslot))

               if (timeslot.mileRanges.length) {
                  const timeslotFromArr = timeslot.from.split(':')
                  const timeslotToArr = timeslot.to.split(':')
                  const fromTimeStamp = new Date(now.getTime())
                  fromTimeStamp.setHours(
                     timeslotFromArr[0],
                     timeslotFromArr[1],
                     timeslotFromArr[2]
                  )
                  const toTimeStamp = new Date(now.getTime())
                  toTimeStamp.setHours(
                     timeslotToArr[0],
                     timeslotToArr[1],
                     timeslotToArr[2]
                  )
                  // check if current time falls within time slot

                  if (
                     now.getTime() >= fromTimeStamp.getTime() &&
                     now.getTime() <= toTimeStamp.getTime()
                  ) {
                     const distanceDeliveryStatus =
                        await isStoreDeliveryAvailableByDistance(
                           timeslot.mileRanges,
                           eachStore,
                           address,
                           drivableDistanceBetweenStoreAndCustomer
                        )

                     const { isDistanceValid, zipcode, geoBoundary } =
                        distanceDeliveryStatus.result
                     const status = isDistanceValid && zipcode && geoBoundary
                     if (status) {
                        timeSlotClone.validMileRange =
                           distanceDeliveryStatus.mileRangeInfo
                        validTimeSlots.push(timeSlotClone)
                        finalRecurrencesClone[rec].recurrence.validTimeSlots =
                           validTimeSlots
                        fulfilledRecurrences = [
                           ...fulfilledRecurrences,
                           finalRecurrencesClone[rec],
                        ]
                     }
                     // const timeslotIndex = sortedTimeSlots.indexOf(timeslot)
                     // const timesSlotsLength = sortedTimeSlots.length

                     if (status || rec == finalRecurrences.length - 1) {
                        return {
                           status: validTimeSlots.length > 0,
                           result: distanceDeliveryStatus.result,
                           rec: fulfilledRecurrences,
                           mileRangeInfo: distanceDeliveryStatus.mileRangeInfo,
                           timeSlotInfo: timeSlotClone,
                           message:
                              validTimeSlots.length > 0
                                 ? 'Delivery available in your location'
                                 : 'Delivery not available in your location.',
                           drivableDistance:
                              distanceDeliveryStatus.drivableDistance,
                        }
                     }
                  } else {
                     const timeslotIndex =
                        finalRecurrences[rec].recurrence.timeSlots.indexOf(
                           timeslot
                        )
                     const timesSlotsLength =
                        finalRecurrences[rec].recurrence.timeSlots.length
                     if (timeslotIndex == timesSlotsLength - 1) {
                        return {
                           status: false,
                           message:
                              'Sorry, We do not offer Delivery at this time.',
                        }
                     }
                  }
               } else {
                  return {
                     status: false,
                     message: 'Sorry, delivery range is not available.',
                  }
               }
            }
         } else {
            if (rec == finalRecurrences.length - 1) {
               return {
                  status: false,
                  message: 'Sorry, We do not offer Delivery at this time.',
               }
            }
         }
      } else {
         if (rec == finalRecurrences.length - 1) {
            return {
               status: false,
               message: 'Sorry, We do not offer Delivery on this day.',
            }
         }
      }
   }
}

// return delivery status of store (with recurrences, mileRange info, timeSlot info and drivable distance if store available for pre order delivery)
export const isStorePreOrderDeliveryAvailable = async (
   finalRecurrences,
   eachStore,
   address
) => {
   // console.log('addess', address)
   const drivableDistanceBetweenStoreAndCustomer =
      drivableDistanceBetweenStoreAndCustomerFn()
   let fulfilledRecurrences = []
   let finalRecurrencesClone = JSON.parse(JSON.stringify(finalRecurrences))
   for (let rec in finalRecurrences) {
      if (finalRecurrences[rec].recurrence.timeSlots.length) {
         const sortedTimeSlots = sortBy(
            finalRecurrences[rec].recurrence.timeSlots,
            [
               function (slot) {
                  return moment(slot.from, 'HH:mm')
               },
            ]
         )
         let validTimeSlots = []
         for (let timeslot of sortedTimeSlots) {
            const timeSlotClone = JSON.parse(JSON.stringify(timeslot))
            if (timeslot.mileRanges.length) {
               const distanceDeliveryStatus =
                  await isStoreDeliveryAvailableByDistance(
                     timeslot.mileRanges,
                     eachStore,
                     address,
                     drivableDistanceBetweenStoreAndCustomer
                  )
               // console.log('distanceDeliveryStatus', distanceDeliveryStatus)
               const { isDistanceValid, zipcode, geoBoundary } =
                  distanceDeliveryStatus.result
               const status = isDistanceValid && zipcode && geoBoundary
               // console.log('statusMile', status, distanceDeliveryStatus.result)
               if (status) {
                  timeSlotClone.validMileRange =
                     distanceDeliveryStatus.mileRangeInfo
                  validTimeSlots.push(timeSlotClone)
               }
               const timeslotIndex = sortedTimeSlots.indexOf(timeslot)
               const timesSlotsLength = sortedTimeSlots.length
               // console.log('statusMile', timeslotIndex, timesSlotsLength)
               if (timeslotIndex == timesSlotsLength - 1) {
                  finalRecurrencesClone[rec].recurrence.validTimeSlots =
                     validTimeSlots
                  fulfilledRecurrences = [
                     ...fulfilledRecurrences,
                     finalRecurrencesClone[rec],
                  ]
               }
               if (
                  rec == finalRecurrences.length - 1 &&
                  fulfilledRecurrences.length > 0 &&
                  timeslotIndex == timesSlotsLength - 1
               ) {
                  return {
                     status: validTimeSlots.length > 0,
                     result: distanceDeliveryStatus.result,
                     rec: fulfilledRecurrences,
                     mileRangeInfo: distanceDeliveryStatus.mileRangeInfo,
                     timeSlotInfo: timeSlotClone,
                     message:
                        validTimeSlots.length > 0
                           ? 'Pre Order Delivery available in your location'
                           : 'Delivery not available in your location.',
                     drivableDistance: distanceDeliveryStatus.drivableDistance,
                  }
               } else {
                  if (
                     rec == finalRecurrences.length - 1 &&
                     timeslotIndex == timesSlotsLength - 1
                  ) {
                     return {
                        status: false,
                        message:
                           'Sorry, you seem to be placed far out of our delivery range.',
                     }
                  }
               }
            } else {
               return {
                  status: false,
                  message: 'Sorry, delivery range is not available.',
               }
            }
         }
      } else {
         if (rec == finalRecurrences.length - 1) {
            return {
               status: false,
               message: 'Sorry, We do not offer Delivery at this time.',
            }
         }
      }
   }
}

const isStoreDeliveryAvailableByDistance = async (
   mileRanges,
   eachStore,
   address,
   drivableDistanceBetweenStoreAndCustomer
) => {
   const userLocation = { ...address }
   // console.log('userLocation', userLocation)
   let isStoreDeliveryAvailableByDistanceStatus = {
      isDistanceValid: false,
      zipcode: false,
      geoBoundary: false,
   }
   let drivableByGoogleDistance = null
   let mileRangeInfo = null
   for (let mileRange in mileRanges) {
      // aerial distance
      if (mileRanges[mileRange].distanceType === 'aerial') {
         const aerialDistance = mileRanges[mileRange]
         if (aerialDistance.from !== null && aerialDistance.to !== null) {
            let result =
               eachStore.aerialDistance >= aerialDistance.from &&
               eachStore.aerialDistance <= aerialDistance.to
            if (result) {
               isStoreDeliveryAvailableByDistanceStatus['isDistanceValid'] =
                  result && !mileRanges[mileRange].isExcluded
            } else {
               continue
            }
         } else {
            isStoreDeliveryAvailableByDistanceStatus['isDistanceValid'] = true
         }
      }
      // drivable distance
      if (mileRanges[mileRange].distanceType === 'drivable') {
         const drivableDistance = mileRanges[mileRange]
         if (drivableDistance.from !== null && drivableDistance.to !== null) {
            try {
               if (
                  drivableDistanceBetweenStoreAndCustomer.value &&
                  drivableDistanceBetweenStoreAndCustomer.isValidated
               ) {
                  let result =
                     drivableDistanceBetweenStoreAndCustomer.value >=
                        drivableDistance.from &&
                     drivableDistanceBetweenStoreAndCustomer.value <=
                        drivableDistance.to
                  if (result) {
                     isStoreDeliveryAvailableByDistanceStatus[
                        'isDistanceValid'
                     ] = result && !mileRanges[mileRange].isExcluded
                  } else {
                     continue
                  }
               } else {
                  const origin = get_env('BASE_BRAND_URL')
                  const url = `${origin}/server/api/distance-matrix`
                  const postLocationData = {
                     key: get_env('GOOGLE_API_KEY'),
                     lat1: userLocation.latitude,
                     lon1: userLocation.longitude,
                     lat2: eachStore.location.lat,
                     lon2: eachStore.location.lng,
                  }
                  const { data } = await axios.post(url, postLocationData)
                  const distanceMeter = data.rows[0].elements[0].distance.value

                  const distanceMileFloat = convertDistance(distanceMeter, 'mi')

                  drivableByGoogleDistance = distanceMileFloat
                  drivableDistanceBetweenStoreAndCustomer.value =
                     distanceMileFloat
                  drivableDistanceBetweenStoreAndCustomer.isValidated = true
                  let result =
                     distanceMileFloat >= drivableDistance.from &&
                     distanceMileFloat <= drivableDistance.to
                  if (result) {
                     isStoreDeliveryAvailableByDistanceStatus[
                        'isDistanceValid'
                     ] = result && !mileRanges[mileRange].isExcluded
                  } else {
                     continue
                  }
               }
            } catch (error) {
               console.log('getDataWithDrivableDistance', error)
            }
         } else {
            isStoreDeliveryAvailableByDistanceStatus['isDistanceValid'] = true
         }
      }

      // zip code
      if (
         mileRanges[mileRange].zipcodes === null ||
         mileRanges[mileRange].zipcodes
      ) {
         // assuming null as true
         if (
            mileRanges[mileRange].zipcodes === null ||
            mileRanges[mileRange].zipcodes.zipcodes.length == 0
         ) {
            isStoreDeliveryAvailableByDistanceStatus['zipcode'] = true
         } else {
            const zipcodes = mileRanges[mileRange].zipcodes.zipcodes
            let result = Boolean(
               zipcodes.find(x => x == parseInt(userLocation.zipcode))
            )
            if (result) {
               isStoreDeliveryAvailableByDistanceStatus['zipcode'] =
                  result && !mileRanges[mileRange].isExcluded
               if (!(result && !mileRanges[mileRange].isExcluded)) {
                  return {
                     result: {
                        isDistanceValid: true,
                        zipcode: false,
                        geoBoundary: true,
                     },
                     mileRangeInfo: null,
                     drivableDistance: null,
                  }
               }
            }
         }
      }
      // geoBoundary
      if (
         mileRanges[mileRange].geoBoundary === null ||
         mileRanges[mileRange].geoBoundary
      ) {
         // assuming null as true
         if (mileRanges[mileRange].geoBoundary === null) {
            isStoreDeliveryAvailableByDistanceStatus['geoBoundary'] = true
         } else {
            const geoBoundaries =
               mileRanges[mileRange].geoBoundary.geoBoundaries
            const storeValidationForGeoBoundaries = isPointInPolygon(
               {
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude,
               },
               geoBoundaries
            )

            let result = storeValidationForGeoBoundaries
            if (result) {
               isStoreDeliveryAvailableByDistanceStatus['geoBoundary'] =
                  result && !mileRanges[mileRange].isExcluded
               if (!(result && !mileRanges[mileRange].isExcluded)) {
                  return {
                     result: {
                        isDistanceValid: true,
                        zipcode: true,
                        geoBoundary: false,
                     },
                     mileRangeInfo: null,
                     drivableDistance: null,
                  }
               }
            }
         }
      }
      if (
         isStoreDeliveryAvailableByDistanceStatus.isDistanceValid &&
         isStoreDeliveryAvailableByDistanceStatus.zipcode &&
         isStoreDeliveryAvailableByDistanceStatus.geoBoundary
      ) {
         mileRangeInfo = mileRanges[mileRange]
      }
   }
   return {
      result: isStoreDeliveryAvailableByDistanceStatus,
      mileRangeInfo: mileRangeInfo,
      drivableDistance: drivableByGoogleDistance,
   }
}
