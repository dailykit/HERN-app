import { useLazyQuery, useMutation, useSubscription } from '@apollo/client'
import React, { useState } from 'react'
import {
   StyleSheet,
   View,
   Text,
   TouchableOpacity,
   Dimensions,
   Image,
} from 'react-native'
import PhoneInput, { isValidNumber } from 'react-native-phone-number-input'
import { Button } from '../../../components/button'
import { INSERT_OTP_TRANSACTION, RESEND_OTP } from '../../../graphql/mutations'
import { PLATFORM_CUSTOMERS } from '../../../graphql/queries'
import { get_env } from '../../../utils/get_env'
import axios from 'axios'
import JWT from 'expo-jwt'
import { OTPform } from './otpForm'
import { MobileNumberForm } from './mobileNumberForm'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
   CommonActions,
   StackActions,
   useNavigation,
} from '@react-navigation/native'
import { OTPS } from '../../../graphql/subscriptions'
import { useUser } from '../../../context/user'
import { useConfig } from '../../../lib/config'

export const OtpLogin = () => {
   const { appConfig } = useConfig()
   const { login } = useUser()
   const navigation = useNavigation()
   const phoneInput = React.useRef(null)
   const [currentScreen, setCurrentScreen] = useState('phoneNumber')
   const [error, setError] = React.useState('')
   const [loading, setLoading] = React.useState(false)
   const [hasOtpSent, setHasOtpSent] = React.useState(false)
   const [sendingOtp, setSendingOtp] = React.useState(false)
   const [form, setForm] = React.useState({
      phoneNumber: '',
      otp: '',
      email: '',
      isPhoneNumberValid: false,
   })
   const [otpId, setOtpId] = React.useState(null)
   const [otp, setOtp] = React.useState(null)
   const [resending, setResending] = React.useState(false)
   const [time, setTime] = React.useState(null)
   const [isNewUser, setIsNewUser] = React.useState(false)
   const [isReferralFieldVisible, setIsReferralFieldVisible] =
      React.useState(false)

   const redirect = () => {
      const state = navigation.getState()
      const { routes } = state
      if (routes.length === 1) {
         navigation.navigate('TabMenu', {
            screen: 'Home',
         })
      } else {
         navigation.goBack()
      }
   }
   const clearState = () => {
      setError('')
      setLoading(false)
      setHasOtpSent(false)
      setSendingOtp(false)
      setForm({
         phoneNumber: '',
         otp: '',
         email: '',
         isPhoneNumberValid: false,
      })
      setOtpId(null)
      setOtp(null)
      setResending(false)
      setTime(null)
      setIsNewUser(false)
      setIsReferralFieldVisible(false)
   }
   const changeCurrentScreen = screen => {
      setCurrentScreen(screen)
   }

   const [resendOTP] = useMutation(RESEND_OTP, {
      onCompleted: () => {
         setResending(false)
         setTime(120)
      },
      onError: error => {
         console.error(error)
         setResending(false)
      },
   })

   const { loading: otpsLoading, data: { otps = [] } = {} } = useSubscription(
      OTPS,
      {
         skip: !otpId,
         fetchPolicy: 'network-only',
         variables: { where: { id: { _eq: otpId } } },
      }
   )

   React.useEffect(() => {
      if (otpId && !otpsLoading && otps.length > 0) {
         const [otp] = otps
         if (otp.isValid) {
            setOtp(otp)
         } else {
            setOtp(null)
            setHasOtpSent(false)
            setForm({ phone: '', otp: '', email: '' })
            setSendingOtp(false)
            setError('')
            setLoading(false)
            setOtpId(null)
            setResending(false)
            setTime(null)
         }
      }
   }, [otpId, otpsLoading, otps])

   // resend OTP
   const resend = async () => {
      setResending(true)
      setTime(null)
      await resendOTP({ variables: { id: otp?.id } })
   }

   const [checkCustomerExistence] = useLazyQuery(PLATFORM_CUSTOMERS, {
      onCompleted: ({ customers = [] }) => {
         if (customers.length === 0) {
            setIsNewUser(true)
         }
      },
      onError: () => {},
   })

   //insert a entry of phone number in table and get otp code then send sms
   const [insertOtpTransaction] = useMutation(INSERT_OTP_TRANSACTION, {
      onCompleted: async ({ insertOtp = {} } = {}) => {
         if (insertOtp?.id) {
            setOtpId(insertOtp?.id)
            setHasOtpSent(true)
            setSendingOtp(false)
            setTime(120)
            setCurrentScreen('OTPSubmit')
            // addToast(t('OTP has been sent!'), { appearance: 'success' })
         } else {
            setSendingOtp(false)
         }
      },
      onError: error => {
         console.error(error)
         setSendingOtp(false)
         setError('Failed to send otp, please try again!')
         //  addToast(t('Failed to send OTP!'), { appearance: 'error' })
      },
   })

   const sendOTP = async () => {
      try {
         if (!form.phoneNumber) {
            setError('Phone number is required!')
            return
         }

         setSendingOtp(true)
         setError('')
         await checkCustomerExistence({
            variables: { where: { phoneNumber: { _eq: form.phoneNumber } } },
         })
         await insertOtpTransaction({
            variables: {
               object: {
                  phoneNumber: form.phoneNumber,
                  domain: get_env('BASE_BRAND_URL'),
               },
            },
         })
      } catch (error) {
         setSendingOtp(false)
         console.log('error is this', error)
         setError(t('Failed to send otp, please try again!'))
         //  addToast(t('Failed to send OTP!'), { appearance: 'error' })
      }
   }

   //handle submit btn to submit email(if new user) and otp
   const submit = async () => {
      try {
         setLoading(true)
         if (!form.otp) {
            setError('Please enter the OTP!')
            setLoading(false)
            return
         }

         setError('')

         const authDetails = encodeURIComponent(
            JSON.stringify({
               authType: 'otp',
               phoneNumber: form.phoneNumber,
               otp: form.otp,
               email: form.email,
            })
         )
         const SERVER_URL = __DEV__
            ? get_env('BASE_BRAND_DEV_URL')
            : get_env('BASE_BRAND_URL')
         const { data, status } = await axios.get(
            `${SERVER_URL}/server/api/auth/?authDetails=${authDetails}`
         )
         console.log('resp', data)
         if (status === 200) {
            const decode = JWT.decode(data.token, get_env('ADMIN_SECRET'), {
               timeSkew: 30,
            })
            if (decode) {
               await AsyncStorage.setItem(
                  'accessToken',
                  JSON.stringify(data.token)
               )
               await login()
               redirect()
            }
         } else {
            setLoading(false)
            setError('Entered OTP is incorrect, please try again!')
         }
      } catch (error) {
         setLoading(false)
         console.error(error)
         setError('Failed to log in, please try again!')
      }
   }

   return (
      <View
         style={{
            flex: 1,
            alignItems: 'center',
            backgroundColor: '#000000',
         }}
      >
         {(appConfig?.data?.showLoginSkipButton?.value ||
            (appConfig?.data?.showLoginSkipButton?.value === undefined &&
               appConfig?.data?.showLoginSkipButton?.default)) && (
            <TouchableOpacity
               style={{
                  position: 'absolute',
                  right: 20,
                  top: 20,
                  padding: 8,
               }}
               onPress={() => {
                  redirect()
               }}
            >
               <Text
                  style={{
                     color: appConfig.brandSettings.buttonSettings
                        .activeTextColor.value,
                     fontWeight: '500',
                  }}
               >
                  Skip
               </Text>
            </TouchableOpacity>
         )}
         <View style={{ flex: 1, justifyContent: 'center' }}>
            <Image
               source={{
                  uri: appConfig.brandSettings.brandLogo.value,
                  width: 120,
                  height: 73,
               }}
            />
         </View>
         {currentScreen === 'phoneNumber' ? (
            <MobileNumberForm
               changeCurrentScreen={changeCurrentScreen}
               setForm={setForm}
               sendOTP={sendOTP}
               sendingOtp={sendingOtp}
               form={form}
               error={error}
            />
         ) : null}
         {currentScreen === 'OTPSubmit' ? (
            <OTPform
               setForm={setForm}
               setCurrentScreen={setCurrentScreen}
               clearState={clearState}
               submit={submit}
               loading={loading}
               error={error}
               time={time}
               resend={resend}
               resending={resending}
               otp={otp}
            />
         ) : null}
      </View>
   )
}
