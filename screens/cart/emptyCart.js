import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import EmptyCartIcon from '../../assets/emptyCart'
import { useConfig } from '../../lib/config'
import useGlobalCss from '../../globalStyle'

export const EmptyCart = () => {
   const { appConfig } = useConfig()
   const { globalCss } = useGlobalCss()
   return (
      <View style={styles.emptyCartContainer}>
         <View style={styles.messages}>
            <Text
               style={[
                  styles.emptyCartMessage,
                  { fontFamily: globalCss.font.medium },
               ]}
            >
               Oops! Your cart is empty.
            </Text>
            <Text
               style={[
                  styles.emptyCartCustomMessage,
                  {
                     fontFamily: globalCss.font.medium,
                     color: globalCss.color.grey,
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
