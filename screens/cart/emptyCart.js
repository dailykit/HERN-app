import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import EmptyCartIcon from '../../assets/emptyCart'
import { useConfig } from '../../lib/config'
import useGlobalStyle from '../../globalStyle'

export const EmptyCart = () => {
   const { appConfig } = useConfig()
   const { globalStyle } = useGlobalStyle()
   return (
      <View style={styles.emptyCartContainer}>
         <View style={styles.messages}>
            <Text
               style={[
                  styles.emptyCartMessage,
                  { fontFamily: globalStyle.font.semibold },
               ]}
            >
               Oops! Your cart is empty.
            </Text>
            <Text
               style={[
                  styles.emptyCartCustomMessage,
                  {
                     fontFamily: globalStyle.font.medium,
                     color: globalStyle.color.grey,
                  },
               ]}
            >
               {appConfig?.brandSettings?.cartSettings?.customEmptyMessage
                  ?.value || ''}
            </Text>
         </View>
         <EmptyCartIcon />
      </View>
   )
}

const styles = StyleSheet.create({
   emptyCartContainer: {
      alignItems: 'center',
      flexDirection: 'column',
   },
   messages: {
      marginTop: 94,
      alignItems: 'center',
      flexDirection: 'column',
      marginBottom: 40,
   },
   emptyCartMessage: {
      fontSize: 20,
   },
   emptyCartCustomMessage: {
      fontSize: 14,
   },
})
