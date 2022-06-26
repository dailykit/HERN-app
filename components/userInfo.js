import React, { createRef, useRef, useState } from 'react'
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
import appConfig from '../brandConfig.json'

export const UserInfo = props => {
   const [settingCartinfo, setSettingCartinfo] = useState(false)
   const UserInfoFormRef = useRef()

   const handleEdit = () => {
      UserInfoFormRef.current.dismiss()
   }
   const handleClose = () => {
      UserInfoFormRef.current.dismiss()
   }

   return (
      <>
         <UserDetails
            settingCartinfo={settingCartinfo}
            handleOpen={() => UserInfoFormRef.current.present()}
            handleEdit={handleEdit}
            setSettingCartinfo={setSettingCartinfo}
            cart={props.cart}
         />
         <BottomSheetModal
            ref={UserInfoFormRef}
            snapPoints={[375]}
            index={0}
            handleComponent={() => null}
            enablePanDownToClose={true}
         >
            <UserInfoForm
               handleClose={handleClose}
               cart={props.cart}
               setSettingCartinfo={setSettingCartinfo}
            />
         </BottomSheetModal>
      </>
   )
}
const UserInfoForm = props => {
   const { handleClose, settingCartinfo, setSettingCartinfo, cart } = props
   const { methods } = React.useContext(CartContext)
   const { user } = useUser()

   const namePattern = /^[a-zA-Z .]+$/
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
      setSavingUserInfo(false)
      if (cart?.customerInfo === null) {
         setSettingCartinfo(true)
      } else {
         handleClose()
      }
   }

   let isValid =
      isValidNumber(mobileNumber) &&
      namePattern.test(firstName) &&
      namePattern.test(lastName)

   React.useEffect(() => {
      if (cart?.customerInfo !== null && settingCartinfo) {
         handleClose()
      }
   }, [cart])

   return (
      <ScrollView style={styles.userInfoForm}>
         <View style={[styles.row, { justifyContent: 'space-between' }]}>
            <Text style={styles.userInfoFormHeading}>User Info</Text>
            <TouchableOpacity onPress={() => handleClose()}>
               <CloseIcon />
            </TouchableOpacity>
         </View>
         <Text style={styles.formLabel}>Full Name</Text>
         <TextInput
            style={[
               styles.inputField,
               !namePattern.test(firstName) && styles.error,
            ]}
            value={firstName}
            onChangeText={setFirstName}
         />
         <Text style={styles.formLabel}>Last Name</Text>
         <TextInput
            style={[
               styles.inputField,
               !namePattern.test(lastName) && styles.error,
            ]}
            value={lastName}
            onChangeText={setLastName}
         />
         <Text style={styles.formLabel}>Phone Number</Text>
         <PhoneInput
            ref={phoneInput}
            defaultCode="IN"
            defaultValue={mobileNumber}
            layout="second"
            onChangeFormattedText={text => {
               setMobileNumber(text)
            }}
            textInputStyle={styles.phoneInputTextInputStyle}
            containerStyle={[
               styles.phoneInputContainerStyle,
               !isValidNumber(mobileNumber) && styles.error,
            ]}
            textContainerStyle={styles.phoneInputTextContainerStyle}
            disableArrowIcon={true}
            textInputProps={{ placeholderTextColor: '#A2A2A2' }}
            placeholder={'Enter Phone Number...'}
            codeTextStyle={styles.phoneInputCodeTextStyle}
         />
         <Button
            buttonStyle={styles.saveInfoBtn}
            textStyle={styles.saveInfoBtnText}
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
   handleEdit,
   handleOpen,
   settingCartinfo,
   setSettingCartinfo,
   cart,
}) => {
   const hasUserInfo =
      cart?.customerInfo?.customerFirstName?.length ||
      cart?.customerInfo?.customerLastName?.length ||
      cart?.customerInfo?.customerPhone?.length

   React.useEffect(() => {
      if (!hasUserInfo && !settingCartinfo) {
         handleOpen()
      }
   }, [])

   return (
      <View style={styles.userInfoContainer}>
         {hasUserInfo ? (
            <>
               <View style={styles.row}>
                  <UserIcon size={16} />
                  <Text style={{ marginLeft: 9 }}>
                     {cart?.customerInfo?.customerFirstName}{' '}
                     {cart?.customerInfo?.customerLastName}
                  </Text>
               </View>
               <View style={styles.row}>
                  <PhoneIcon size={16} />
                  <Text style={{ marginLeft: 9 }}>
                     {cart?.customerInfo?.customerPhone}
                  </Text>
               </View>
               <TouchableOpacity onPress={handleOpen}>
                  <EditIcon
                     fill={
                        appConfig.brandSettings.buttonSettings.buttonBGColor
                           .value
                     }
                     size={18}
                  />
               </TouchableOpacity>
            </>
         ) : (
            <>
               <UserIcon size={16} />
               <Button
                  onPress={() => {
                     handleOpen()
                  }}
                  buttonStyle={styles.addUserInfoBtn}
               >
                  Add User Info
               </Button>
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
   userInfoForm: {
      display: 'flex',
      flexDirection: 'column',
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      height: '100%',
      width: '100%',
      paddingVertical: 22,
      paddingHorizontal: 18,
      borderWidth: 0.3,
      borderColor: '#A2A2A2',
   },
   userInfoFormHeading: {
      fontSize: 18,
      lineHeight: 18,
      fontWeight: '600',
      color: 'rgba(0, 0, 0, 0.8)',
   },
   formLabel: {
      fontSize: 12,
      lineHeight: 12,
      fontWeight: '500',
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
   phoneInputCodeTextStyle: { fontSize: 14 },
   saveInfoBtn: {
      marginTop: 25,
      marginBottom: 10,
      borderRadius: 8,
      paddingVertical: 4,
   },
   saveInfoBtnText: {
      fontSize: 14,
      lineHeight: 14,
      fontWeight: '500',
   },
   editUserInfoBtn: {},
   error: {
      borderWidth: 1,
      borderColor: 'red',
   },
})
