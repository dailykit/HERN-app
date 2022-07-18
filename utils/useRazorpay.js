import React from 'react'
import { get_env } from '../utils'

function useRazorPay() {
   const displayRazorpay = (options, setShowWebView, setWebViewSource) => {
      console.log('==> Displaying Razorpay')
      setWebViewSource(prevSource => {
         return {
            html: `<!DOCTYPE html>
         <html lang="en">
            <head>
               <meta name="viewport" content="width=device-width, initial-scale=1.0">
               <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
            </head>
            <body>

            </body>
            <script>
               function ondismiss(){
                  window.ReactNativeWebView.postMessage(JSON.stringify({'type': 'cancel'}))
               }
               function eventHandler(){
                  window.ReactNativeWebView.postMessage(JSON.stringify({'type': 'success'}))
               }
               var options = JSON.parse('${JSON.stringify(options)}');
               options["modal"]["ondismiss"] = ondismiss;
               var rzp1 = new Razorpay(options);
               rzp1.on('payment.failed', (response) => {
                  window.ReactNativeWebView.postMessage(JSON.stringify({'type': 'failed', 'error': response.error}))
               });
               rzp1.open();
            </script>
         </html>
         `,
         }
      })
      setShowWebView(true)
   }

   return {
      displayRazorpay,
   }
}

export { useRazorPay }
