import { Animated } from 'react-native'
import { useEffect } from 'react'

export const Skeleton = ({
   width = 250,
   height = 250,
   borderRadius = 10,
   additionalStyle = {},
}) => {
   const animatedValue = new Animated.Value(0.3)

   useEffect(() => {
      Animated.loop(
         Animated.sequence([
            Animated.timing(animatedValue, {
               toValue: 1,
               duration: 500,
               useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
               toValue: 0.5,
               duration: 800,
               useNativeDriver: true,
            }),
         ])
      ).start()
   })
   return (
      <Animated.View
         style={{
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
   //    return (
   //       <View
   //          style={{
   //             width: width,
   //             height: height,
   //             backgroundColor: '#a0a0a0',
   //             margin: 20,
   //             elevation: 7,
   //             borderRadius: borderRadius,

   //          }}
   //       >
   //          <AnimatedLG
   //             colors={['#a0a0a0', '#b0b0b0', '#b0b0b0', '#a0a0a0']}
   //             style={{
   //                ...StyleSheet.absoluteFill,
   //                opacity: animatedValue,
   //                borderRadius: borderRadius,
   //             }}
   //          />
   //       </View>
   //    )
}
