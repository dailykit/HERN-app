import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { MailIcon } from '../../assets/mailIcon'
import { PhoneIcon } from '../../assets/phoneIcon'
import { useUser } from '../../context/user'
import useGlobalStyle from '../../globalStyle'

export const UserInfo = () => {
   const { globalStyle } = useGlobalStyle()
   const { user } = useUser()
   return (
      <View style={styles.userInfoContainer}>
         {user.platform_customer?.firstName ? (
            <Text
               style={{
                  ...styles.userName,
                  fontFamily: globalStyle.font.medium,
               }}
            >
               {user.platform_customer?.firstName}{' '}
               {user.platform_customer?.lastName || ''}
            </Text>
         ) : null}
         {user.platform_customer?.phoneNumber ? (
            <View style={styles.contact}>
               <PhoneIcon />
               <Text
                  style={[
                     styles.userPhoneNumber,
                     { fontFamily: globalStyle.font.regular },
                  ]}
               >
                  {user.platform_customer?.phoneNumber}
               </Text>
            </View>
         ) : null}
         {user.platform_customer?.email ? (
            <View style={styles.contact}>
               <MailIcon />
               <Text
                  style={[
                     styles.userEmail,
                     { fontFamily: globalStyle.font.regular },
                  ]}
               >
                  {user.platform_customer?.email}
               </Text>
            </View>
         ) : null}
      </View>
   )
}

const styles = StyleSheet.create({
   userInfoContainer: {
      paddingHorizontal: 12,
      paddingVertical: 18,
      borderWidth: 1,
      borderColor: '#00000010',
      borderRadius: 10,
      marginTop: 12,
   },
   userName: {
      fontSize: 18,
      marginBottom: 8,
   },
   userPhoneNumber: {
      fontSize: 14,
      marginLeft: 6,
      color: '#00000095',
   },
   userEmail: {
      fontSize: 14,
      marginLeft: 8,
      color: '#00000095',
   },
   contact: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
   },
})
