import React, { useEffect, useState } from 'react'

import { Text, View } from 'react-native'

export const MAKE_TIME_READABLE = seconds => {
   if (seconds <= 0) return '00:00'
   let minutes = Math.floor(seconds / 60)
   let remainingSeconds = seconds - minutes * 60

   if (remainingSeconds < 10)
      remainingSeconds = '0' + remainingSeconds.toString()
   if (minutes < 10) minutes = '0' + minutes.toString()

   return `${minutes}:${remainingSeconds}`
}

const Timer = ({ seconds, renderComponent, onTimeZero }) => {
   const [timeLeft, setTimeLeft] = useState(seconds)
   useEffect(() => {
      const countDown =
         timeLeft > 0
            ? setInterval(() => setTimeLeft(timeLeft - 1), 1000)
            : onTimeZero()
      return () => clearInterval(countDown)
   }, [timeLeft])

   if (renderComponent) {
      return renderComponent(timeLeft)
   }
   return <Text>{MAKE_TIME_READABLE(timeLeft)}</Text>
}

export default Timer
