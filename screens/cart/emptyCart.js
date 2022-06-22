import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import EmptyCartIcon from '../../assets/emptyCart'
import appConfig from '../../brandConfig.json'
export const EmptyCart = () => {
   return (
      <View style={styles.emptyCartContainer}>
         <View style={styles.messages}>
            <Text style={styles.emptyCartMessage}>
               Oops! Your cart is empty.
            </Text>
            <Text style={styles.emptyCartCustomMessage}>
               {appConfig.brandSettings.cartSettings?.customEmptyMessage?.value}
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
      fontWeight: '600',
   },
   emptyCartCustomMessage: {
      color: '#a2a2a2',
      fontSize: 14,
      fontWeight: '500',
   },
})