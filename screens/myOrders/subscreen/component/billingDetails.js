import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
// import { useTranslation, useUser } from '../context'
import { formatCurrency } from '../../../../utils/formatCurrency'
import { useConfig } from '../../../../lib/config'
const user = {}
export const BillingDetails = ({ billing }) => {
   //    const { user } = useUser()
   const { configOf } = useConfig()

   const loyaltyPointsUsage = configOf('Loyalty Points Usage', 'rewards')[
      'Loyalty Points Usage'
   ]
   const loyaltyPointsConversionRate = parseInt(
      loyaltyPointsUsage?.ConversionRate?.value
   )
   console.log('billing', billing)
   return (
      <View style={styles.cartDetailContainer}>
         <Text style={[styles.textCommonStyle]}>{'Bill Details'}</Text>
         {billing && (
            <View>
               <View style={[styles.rowCommonStyle]}>
                  <Text style={[styles.textCommonStyle]}>{'Item total'}</Text>
                  <Text style={[styles.textCommonStyle]}>
                     {formatCurrency(billing.itemTotal || 0)}
                  </Text>
               </View>
               <View style={[styles.rowCommonStyle]}>
                  <Text style={[styles.textCommonStyle]}>{'Delivery fee'}</Text>
                  {billing.deliveryPrice === 0 ? (
                     <Text
                        style={{
                           fontWeight: 'bold',
                        }}
                     >
                        {'Free'}
                     </Text>
                  ) : (
                     <Text style={[styles.textCommonStyle]}>
                        {formatCurrency(billing.deliveryPrice || 0)}
                     </Text>
                  )}
               </View>
               {billing.itemTotalInclusiveTax > 0 ? (
                  <View style={[styles.rowCommonStyle]}>
                     <Text style={[styles.textCommonStyle]}>
                        {'Tax (Inclusive)'}
                     </Text>
                     <Text style={[styles.textCommonStyle]}>
                        {formatCurrency(
                           Math.round(
                              (billing.itemTotalInclusiveTax + Number.EPSILON) *
                                 100
                           ) / 100 || billing.itemTotalInclusiveTax
                        )}
                     </Text>
                  </View>
               ) : (
                  <View style={[styles.rowCommonStyle]}>
                     <Text style={[styles.textCommonStyle]}>{'Tax'}</Text>
                     <Text style={[styles.textCommonStyle]}>
                        {formatCurrency(
                           Math.round(
                              (billing.itemTotalTaxExcluded + Number.EPSILON) *
                                 100
                           ) / 100 || billing.itemTotalTaxExcluded
                        )}
                     </Text>
                  </View>
               )}
               {billing.totalDiscount > 0 && (
                  <View style={[styles.rowCommonStyle]}>
                     <Text style={[styles.textCommonStyle]}>
                        {'Total Discount'}
                     </Text>
                     <Text style={[styles.textCommonStyle]}>
                        - {formatCurrency(billing.totalDiscount || 0)}
                     </Text>
                  </View>
               )}
               {user?.keycloakId && billing.loyaltyAmountApplied > 0 && (
                  <View style={[styles.rowCommonStyle]}>
                     <Text style={[styles.textCommonStyle]}>
                        {'Loyalty amount applied'}
                     </Text>
                     <Text style={[styles.textCommonStyle]}>
                        <Text
                           title={
                              loyaltyPointsConversionRate &&
                              `${loyaltyPointsConversionRate} (Conversion Rate) * ${cart.loyaltyPointsUsed}`
                           }
                        >
                           {billing.loyaltyAmountApplied}
                        </Text>
                     </Text>
                  </View>
               )}
               {user?.keycloakId && billing.walletAmountUsed > 0 && (
                  <View style={[styles.rowCommonStyle]}>
                     <Text style={[styles.textCommonStyle]}>
                        {'Wallet amount used'}
                     </Text>
                     <Text style={[styles.textCommonStyle]}>
                        - {formatCurrency(billing.walletAmountUsed)}
                     </Text>
                  </View>
               )}

               <View style={[styles.rowCommonStyle]}>
                  <Text style={[styles.textCommonStyle, { fontWeight: '500' }]}>
                     {'Total'}
                  </Text>
                  <Text style={[styles.textCommonStyle, { fontWeight: '500' }]}>
                     {formatCurrency(billing.totalToPay || 0)}
                  </Text>
               </View>
            </View>
         )}
      </View>
   )
}

const styles = StyleSheet.create({
   cartDetailContainer: {
      marginHorizontal: 10,
   },
   rowCommonStyle: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 3,
   },
   textCommonStyle: {
      fontSize: 14,
      // fontWeight: '500',
   },
})
