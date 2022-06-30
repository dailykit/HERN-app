import {
   Dimensions,
   StyleSheet,
   Text,
   TouchableOpacity,
   View,
} from 'react-native'
import { Button } from '../../../components/button'
import OTPInputView from '@twotalltotems/react-native-otp-input'
import appConfig from '../../../brandConfig.json'

import CountDown from 'react-native-countdown-component'
import React, { useEffect } from 'react'

// TODO: countdown for resend button

export const OTPform = ({
   setForm,
   clearState,
   setCurrentScreen,
   submit,
   loading,
   error,
   resend,
   resending,
   time,
   otp,
}) => {
   const [showResendBtn, setShowResendBtn] = React.useState(false)

   const ResentBtn = () => {
      return (
         <TouchableOpacity
            style={{
               position: 'absolute',
               right: 0,
               bottom: 0,
            }}
            onPress={() => {
               resend()
               setShowResendBtn(true)
            }}
         >
            <Text style={{ color: 'red' }}>Resend OTP</Text>
         </TouchableOpacity>
      )
   }

   return (
      <View
         style={{
            flex: 2,
            width: Dimensions.get('screen').width * 0.87,
            alignItems: 'center',
         }}
      >
         <View style={{ flex: 1 }}>
            <Text style={{ color: '#ffffff', fontSize: 24 }}>ENTER OTP</Text>
         </View>
         <View style={{ flex: 3, alignItems: 'center', width: '100%' }}>
            <View
               style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
               }}
            >
               <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>
                  An OTP has been sent to{' '}
               </Text>
               <TouchableOpacity
                  onPress={() => {
                     clearState()
                     setCurrentScreen('phoneNumber')
                  }}
                  style={{ justifyContent: 'center' }}
               >
                  <Text
                     style={{
                        color: appConfig.brandSettings.buttonSettings
                           .activeTextColor.value,
                        fontSize: 14,
                        fontWeight: '600',
                        marginLeft: 4,
                     }}
                  >
                     Edit
                  </Text>
               </TouchableOpacity>
            </View>
            <OTPInputView
               style={{ width: '100%', height: 100 }}
               pinCount={6}
               // code={this.state.code} //You can supply this prop or not. The component will be used as a controlled / uncontrolled component respectively.
               onCodeChanged={code => setForm(prev => ({ ...prev, otp: code }))}
               autoFocusOnLoad
               codeInputFieldStyle={styles.underlineStyleBase}
               codeInputHighlightStyle={styles.underlineStyleHighLighted}
               onCodeFilled={code => {
                  console.log('filledCode', code)
               }}
            />
            <View style={{ width: '100%' }}>
               <ResentBtn />
            </View>
            {error ? (
               <Text
                  style={{ color: 'red', fontStyle: 'italic', width: '100%' }}
               >
                  {error}
               </Text>
            ) : null}
            <Button
               buttonStyle={{ marginTop: 20, width: 183, height: 43 }}
               textStyle={{ fontSize: 18 }}
               onPress={submit}
               disabled={loading || resending}
            >
               {resending
                  ? 'Resending OTP'
                  : loading
                  ? 'Verifying'
                  : 'Verify OTP'}
            </Button>
         </View>
         <View style={{ flex: 3 }}></View>
      </View>
   )
}

const styles = StyleSheet.create({
   enterPhoneNo: {
      fontSize: 12,
      lineHeight: 20,
      color: '#FFFFFF',
      marginBottom: 6,
   },
   containerStyle: {
      backgroundColor: '#242424',
      borderRadius: 6,
      height: 50,
      width: '100%',
      fontWeight: 500,
   },
   textContainerStyle: {
      backgroundColor: '#242424',
      borderRadius: 6,
   },
   textInputStyle: {
      borderLeftWidth: 4,
      fontSize: 16,
      lineHeight: 20,
      color: '#FFFFFF',
   },
   codeTextStyle: {
      color: '#FFFFFF',
   },
   termAndCond: {
      fontSize: 10,
      lineHeight: 10,
      marginTop: 6,
   },
   continueBtn: {
      backgroundColor: '#EF5266',
      borderRadius: 8,
      width: '100%',
      height: 50,
      color: '#FFFFFF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
   },
   counterBtnText: {
      color: '#FFFFFF',
      textTransform: 'uppercase',
      fontSize: 20,
      lineHeight: 20,
   },
   resendOTPContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
   },
   resendOTPtext: {
      color: '#EF5266',
      fontSize: 14,
      lineHeight: 20,
      marginTop: 16,
   },
   changeNum: {
      fontSize: 12,
      lineHeight: 20,
      color: '#EF5266',
   },
   borderStyleBase: {
      width: 30,
      height: 45,
   },

   borderStyleHighLighted: {
      borderColor: '#03DAC6',
   },

   underlineStyleBase: {
      width: 44,
      height: 48,
      // borderWidth: 1,
      backgroundColor: '#242424',
      borderRadius: 6,
      // borderBottomWidth: 1,
   },

   underlineStyleHighLighted: {
      borderColor: '#03DAC6',
   },
})
