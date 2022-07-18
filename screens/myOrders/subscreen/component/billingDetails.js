import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
// import { useTranslation, useUser } from '../context'
import { formatCurrency } from '../../../../utils/formatCurrency'
import { useConfig } from '../../../../lib/config'
import useGlobalCss from '../../../../globalStyle'

const user = {}
export const BillingDetails = ({ billing }) => {
   //    const { user } = useUser()
   const { configOf } = useConfig()
   const { globalCss } = useGlobalCss()

   const loyaltyPointsUsage = configOf('Loyalty Points Usage', 'rewards')[
      'Loyalty Points Usage'
   ]
   const loyaltyPointsConversionRate = parseInt(
      loyaltyPointsUsage?.ConversionRate?.value
   )
   return (
      <View style={styles.cartDetailContainer}>
         <Text
            style={[
               styles.textCommonStyle,
               { fontFamily: globalCss.font.medium },
            ]}
         >
            {'Bill Details'}
         </Text>
         {billing && (
            <View>
               <View style={[styles.rowCommonStyle]}>
                  <Text
                     style={[
                        styles.textCommonStyle,
                        { fontFamily: globalCss.font.medium },
                     ]}
                  >
                     {'Item total'}
                  </Text>
                  <Text
                     style={[
                        styles.textCommonStyle,
                        { fontFamily: globalCss.font.medium },
                     ]}
                  >
                     {formatCurrency(billing.itemTotal || 0)}
                  </Text>
               </View>
               <View style={[styles.rowCommonStyle]}>
                  <Text
                     style={[
                        styles.textCommonStyle,
                        { fontFamily: globalCss.font.medium },
                     ]}
                  >
                     {'Delivery fee'}
                  </Text>
                  {billing.deliveryPrice === 0 ? (
                     <Text
                        style={{
                           fontFamily: globalCss.font.bold,
                        }}
                     >
                        {'Free'}
                     </Text>
                  ) : (
                     <Text
                        style={[
                           styles.textCommonStyle,
                           { fontFamily: globalCss.font.medium },
                        ]}
                     >
                        {formatCurrency(billing.deliveryPrice || 0)}
                     </Text>
                  )}
               </View>
               {billing.itemTotalInclusiveTax > 0 ? (
                  <View style={[styles.rowCommonStyle]}>
                     <Text
                        style={[
                           styles.textCommonStyle,
                           { fontFamily: globalCss.font.medium },
                        ]}
                     >
                        {'Tax (Inclusive)'}
                     </Text>
                     <Text
                        style={[
                           styles.textCommonStyle,
                           { fontFamily: globalCss.font.medium },
                        ]}
                     >
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
                     <Text
                        style={[
                           styles.textCommonStyle,
                           { fontFamily: globalCss.font.medium },
                        ]}
                     >
                        {'Tax'}
                     </Text>
                     <Text
                        style={[
                           styles.textCommonStyle,
                           { fontFamily: globalCss.font.medium },
                        ]}
                     >
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
                     <Text
                        style={[
                           styles.textCommonStyle,
                           { fontFamily: globalCss.font.medium },
                        ]}
                     >
                        {'Total Discount'}
                     </Text>
                     <Text
                        style={[
                           styles.textCommonStyle,
                           { fontFamily: globalCss.font.medium },
                        ]}
                     >
                        - {formatCurrency(billing.totalDiscount || 0)}
                     </Text>
                  </View>
               )}
               {user?.keycloakId && billing.loyaltyAmountApplied > 0 && (
                  <View style={[styles.rowCommonStyle]}>
                     <Text
                        style={[
                           styles.textCommonStyle,
                           { fontFamily: globalCss.font.medium },
                        ]}
                     >
                        {'Loyalty amount applied'}
                     </Text>
                     <Text
                        style={[
                           styles.textCommonStyle,
                           { fontFamily: globalCss.font.medium },
                        ]}
                     >
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
                     <Text
                        style={[
                           styles.textCommonStyle,
                           { fontFamily: globalCss.font.medium },
                        ]}
                     >
                        {'Wallet amount used'}
                     </Text>
                     <Text
                        style={[
                           styles.textCommonStyle,
                           { fontFamily: globalCss.font.medium },
                        ]}
                     >
                        - {formatCurrency(billing.walletAmountUsed)}
                     </Text>
                  </View>
               )}

               <View style={[styles.rowCommonStyle]}>
                  <Text
                     style={[
                        styles.textCommonStyle,
                        { fontFamily: globalCss.font.medium },
                     ]}
                  >
                     {'Total'}
                  </Text>
                  <Text
                     style={[
                        styles.textCommonStyle,
                        { fontFamily: globalCss.font.medium },
                     ]}
                  >
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
   },
})
