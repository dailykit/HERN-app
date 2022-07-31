import React, { useState, useEffect } from 'react'
import isEmpty from 'lodash/isEmpty'
// import Countdown from 'react-countdown'
import { formatCurrency } from '../utils'
import { useConfig } from '../lib/config'
import { StyleSheet, View, Text, Image } from 'react-native'
import { Button } from '../components/button'
import Modal from '../components/modal'
import useGlobalStyle from '../globalStyle'
import Timer, { MAKE_TIME_READABLE } from '../components/timer'

const PaymentProcessingModal = ({
   isOpen,
   cartPayment,
   cartId,
   PaymentOptions,
   showWebView,
   closeModal = () => null,
   normalModalClose = () => null,
   cancelPayment = () => null,
   cancelTerminalPayment = () => null,
   resetPaymentProviderStates = () => null,
   setIsProcessingPayment = () => null,
   setIsPaymentInitiated = () => null,
}) => {
   const { globalStyle } = useGlobalStyle()
   const [countDown, setCountDown] = useState(null)
   //    const { t } = useTranslation()

   const closeModalHandler = async () => {
      await closeModal()
      // await resetPaymentProviderStates()
   }
   const resetStateAfterModalClose = async ({ showChoosePayment = false }) => {
      await closeModal()
      await resetPaymentProviderStates()
      if (showChoosePayment) {
         setIsProcessingPayment(true)
         setIsPaymentInitiated(true)
      }
   }

   const stopCelebration = async () => {
      await closeModalHandler()
      setIsProcessingPayment(false)
      setIsPaymentInitiated(false)
   }

   const startCelebration = () => {
      setTimeout(async () => {
         await stopCelebration()
      }, 5000)
   }

   const ShowPaymentStatusInfo = status => {
      let cartPayment = { paymentStatus: status }
      let icon = (
         <Image
            source={require('../assets/gifs/paymentProcessing.gif')}
            style={styles.paymentStatusLoader}
         />
      )

      let title = (
         <Text
            style={{
               ...styles.modalTitle,
               fontFamily: globalStyle.font.medium,
            }}
         >
            Processing your payment
         </Text>
      )
      let subtitle = (
         <View style={styles.modalSubtitleBlock}>
            <Text
               style={[
                  styles.modalSubtitle,
                  {
                     fontFamily: globalStyle.font.medium,
                     color: globalStyle.color.grey,
                  },
               ]}
            >
               Please wait while we process your payment.
            </Text>
            <Text
               style={[
                  styles.modalSubtitle,
                  {
                     fontFamily: globalStyle.font.medium,
                     color: globalStyle.color.grey,
                  },
               ]}
            >
               Please do not press back button or close the app
            </Text>
            <Text
               style={[
                  styles.modalSubtitle,
                  {
                     fontFamily: globalStyle.font.medium,
                     color: globalStyle.color.grey,
                  },
               ]}
            >
               You'll be automatically redirected.
            </Text>
         </View>
      )
      let extra = null
      if (cartPayment?.paymentStatus === 'SUCCEEDED') {
         icon = (
            <Image
               source={require('../assets/gifs/successful.gif')}
               style={styles.paymentStatusLoader}
            />
         )
         title = (
            <Text
               style={{
                  ...styles.modalTitle,
                  fontFamily: globalStyle.font.medium,
               }}
            >
               Successfully placed your order
            </Text>
         )
         subtitle = (
            <Text
               style={[
                  styles.modalSubtitle,
                  styles.modalSubtitleBlock,
                  {
                     fontFamily: globalStyle.font.medium,
                     color: globalStyle.color.grey,
                  },
               ]}
            >
               You will be redirected to your booking page shortly
            </Text>
         )
      } else if (cartPayment?.paymentStatus === 'REQUIRES_ACTION') {
         icon = (
            <Image
               source={require('../assets/gifs/authentication.gif')}
               style={styles.paymentStatusLoader}
            />
         )
         title = (
            <Text
               style={{
                  ...styles.modalTitle,
                  fontFamily: globalStyle.font.medium,
               }}
            >
               Looks like your card requires authentication
            </Text>
         )
         subtitle = (
            <Text
               style={[
                  styles.modalSubtitle,
                  styles.modalSubtitleBlock,
                  {
                     fontFamily: globalStyle.font.medium,
                     color: globalStyle.color.grey,
                  },
               ]}
            >
               An additional verification step which direct you to an
               authentication page on your bank’s website
            </Text>
         )
         extra = [
            <Button
               buttonStyle={styles.authenticateBtn}
               key={'authenticate'}
               //    href={cartPayment?.actionUrl}
            >
               Authenticate Here
            </Button>,
            <Button
               key={'cancelPayment'}
               onPress={cancelPayment}
               variant={'outline'}
               buttonStyle={styles.cancelPaymentBtn}
            >
               Cancel Payment
            </Button>,
         ]
      } else if (cartPayment?.paymentStatus === 'FAILED') {
         icon = (
            <Image
               source={require('../assets/gifs/payment_fail.gif')}
               style={styles.paymentStatusLoader}
            />
         )
         title = (
            <Text
               style={{
                  ...styles.modalTitle,
                  fontFamily: globalStyle.font.medium,
               }}
            >
               Payment Failed
            </Text>
         )
         subtitle = (
            <Text
               style={[
                  styles.modalSubtitle,
                  styles.modalSubtitleBlock,
                  {
                     fontFamily: globalStyle.font.medium,
                     color: globalStyle.color.grey,
                  },
               ]}
            >
               Something went wrong
            </Text>
         )
         extra = [
            <Button
               buttonStyle={styles.tryOtherPayment}
               onPress={resetStateAfterModalClose}
               key={'tryOtherPaymentMethod'}
            >
               Try other payment method
            </Button>,
         ]
      } else if (cartPayment?.paymentStatus === 'CANCELLED') {
         icon = (
            <Image
               source={require('../assets/gifs/payment_fail.gif')}
               style={styles.paymentStatusLoader}
            />
         )
         title = (
            <Text
               style={{
                  ...styles.modalTitle,
                  fontFamily: globalStyle.font.medium,
               }}
            >
               Payment Cancelled
            </Text>
         )
         subtitle = (
            <Text
               style={[
                  styles.modalSubtitle,
                  styles.modalSubtitleBlock,
                  {
                     fontFamily: globalStyle.font.medium,
                     color: globalStyle.color.grey,
                  },
               ]}
            >
               You cancelled your payment process
            </Text>
         )
         extra = [
            <Button
               buttonStyle={styles.tryOtherPayment}
               onPress={resetStateAfterModalClose}
               key={'tryOtherPaymentMethod'}
            >
               Try other payment method
            </Button>,
         ]
      } else if (cartPayment?.paymentStatus === 'REQUIRES_PAYMENT_METHOD') {
         icon = (
            <Image
               source={require('../assets/gifs/payment_fail.gif')}
               style={styles.paymentStatusLoader}
            />
         )
         title = (
            <Text
               style={{
                  ...styles.modalTitle,
                  fontFamily: globalStyle.font.medium,
               }}
            >
               Payment Failed
            </Text>
         )
         subtitle = (
            <Text
               style={[
                  styles.modalSubtitle,
                  styles.modalSubtitleBlock,
                  {
                     fontFamily: globalStyle.font.medium,
                     color: globalStyle.color.grey,
                  },
               ]}
            >
               Your payment is failed since your bank doesn't authenticate you
            </Text>
         )
         extra = [
            <Button
               buttonStyle={styles.tryOtherPayment}
               onPress={resetStateAfterModalClose}
               key={'tryOtherPaymentMethod'}
            >
               Try other payment method
            </Button>,
         ]
      }

      return {
         icon,
         title,
         subtitle,
         extra,
      }
   }

   useEffect(() => {
      if (!isEmpty(cartPayment)) {
         // start celebration (confetti effect) once payment is successful
         if (cartPayment?.paymentStatus === 'SUCCEEDED') {
            startCelebration()
         } else if (
            // start the timeout to cancel the payment if payment is not successful/cancelled/failed/QR_GENERATED
            !['SUCCEEDED', 'FAILED', 'CANCELLED', 'QR_GENERATED'].includes(
               cartPayment?.paymentStatus
            )
         ) {
            setCountDown(2 * 60)
         }
      }
   }, [cartPayment?.paymentStatus])

   // resetting countdown timer when payment status changes
   useEffect(() => {
      setCountDown(2 * 60)
   }, [cartPayment?.paymentStatus])

   return (
      <Modal closeOnClickOutside={false} visible={isOpen} onClose={closeModal}>
         {ShowPaymentStatusInfo(cartPayment?.paymentStatus).icon}
         {cartPayment?.paymentStatus === 'SUCCEEDED' &&
         cartPayment?.metaData?.paymentFor === 'walletTopUp' ? (
            <Text
               style={{
                  ...styles.modalTitle,
                  fontFamily: globalStyle.font.medium,
               }}
            >
               Successfully top-up your wallet
            </Text>
         ) : (
            <>
               {ShowPaymentStatusInfo(cartPayment?.paymentStatus).title}
               {ShowPaymentStatusInfo(cartPayment?.paymentStatus).subtitle}
            </>
         )}
         {ShowPaymentStatusInfo(cartPayment?.paymentStatus).extra}
         {!showWebView &&
            !isEmpty(cartPayment) &&
            !['SUCCEEDED', 'FAILED', 'CANCELLED', 'QR_GENERATED'].includes(
               cartPayment?.paymentStatus
            ) &&
            countDown && (
               <Timer
                  seconds={countDown}
                  onTimeZero={() => {
                     cancelPayment()
                  }}
                  renderComponent={seconds => {
                     return (
                        <Text
                           style={{
                              width: '100%',
                              textAlign: 'center',
                              fontFamily: 'MetropolisMedium',
                              fontSize: 11,
                           }}
                        >
                           Timeout in {MAKE_TIME_READABLE(seconds)}
                        </Text>
                     )
                  }}
               />
            )}
      </Modal>
   )
}

export default PaymentProcessingModal

const styles = StyleSheet.create({
   modalTitle: {
      fontSize: 14,
      lineHeight: 25,
      marginBottom: 3,
      textAlign: 'center',
   },
   modalSubtitleBlock: {
      marginBottom: 8,
   },
   modalSubtitle: {
      fontSize: 11,
      lineHeight: 13,

      textAlign: 'center',
   },
   paymentStatusLoader: {
      width: 100,
      height: 100,
   },
   authenticateBtn: {
      marginBottom: 8,
      width: '70%',
   },
   tryOtherPayment: {
      backgroundColor: 'green',
   },
   cancelPaymentBtn: {
      width: '70%',
   },
})
