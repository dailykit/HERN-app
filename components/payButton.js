import React, { useEffect, useState, memo } from 'react'
import {
   View,
   StyleSheet,
   Button,
   Text,
   TouchableOpacity,
   ActivityIndicator,
} from 'react-native'
import { useMutation, useSubscription } from '@apollo/client'
import isEmpty from 'lodash/isEmpty'
// import { useToasts } from 'react-toast-notifications'
import * as QUERIES from '../graphql'
import { usePayment } from '../lib/payment'
import { useConfig } from '../lib/config'
import { useUser } from '../context/user'
import appConfig from '../brandConfig.json'
import { Spinner } from '../assets/loaders'

function PayButton({
   children,
   selectedAvailablePaymentOptionId = null,
   cartId = null,
   balanceToPay = 0,
   metaData = {},
   ...props
}) {
   const {
      profileInfo,
      paymentInfo,
      setIsPaymentInitiated,
      setIsProcessingPayment,
      updatePaymentState,
      initializePayment,
      setPaymentInfo,
   } = usePayment()
   const { user } = useUser()
   //    const { addToast } = useToasts()
   const { brand } = useConfig()
   const [cartValidity, setCartValidity] = useState(null)

   // query for fetching available payment options
   if (cartId) {
      var {
         loading,
         error,
         data: { cart = {} } = {},
      } = useSubscription(QUERIES.GET_PAYMENT_OPTIONS, {
         skip: !cartId,
         variables: {
            id: cartId,
         },
      })
   }

   // update cart mutation
   const [updateCart] = useMutation(QUERIES.UPDATE_CART, {
      onError: error => {
         console.log(error)
         addToast(error.message, { appearance: 'error' })
      },
   })

   // create cartPayment mutation
   const [createCartPayment] = useMutation(QUERIES.CREATE_CART_PAYMENT, {
      onError: error => {
         console.log(error)
         addToast(error.message, { appearance: 'error' })
      },
      onCompleted: data => {
         initializePayment(null, data.createCartPayment.id)
      },
   })

   const isStripe =
      paymentInfo?.selectedAvailablePaymentOption?.supportedPaymentOption
         ?.supportedPaymentCompany?.label === 'stripe'

   const onPayClickHandler = async () => {
      console.log('==> PayButton Clicked!')
      // setPaymentTunnelOpen && setPaymentTunnelOpen(false)
      if (cartId) {
         if (
            !isEmpty(paymentInfo) &&
            cartId &&
            !isEmpty(cartValidity) &&
            cartValidity.status
         ) {
            initializePayment(cartId)

            await updateCart({
               variables: {
                  id: cartId,
                  _inc: { paymentRetryAttempt: 1 },
                  _set: {
                     ...(isStripe && {
                        paymentMethodId:
                           paymentInfo?.selectedAvailablePaymentOption
                              ?.selectedPaymentMethodId,
                     }),
                     toUseAvailablePaymentOptionId:
                        paymentInfo?.selectedAvailablePaymentOption?.id,
                  },
               },
            })
         }
      } else {
         createCartPayment({
            variables: {
               object: {
                  paymentRetryAttempt: 1,
                  amount: balanceToPay,
                  isTest: user.isTest,
                  paymentCustomerId: user.platform_customer.paymentCustomerId,
                  paymentMethodId:
                     paymentInfo?.selectedAvailablePaymentOption
                        ?.selectedPaymentMethodId,
                  usedAvailablePaymentOptionId:
                     paymentInfo.selectedAvailablePaymentOption.id,
                  metaData: { ...metaData, brandId: brand.id },
               },
            },
         })
      }
   }

   if (cartId) {
      useEffect(() => {
         if (!loading && !isEmpty(cart)) {
            setCartValidity(cart?.isCartValid)
            if (isEmpty(paymentInfo.selectedAvailablePaymentOption)) {
               setPaymentInfo({
                  selectedAvailablePaymentOption: {
                     ...paymentInfo.selectedAvailablePaymentOption,
                     ...cart.availablePaymentOptionToCart[0],
                  },
               })
            }
         }
      }, [cart, loading])
   }

   // console.log('==> Disabled ', cartId, cartValidity.status)
   return (
      <>
         {loading ? (
            <View
               style={{
                  ...styles.disabledPaymentButton,
                  marginTop: props?.style?.marginTop || 'auto',
               }}
            >
               <Text style={styles.disabledPaymentButton.text}>
                  <Spinner color={'#ffffff'} />
               </Text>
            </View>
         ) : (
            <TouchableOpacity
               onPress={onPayClickHandler}
               disabled={cartId && !cartValidity?.status}
               {...props}
            >
               {children}
            </TouchableOpacity>
         )}
      </>
   )
}
export default memo(PayButton)

const styles = StyleSheet.create({
   disabledPaymentButton: {
      width: '80%',
      borderRadius: 8,
      paddingVertical: 10,
      backgroundColor:
         `${appConfig?.brandSettings?.buttonSettings?.buttonBGColor?.value}AA` ||
         '#222222',
      text: {
         textAlign: 'center',
         color:
            appConfig?.brandSettings?.buttonSettings?.textColor?.value ||
            '#ffffff',
      },
   },
})
