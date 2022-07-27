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
import { SafeAreaView } from 'react-native-safe-area-context'
import { Spinner } from '../../assets/loaders'
import CustomBackdrop from '../../components/modalBackdrop'
import useGlobalStyle from '../../globalStyle'
import { gql, useQuery } from '@apollo/client'

const CartScreen = () => {
   const { globalStyle } = useGlobalStyle()
   const navigation = useNavigation()
   const { isAuthenticated } = useUser()
   const {
      cartState,
      combinedCartItems,
      isFinalCartLoading,
      storedCartId,
      totalCartItems,
   } = useCart()

   useEffect(() => {
      if (isAuthenticated) {
         loginPopUp?.current?.dismiss()
      }
   }, [isAuthenticated])

   const loginPopUp = createRef()

   const { data: { carts = [] } = {} } = useQuery(
      GET_FULFILLMENT_CUSTOMER_ADDRESS,
      {
         variables: {
            where: {
               id: {
                  _eq: storedCartId,
               },
            },
         },
      }
   )

   if (
      isFinalCartLoading ||
      (totalCartItems > 0 &&
         (combinedCartItems === null || combinedCartItems?.length === 0))
   )
      return (
         <SafeAreaView style={{ flex: 1 }}>
            <CartHeader />
            <Spinner size="large" showText={true} />
         </SafeAreaView>
      )

   if (
      storedCartId === null ||
      isEmpty(cartState?.cart) ||
      combinedCartItems === null ||
      combinedCartItems?.length === 0
   ) {
      return (
         <SafeAreaView style={{ flex: 1 }}>
            <CartHeader />
            <EmptyCart />
            <View style={{ bottom: 110, position: 'absolute', width: '100%' }}>
               <Button
                  buttonStyle={styles.orderNowButtonStyle}
                  textStyle={[
                     styles.orderNowTextStyle,
                     { fontFamily: globalStyle.font.medium },
                  ]}
                  onPress={() => {
                     navigation.navigate('Menu')
                  }}
               >
                  Order Now
               </Button>
            </View>
         </SafeAreaView>
      )
   }

   return (
      <SafeAreaView
         style={{
            position: 'relative',
            height: '100%',
            backgroundColor: '#ffffff',
         }}
      >
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
               textStyle={[styles.buttonText]}
               disabled={
                  isAuthenticated &&
                  (!carts?.[0]?.fulfillmentInfo ||
                     !(
                        carts?.[0]?.customerInfo?.customerFirstName?.length &&
                        carts?.[0]?.customerInfo?.customerPhone?.length
                     ) ||
                     !carts?.[0]?.address)
               }
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
            snapPoints={[200]}
            index={0}
            enablePanDownToClose={true}
            handleComponent={() => null}
            backdropComponent={CustomBackdrop}
         >
            <LoginPopUp navigation={navigation} loginPopUp={loginPopUp} />
         </BottomSheetModal>
      </SafeAreaView>
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

      marginBottom: 12,
   },
   loginPopUpDescription: {
      fontSize: 12,
      lineHeight: 12,
      marginBottom: 12,
   },
   loginPopUpButton: {
      width: '80%',
      paddingVertical: 4,
   },
})

const LoginPopUp = ({ navigation, loginPopUp }) => {
   const { globalStyle } = useGlobalStyle()
   return (
      <View style={styles.loginPopUp}>
         <Text
            style={[
               styles.loginPopUpHeading,
               { fontFamily: globalStyle.font.semibold },
            ]}
         >
            Almost There
         </Text>
         <Text
            style={[
               styles.loginPopUpDescription,
               {
                  fontFamily: globalStyle.font.semibold,
                  color: globalStyle.color.grey,
               },
            ]}
         >
            Login to place your Order
         </Text>
         <Button
            onPress={() => {
               loginPopUp?.current?.dismiss()
               navigation.navigate('Login')
            }}
            buttonStyle={styles.loginPopUpButton}
         >
            Login
         </Button>
      </View>
   )
}

const GET_FULFILLMENT_CUSTOMER_ADDRESS = gql`
   query cart($where: order_cart_bool_exp!) {
      carts(where: $where) {
         id
         customerInfo
         fulfillmentInfo
         address
      }
   }
`
