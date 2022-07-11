import React, { useMemo } from 'react'
import Animated, {
   Extrapolate,
   interpolate,
   useAnimatedStyle,
} from 'react-native-reanimated'

const CustomBackdrop = ({ animatedIndex, style }) => {
   // animated variables
   const containerAnimatedStyle = useAnimatedStyle(() => ({
      opacity: interpolate(
         animatedIndex.value,
         [0, 0],
         [0.5, 0.5],
         Extrapolate.CLAMP
      ),
   }))

   // styles
   const containerStyle = useMemo(
      () => [
         style,
         {
            backgroundColor: '#00000080',
         },
         containerAnimatedStyle,
      ],
      [style, containerAnimatedStyle]
   )

   return <Animated.View style={containerStyle} />
}

export default CustomBackdrop
