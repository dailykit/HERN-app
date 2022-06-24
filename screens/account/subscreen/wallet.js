import moment from 'moment'
import React, { useState } from 'react'
import {
   StyleSheet,
   Text,
   TextInput,
   TouchableWithoutFeedback,
   View,
} from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { useUser } from '../../../context/user'
import { formatCurrency } from '../../../utils/formatCurrency'
import { SubScreenHeader } from './header'
import appConfig from '../../../brandConfig.json'
import { Button } from '../../../components/button'

const WalletScreen = () => {
   const { isLoading } = useUser()
   const [showTopUpTab, setShowTopUpTab] = useState(false)
   if (isLoading) {
      return <Text>Loading</Text>
   }
   return (
      <View>
         <SubScreenHeader title={'Wallet'} />
         {showTopUpTab ? (
            <AddWalletAmount setShowTopUpTab={setShowTopUpTab} />
         ) : (
            <WalletDetails setShowTopUpTab={setShowTopUpTab} />
         )}
      </View>
   )
}

const WalletDetails = ({ setShowTopUpTab }) => {
   const { user } = useUser()

   return (
      <View
         style={{
            paddingHorizontal: 12,
            backgroundColor: '#fff',
            height: '100%',
         }}
      >
         <View
            style={{
               flex: 1,
               flexDirection: 'row',
               justifyContent: 'space-between',
            }}
         >
            <Text style={styles.balance}>
               Available Balance : {formatCurrency(user.wallet.amount)}
            </Text>
            <TouchableWithoutFeedback
               onPress={() => {
                  setShowTopUpTab(true)
               }}
            >
               <Text
                  style={{
                     fontSize: 18,
                     fontWeight: '500',
                     color: appConfig.brandSettings.buttonSettings
                        .activeTextColor.value,
                  }}
               >
                  Top-Up
               </Text>
            </TouchableWithoutFeedback>
         </View>
         <View style={{ flex: 11 }}>
            <Text style={{ fontSize: 18, fontWeight: '500', marginBottom: 10 }}>
               Transaction History
            </Text>
            <View style={styles.transactionHeader}>
               <Text
                  style={[styles.headingText, { flex: 2, textAlign: 'left' }]}
               >
                  Transaction Date
               </Text>
               <Text
                  style={[styles.headingText, { flex: 1, textAlign: 'right' }]}
               >
                  Balance
               </Text>
            </View>
            <ScrollView>
               {user.wallet.walletTransactions.map(eachTransaction => {
                  return (
                     <View
                        key={eachTransaction.id}
                        style={[
                           styles.transactionStyle,
                           {
                              borderBottomColor: '#00000010',
                              borderBottomWidth: 1,
                           },
                        ]}
                     >
                        <Text style={styles.transactionDate}>
                           {moment(eachTransaction.created_at).format(
                              'DD MMM YY HH:mm'
                           )}
                        </Text>
                        <Text
                           style={[
                              styles.transactionAmount,
                              {
                                 color:
                                    eachTransaction.type === 'CREDIT'
                                       ? '#61D836'
                                       : '#FF0000',
                              },
                           ]}
                        >
                           {eachTransaction.type === 'CREDIT'
                              ? `+${formatCurrency(eachTransaction.amount)}`
                              : `+${formatCurrency(eachTransaction.amount)}`}
                        </Text>
                     </View>
                  )
               })}
            </ScrollView>
         </View>
      </View>
   )
}

const AddWalletAmount = ({ setShowTopUpTab }) => {
   const [amount, setAmount] = useState(0)
   const predefinedAmount = React.useMemo(() => {
      return [
         {
            label: 500,
            value: 500,
         },
         {
            label: 1000,
            value: 1000,
         },
         {
            label: 1500,
            value: 1500,
         },
      ]
   }, [])
   return (
      <View
         style={{
            paddingHorizontal: 12,
            backgroundColor: '#fff',
            height: '100%',
         }}
      >
         <View
            style={{
               flex: 1,
               flexDirection: 'row',
               justifyContent: 'space-between',
            }}
         >
            <Text style={styles.balance}>Top-Up</Text>
            <TouchableWithoutFeedback
               onPress={() => {
                  setShowTopUpTab(false)
               }}
            >
               <Text
                  style={{
                     fontSize: 18,
                     fontWeight: '500',
                     color: appConfig.brandSettings.buttonSettings
                        .activeTextColor.value,
                  }}
               >
                  Back
               </Text>
            </TouchableWithoutFeedback>
         </View>
         <View style={{ flex: 2 }}>
            <Text style={{ fontSize: 14, fontWeight: '500' }}>Add Money</Text>
            <Text
               style={{
                  fontSize: 18,
                  fontWeight: '500',
                  position: 'absolute',
                  top: 42,
                  left: 10,
               }}
            >
               {formatCurrency('')}
            </Text>
            <TextInput
               style={styles.input}
               onChangeText={setAmount}
               value={amount}
               placeholder="Enter amount..."
               keyboardType="numeric"
            />
            <View style={{ flexDirection: 'row' }}>
               {predefinedAmount.map((eachAmount, index) => {
                  return (
                     <Button
                        buttonStyle={{
                           marginRight: 5,
                        }}
                        key={`${eachAmount}-${index}`}
                        variant={
                           eachAmount.value == amount ? 'primary' : 'outline'
                        }
                        textStyle={{
                           color:
                              eachAmount.value == amount
                                 ? appConfig.brandSettings.buttonSettings
                                      .textColor.value
                                 : appConfig.brandSettings.buttonSettings
                                      .activeTextColor.value,
                        }}
                        onPress={() => {
                           setAmount(eachAmount.value)
                           walletAmountRef.current.value = eachAmount.value
                        }}
                     >
                        {formatCurrency(eachAmount.label)}
                     </Button>
                  )
               })}
            </View>
         </View>
         <View style={{ flex: 8 }}></View>
      </View>
   )
}
const styles = StyleSheet.create({
   balance: {
      fontWeight: '500',
      fontSize: 18,
   },
   transactionStyle: {
      justifyContent: 'space-between',
      flexDirection: 'row',
      height: 40,
      alignItems: 'center',
   },
   headingText: {
      fontSize: 16,
      fontWeight: '500',
      color: '#A2A2A2',
   },
   transactionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomColor: '#00000010',
      borderBottomWidth: 1,
      height: 40,
   },
   transactionId: {
      fontSize: 16,
      fontWeight: '500',
      flex: 1,
      textAlign: 'center',
   },
   transactionDate: {
      fontSize: 16,
      fontWeight: '500',
      flex: 2,
      textAlign: 'left',
   },
   transactionAmount: {
      fontSize: 16,
      fontWeight: '500',
      flex: 1,
      textAlign: 'right',
   },
   input: {
      borderWidth: 0.5,
      borderColor: '#00000040',
      height: 50,
      borderRadius: 4,
      marginVertical: 10,
      paddingHorizontal: 10,
      paddingLeft: 22,
      fontSize: 20,
      fontWeight: '500',
      color: '#00000080',
   },
})
export default WalletScreen
