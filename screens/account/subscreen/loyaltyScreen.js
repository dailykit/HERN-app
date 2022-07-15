import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { CoinsIcon } from '../../../assets/coinsIcon'
import { useUser } from '../../../context/user'
import { SubScreenHeader } from './header'
import moment from 'moment'
import { NoDataIcon } from '../../../assets/noDataIcon'
import { Spinner } from '../../../assets/loaders'
import { SafeAreaView } from 'react-native-safe-area-context'
import global from '../../../globalStyles'

const LoyaltyPointsScreen = () => {
   const { user, isLoading } = useUser()
   if (isLoading) {
      return <Spinner size={'large'} showText={true} />
   }
   return (
      <SafeAreaView style={{ flex: 1 }}>
         <SubScreenHeader title={'Loyalty Points'} />
         <View style={{ height: '100%', backgroundColor: '#fff', padding: 12 }}>
            <View
               style={{ alignItems: 'center', flexDirection: 'row', flex: 1 }}
            >
               <Text style={styles.loyaltyText}>Loyalty Points :</Text>
               <CoinsIcon />
               <Text style={[styles.loyaltyText, { marginLeft: 5 }]}>
                  {user.loyaltyPoint.points || 0}
               </Text>
            </View>
            <View style={{ flex: 11 }}>
               <Text
                  style={{
                     fontSize: 18,
                     marginBottom: 10,
                     fontFamily: global.regular,
                  }}
               >
                  Transaction History
               </Text>
               {user.loyaltyPoint.loyaltyPointTransactions.length == 0 ? (
                  <View
                     style={{
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '50%',
                     }}
                  >
                     <NoDataIcon />
                     <Text style={styles.noTransactionMessage}>
                        Oops! No transaction history is available yet
                     </Text>
                  </View>
               ) : (
                  <>
                     <View style={styles.transactionHeader}>
                        <Text
                           style={[
                              styles.headingText,
                              { flex: 2, textAlign: 'left' },
                           ]}
                        >
                           Transaction Date
                        </Text>
                        <Text
                           style={[
                              styles.headingText,
                              { flex: 1, textAlign: 'right' },
                           ]}
                        >
                           Balance
                        </Text>
                     </View>
                     <ScrollView>
                        {user.loyaltyPoint.loyaltyPointTransactions.map(
                           eachTransaction => {
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
                                       {moment(
                                          eachTransaction.created_at
                                       ).format('DD MMM YY HH:mm')}
                                    </Text>
                                    <Text
                                       style={[
                                          styles.transactionAmount,
                                          {
                                             color:
                                                eachTransaction.type ===
                                                'CREDIT'
                                                   ? '#61D836'
                                                   : '#FF0000',
                                          },
                                       ]}
                                    >
                                       {eachTransaction.type === 'CREDIT'
                                          ? `+${eachTransaction.points}`
                                          : `+${eachTransaction.points}`}
                                    </Text>
                                 </View>
                              )
                           }
                        )}
                     </ScrollView>
                  </>
               )}
            </View>
         </View>
      </SafeAreaView>
   )
}
const styles = StyleSheet.create({
   loyaltyText: {
      fontFamily: global.regular,
      fontSize: 18,
   },
   headingText: {
      fontFamily: global.regular,
      fontSize: 16,
      color: global.greyColor,
   },
   noTransactionMessage: {
      fontFamily: global.semibold,
      fontSize: 16,
      marginVertical: 10,
   },
   transactionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomColor: '#00000010',
      borderBottomWidth: 1,
      height: 40,
   },
   transactionStyle: {
      justifyContent: 'space-between',
      flexDirection: 'row',
      height: 40,
      alignItems: 'center',
   },
   transactionId: {
      fontSize: 16,
      fontFamily: global.regular,
      flex: 1,
      textAlign: 'center',
   },
   transactionDate: {
      fontFamily: global.regular,
      fontSize: 16,
      flex: 2,
      textAlign: 'left',
   },
   transactionAmount: {
      fontFamily: global.regular,
      fontSize: 16,
      flex: 1,
      textAlign: 'right',
   },
})
export default LoyaltyPointsScreen
