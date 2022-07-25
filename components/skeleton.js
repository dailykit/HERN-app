import { Animated } from 'react-native'
import { useEffect } from 'react'

export const Skeleton = ({
   key,
   width = 250,
   height = 250,
   borderRadius = 10,
   additionalStyle = {},
}) => {
   const animatedValue = new Animated.Value(0.5)

   useEffect(() => {
      Animated.loop(
         Animated.sequence([
            Animated.timing(animatedValue, {
               toValue: 0.8,
               duration: 700,
               useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
               toValue: 0.5,
               duration: 900,
               useNativeDriver: true,
            }),
         ])
      ).start()
   })
   return (
      <Animated.View
         style={{
            key,
            opacity: animatedValue,
            borderRadius: borderRadius,
            width: width,
            height: height,
            backgroundColor: '#a0a0a0',
            elevation: 7,
            ...additionalStyle,
         }}
      />
   )
}
