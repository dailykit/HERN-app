import React, { createRef, useEffect, useRef } from 'react'
import {
   ScrollView,
   StyleSheet,
   Text,
   TouchableOpacity,
   View,
} from 'react-native'
import {
   BottomSheetModal,
   BottomSheetModalProvider,
} from '@gorhom/bottom-sheet'
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
import { UserInfo } from '../../components/userInfo'
import { useUser } from '../../context/user'

const CartScreen = () => {
   const navigation = useNavigation()
   const { isAuthenticated } = useUser()
   const { cartState, combinedCartItems, isFinalCartLoading, storedCartId } =
      useCart()

   useEffect(() => {
      if (isAuthenticated) {
         loginPopUp?.current?.dismiss()
      }
   }, [isAuthenticated])

   const loginPopUp = createRef()

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
      <View
         style={{
            position: 'relative',
            height: '100%',
            backgroundColor: '#ffffff',
         }}
      >
         <BottomSheetModalProvider>
            <CartHeader />
            <ScrollView>
               <CartItemList />
               <CartBillingDetails
                  cart={cartState.cart}
                  billing={cartState.cart.cartOwnerBilling}
               />
               {isAuthenticated && (
                  <>
                     <UserInfo cart={cartState.cart} />
                     <Address />
                     <FulfillmentSection />
                  </>
               )}
            </ScrollView>
            <View style={styles.buttonContainer}>
               <Button
                  buttonStyle={styles.button}
                  textStyle={styles.buttonText}
                  onPress={() => {
                     if (isAuthenticated) {
                        navigation.navigate('PaymentOptions')
                     } else {
                        loginPopUp.current.present()
                     }
                  }}
               >
                  Checkout
               </Button>
            </View>
            <BottomSheetModal
               ref={loginPopUp}
               snapPoints={[250]}
               index={0}
               enablePanDownToClose={true}
               handleComponent={() => null}
            >
               <LoginPopUp navigation={navigation} />
            </BottomSheetModal>
         </BottomSheetModalProvider>
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
   buttonContainer: {
      width: '100%',
      height: 70,
      backgroundColor: '#000',
      position: 'relative',
      bottom: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
   },
   button: {
      width: '80%',
      borderRadius: 0,
      paddingVertical: 6,
      marginVertical: 10,
      borderRadius: 8,
   },
   buttonText: {
      textAlign: 'center',
      fontSize: 15,
   },
   loginPopUp: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#fff',
      height: '100%',
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      borderWidth: 0.3,
      borderColor: 'grey',
   },
   loginPopUpHeading: {
      fontSize: 24,
      lineHeight: 24,
      fontWeight: '600',
      marginBottom: 12,
   },
   loginPopUpDescription: {
      fontSize: 12,
      lineHeight: 12,
      fontWeight: '600',
      color: '#A2A2A2',
      marginBottom: 12,
   },
   loginPopUpButton: {
      width: '80%',
      paddingVertical: 4,
   },
})

const LoginPopUp = ({ navigation }) => {
   return (
      <View style={styles.loginPopUp}>
         <Text style={styles.loginPopUpHeading}>Almost There</Text>
         <Text style={styles.loginPopUpDescription}>
            Login to place your Order
         </Text>
         <Button
            onPress={() => navigation.navigate('Login')}
            buttonStyle={styles.loginPopUpButton}
         >
            Login
         </Button>
         <Text style={[styles.loginPopUpDescription, { marginVertical: 8 }]}>
            or
         </Text>
         <Button
            onPress={() => navigation.navigate('Login')}
            buttonStyle={styles.loginPopUpButton}
            variant={'outline'}
         >
            SignUp
         </Button>
      </View>
   )
}
