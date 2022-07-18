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
import { Button } from '../../../components/button'
import { NoDataIcon } from '../../../assets/noDataIcon'
import { Spinner } from '../../../assets/loaders'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useConfig } from '../../../lib/config'
import PaymentOptionsRenderer from '../../../components/paymentOptionRenderer'
import useGlobalCss from '../../../globalStyle'

const WalletScreen = () => {
   const { globalCss } = useGlobalCss()
   const { isLoading } = useUser()
   const [showTopUpTab, setShowTopUpTab] = useState(false)
   if (isLoading) {
      return <Spinner size={'large'} showText={true} />
   }
   return (
      <SafeAreaView style={{ flex: 1 }}>
         <SubScreenHeader title={'Wallet'} />
         {showTopUpTab ? (
            <AddWalletAmount setShowTopUpTab={setShowTopUpTab} />
         ) : (
            <WalletDetails setShowTopUpTab={setShowTopUpTab} />
         )}
      </SafeAreaView>
   )
}

const WalletDetails = ({ setShowTopUpTab }) => {
   const { appConfig } = useConfig()
   const { globalCss } = useGlobalCss()
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
            <Text
               style={[styles.balance, { fontFamily: globalCss.font.semibold }]}
            >
               Available Balance : {formatCurrency(user.wallet?.amount || 0)}
            </Text>
            <TouchableWithoutFeedback
               onPress={() => {
                  setShowTopUpTab(true)
               }}
            >
               <Text
                  style={{
                     fontSize: 18,
                     fontFamily: globalCss.font.semibold,
                     color:
                        appConfig.brandSettings.buttonSettings.activeTextColor
                           .value || '#000000',
                  }}
               >
                  Top-Up
               </Text>
            </TouchableWithoutFeedback>
         </View>
         <View style={{ flex: 11 }}>
            <Text
               style={{
                  fontSize: 18,
                  fontFamily: globalCss.font.semibold,
                  marginBottom: 10,
               }}
            >
               Transaction History
            </Text>
            {user.wallet.walletTransactions.length == 0 ? (
               <View
                  style={{
                     flexDirection: 'column',
                     alignItems: 'center',
                     justifyContent: 'center',
                     height: '50%',
                  }}
               >
                  <NoDataIcon />
                  <Text
                     style={[
                        styles.noTransactionMessage,
                        { fontFamily: globalCss.font.semibold },
                     ]}
                  >
                     Oops! No transaction history is available yet
                  </Text>
               </View>
            ) : (
               <>
                  <View style={styles.transactionHeader}>
                     <Text
                        style={[
                           styles.headingText,
                           {
                              flex: 2,
                              textAlign: 'left',
                              fontFamily: globalCss.font.semibold,
                              color: globalCss.color.grey,
                           },
                        ]}
                     >
                        Transaction Date
                     </Text>
                     <Text
                        style={[
                           styles.headingText,
                           {
                              flex: 1,
                              textAlign: 'right',
                              fontFamily: globalCss.font.semibold,
                              color: globalCss.color.grey,
                           },
                        ]}
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
                              <Text
                                 style={[
                                    styles.transactionDate,
                                    { fontFamily: globalCss.font.medium },
                                 ]}
                              >
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
                                       fontFamily: globalCss.font.medium,
                                    },
                                 ]}
                              >
                                 {eachTransaction.type === 'CREDIT'
                                    ? `+${formatCurrency(
                                         eachTransaction.amount
                                      )}`
                                    : `+${formatCurrency(
                                         eachTransaction.amount
                                      )}`}
                              </Text>
                           </View>
                        )
                     })}
                  </ScrollView>
               </>
            )}
         </View>
      </View>
   )
}

const AddWalletAmount = ({ setShowTopUpTab }) => {
   const { appConfig } = useConfig()
   const { globalCss } = useGlobalCss()

   const { user } = useUser()
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
            <Text
               style={[styles.balance, { fontFamily: globalCss.font.semibold }]}
            >
               Top-Up
            </Text>
            <TouchableWithoutFeedback
               onPress={() => {
                  setShowTopUpTab(false)
               }}
            >
               <Text
                  style={{
                     fontSize: 18,
                     fontFamily: globalCss.font.semibold,
                     color:
                        appConfig.brandSettings.buttonSettings.activeTextColor
                           .value || '#000000',
                  }}
               >
                  Back
               </Text>
            </TouchableWithoutFeedback>
         </View>
         <View style={{ flex: 2 }}>
            <Text style={{ fontSize: 14, fontFamily: globalCss.font.semibold }}>
               Add Money
            </Text>
            <Text
               style={{
                  fontSize: 18,
                  fontFamily: globalCss.font.semibold,
                  position: 'absolute',
                  top: 42,
                  left: 10,
               }}
            >
               {formatCurrency('')}
            </Text>
            <TextInput
               style={[styles.input, { fontFamily: globalCss.font.medium }]}
               onChangeText={setAmount}
               value={`${amount}`}
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
                                      .textColor.value || '#ffffff'
                                 : appConfig.brandSettings.buttonSettings
                                      .activeTextColor.value || '#000000',
                        }}
                        onPress={() => {
                           setAmount(eachAmount.value.toString())
                        }}
                     >
                        {formatCurrency(eachAmount.label)}
                     </Button>
                  )
               })}
            </View>
         </View>

         <View style={{ flex: 8 }}>
            {amount ? (
               <PaymentOptionsRenderer
                  amount={amount}
                  availablePaymentOptionIds={
                     appConfig?.data?.walletPaymentOptions?.value.map(op => {
                        let optionId = parseInt(op[0]?.value?.id)
                        return optionId
                     }) || []
                  }
                  metaData={{
                     paymentFor: 'walletTopUp',
                     walletId: user.wallet.id,
                     customerkeycloakId: user.keycloakId,
                     amount: amount,
                     walletAmount: amount,
                  }}
                  setPaymentTunnelOpen={() => {
                     console.log('Payment Closed')
                  }}
                  onPaymentSuccess={() => {
                     console.log(
                        '===> Payment Success! [in functioned passed in paymentOptionRenderer]'
                     )
                  }}
                  onPaymentCancel={() => {
                     console.log(
                        '===> Payment Canceled! [in functioned passed in paymentOptionRenderer]'
                     )
                  }}
               />
            ) : null}
         </View>
      </View>
   )
}
const styles = StyleSheet.create({
   balance: {
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
   },
   transactionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomColor: '#00000010',
      borderBottomWidth: 1,
      height: 40,
   },
   noTransactionMessage: {
      fontSize: 16,
      marginVertical: 10,
   },
   transactionId: {
      fontSize: 16,
      flex: 1,
      textAlign: 'center',
   },
   transactionDate: {
      fontSize: 16,

      flex: 2,
      textAlign: 'left',
   },
   transactionAmount: {
      fontSize: 16,

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

      color: '#00000080',
   },
})
export default WalletScreen
