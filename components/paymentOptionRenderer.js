import React, { useEffect } from 'react'
import {
   StyleSheet,
   View,
   Text,
   TouchableOpacity,
   ScrollView,
} from 'react-native'
import { useMutation, useSubscription } from '@apollo/client'
import { isEmpty } from 'lodash'
// import { useToasts } from 'react-toast-notifications'
// import { AddCard } from './components'
import { usePayment } from '../lib/payment'
import { useConfig } from '../lib/config'
import * as Icon from '../assets/paymentIcons'
import RadioIcon from '../assets/radioIcon'
import { HelperBar } from '../components/helperBar'
import PayButton from '../components/payButton'
import { useUser } from '../context/user'
import * as QUERIES from '../graphql'
import { formatCurrency, get_env } from '../utils'
import { CardsLoader } from '../assets/loaders'

export default function PaymentOptionsRenderer({
   cartId,
   amount,
   availablePaymentOptionIds,
   metaData,
   onPaymentSuccess,
   onPaymentCancel,
}) {
   const { appConfig } = useConfig()
   const { setPaymentInfo, paymentInfo, updatePaymentState } = usePayment()
   const { user } = useUser()
   const [isLoading, setIsLoading] = React.useState(true)

   // Setting onSuccess and onCancel callbacks in Payment provider state
   useEffect(() => {
      if (onPaymentSuccess && typeof onPaymentSuccess === 'function') {
         updatePaymentState({
            onPaymentSuccessCallback: onPaymentSuccess,
         })
      }
      if (onPaymentCancel && typeof onPaymentCancel === 'function') {
         updatePaymentState({
            onPaymentCancelCallback: onPaymentCancel,
         })
      }
   }, [onPaymentSuccess, onPaymentCancel])

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
         onSubscriptionData: data => {},
      })
   } else {
      var {
         loading,
         error,
         data: { availablePaymentOptions = [] } = {},
      } = useSubscription(QUERIES.GET_AVAILABLE_PAYMENT_OPTIONS, {
         variables: {
            ids: availablePaymentOptionIds,
         },
         onSubscriptionData: data => {
            console.log('==> Payment option renderer: ', data)
         },
      })
   }

   // update cart mutation
   const [updateCart] = useMutation(QUERIES.UPDATE_CART, {
      onError: error => {
         console.log(error)
      },
   })

   // update cartPayment mutation
   const [updateCartPayments] = useMutation(QUERIES.UPDATE_CART_PAYMENTS, {
      onError: error => {
         console.log(error)
      },
   })

   const showPaymentIcon = label => {
      let icon = null
      if (['Debit/Credit Card', 'Debit/Credit Cards'].includes(label)) {
         icon = <Icon.DebitCardIcon size={48} />
      } else if (label === 'Netbanking') {
         icon = <Icon.NetbankingIcon size={48} />
      } else if (label === 'Paytm') {
         icon = <Icon.PaytmIcon size={48} />
      } else if (label === 'UPI') {
         icon = <Icon.UpiIcon size={48} />
      }
      return icon
   }

   const onPaymentMethodChange = async id => {
      console.log('==> Payment Option Changed!')
      if (id) {
         let availablePaymentOption
         if (cartId) {
            availablePaymentOption = cart.availablePaymentOptionToCart.find(
               option => option.id === id
            )
         } else {
            availablePaymentOption = availablePaymentOptions.find(
               option => option.id === id
            )
         }
         if (cartId) {
            await updateCartPayments({
               variables: {
                  where: {
                     cartId: {
                        _eq: cartId,
                     },
                     paymentStatus: {
                        _nin: ['SUCCEEDED'],
                     },
                     isResultShown: {
                        _eq: false,
                     },
                  },
                  _set: {
                     paymentStatus: 'CANCELLED',
                     isResultShown: true,
                  },
               },
            })
            await updateCart({
               variables: {
                  id: cartId,
                  _set: {
                     toUseAvailablePaymentOptionId: id,
                  },
               },
            })
         }
         setPaymentInfo({
            selectedAvailablePaymentOption: {
               ...paymentInfo?.selectedAvailablePaymentOption,
               ...availablePaymentOption,
            },
         })
      }
   }

   const toggleTunnel = value => {
      setPaymentInfo({
         tunnel: {
            isVisible: value,
         },
      })
   }

   if (cartId) {
      React.useEffect(() => {
         if (!isEmpty(cart) && !loading) {
            setIsLoading(false)
         }
      }, [loading, cart])
   }

   return (
      <View style={styles.Wrapper}>
         <Text style={styles.heading}>Select Payment Mode</Text>
         {(cartId ? isLoading || loading : loading) ? (
            <CardsLoader />
         ) : (
            <View
               style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
               }}
            >
               <ScrollView style={{ width: '100%' }}>
                  {cartId ? (
                     !isLoading &&
                     !isEmpty(cart) && (
                        <>
                           {cart.availablePaymentOptionToCart.length > 0 ? (
                              cart.availablePaymentOptionToCart.map(option => (
                                 <PaymentOptionCard
                                    key={option?.id}
                                    title={
                                       option?.label ||
                                       option?.supportedPaymentOption
                                          ?.paymentOptionLabel
                                    }
                                    isSelected={
                                       paymentInfo
                                          ?.selectedAvailablePaymentOption
                                          ?.id === option?.id
                                    }
                                    description={option?.description || ''}
                                    icon={showPaymentIcon(option?.label)}
                                    onClick={() =>
                                       onPaymentMethodChange(option?.id)
                                    }
                                    paymentInfo={paymentInfo}
                                    balanceToPay={
                                       cart?.cartOwnerBilling?.balanceToPay
                                    }
                                    cartId={cartId}
                                    isLoginRequired={
                                       option?.supportedPaymentOption
                                          ?.isLoginRequired
                                    }
                                    canShowWhileLoggedIn={
                                       option?.supportedPaymentOption
                                          ?.canShowWhileLoggedIn
                                    }
                                 />
                              ))
                           ) : (
                              <View style={styles.Main}>
                                 <HelperBar type="info">
                                    <HelperBar.Title>
                                       Looks like this cart does not have any
                                       available payment options.
                                    </HelperBar.Title>
                                 </HelperBar>
                              </View>
                           )}
                        </>
                     )
                  ) : availablePaymentOptions.length > 0 ? (
                     availablePaymentOptions.map(option => (
                        <PaymentOptionCard
                           key={option?.id}
                           setPaymentTunnelOpen={setPaymentTunnelOpen}
                           title={
                              option?.label ||
                              option?.supportedPaymentOption?.paymentOptionLabel
                           }
                           isSelected={
                              paymentInfo?.selectedAvailablePaymentOption
                                 ?.id === option?.id
                           }
                           description={option?.description || ''}
                           icon={showPaymentIcon(option?.label)}
                           onClick={() => onPaymentMethodChange(option?.id)}
                           paymentInfo={paymentInfo}
                           balanceToPay={amount}
                           isLoginRequired={
                              option?.supportedPaymentOption?.isLoginRequired
                           }
                           canShowWhileLoggedIn={
                              option?.supportedPaymentOption
                                 ?.canShowWhileLoggedIn
                           }
                           metaData={metaData}
                        />
                     ))
                  ) : (
                     <View style={styles.Main}>
                        <div tw="pt-4 w-full">
                           <HelperBar type="info">
                              <HelperBar.Title>
                                 No payment options available.
                              </HelperBar.Title>
                           </HelperBar>
                        </div>
                     </View>
                  )}
               </ScrollView>
               {paymentInfo?.selectedAvailablePaymentOption
                  ?.supportedPaymentOption?.supportedPaymentCompany.label !==
                  'stripe' && (
                  <PayButton
                     cartId={cartId}
                     balanceToPay={cart?.cartOwnerBilling?.balanceToPay}
                     metaData={metaData}
                     style={{
                        ...styles.payButton,
                        backgroundColor:
                           appConfig?.brandSettings?.buttonSettings
                              ?.buttonBGColor?.value || '#222222',
                     }}
                  >
                     <Text
                        style={{
                           ...styles.payButton.text,
                           color:
                              appConfig?.brandSettings?.buttonSettings
                                 ?.textColor?.value || '#ffffff',
                        }}
                     >
                        Pay Now
                     </Text>
                  </PayButton>
               )}
               {paymentInfo?.selectedAvailablePaymentOption
                  ?.supportedPaymentOption?.supportedPaymentCompany.label ===
                  'stripe' &&
                  false &&
                  user?.platform_customer?.paymentMethods.length > 0 && (
                     <OutlineButton onClick={() => toggleTunnel(true)}>
                        Add New Card
                     </OutlineButton>
                  )}
            </View>
         )}
      </View>
   )
}

const PaymentOptionCard = ({
   title = '',
   icon = '',
   description = '',
   isSelected = false,
   onClick = () => null,
   balanceToPay = 0,
   cartId = null,
   isLoginRequired = false,
   canShowWhileLoggedIn = true,
   setPaymentTunnelOpen,
   metaData = {},
}) => {
   const { appConfig } = useConfig()
   const { isAuthenticated } = true
   const { setPaymentInfo, paymentInfo } = usePayment()

   if (!isAuthenticated && isLoginRequired) {
      return null
   }
   if (isAuthenticated && !canShowWhileLoggedIn) {
      return null
   }
   return (
      <TouchableOpacity onPress={onClick} style={styles.paymentOptionContainer}>
         <Text style={styles.paymentOptionCardHeader}>{title}</Text>
         <View style={styles.paymentOptionCard}>
            {icon}
            <View style={{ marginHorizontal: 8 }}>
               <Text style={styles.paymentOptionCardTitle}>{title}</Text>
               {description ? (
                  <Text style={styles.paymentOptionCardDescription}>
                     {description}
                  </Text>
               ) : null}
            </View>
            <View style={{ marginLeft: 'auto' }}>
               <RadioIcon
                  checked={isSelected}
                  stroke={
                     isSelected
                        ? appConfig?.brandSettings?.checkIconSettings
                             ?.checkIconFillColor?.value
                        : appConfig?.brandSettings?.checkIconSettings
                             ?.boundaryColor?.value
                  }
               />
            </View>
         </View>
      </TouchableOpacity>
   )
}

const styles = StyleSheet.create({
   Wrapper: {
      padding: 0,
   },
   Main: {
      display: 'flex',
      paddingVertical: 0,
      paddingHorizontal: 16,
      marginBottom: 24,
   },
   StyledWrapper: {
      display: 'flex',
      flexDirection: 'column',
   },
   OutlineButton: {
      backgroundColor: 'green',
      borderRadius: 10,
      color: '#38a169',
      paddingHorizontal: 4,
   },
   payButton: {
      paddingVertical: 10,
      width: '80%',
      borderRadius: 8,
      text: {
         textAlign: 'center',
      },
      marginTop: 15,
   },
   heading: {
      textAlign: 'center',
      marginVertical: 24,
      fontWeight: '500',
      fontSize: 24,
      lineHeight: 24,
      color: '#000000',
   },
   paymentOptionContainer: {
      display: 'flex',
      flexDirection: 'column',
      margin: 10,
   },
   paymentOptionCard: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 0.3,
      borderStyle: 'solid',
      borderColor: '#A2A2A2',
      borderRadius: 6,
      padding: 10,
   },
   paymentOptionCardHeader: {
      fontSize: 12,
      lineHeight: 14,
      color: 'rgba(0, 0, 0, 0.8)',
      margin: 2,
   },
   paymentOptionCardTitle: {
      fontSize: 16,
      lineHeight: 18,
      color: '#000',
   },
   paymentOptionCardDescription: {
      fontSize: 11,
      lineHeight: 13,
      color: 'rgba(0, 0, 0, 0.8)',
      margin: 2,
   },
})
