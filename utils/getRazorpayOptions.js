import { get_env } from './get_env'
import _isEmpty from 'lodash/isEmpty'

const METHOD = {
   NETBANKING: 'netbanking',
   CARD: 'card',
   UPI: 'upi',
   EMI: 'emi',
}
export const getRazorpayOptions = ({
   orderDetails = null,
   brand = null,
   theme = null,
   paymentInfo = null,
   profileInfo = null,
   ondismissHandler = () => null,
   eventHandler = () => null,
}) => {
   if (!_isEmpty(orderDetails) && !_isEmpty(paymentInfo)) {
      const RAZORPAY_KEY_ID = get_env('RAZORPAY_KEY_ID')
      const {
         id: razorpay_order_id,
         notes,
         amount,
         status,
         receipt,
         currency,
      } = orderDetails

      let checkout_option = {}
      let config = {}
      if (
         paymentInfo?.supportedPaymentOption?.paymentOptionLabel ===
         'NETBANKING'
      ) {
         // checkout_option = {
         //    method:
         //       METHOD[paymentInfo?.supportedPaymentOption?.paymentOptionLabel],
         //    bank: '',
         // }
         config = {
            config: {
               display: {
                  hide: [
                     { method: 'card' },
                     { method: 'wallet' },
                     { method: 'upi' },
                     { method: 'cardless_emi' },
                     { method: 'paylater' },
                     { method: 'app' },
                  ],
               },
            },
         }
      } else if (
         paymentInfo?.supportedPaymentOption?.paymentOptionLabel === 'UPI'
      ) {
         // checkout_option = {
         //    method:
         //       METHOD[paymentInfo?.supportedPaymentOption?.paymentOptionLabel],
         //    vpa: '',
         // }
         config = {
            config: {
               display: {
                  hide: [
                     { method: 'card' },
                     { method: 'netbanking' },
                     { method: 'wallet' },
                     { method: 'cardless_emi' },
                     { method: 'paylater' },
                  ],
               },
            },
         }
      } else if (
         paymentInfo?.supportedPaymentOption?.paymentOptionLabel === 'CARD'
      ) {
         // checkout_option = {
         //    method:
         //       METHOD[paymentInfo?.supportedPaymentOption?.paymentOptionLabel],
         //    'card[name]': '',
         //    'card[number]': '',
         //    'card[expiry]': '',
         //    'card[cvv]': '',
         // }
         config = {
            config: {
               display: {
                  hide: [
                     { method: 'netbanking' },
                     { method: 'wallet' },
                     { method: 'upi' },
                     { method: 'cardless_emi' },
                     { method: 'paylater' },
                     { method: 'app' },
                  ],
               },
            },
         }
      }

      const options = {
         key: RAZORPAY_KEY_ID,
         theme: {
            hide_topbar: true,
            backdrop_color: '#231F20',
            ...(theme?.accent?.value && { color: theme?.accent?.value }),
         },
         ...(brand?.brandLogo?.value && { image: brand?.brandLogo?.value }),
         ...(brand?.brandName?.value && { name: brand?.brandName?.value }),
         amount: amount.toString(),
         currency,
         order_id: razorpay_order_id,
         notes,
         prefill: {
            name: `${profileInfo?.customerFirstName || ''} ${
               profileInfo?.customerLastName || ''
            }`,
            email: `${profileInfo?.customerEmail || ''}`,
            contact: `${profileInfo?.customerPhone || ''}`,
            ...checkout_option,
         },

         modal: {
            confirm_close: true,
         },
         retry: {
            enabled: false,
         },
         redirect: true,
         ...config,
      }
      return options
   }
   return null
}
