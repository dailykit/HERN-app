import {
   createContext,
   useState,
   useEffect,
   useContext,
   useReducer,
} from 'react'
import _has from 'lodash/has'
import _isEmpty from 'lodash/isEmpty'
import { useSubscription, useMutation, useApolloClient } from '@apollo/client'
import axios from 'axios'

import {
   GET_CART_PAYMENT_INFO,
   UPDATE_CART_PAYMENT,
   CREATE_PRINT_JOB,
   UPDATE_CART,
   CUSTOMER,
} from '../graphql'
import { useCart } from '../context/cart'
import { useUser } from '../context/user'
import { useConfig } from '../lib/config'
import {
   getRazorpayOptions,
   useRazorPay,
   // usePaytm,
   get_env,
} from '../utils'
import PaymentProcessingModal from '../components/paymentProcessingModal'
import { View, Text } from 'react-native'

const PaymentContext = createContext()
const initialState = {
   profileInfo: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
   },
   paymentInfo: {
      tunnel: {
         isVisible: false,
      },
      selectedAvailablePaymentOption: null,
   },
   paymentLoading: false,
   paymentLifeCycleState: '',
   printDetails: {
      isPrintInitiated: false,
      printStatus: 'not-started',
      message: '',
   },
   onPaymentSuccessCallback: () => {},
   onPaymentCancelCallback: () => {},
}

const reducer = (state, action) => {
   switch (action.type) {
      case 'SET_PROFILE_INFO':
         return {
            ...state,
            profileInfo: action.payload,
         }
      case 'SET_PAYMENT_INFO':
         return {
            ...state,
            paymentInfo: {
               ...state.paymentInfo,
               ...action.payload,
            },
         }
      case 'UPDATE_INITIAL_STATE':
         return {
            ...state,
            ...action.payload,
         }
      default:
         return state
   }
}

export const PaymentProvider = ({ children }) => {
   // const router = useRouter()
   const [state, dispatch] = useReducer(reducer, initialState)
   const [isPaymentLoading, setIsPaymentLoading] = useState(true)
   const [cartId, setCartId] = useState(null)
   const [cartPayment, setCartPayment] = useState(null)
   const [cartPaymentId, setCartPaymentId] = useState(null)
   const [isProcessingPayment, setIsProcessingPayment] = useState(false)
   const [isPaymentInitiated, setIsPaymentInitiated] = useState(false)
   const { user, isAuthenticated, isLoading } = useUser()
   const { configOf } = useConfig()
   const { displayRazorpay } = useRazorPay()
   // const { displayPaytm } = usePaytm()

   const brand = configOf('Brand Info', 'brand')
   const theme = configOf('theme-color', 'Visual')?.themeColor

   const { cartState } = useCart()
   const apolloClient = useApolloClient()

   // subscription to get cart payment info
   const {
      data: { cartPayments: cartPaymentsFromQuery = [] } = {},
      error: hasCartPaymentError,
      loading: isCartPaymentLoading,
   } = useSubscription(GET_CART_PAYMENT_INFO, {
      skip: !cartPaymentId && !cartId, // When cartId is not available use cartPaymentId to get the cartPayments
      fetchPolicy: 'no-cache',
      variables: {
         where: {
            isResultShown: {
               _eq: false,
            },
            ...(cartPaymentId
               ? {
                    id: {
                       _eq: cartPaymentId,
                    },
                 }
               : {
                    cartId: {
                       _eq: cartId,
                    },
                 }),
         },
      },
   })

   // mutation to update cart payment
   const [updateCartPayment] = useMutation(UPDATE_CART_PAYMENT, {
      onError: error => {
         console.error(error)
         //  addToast(`${t('Something went wrong')}`, { appearance: 'error' })
      },
   })

   // mutation to update cart
   const [updateCart] = useMutation(UPDATE_CART, {
      onError: error => {
         console.error(error)
         //  addToast(`${t('Something went wrong')}`, { appearance: 'error' })
      },
   })

   //<---------  methods to set/update reducer state  --------->

   const setProfileInfo = profileInfo => {
      dispatch({
         type: 'SET_PROFILE_INFO',
         payload: profileInfo,
      })
   }

   const setPaymentInfo = paymentInfo => {
      dispatch({
         type: 'SET_PAYMENT_INFO',
         payload: paymentInfo,
      })
   }

   const updatePaymentState = state => {
      dispatch({
         type: 'UPDATE_INITIAL_STATE',
         payload: state,
      })
   }

   const onCancelledHandler = () => {
      if (!_isEmpty(cartPayment)) {
         updateCartPayment({
            variables: {
               id: cartPayment?.id,
               _set: {
                  paymentStatus: 'CANCELLED',
                  comment:
                     'Cancelled by user using back button or dismiss modal',
               },
               _inc: {
                  cancelAttempt: 1,
               },
            },
         })
      }
      // Calling onPaymentCancel Callback which is passed in PaymentOptionRenderer Component
      state.onPaymentCancelCallback()
   }

   const onPaymentModalClose = async () => {
      await updateCartPayment({
         variables: {
            id: cartPayment?.id,
            _set: {
               ...(!['SUCCEEDED', 'FAILED', 'CANCELLED'].includes(
                  cartPayment?.paymentStatus
               ) && {
                  paymentStatus: 'FAILED',
               }),
               isResultShown: true,
            },
         },
      })
   }

   const eventHandler = async response => {
      dispatch({
         type: 'UPDATE_INITIAL_STATE',
         payload: {
            isPaymentProcessing: false,
            isPaymentInitiated: false,
            paymentLifeCycleState: '',
         },
      })
      const url = get_env('BASE_BRAND_URL')
      const { data } = await axios.post(
         `${url}/server/api/payment/handle-payment-webhook`,
         response
      )
      console.log('==> Razorpay result: ', data)
   }

   const initializePayment = (
      requiredCartId,
      cartPaymentId,
      paymentLifeCycleState = 'INITIALIZE'
   ) => {
      if (requiredCartId) {
         setCartId(requiredCartId)
      } else if (cartPaymentId) {
         setCartPaymentId(cartPaymentId)
      }
      setIsPaymentInitiated(true)
      setIsProcessingPayment(true)
      dispatch({
         type: 'UPDATE_INITIAL_STATE',
         payload: {
            paymentLifeCycleState,
         },
      })
   }

   const resetPaymentProviderStates = async () => {
      await dispatch({
         type: 'UPDATE_INITIAL_STATE',
         payload: {
            profileInfo: {
               firstName: '',
               lastName: '',
               phoneNumber: '',
               email: '',
            },
            paymentInfo: {
               tunnel: {
                  isVisible: false,
               },
               selectedAvailablePaymentOption: null,
            },
            paymentLoading: false,
            paymentLifeCycleState: '',
            printDetails: {
               isPrintInitiated: false,
               printStatus: 'not-started',
               message: '',
            },
         },
      })
      setCartId(null)
      setCartPayment(null)
      setIsPaymentLoading(true)
      setIsPaymentInitiated(false)
      setIsProcessingPayment(false)
   }

   const getCustomerInfo = async keycloakId => {
      let customerData = await apolloClient.query({
         query: CUSTOMER.PROFILE_INFO,
         variables: {
            keycloakId: keycloakId,
         },
      })
      customerData = customerData.data?.customer?.platform_customer
      return customerData
   }

   //<---------  methods to set/update reducer state  --------->

   // setting cartPayment in state
   useEffect(() => {
      if (!cartId && !cartPaymentId) {
         setCartId(cartState?.cart?.id || null)
      }
      if (!_isEmpty(cartPaymentsFromQuery)) {
         setCartPayment(cartPaymentsFromQuery[0])
         setCartId(cartPaymentsFromQuery[0].cartId)
         setIsPaymentInitiated(true)
         setIsProcessingPayment(true)
      } else {
         setCartPayment(null)
         setIsPaymentInitiated(false)
         setIsProcessingPayment(false)
      }
   }, [cartPaymentsFromQuery])

   // setting user related info in payment provider context
   useEffect(() => {
      if (
         isAuthenticated &&
         !_isEmpty(user) &&
         _has(user, 'platform_customer') &&
         !isLoading
      ) {
         dispatch({
            type: 'SET_PROFILE_INFO',
            payload: {
               firstName: user.platform_customer?.firstName || '',
               lastName: user.platform_customer?.lastName || '',
               email: user.platform_customer?.email || '',
               phoneNumber: user.platform_customer?.phoneNumber || '',
            },
         })

         dispatch({
            type: 'SET_PAYMENT_INFO',
            payload: {
               selectedAvailablePaymentOption: {
                  ...state.selectedAvailablePaymentOption,
                  selectedPaymentMethodId:
                     user.platform_customer?.defaultPaymentMethodId || null,
               },
               paymentMethods: user.platform_customer?.paymentMethods,
            },
         })
         setIsPaymentLoading(false)
      }
   }, [user])

   // Calling onPaymentCancel Callback which is passed in PaymentOptionRenderer Component
   useEffect(() => {
      if (cartPayment?.paymentStatus === 'SUCCEEDED') {
         state.onPaymentSuccessCallback()
      }
   }, [cartPayment?.paymentStatus])

   // useEffect which checks the payment company and payment related status and does required actions
   useEffect(() => {
      if (
         isPaymentInitiated &&
         !_isEmpty(cartPayment) &&
         _has(
            cartPayment,
            'availablePaymentOption.supportedPaymentOption.supportedPaymentCompany.label'
         ) &&
         !isCartPaymentLoading
      ) {
         console.log(
            '==> Inside payment provider useEffect, for Actions according to company'
         )
         setIsProcessingPayment(true)
         // for Razorpay SDK rendering.
         if (
            cartPayment.availablePaymentOption.supportedPaymentOption
               .supportedPaymentCompany.label === 'razorpay'
         ) {
            console.log('==> Razorpay Initiation: cartPayment: ', cartPayment)

            if (
               cartPayment.paymentStatus === 'CREATED' &&
               !_isEmpty(cartPayment?.stripeInvoiceId)
            ) {
               ;(async () => {
                  const options = getRazorpayOptions({
                     orderDetails: cartPayment.transactionRemark,
                     brand,
                     theme,
                     paymentInfo: cartPayment.availablePaymentOption,
                     profileInfo:
                        cartPayment?.cart?.customerInfo ||
                        (await getCustomerInfo(
                           cartPayment?.metaData.customerkeycloakId
                        )),
                     ondismissHandler: () => onCancelledHandler(),
                     eventHandler,
                  })
                  console.log('==> Razorpay options: ', options)
                  if (state.paymentLifeCycleState === 'INITIALIZE') {
                     await displayRazorpay(options)
                  }
               })()
            }
         } else if (
            cartPayment.availablePaymentOption.supportedPaymentOption
               .supportedPaymentCompany.label === 'paytm'
         ) {
            console.log('inside payment provider useEffect 1', cartPayment)
            if (['PENDING', 'PROCESSING'].includes(cartPayment.paymentStatus)) {
               if (cartPayment.actionRequired) {
                  // const paymentUrl = cartPayment.actionUrl
                  // window.location.href = paymentUrl
               }
            }
         }
      }
   }, [
      cartPayment?.paymentStatus,
      cartPayment?.transactionId,
      cartPayment?.stripeInvoiceId,
      cartPayment?.actionUrl,
      isCartPaymentLoading,
   ])

   return (
      <PaymentContext.Provider
         value={{
            state,
            paymentLoading: isPaymentLoading,
            setPaymentInfo,
            setProfileInfo,
            setIsProcessingPayment,
            setIsPaymentInitiated,
            updatePaymentState,
            initializePayment,
            isProcessingPayment,
            resetPaymentProviderStates,
         }}
      >
         {children}
         {isPaymentInitiated && (
            <PaymentProcessingModal
               isOpen={isProcessingPayment}
               cartPayment={cartPayment}
               cartId={cartState?.cart?.id}
               closeModal={onPaymentModalClose}
               normalModalClose={resetPaymentProviderStates}
               cancelPayment={onCancelledHandler}
               resetPaymentProviderStates={resetPaymentProviderStates}
               setIsProcessingPayment={setIsProcessingPayment}
               setIsPaymentInitiated={setIsPaymentInitiated}
            />
         )}
      </PaymentContext.Provider>
   )
}

export const usePayment = () => {
   const {
      state,
      paymentLoading,
      setPaymentInfo,
      setProfileInfo,
      setIsProcessingPayment,
      setIsPaymentInitiated,
      updatePaymentState,
      initializePayment,
      isProcessingPayment,
      resetPaymentProviderStates,
   } = useContext(PaymentContext)
   return {
      isPaymentLoading: paymentLoading,
      isPaymentProcessing: state.isPaymentProcessing,
      isPaymentSuccess: state.isPaymentSuccess,
      isPaymentDismissed: state.isPaymentDismissed,
      paymentLifeCycleState: state.paymentLifeCycleState,
      profileInfo: state.profileInfo,
      paymentInfo: state.paymentInfo,
      setPaymentInfo: setPaymentInfo,
      setProfileInfo: setProfileInfo,
      setIsProcessingPayment,
      setIsPaymentInitiated,
      updatePaymentState,
      initializePayment,
      isProcessingPayment,
      resetPaymentProviderStates,
   }
}
