// import { rrulestr } from 'rrule'
// import _ from 'lodash'
import moment from 'moment'
import { isDateValidInRRule } from '../isDateValidInRRule'
import sortBy from 'lodash/sortBy'

export const isStoreOnDemandPickupAvailable = finalRecurrences => {
   for (let rec in finalRecurrences) {
      const now = new Date() // now
      const isValidDay = isDateValidInRRule(
         finalRecurrences[rec].recurrence.rrule
      )
      const finalRecurrencesClone = JSON.parse(JSON.stringify(finalRecurrences))
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
                  finalRecurrencesClone[rec].recurrence.validTimeSlots = [
                     timeslot,
                  ]
                  return {
                     status: true,
                     rec: [finalRecurrencesClone[rec]],
                     timeSlotInfo: timeslot,
                     message: 'Store available for pickup.',
                  }
               } else {
                  if (rec == finalRecurrences.length - 1) {
                     return {
                        status: false,
                        message: 'Sorry, We do not offer Pickup at this time.',
                     }
                  }
               }
            }
         } else {
            if (rec == finalRecurrences.length - 1) {
               return {
                  status: false,
                  message: 'Sorry, We do not offer Pickup at this time.',
               }
            }
         }
      } else {
         if (rec == finalRecurrences.length - 1) {
            return {
               status: false,
               message: 'Sorry, We do not offer Pickup on this day.',
            }
         }
      }
   }
}
export const isStorePreOrderPickupAvailable = finalRecurrences => {
   return {
      status: true,
      message: 'Store available for pre order pre order pickup.',
      rec: finalRecurrences,
   }
}
