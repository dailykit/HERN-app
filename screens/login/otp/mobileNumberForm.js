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
import useGlobalStyle from '../../../globalStyle'

export const MobileNumberForm = ({
   setForm,
   sendOTP,
   sendingOtp,
   form,
   error,
}) => {
   const { appConfig } = useConfig()
   const phoneInput = React.useRef(null)
   const { globalStyle } = useGlobalStyle()

   return (
      <View style={styles.phoneNumberContainer}>
         <View style={{ flex: 1 }}>
            <Text
               style={{
                  color: '#ffffff',
                  fontSize: 24,
                  fontFamily: globalStyle.font.medium,
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
                  textInputStyle={[
                     styles.textInputStyle,
                     { fontFamily: globalStyle.font.medium },
                  ]}
                  containerStyle={styles.containerStyle}
                  textContainerStyle={styles.textContainerStyle}
                  codeTextStyle={[
                     styles.codeTextStyle,
                     { fontFamily: globalStyle.font.medium },
                  ]}
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
                     fontFamily: globalStyle.font.regular,
                  }}
               >
                  By continuing, I agree to the{' '}
               </Text>
               <TouchableOpacity style={{ alignItems: 'center' }}>
                  <Text
                     style={{
                        color:
                           appConfig.brandSettings.buttonSettings
                              .activeTextColor.value || '#ffffff',
                        fontSize: 10,
                        fontFamily: globalStyle.font.regular,
                     }}
                  >
                     Terms of Use{' '}
                  </Text>
               </TouchableOpacity>
               <Text
                  style={{
                     color: '#fff',
                     fontSize: 12,
                     fontFamily: globalStyle.font.regular,
                  }}
               >
                  &{' '}
               </Text>
               <TouchableOpacity style={{ alignItems: 'center' }}>
                  <Text
                     style={{
                        color:
                           appConfig.brandSettings.buttonSettings
                              .activeTextColor.value || '#ffffff',
                        fontSize: 10,
                        fontFamily: globalStyle.font.regular,
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
                     fontFamily: globalStyle.font.italic,
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
               textStyle={{
                  fontSize: 16,
               }}
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
                        fontFamily: globalStyle.font.medium,
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
})
