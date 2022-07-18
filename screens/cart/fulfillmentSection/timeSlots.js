import { slice, sortBy } from 'lodash'
import React from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { Button } from '../../../components/button'
import moment from 'moment'
import { generateTimeStamp } from '../../../utils'
import useGlobalStyle from '../../../globalStyle'

export const TimeSlots = ({
   availableDaySlots,
   selectedSlot,
   setSelectedSlot,
   onFulfillmentTimeClick,
}) => {
   const { globalStyle } = useGlobalStyle()
   const [showAllDates, setShowAllDates] = React.useState(true)
   const [showAllTimeSlots, setShowAllTimeSlots] = React.useState(true)

   const daySlots = React.useMemo(() => {
      return showAllDates ? availableDaySlots : slice(availableDaySlots, 0, 5)
   }, [showAllDates, availableDaySlots])

   const timeSlots = React.useMemo(() => {
      return selectedSlot
         ? showAllTimeSlots
            ? selectedSlot?.slots
            : slice(selectedSlot.slots, 0, 5)
         : null
   }, [selectedSlot, showAllTimeSlots])
   return (
      <View>
         <View>
            <Text
               style={[
                  styles.headingStyle,
                  { fontFamily: globalStyle.font.semibold },
               ]}
            >
               Select Date For Later
            </Text>
            <View>
               <ScrollView horizontal={true}>
                  {daySlots.map((eachSlot, index) => {
                     return (
                        <Button
                           key={eachSlot.date}
                           buttonStyle={{
                              marginHorizontal: 4,
                              ...(index == 0 ? { marginLeft: 0 } : {}),
                           }}
                           onPress={() => setSelectedSlot(eachSlot)}
                           variant={
                              eachSlot === selectedSlot ? 'primary' : 'outline'
                           }
                        >
                           {moment(eachSlot.date).format('DD MMM YY')}
                        </Button>
                     )
                  })}
               </ScrollView>
            </View>
         </View>
         {selectedSlot ? (
            <View>
               <Text
                  style={[
                     styles.headingStyle,
                     { fontFamily: globalStyle.font.semibold },
                  ]}
               >
                  Select Time
               </Text>
               <ScrollView horizontal={true}>
                  {sortBy(timeSlots, [
                     function (slot) {
                        return moment(slot.time, 'HH:mm')
                     },
                  ]).map((eachSlot, index, elements) => {
                     const slot = {
                        from: eachSlot.time,
                        to: moment(eachSlot.time, 'HH:mm')
                           .add(eachSlot.intervalInMinutes, 'm')
                           .format('HH:mm'),
                     }

                     const handleOnTimeSlotClick = () => {
                        const newTimeStamp = generateTimeStamp(
                           eachSlot.time,
                           selectedSlot.date,
                           eachSlot.intervalInMinutes
                        )
                        onFulfillmentTimeClick(
                           newTimeStamp,
                           eachSlot.mileRangeId
                        )
                     }
                     return (
                        <Button
                           key={`${eachSlot}-${index}`}
                           buttonStyle={{
                              marginHorizontal: 4,
                              ...(index == 0 ? { marginLeft: 0 } : {}),
                           }}
                           variant={'outline'}
                           onPress={handleOnTimeSlotClick}
                        >
                           {slot.from}
                           {'-'}
                           {slot.to}
                        </Button>
                     )
                  })}
               </ScrollView>
            </View>
         ) : null}
      </View>
   )
}

const styles = StyleSheet.create({
   headingStyle: {
      color: '#00000060',
      marginVertical: 6,
   },
})
