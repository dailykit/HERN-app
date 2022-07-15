import React from 'react'
import {
   StyleSheet,
   View,
   Text,
   TouchableOpacity,
   Dimensions,
} from 'react-native'
import PhoneInput, { isValidNumber } from 'react-native-phone-number-input'
import { Button } from '../../../components/button'
import { useConfig } from '../../../lib/config'
import { Spinner } from '../../../assets/loaders'
import global from '../../../globalStyles'

export const MobileNumberForm = ({
   setForm,
   sendOTP,
   sendingOtp,
   form,
   error,
}) => {
   const { appConfig } = useConfig()
   const phoneInput = React.useRef(null)

   return (
      <View style={styles.phoneNumberContainer}>
         <View style={{ flex: 1 }}>
            <Text
               style={{
                  color: '#ffffff',
                  fontSize: 24,
                  fontFamily: global.medium,
               }}
            >
               LOGIN
            </Text>
         </View>
         <View style={{ width: '100%', flex: 1 }}>
            <View style={styles.phoneNumberWrapper}>
               <PhoneInput
                  ref={phoneInput}
                  defaultValue={''}
                  defaultCode="IN"
                  layout="second"
                  onChangeFormattedText={text => {
                     // setFormattedValue(text)
                     setForm(prev => ({
                        ...prev,
                        phoneNumber: text,
                        isPhoneNumberValid: isValidNumber(text),
                     }))
                  }}
                  withDarkTheme
                  withShadow
                  autoFocus
                  textInputStyle={styles.textInputStyle}
                  containerStyle={styles.containerStyle}
                  textContainerStyle={styles.textContainerStyle}
                  codeTextStyle={styles.codeTextStyle}
                  disableArrowIcon={true}
                  textInputProps={{ placeholderTextColor: '#ffffff80' }}
                  placeholder={'Enter Phone Number...'}
               />
            </View>
            <View style={styles.infoLine}>
               <Text
                  style={{
                     color: '#fff',
                     fontSize: 12,
                     fontFamily: global.regular,
                  }}
               >
                  By continuing, I agree to the{' '}
               </Text>
               <TouchableOpacity style={{ alignItems: 'center' }}>
                  <Text
                     style={{
                        color: appConfig.brandSettings.buttonSettings
                           .activeTextColor.value,
                        fontSize: 12,
                        fontFamily: global.regular,
                     }}
                  >
                     Terms of Use{' '}
                  </Text>
               </TouchableOpacity>
               <Text
                  style={{
                     color: '#fff',
                     fontSize: 12,
                     fontFamily: global.regular,
                  }}
               >
                  &{' '}
               </Text>
               <TouchableOpacity style={{ alignItems: 'center' }}>
                  <Text
                     style={{
                        color: appConfig.brandSettings.buttonSettings
                           .activeTextColor.value,
                        fontSize: 12,
                        fontFamily: global.regular,
                     }}
                  >
                     Privacy Policy
                  </Text>
               </TouchableOpacity>
            </View>
            {error ? (
               <Text
                  style={{
                     color: 'red',
                     fontFamily: global.italic,
                  }}
               >
                  {error}
               </Text>
            ) : null}
         </View>

         <View style={{ flex: 1 }}>
            <Button
               onPress={sendOTP}
               buttonStyle={{ width: 155, height: 43, marginTop: 30 }}
               textStyle={{ fontSize: 16 }}
               disabled={sendingOtp || !form.isPhoneNumberValid}
            >
               {sendingOtp ? (
                  <Spinner
                     text={'Sending OTP'}
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
                  'Submit'
               )}
            </Button>
         </View>
         <View style={{ flex: 1 }}></View>
      </View>
   )
}

const styles = StyleSheet.create({
   phoneNumberContainer: {
      width: Dimensions.get('screen').width * 0.87,
      alignItems: 'center',
      flex: 2,
   },
   phoneNumberWrapper: {
      borderWidth: 1,
      borderColor: '#ffffff80',
      borderRadius: 4,
   },
   enterPhoneNo: {
      fontSize: 12,
      lineHeight: 20,
      color: '#FFFFFF',
      marginBottom: 6,
   },
   infoLine: {
      color: '#fff',
      alignItems: 'center',
      flexDirection: 'row',
      marginVertical: 4,
      marginLeft: 2,
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
      fontFamily: global.medium,
      borderLeftWidth: 4,
      fontSize: 16,
      lineHeight: 20,
      color: '#FFFFFF',
   },
   codeTextStyle: {
      fontFamily: global.medium,
      color: '#FFFFFF',
   },
   termAndCond: {
      fontSize: 10,
      lineHeight: 10,
      marginTop: 6,
   },
})
