import React, { createRef, useEffect, useRef, useState } from 'react'
import { get_env } from '../utils'
import { UserIcon } from '../assets/userIcon'
import CloseIcon from '../assets/closeIcon'
import { PhoneIcon } from '../assets/phoneIcon'
import { EditIcon } from '../assets/editIcon'
import { useUser } from '../context/user'
import { CartContext, useCart } from '../context/cart'
import { UPDATE_PLATFORM_CUSTOMER } from '../graphql'
import { gql, useMutation, useQuery } from '@apollo/client'
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
import useGlobalStyle from '../globalStyle'

export const UserInfo = props => {
   const [settingCartInfo, setSettingCartInfo] = useState(false)
   const UserInfoFormRef = useRef()

   const handleClose = () => {
      UserInfoFormRef.current.dismiss()
   }

   const { user } = useUser()
   const { storedCartId } = useCart()
   const { data, loading } = useQuery(GET_USER_INFO, {
      skip: !user?.keycloakId,
      variables: {
         where: {
            id: {
               _eq: storedCartId,
            },
         },
      },
   })
   return (
      <>
         <UserDetails
            handleOpen={() => UserInfoFormRef.current.present()}
            settingCartInfo={settingCartInfo}
            setSettingCartInfo={setSettingCartInfo}
            data={data}
            loading={loading}
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
            <UserInfoForm handleClose={handleClose} cart={data?.carts?.[0]} />
         </BottomSheetModal>
      </>
   )
}
const UserInfoForm = props => {
   const { handleClose, settingCartInfo, setSettingCartInfo, cart } = props
   const { methods } = React.useContext(CartContext)
   const { user } = useUser()
   const { globalStyle } = useGlobalStyle()

   const namePattern = /^[a-zA-Z .]+$/
   const lastNamePattern = /^[a-zA-Z .]*$/
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
         optimisticResponse: {
            updateCart: {
               id: cart.id,
               customerInfo: {
                  customerFirstName: firstName,
                  customerLastName: lastName,
                  customerPhone: mobileNumber,
                  customerEmail:
                     cart?.customerInfo?.customerEmail ||
                     user.platform_customer?.email,
               },
               fulfillmentInfo: cart.fulfillmentInfo,
               address: cart.address,
               __typename: 'order_cart',
               orderTabId: cart?.orderTabId,
               locationId: cart?.locationId,
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
      lastNamePattern.test(lastName)

   React.useEffect(() => {
      if (cart?.customerInfo !== null) {
         handleClose()
      }
   }, [cart])

   return (
      <ScrollView
         style={[styles.userInfoForm, { borderColor: globalStyle.color.grey }]}
      >
         <View style={[styles.row, { justifyContent: 'space-between' }]}>
            <Text
               style={[
                  styles.userInfoFormHeading,
                  { fontFamily: globalStyle.font.semibold },
               ]}
            >
               User Info
            </Text>
            <TouchableOpacity onPress={() => handleClose()}>
               <CloseIcon />
            </TouchableOpacity>
         </View>
         <Text
            style={[styles.formLabel, { fontFamily: globalStyle.font.medium }]}
         >
            First Name
         </Text>
         <TextInput
            style={[
               styles.inputField,
               !namePattern.test(firstName) && styles.error,
               { fontFamily: globalStyle.font.medium },
            ]}
            value={firstName}
            onChangeText={setFirstName}
         />
         <Text
            style={[styles.formLabel, { fontFamily: globalStyle.font.medium }]}
         >
            Last Name
         </Text>
         <TextInput
            style={[
               styles.inputField,
               !lastNamePattern.test(lastName) && styles.error,
               { fontFamily: globalStyle.font.medium },
            ]}
            value={lastName}
            onChangeText={setLastName}
         />
         <Text
            style={[styles.formLabel, { fontFamily: globalStyle.font.medium }]}
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
               { fontFamily: globalStyle.font.medium },
            ]}
            containerStyle={[
               styles.phoneInputContainerStyle,
               !isValidNumber(mobileNumber) && styles.error,
            ]}
            textContainerStyle={styles.phoneInputTextContainerStyle}
            disableArrowIcon={true}
            textInputProps={{ placeholderTextColor: globalStyle.color.grey }}
            placeholder={'Enter Phone Number...'}
            codeTextStyle={[
               styles.phoneInputCodeTextStyle,
               { fontFamily: globalStyle.font.medium },
            ]}
         />
         <Button
            buttonStyle={styles.saveInfoBtn}
            textStyle={[styles.saveInfoBtnText]}
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
const GET_USER_INFO = gql`
   query cart($where: order_cart_bool_exp!) {
      carts(where: $where) {
         id
         customerInfo
      }
   }
`
const UserDetails = ({
   handleOpen,
   settingCartInfo,
   setSettingCartInfo,
   data,
   loading,
}) => {
   const { appConfig } = useConfig()
   const { globalStyle } = useGlobalStyle()
   const { user } = useUser()
   const { methods, storedCartId } = React.useContext(CartContext)
   const [updateCustomer] = useMutation(UPDATE_PLATFORM_CUSTOMER, {
      onCompleted: () => {
         console.log('==> Platform Customer Updated!')
      },
      onError: error => {
         console.error('==>Error in Platform Customer Update', error)
      },
   })

   const hasUserInfoInCart =
      data?.carts?.[0]?.customerInfo?.customerFirstName?.length &&
      data?.carts?.[0]?.customerInfo?.customerPhone?.length

   const hasUserInfo =
      user?.platform_customer?.firstName?.length &&
      user?.platform_customer?.phoneNumber?.length

   const handleSave = async data => {
      if (data) {
         var { firstName, lastName, mobileNumber } = data
      }
      await methods.cart.update({
         variables: {
            id: storedCartId,
            _set: {
               customerInfo: {
                  customerFirstName: firstName,
                  customerLastName: lastName,
                  customerPhone: mobileNumber,
                  customerEmail:
                     data?.carts?.[0]?.customerInfo?.customerEmail ||
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
      <>
         <View style={styles.userInfoContainer}>
            {loading ? (
               <ActivityIndicator size="small" color={'#000'} />
            ) : hasUserInfoInCart ? (
               <>
                  <View style={styles.row}>
                     <UserIcon size={16} />
                     <Text
                        style={{
                           fontFamily: globalStyle.font.medium,
                           marginLeft: 9,
                        }}
                     >
                        {data?.carts?.[0]?.customerInfo?.customerFirstName}{' '}
                        {data?.carts?.[0]?.customerInfo?.customerLastName}
                     </Text>
                  </View>
                  <View style={styles.row}>
                     <PhoneIcon size={16} />
                     <Text
                        style={{
                           fontFamily: globalStyle.font.medium,
                           marginLeft: 9,
                        }}
                     >
                        {data?.carts?.[0]?.customerInfo?.customerPhone}
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
         <View style={styles.divider}></View>
      </>
   )
}

const styles = StyleSheet.create({
   userInfoContainer: {
      display: 'flex',
      marginHorizontal: 2,
      marginBottom: 4,
      marginTop: 12,
      // borderWidth: 1,
      // borderColor: '#00000030',
      // borderRadius: 5,
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
   divider: {
      height: 1,
      backgroundColor: '#00000030',
      marginVertical: 6,
      marginHorizontal: 8,
   },
})
