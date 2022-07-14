import React, { useState, useEffect } from 'react'
import isEmpty from 'lodash/isEmpty'
// import Countdown from 'react-countdown'
import { formatCurrency } from '../utils'
import { useConfig } from '../lib/config'
import { StyleSheet, View, Text, Image } from 'react-native'
import { Button } from '../components/button'
import Modal from '../components/modal'

const PaymentProcessingModal = ({
   isOpen,
   cartPayment,
   cartId,
   PaymentOptions,
   closeModal = () => null,
   normalModalClose = () => null,
   cancelPayment = () => null,
   cancelTerminalPayment = () => null,
   resetPaymentProviderStates = () => null,
   setIsProcessingPayment = () => null,
   setIsPaymentInitiated = () => null,
}) => {
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

      let title = <Text style={styles.modalTitle}>Processing your payment</Text>
      let subtitle = (
         <View style={styles.modalSubtitleBlock}>
            <Text style={[styles.modalSubtitle]}>
               Please wait while we process your payment
            </Text>
            <Text style={[styles.modalSubtitle]}>
               Please do not refresh or reload the page
            </Text>
            <Text style={[styles.modalSubtitle]}>
               you'll be automatically redirected
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
            <Text style={styles.modalTitle}>
               Successfully placed your order
            </Text>
         )
         subtitle = (
            <Text style={[styles.modalSubtitle, styles.modalSubtitleBlock]}>
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
            <Text style={styles.modalTitle}>
               Looks like your card requires authentication
            </Text>
         )
         subtitle = (
            <Text style={[styles.modalSubtitle, styles.modalSubtitleBlock]}>
               An additional verification step which direct you to an
               authentication page on your bank’s website
            </Text>
         )
         extra = [
            <Button
               buttonStyle={styles.authenticateBtn}
               //    href={cartPayment?.actionUrl}
            >
               Authenticate Here
            </Button>,
            <Button
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
         title = <Text style={styles.modalTitle}>Payment Failed</Text>
         subtitle = (
            <Text style={[styles.modalSubtitle, styles.modalSubtitleBlock]}>
               Something went wrong
            </Text>
         )
         extra = [
            <Button
               buttonStyle={styles.tryOtherPayment}
               onPress={resetStateAfterModalClose}
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
         title = <Text style={styles.modalTitle}>Payment Cancelled</Text>
         subtitle = (
            <Text style={[styles.modalSubtitle, styles.modalSubtitleBlock]}>
               You cancelled your payment process
            </Text>
         )
         extra = [
            <Button
               buttonStyle={styles.tryOtherPayment}
               onPress={resetStateAfterModalClose}
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
         title = <Text style={styles.modalTitle}>Payment Failed</Text>
         subtitle = (
            <Text style={[styles.modalSubtitle, styles.modalSubtitleBlock]}>
               Your payment is failed since your bank doesn't authenticate you
            </Text>
         )
         extra = [
            <Button
               buttonStyle={styles.tryOtherPayment}
               onPress={resetStateAfterModalClose}
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
            setCountDown(Date.now() + 5 * 60000)
         }
      }
   }, [cartPayment?.paymentStatus])

   // resetting countdown timer when payment status changes
   // useEffect(() => {
   //    setCountDown(60)
   // }, [cartPayment?.paymentStatus])

   return (
      <Modal closeOnClickOutside={false} visible={isOpen} onClose={closeModal}>
         {ShowPaymentStatusInfo(cartPayment?.paymentStatus).icon}
         {cartPayment?.metaData?.paymentFor !== 'walletTopUp' ? (
            <>
               {ShowPaymentStatusInfo(cartPayment?.paymentStatus).title}
               {ShowPaymentStatusInfo(cartPayment?.paymentStatus).subtitle}
            </>
         ) : (
            <Text style={styles.modalTitle}>
               Successfully top-up your wallet
            </Text>
         )}
         {ShowPaymentStatusInfo(cartPayment?.paymentStatus).extra}
         {!isEmpty(cartPayment) &&
            !['SUCCEEDED', 'FAILED', 'CANCELLED', 'QR_GENERATED'].includes(
               cartPayment?.paymentStatus
            ) && (
               <>
                  {/* {countDown && (
                     <Countdown
                        date={countDown}
                        renderer={({ minutes, seconds, completed }) => {
                           if (completed) {
                              return (
                                 <h1 tw="font-extrabold color[rgba(0, 64, 106, 0.9)] text-xl text-center">
                                    {t('Request timed out')}
                                 </h1>
                              )
                           }
                           return (
                              <h1 tw="font-extrabold color[rgba(0, 64, 106, 0.9)] text-xl text-center">
                                 {`Timeout in ${minutes}:${
                                    seconds <= 9 ? '0' : ''
                                 }${seconds}`}
                              </h1>
                           )
                        }}
                        onComplete={() =>
                           cancelTerminalPayment({
                              cartPayment,
                              retryPaymentAttempt: false,
                           })
                        }
                     />
                  )} */}
               </>
            )}
      </Modal>
   )
}

export default PaymentProcessingModal

const styles = StyleSheet.create({
   modalTitle: {
      fontSize: 14,
      lineHeight: 25,
      fontWeight: '500',
      marginBottom: 3,
      textAlign: 'center',
   },
   modalSubtitleBlock: {
      marginBottom: 8,
   },
   modalSubtitle: {
      fontFamily: 'Metropolis',
      fontSize: 11,
      lineHeight: 13,
      color: '#A2A2A2',
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
