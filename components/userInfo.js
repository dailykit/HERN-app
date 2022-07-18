import React, { createRef, useEffect, useRef, useState } from 'react'
import { get_env } from '../utils'
import { UserIcon } from '../assets/userIcon'
import CloseIcon from '../assets/closeIcon'
import { PhoneIcon } from '../assets/phoneIcon'
import { EditIcon } from '../assets/editIcon'
import { useUser } from '../context/user'
import { CartContext } from '../context/cart'
import { UPDATE_PLATFORM_CUSTOMER } from '../graphql'
import { useMutation } from '@apollo/client'
import {
   View,
   Text,
   StyleSheet,
   TouchableOpacity,
   ScrollView,
   ActivityIndicator,
} from 'react-native'
import { Button } from './button'
import {
   BottomSheetModal,
   BottomSheetModalProvider,
} from '@gorhom/bottom-sheet'
import { TextInput } from 'react-native-gesture-handler'
import PhoneInput, { isValidNumber } from 'react-native-phone-number-input'
import { useConfig } from '../lib/config'
import CustomBackdrop from './modalBackdrop'
import useGlobalCss from '../globalStyle'

export const UserInfo = props => {
   const [settingCartInfo, setSettingCartInfo] = useState(true)
   const UserInfoFormRef = useRef()

   const handleClose = () => {
      UserInfoFormRef.current.dismiss()
   }
   return (
      <>
         <UserDetails
            handleOpen={() => UserInfoFormRef.current.present()}
            cart={props.cart}
            settingCartInfo={settingCartInfo}
            setSettingCartInfo={setSettingCartInfo}
         />
         <BottomSheetModal
            ref={UserInfoFormRef}
            snapPoints={[375]}
            handleComponent={() => null}
            enablePanDownToClose={true}
            settingCartInfo={settingCartInfo}
            setSettingCartInfo={setSettingCartInfo}
            backdropComponent={CustomBackdrop}
         >
            <UserInfoForm handleClose={handleClose} cart={props.cart} />
         </BottomSheetModal>
      </>
   )
}
const UserInfoForm = props => {
   const { handleClose, cart, settingCartInfo, setSettingCartInfo } = props
   const { methods } = React.useContext(CartContext)
   const { user } = useUser()
   const { globalCss } = useGlobalCss()

   const namePattern = /^[a-zA-Z .]*$/
   const [savingUserInfo, setSavingUserInfo] = React.useState(false)
   const [firstName, setFirstName] = useState(
      cart?.customerInfo?.customerFirstName ||
         user.platform_customer?.firstName ||
         ''
   )
   const [lastName, setLastName] = useState(
      cart?.customerInfo?.customerLastName ||
         user.platform_customer?.lastName ||
         ''
   )

   const [mobileNumber, setMobileNumber] = useState(
      cart?.customerInfo?.customerPhone ||
         user.platform_customer?.phoneNumber ||
         ''
   )
   const phoneInput = React.useRef()

   const [updateCustomer] = useMutation(UPDATE_PLATFORM_CUSTOMER, {
      onCompleted: () => {
         console.log('==> Platform Customer Updated!')
         setSavingUserInfo(false)
         if (cart?.customerInfo === null) {
            setSettingCartInfo(true)
         } else {
            handleClose()
         }
      },
      onError: error => {
         console.error('==>Error in Platform Customer Update', error)
      },
   })

   const handleSave = async () => {
      setSavingUserInfo(true)
      await methods.cart.update({
         variables: {
            id: cart.id,
            _set: {
               customerInfo: {
                  customerFirstName: firstName,
                  customerLastName: lastName,
                  customerPhone: mobileNumber,
                  customerEmail:
                     cart?.customerInfo?.customerEmail ||
                     user.platform_customer?.email,
               },
            },
         },
      })
      if (user?.keycloakId) {
         await updateCustomer({
            variables: {
               keycloakId: user.keycloakId,
               _set: {
                  firstName: firstName,
                  lastName: lastName,
               },
            },
         })
      }
   }

   let isValid =
      isValidNumber(mobileNumber) &&
      namePattern.test(firstName) &&
      namePattern.test(lastName)

   React.useEffect(() => {
      if (cart?.customerInfo !== null) {
         handleClose()
      }
   }, [cart])

   return (
      <ScrollView
         style={[styles.userInfoForm, { borderColor: globalCss.color.grey }]}
      >
         <View style={[styles.row, { justifyContent: 'space-between' }]}>
            <Text
               style={[
                  styles.userInfoFormHeading,
                  { fontFamily: globalCss.font.semibold },
               ]}
            >
               User Info
            </Text>
            <TouchableOpacity onPress={() => handleClose()}>
               <CloseIcon />
            </TouchableOpacity>
         </View>
         <Text
            style={[styles.formLabel, { fontFamily: globalCss.font.medium }]}
         >
            First Name
         </Text>
         <TextInput
            style={[
               styles.inputField,
               !namePattern.test(firstName) && styles.error,
               { fontFamily: globalCss.font.regular },
            ]}
            value={firstName}
            onChangeText={setFirstName}
         />
         <Text
            style={[styles.formLabel, { fontFamily: globalCss.font.medium }]}
         >
            Last Name
         </Text>
         <TextInput
            style={[
               styles.inputField,
               !namePattern.test(lastName) && styles.error,
               { fontFamily: globalCss.font.regular },
            ]}
            value={lastName}
            onChangeText={setLastName}
         />
         <Text
            style={[styles.formLabel, { fontFamily: globalCss.font.medium }]}
         >
            Phone Number
         </Text>
         <PhoneInput
            ref={phoneInput}
            defaultCode="IN"
            defaultValue={mobileNumber}
            layout="second"
            onChangeFormattedText={text => {
               setMobileNumber(text)
            }}
            textInputStyle={[
               styles.phoneInputTextInputStyle,
               { fontFamily: globalCss.font.regular },
            ]}
            containerStyle={[
               styles.phoneInputContainerStyle,
               !isValidNumber(mobileNumber) && styles.error,
            ]}
            textContainerStyle={styles.phoneInputTextContainerStyle}
            disableArrowIcon={true}
            textInputProps={{ placeholderTextColor: globalCss.color.grey }}
            placeholder={'Enter Phone Number...'}
            codeTextStyle={[
               styles.phoneInputCodeTextStyle,
               { fontFamily: globalCss.font.regular },
            ]}
         />
         <Button
            buttonStyle={styles.saveInfoBtn}
            textStyle={[
               styles.saveInfoBtnText,
               { fontFamily: globalCss.font.regular },
            ]}
            onPress={handleSave}
            disabled={!isValid}
         >
            {savingUserInfo ? (
               <ActivityIndicator size="small" color={'#fff'} />
            ) : (
               'Save'
            )}
         </Button>
      </ScrollView>
   )
}

const UserDetails = ({
   handleOpen,
   cart,
   settingCartInfo,
   setSettingCartInfo,
}) => {
   const { appConfig } = useConfig()
   const { globalCss } = useGlobalCss()
   const { user } = useUser()
   const { methods } = React.useContext(CartContext)
   const [updateCustomer] = useMutation(UPDATE_PLATFORM_CUSTOMER, {
      onCompleted: () => {
         console.log('==> Platform Customer Updated!')
      },
      onError: error => {
         console.error('==>Error in Platform Customer Update', error)
      },
   })

   const hasUserInfoInCart =
      cart?.customerInfo?.customerFirstName?.length ||
      cart?.customerInfo?.customerLastName?.length ||
      cart?.customerInfo?.customerPhone?.length

   const hasUserInfo =
      user?.platform_customer?.firstName?.length ||
      user?.platform_customer?.lastName?.length ||
      user?.platform_customer?.phoneNumber?.length

   const handleSave = async data => {
      if (data) {
         var { firstName, lastName, mobileNumber } = data
      }
      await methods.cart.update({
         variables: {
            id: cart.id,
            _set: {
               customerInfo: {
                  customerFirstName: firstName,
                  customerLastName: lastName,
                  customerPhone: mobileNumber,
                  customerEmail:
                     cart?.customerInfo?.customerEmail ||
                     user.platform_customer?.email,
               },
            },
         },
      })
      if (user?.keycloakId) {
         await updateCustomer({
            variables: {
               keycloakId: user.keycloakId,
               _set: {
                  firstName: firstName,
                  lastName: lastName,
               },
            },
         })
      }
   }

   useEffect(() => {
      if (hasUserInfoInCart) {
         setSettingCartInfo(false)
      }
   }, [hasUserInfoInCart])

   React.useEffect(() => {
      if (!hasUserInfoInCart) {
         if (user?.platform_customer) {
            if (!hasUserInfo) {
               handleOpen()
            } else {
               setSettingCartInfo(true)
               handleSave({
                  firstName: user?.platform_customer?.firstName,
                  lastName: user?.platform_customer?.lastName,
                  mobileNumber: user?.platform_customer?.phoneNumber,
               })
            }
         }
      }
   }, [user])

   return (
      <View style={styles.userInfoContainer}>
         {hasUserInfoInCart ? (
            <>
               <View style={styles.row}>
                  <UserIcon size={16} />
                  <Text
                     style={{
                        fontFamily: globalCss.font.semibold,
                        marginLeft: 9,
                     }}
                  >
                     {cart?.customerInfo?.customerFirstName}{' '}
                     {cart?.customerInfo?.customerLastName}
                  </Text>
               </View>
               <View style={styles.row}>
                  <PhoneIcon size={16} />
                  <Text
                     style={{
                        fontFamily: globalCss.font.regular,
                        marginLeft: 9,
                     }}
                  >
                     {cart?.customerInfo?.customerPhone}
                  </Text>
               </View>
               <TouchableOpacity onPress={handleOpen}>
                  <EditIcon
                     fill={
                        appConfig?.brandSettings.buttonSettings.buttonBGColor
                           .value || '#000000'
                     }
                     size={18}
                  />
               </TouchableOpacity>
            </>
         ) : (
            <>
               <UserIcon size={16} />
               {!settingCartInfo ? (
                  <Button
                     onPress={() => {
                        handleOpen()
                     }}
                     buttonStyle={styles.addUserInfoBtn}
                  >
                     Add User Info
                  </Button>
               ) : (
                  <ActivityIndicator size="small" color={'#000'} />
               )}
            </>
         )}
      </View>
   )
}

const styles = StyleSheet.create({
   userInfoContainer: {
      display: 'flex',
      marginHorizontal: 17,
      marginBottom: 4,
      marginTop: 12,
      borderWidth: 1,
      borderColor: '#00000030',
      borderRadius: 5,
      paddingVertical: 8,
      paddingHorizontal: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
   },
   row: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      //   width: '100%',
   },
   addUserInfoBtn: {},
   userInfoFuserInfoFormorm: {
      display: 'flex',
      flexDirection: 'column',
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      height: '100%',
      width: '100%',
      paddingVertical: 22,
      paddingHorizontal: 18,
      borderWidth: 0.3,
   },
   userInfoFormHeading: {
      fontSize: 18,
      lineHeight: 18,

      color: 'rgba(0, 0, 0, 0.8)',
   },
   formLabel: {
      fontSize: 12,
      lineHeight: 12,

      color: 'rgba(0, 0, 0, 0.6)',
      marginTop: 25,
      marginBottom: 8,
   },
   inputField: {
      width: '100%',
      height: 40,
      borderRadius: 6,
      paddingHorizontal: 10,
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
   },
   phoneInputTextInputStyle: {
      color: '#000',
      fontSize: 14,
   },
   phoneInputContainerStyle: {
      width: '100%',
      height: 40,
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
      borderRadius: 6,
   },
   phoneInputTextContainerStyle: {
      paddingVertical: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
   },
   phoneInputCodeTextStyle: {
      fontSize: 14,
   },
   saveInfoBtn: {
      marginTop: 25,
      marginBottom: 10,
      borderRadius: 8,
      paddingVertical: 4,
   },
   saveInfoBtnText: {
      fontSize: 14,
      lineHeight: 14,
   },
   editUserInfoBtn: {},
   error: {
      borderWidth: 1,
      borderColor: 'red',
   },
})
