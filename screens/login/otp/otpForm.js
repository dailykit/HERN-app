import {
   Dimensions,
   StyleSheet,
   Text,
   TouchableOpacity,
   View,
} from 'react-native'
import { Button } from '../../../components/button'
import OTPInputView from '@twotalltotems/react-native-otp-input'

import CountDown from 'react-native-countdown-component'
import React, { useEffect } from 'react'
import { useConfig } from '../../../lib/config'
import { Spinner } from '../../../assets/loaders'
import useGlobalCss from '../../../globalStyle'
// TODO: countdown for resend button

export const OTPform = ({
   form,
   setForm,
   clearState,
   setCurrentScreen,
   submit,
   loading,
   error,
   setError,
   resend,
   resending,
   time,
   otp,
}) => {
   const { appConfig } = useConfig()
   const [showResendBtn, setShowResendBtn] = React.useState(false)
   const { globalCss } = useGlobalCss()

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
            <Text style={{ color: 'red', fontFamily: globalCss.font.medium }}>
               Resend OTP
            </Text>
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
            <Text
               style={{
                  color: '#ffffff',
                  fontSize: 24,
                  fontFamily: globalCss.font.medium,
               }}
            >
               ENTER OTP
            </Text>
         </View>
         <View style={{ flex: 3, alignItems: 'center', width: '100%' }}>
            <View
               style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
               }}
            >
               <Text
                  style={{
                     color: '#fff',
                     fontSize: 13,
                     fontFamily: globalCss.font.medium,
                  }}
               >
                  An OTP has been sent to
                  <Text
                     style={{
                        fontSize: 11.5,
                        fontFamily: globalCss.font.medium,
                     }}
                  >{`  ${form?.phoneNumber || ''}`}</Text>
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
                        color:
                           appConfig.brandSettings.buttonSettings
                              .activeTextColor.value || '#ffffff',
                        fontSize: 14,
                        fontFamily: globalCss.font.medium,
                        marginLeft: 4,
                     }}
                  >
                     Edit
                  </Text>
               </TouchableOpacity>
            </View>
            <OTPInputView
               style={{
                  width: '100%',
                  height: 100,
               }}
               pinCount={6}
               // code={this.state.code} //You can supply this prop or not. The component will be used as a controlled / uncontrolled component respectively.
               onCodeChanged={code => {
                  setError('')
                  setForm(prev => ({ ...prev, otp: code }))
               }}
               autoFocusOnLoad
               codeInputFieldStyle={[
                  styles.underlineStyleBase,
                  { fontFamily: globalCss.font.medium },
               ]}
               codeInputHighlightStyle={[
                  styles.underlineStyleHighLighted,
                  { borderColor: globalCss.color.highlight },
               ]}
               onCodeFilled={code => {
                  console.log('filledCode', code)
               }}
            />
            <View style={{ width: '100%' }}>
               <ResentBtn />
            </View>
            {error ? (
               <Text
                  style={{
                     color: 'red',
                     fontFamily: globalCss.font.italic,
                     width: '100%',
                  }}
               >
                  {error}
               </Text>
            ) : null}
            <Button
               buttonStyle={{ marginTop: 20, width: 183, height: 43 }}
               textStyle={{ fontSize: 16 }}
               onPress={submit}
               disabled={loading || resending}
            >
               {resending || loading ? (
                  <Spinner
                     text={resending ? 'Resending OTP' : 'Verifying'}
                     showText={true}
                     color={'#ffffff'}
                     style={{ flexDirection: 'row' }}
                     textStyle={{
                        marginLeft: 8,
                        marginTop: 0,
                        fontSize: 14,
                        color: '#ffffff',
                     }}
                  />
               ) : (
                  'Verify OTP'
               )}
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
      fontSize: 14,
      lineHeight: 20,
      marginTop: 16,
   },
   changeNum: {
      fontSize: 12,
      lineHeight: 20,
   },
   borderStyleBase: {
      width: 30,
      height: 45,
   },

   underlineStyleBase: {
      width: 44,
      height: 48,
      // borderWidth: 1,
      backgroundColor: '#242424',
      borderRadius: 6,
      // borderBottomWidth: 1,
   },
})
