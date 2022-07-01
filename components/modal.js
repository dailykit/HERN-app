import { useEffect, useRef, useState } from 'react'
import {
   View,
   StyleSheet,
   TouchableWithoutFeedback,
   TouchableHighlight,
   Animated,
} from 'react-native'

const Modal = ({ closeOnClickOutside, children, visible, onClose }) => {
   const opacity = useRef(new Animated.Value(0)).current
   const [display, setDisplay] = useState(visible ? 'flex' : 'none')

   const closeModal = () => {
      onClose && onClose()
   }

   useEffect(() => {
      if (visible) {
         setDisplay('flex')
      }
      Animated.timing(opacity, {
         toValue: visible ? 1 : 0,
         useNativeDriver: true,
         duration: 500,
      }).start(() => {
         !visible && setDisplay('none')
      })
   }, [visible])

   return (
      <Animated.View
         style={[
            {
               display: display,
               width: '100%',
               height: '100%',
               position: 'absolute',
               opacity: opacity,
            },
         ]}
      >
         <TouchableWithoutFeedback
            onPress={() => {
               closeOnClickOutside !== undefined &&
                  closeOnClickOutside &&
                  closeModal()
            }}
            style={[styles.modalContainer]}
         >
            <View style={[styles.modalContainer]}>
               <TouchableHighlight
                  style={{
                     width: '100%',
                     display: 'flex',
                     justifyContent: 'center',
                     alignItems: 'center',
                  }}
               >
                  <View style={styles.modalBody}>{children}</View>
               </TouchableHighlight>
            </View>
         </TouchableWithoutFeedback>
      </Animated.View>
   )
}

export default Modal

const styles = StyleSheet.create({
   modalContainer: {
      height: '100%',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.8)',
   },
   modalBody: {
      display: 'flex',
      backgroundColor: '#fff',
      justifyContent: 'center',
      alignItems: 'center',
      width: '90%',
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderWidth: 0.3,
      borderColor: 'grey',
      borderRadius: 10,
   },
})
