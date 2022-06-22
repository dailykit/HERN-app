import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { EmptyCart } from './emptyCart'
import { Button } from '../../components/button'
import { CartHeader } from './cartHeader'
import { useNavigation } from '@react-navigation/native'
import { useCart } from '../../context'
import { isEmpty } from 'lodash'
import { CartItemList } from './cartItemList'
import { CartBillingDetails } from './cartBillingDetails'
import { Address } from './address'
import { FulfillmentSection } from './fulfillmentSection'

const CartScreen = () => {
   const navigation = useNavigation()
   const { cartState, combinedCartItems, isFinalCartLoading, storedCartId } =
      useCart()

   if (isFinalCartLoading)
      return (
         <View style={{ height: '100%' }}>
            <CartHeader />
            <Text>Loading</Text>
         </View>
      )

   if (
      storedCartId === null ||
      isEmpty(cartState?.cart) ||
      combinedCartItems === null ||
      combinedCartItems?.length === 0
   ) {
      return (
         <View style={{ height: '100%' }}>
            <CartHeader />
            <EmptyCart />
            <View style={{ bottom: 110, position: 'absolute', width: '100%' }}>
               <Button
                  buttonStyle={styles.orderNowButtonStyle}
                  textStyle={styles.orderNowTextStyle}
                  onPress={() => {
                     navigation.navigate('Menu')
                  }}
               >
                  Order Now
               </Button>
            </View>
         </View>
      )
   }

   return (
      <View style={{ height: '100%', backgroundColor: '#ffffff' }}>
         <CartHeader />
         <Address />
         <FulfillmentSection />
         <CartItemList />
         <CartBillingDetails
            cart={cartState.cart}
            billing={cartState.cart.cartOwnerBilling}
         />
      </View>
   )
}

export default CartScreen

const styles = StyleSheet.create({
   orderNowButtonStyle: {
      marginHorizontal: 45,
      height: 42,
      borderRadius: 8,
   },
   orderNowTextStyle: {
      fontSize: 18,
      fontWeight: '500',
   },
})
