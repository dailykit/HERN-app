import { add, formatISO } from 'date-fns'
import { sortBy } from 'lodash'
import { rrulestr } from 'rrule'
import moment from 'moment'

export const getMinutes = time => {
   return parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1])
}

export const makeDoubleDigit = num => {
   if (num.toString().length === 1) {
      return '0' + num
   } else {
      return num
   }
}

export const getTimeFromMinutes = num => {
   const hours = num / 60
   const rhours = Math.floor(hours)
   const minutes = (hours - rhours) * 60
   const rminutes = Math.round(minutes)
   return makeDoubleDigit(rhours) + ':' + makeDoubleDigit(rminutes)
}

export const combineRecurrenceAndBrandLocation = (
   eachStore,
   brandRecurrences
) => {
   const storeLocationRecurrence = brandRecurrences.filter(
      x => x.brandLocationId === eachStore.id
   )

   // getting brand recurrence by location [consist different brandLocation ids]

   const storeRecurrencesLength = storeLocationRecurrence.length

   // if there is brandLocationId in brandRecurrences we use only those brandRecurrences which has eachStore.id for particular eachStore other wise (brand level recurrences) we use reoccurrences which as brandLocationId == null
   const finalBrandLocationRecurrence =
      storeRecurrencesLength === 0
         ? brandRecurrences.filter(x => x.brandLocationId === null)
         : storeLocationRecurrence

   const finalBrandRecurrence = brandRecurrences.filter(
      x => x.brandId === eachStore.brandId
   )

   if (finalBrandLocationRecurrence.length === 0) {
      eachStore.recurrences = finalBrandRecurrence
      return eachStore.recurrences[0].recurrence
   } else {
      eachStore.recurrences = finalBrandLocationRecurrence
      return eachStore.recurrences[0].recurrence
   }
}
export const generateDeliverySlots = recurrences => {
   let data = []
   for (let rec of recurrences) {
      const now = new Date() // now
      const start = new Date(now.getTime() - 1000 * 60 * 60 * 24) // yesterday
      // const start = now;
      const end = new Date(now.getTime() + 10 * 1000 * 60 * 60 * 24) // 7 days later
      const dates = rrulestr(rec.rrule).between(start, end)
      dates.forEach(date => {
         if (rec.validTimeSlots.length) {
            rec.validTimeSlots.forEach(timeslot => {
               // if multiple mile ranges, only first one will be taken
               if (timeslot.validMileRange) {
                  const leadTime = timeslot.validMileRange.leadTime
                  const [fromHr, fromMin, fromSec] = timeslot.from.split(':')
                  const [toHr, toMin, toSec] = timeslot.to.split(':')
                  const fromTimeStamp = new Date(
                     date.setHours(fromHr, fromMin, fromSec)
                  )
                  const toTimeStamp = new Date(
                     date.setHours(toHr, toMin, toSec)
                  )
                  // start + lead time < to
                  const leadMiliSecs = leadTime * 60000
                  if (now.getTime() + leadMiliSecs < toTimeStamp.getTime()) {
                     // if start + lead time > from -> set new from time
                     let slotStart
                     let slotEnd =
                        toTimeStamp.getHours() + ':' + toTimeStamp.getMinutes()
                     slotStart =
                        fromTimeStamp.getHours() +
                        ':' +
                        fromTimeStamp.getMinutes()
                     // check if date already in slots
                     const dateWithoutTime = date.toDateString()
                     const index = data.findIndex(
                        slot => slot.date === dateWithoutTime
                     )
                     const [HH, MM, SS] = timeslot.slotInterval
                        ? timeslot.slotInterval.split(':')
                        : []
                     const intervalInMinutes = Boolean(HH && MM && SS)
                        ? +HH * 60 + +MM
                        : null
                     if (index === -1) {
                        data.push({
                           date: dateWithoutTime,
                           slots: [
                              {
                                 start: slotStart,
                                 end: slotEnd,
                                 mileRangeId: timeslot.validMileRange.id,
                                 intervalInMinutes: intervalInMinutes,
                              },
                           ],
                        })
                     } else {
                        data[index].slots.push({
                           start: slotStart,
                           end: slotEnd,
                           mileRangeId: timeslot.validMileRange.id,
                           intervalInMinutes: intervalInMinutes,
                        })
                     }
                  }
               } else {
                  return {
                     status: false,
                     message:
                        'Sorry, you seem to be placed far out of our delivery range.',
                  }
               }
            })
         } else {
            return { status: false, message: 'Sorry! No time slots available.' }
         }
      })
   }
   return { status: true, data }
}

export const generateMiniSlots = (data, size) => {
   // data --> delivery slots group by dates
   let newData = []
   data.forEach(el => {
      el.slots.forEach(slot => {
         const startMinutes = getMinutes(slot.start)
         const endMinutes = getMinutes(slot.end)
         let startPoint = startMinutes
         while (startPoint < endMinutes) {
            const index = newData.findIndex(datum => datum.date === el.date)
            if (index === -1) {
               newData.push({
                  date: el.date,
                  slots: [{ time: getTimeFromMinutes(startPoint), ...slot }],
               })
            } else {
               newData[index].slots.push({
                  time: getTimeFromMinutes(startPoint),
                  ...slot,
               })
            }
            if (slot.intervalInMinutes) {
               startPoint = startPoint + slot.intervalInMinutes
            } else {
               startPoint = startPoint + size
            }
         }
      })
   })
   return newData
}
export const generatePickUpSlots = recurrences => {
   let data = []
   recurrences.forEach(rec => {
      const now = new Date() // now
      const start = new Date(now.getTime() - 1000 * 60 * 60 * 24) // yesterday
      // const start = now;
      const end = new Date(now.getTime() + 10 * 1000 * 60 * 60 * 24) // 7 days later
      const dates = rrulestr(rec.rrule).between(start, end)
      dates.forEach(date => {
         if (rec.timeSlots.length) {
            rec.timeSlots.forEach(timeslot => {
               const timeslotFromArr = timeslot.from.split(':')
               const timeslotToArr = timeslot.to.split(':')
               const fromTimeStamp = new Date(
                  date.setHours(
                     timeslotFromArr[0],
                     timeslotFromArr[1],
                     timeslotFromArr[2]
                  )
               )
               const toTimeStamp = new Date(
                  date.setHours(
                     timeslotToArr[0],
                     timeslotToArr[1],
                     timeslotToArr[2]
                  )
               )
               // start + lead time < to
               const leadMiliSecs = timeslot.pickUpLeadTime * 60000
               if (now.getTime() + leadMiliSecs < toTimeStamp.getTime()) {
                  // if start + lead time > from -> set new from time
                  let slotStart
                  let slotEnd =
                     toTimeStamp.getHours() + ':' + toTimeStamp.getMinutes()
                  // if (now.getTime() + leadMiliSecs > fromTimeStamp.getTime()) {
                  //    // new start time = lead time + now
                  //    const newStartTimeStamp = new Date(
                  //       now.getTime() + leadMiliSecs
                  //    )
                  //    slotStart =
                  //       newStartTimeStamp.getHours() +
                  //       ':' +
                  //       newStartTimeStamp.getMinutes()
                  // } else {

                  // }
                  slotStart =
                     fromTimeStamp.getHours() + ':' + fromTimeStamp.getMinutes()
                  // check if date already in slots
                  const dateWithoutTime = date.toDateString()
                  const index = data.findIndex(
                     slot => slot.date === dateWithoutTime
                  )
                  const [HH, MM, SS] = timeslot.slotInterval
                     ? timeslot.slotInterval.split(':')
                     : []
                  const intervalInMinutes = Boolean(HH && MM && SS)
                     ? +HH * 60 + +MM
                     : null
                  if (index === -1) {
                     data.push({
                        date: dateWithoutTime,
                        slots: [
                           {
                              start: slotStart,
                              end: slotEnd,
                              intervalInMinutes: intervalInMinutes,
                           },
                        ],
                     })
                  } else {
                     data[index].slots.push({
                        start: slotStart,
                        end: slotEnd,
                        intervalInMinutes: intervalInMinutes,
                     })
                  }
               }
            })
         } else {
            return { status: false }
         }
      })
   })
   return { status: true, data }
}

export const generateTimeStamp = (time, date, slotTiming) => {
   let formatedTime = time.split(':')
   formatedTime =
      makeDoubleDigit(formatedTime[0]) + ':' + makeDoubleDigit(formatedTime[1])

   const currTimestamp = formatISO(new Date())
   const selectedDate = formatISO(new Date(date))
   const from = `${selectedDate.split('T')[0]}T${formatedTime}:00+${
      currTimestamp.split('+')[1]
   }`

   const to = formatISO(add(new Date(from), { minutes: slotTiming }))
   return { from, to }
}

export const getTimeSlotsValidation = (
   recurrences,
   cartFrom,
   cartTo,
   cartMileRangeId
) => {
   for (let rec in recurrences) {
      const from = new Date(cartFrom) // from
      const to = new Date(cartTo)
      const currentTime = new Date()
      const start = new Date(from.getTime() - 1000 * 60 * 60 * 24) // yesterday

      if (recurrences[rec].recurrence.validTimeSlots.length) {
         for (let timeslot of recurrences[rec].recurrence.validTimeSlots) {
            if (timeslot.validMileRange) {
               const timeslotFromArr = timeslot.from.split(':')
               const timeslotToArr = timeslot.to.split(':')
               const fromTimeStamp = new Date(from.getTime())
               fromTimeStamp.setHours(
                  timeslotFromArr[0],
                  timeslotFromArr[1],
                  timeslotFromArr[2]
               )
               const toTimeStamp = new Date(from.getTime())
               toTimeStamp.setHours(
                  timeslotToArr[0],
                  timeslotToArr[1],
                  timeslotToArr[2]
               )
               // check if cart from and to time falls within time slot
               if (
                  from.getTime() >= fromTimeStamp.getTime() &&
                  from.getTime() <= toTimeStamp.getTime() &&
                  to.getTime() <= toTimeStamp.getTime()
               ) {
                  const leadTime = timeslot.validMileRange.leadTime
                  const isDateValid =
                     currentTime.getTime() + leadTime * 60000 <= to.getTime()
                  return {
                     status: isDateValid,
                     message: isDateValid
                        ? 'Valid date and time'
                        : 'In Valid Date',
                  }
               } else {
                  if (
                     recurrences[rec].recurrence.validTimeSlots.indexOf(
                        timeslot
                     ) ==
                     recurrences[rec].recurrence.validTimeSlots.length - 1
                  ) {
                     return {
                        status: false,
                        message: 'time not valid',
                     }
                  }
               }
            }
         }
      } else {
         if (rec == recurrences.length - 1) {
            return {
               status: false,
               message: 'Time slot not available',
            }
         }
      }
   }
}

export const getOnDemandValidation = (recurrences, cartMileRangeId) => {
   for (let rec in recurrences) {
      const now = new Date() // now
      const start = new Date(now.getTime() - 1000 * 60 * 60 * 24) // yesterday

      if (recurrences[rec].recurrence.timeSlots.length) {
         const sortedTimeSlots = sortBy(recurrences[rec].recurrence.timeSlots, [
            function (slot) {
               return moment(slot.from, 'HH:mm')
            },
         ])
         for (let timeslot of sortedTimeSlots) {
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
                  now.getTime() > fromTimeStamp.getTime() &&
                  now.getTime() < toTimeStamp.getTime()
               ) {
                  const isCartMileRangeIdAvailableInTimeSlot =
                     timeslot.mileRanges.find(
                        each => each.id === cartMileRangeId
                     )
                  if (isCartMileRangeIdAvailableInTimeSlot) {
                     return {
                        status: true,
                     }
                  } else {
                     return { status: false }
                  }
               } else {
                  const timeslotIndex =
                     recurrences[rec].recurrence.timeSlots.indexOf(timeslot)
                  const timesSlotsLength =
                     recurrences[rec].recurrence.timeSlots.length
                  if (timeslotIndex == timesSlotsLength - 1) {
                     return {
                        status: false,
                        message:
                           'Sorry, We do not offer Delivery at this time.',
                     }
                  }
               }
            }
         }
      }
   }
}

export const getPickupTimeSlotValidation = (
   recurrences,
   cartFrom,
   cartTo,
   cartTimeSlotId
) => {
   for (let rec in recurrences) {
      const from = new Date(cartFrom) // from
      const to = new Date(cartTo)
      const currentTime = new Date()
      const start = new Date(from.getTime() - 1000 * 60 * 60 * 24) // yesterday

      if (recurrences[rec].recurrence.timeSlots.length) {
         const timeslot = recurrences[rec].recurrence.timeSlots.find(
            eachTimeSlot => eachTimeSlot.id === cartTimeSlotId
         )
         if (timeslot) {
            const timeslotFromArr = timeslot.from.split(':')
            const timeslotToArr = timeslot.to.split(':')
            const fromTimeStamp = new Date(from.getTime())
            fromTimeStamp.setHours(
               timeslotFromArr[0],
               timeslotFromArr[1],
               timeslotFromArr[2]
            )
            const toTimeStamp = new Date(from.getTime())
            toTimeStamp.setHours(
               timeslotToArr[0],
               timeslotToArr[1],
               timeslotToArr[2]
            )
            // check if cart from and to time falls within time slot
            if (
               from.getTime() >= fromTimeStamp.getTime() &&
               from.getTime() <= toTimeStamp.getTime() &&
               to.getTime() <= toTimeStamp.getTime()
            ) {
               const leadTime = timeslot.pickUpLeadTime
               const isDateValid =
                  currentTime.getTime() + leadTime * 60000 <= to.getTime()
               return {
                  status: isDateValid,
                  message: isDateValid
                     ? 'Valid date and time'
                     : 'In Valid Date',
               }
            }
         } else {
            if (rec == recurrences.length - 1) {
               return {
                  status: false,
                  message: 'Time slot not available1',
               }
            }
         }
      } else {
         if (rec == recurrences.length - 1) {
            return {
               status: false,
               message: 'Time slot not available',
            }
         }
      }
   }
}

export const getOndemandPickupTimeValidation = (
   recurrences,
   cartTimeSlotId
) => {
   for (let rec in recurrences) {
      const now = new Date() // now
      const start = new Date(now.getTime() - 1000 * 60 * 60 * 24) // yesterday

      if (recurrences[rec].recurrence.timeSlots.length) {
         const timeslot = recurrences[rec].recurrence.timeSlots.find(
            eachTimeSlot => eachTimeSlot.id === cartTimeSlotId
         )
         if (timeslot) {
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
            if (
               now.getTime() >= fromTimeStamp.getTime() &&
               now.getTime() <= toTimeStamp.getTime()
            ) {
               const prepTime = timeslot.pickUpPrepTime
               const isDateValid =
                  now.getTime() + prepTime * 60000 <= toTimeStamp.getTime()
               return {
                  status: isDateValid,
                  message: isDateValid ? 'Valid date and time' : 'Invalid Date',
               }
            }
         } else {
            if (rec == recurrences.length - 1) {
               return {
                  status: false,
                  message: 'Time slot not available',
               }
            }
         }
      } else {
         if (rec == recurrences.length - 1) {
            return {
               status: false,
               message: 'Time slot not available',
            }
         }
      }
   }
}
