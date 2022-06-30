import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { MailIcon } from '../../assets/mailIcon'
import { PhoneIcon } from '../../assets/phoneIcon'
import { useUser } from '../../context/user'

export const UserInfo = () => {
   const { user } = useUser()
   return (
      <View style={styles.userInfoContainer}>
         {user.platform_customer?.firstName ? (
            <Text style={styles.userName}>
               {user.platform_customer?.firstName}{' '}
               {user.platform_customer?.lastName || ''}
            </Text>
         ) : null}
         {user.platform_customer?.phoneNumber ? (
            <View style={styles.contact}>
               <PhoneIcon />
               <Text style={styles.userPhoneNumber}>
                  {user.platform_customer?.phoneNumber}
               </Text>
            </View>
         ) : null}
         {user.platform_customer?.email ? (
            <View style={styles.contact}>
               <MailIcon />
               <Text style={styles.userEmail}>
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
      fontFamily: 'Metropolis',
      fontSize: 18,
      fontWeight: '500',
      marginBottom: 8,
   },
   userPhoneNumber: {
      fontFamily: 'Metropolis',
      fontSize: 14,
      fontWeight: '400',
      marginLeft: 6,
      color: '#00000095',
   },
   userEmail: {
      fontFamily: 'Metropolis',
      fontSize: 14,
      fontWeight: '400',
      marginLeft: 8,
      color: '#00000095',
   },
   contact: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
   },
})
