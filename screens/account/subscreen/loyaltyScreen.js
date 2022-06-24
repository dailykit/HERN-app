import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { CoinsIcon } from '../../../assets/coinsIcon'
import { useUser } from '../../../context/user'
import { SubScreenHeader } from './header'
import moment from 'moment'
import { NoDataIcon } from '../../../assets/noDataIcon'

const LoyaltyPointsScreen = () => {
   const { user, isLoading } = useUser()
   if (isLoading) {
      return <Text>Loading</Text>
   }
   return (
      <View>
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
                  style={{ fontSize: 18, fontWeight: '500', marginBottom: 10 }}
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
      </View>
   )
}
const styles = StyleSheet.create({
   loyaltyText: {
      fontSize: 18,
      fontWeight: '500',
   },
   noTransactionMessage: {
      fontWeight: '600',
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
})
export default LoyaltyPointsScreen
