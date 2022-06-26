import React from 'react'
import RazorpayCheckout from 'react-native-razorpay-expokit'

function useRazorPay() {
   const displayRazorpay = async options => {
      let response = await RazorpayCheckout.open(options)
      console.log('==> Razorpay Response: ', response)
      return response
   }

   return {
      displayRazorpay,
   }
}

export { useRazorPay }
