import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
// import { useTranslation, useUser } from '../context'
import { formatCurrency } from '../../utils/formatCurrency'
import { useConfig } from '../../lib/config'
import useGlobalStyle from '../../globalStyle'

const user = {}
export const CartBillingDetails = ({ cart, billing, tip = false }) => {
   const { globalStyle } = useGlobalStyle()
   //    const { user } = useUser()
   const { configOf } = useConfig()

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
               {
                  fontSize: 14,
                  fontFamily: globalStyle.font.medium,
               },
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
                        {
                           fontFamily: globalStyle.font.medium,
                           color: '#00000080',
                        },
                     ]}
                  >
                     {'Item total'}
                  </Text>
                  <Text
                     style={[
                        styles.textCommonStyle,
                        { fontFamily: globalStyle.font.medium },
                     ]}
                  >
                     {formatCurrency(billing.itemTotal || 0)}
                  </Text>
               </View>
               <View style={[styles.rowCommonStyle]}>
                  <Text
                     style={[
                        styles.textCommonStyle,
                        {
                           fontFamily: globalStyle.font.medium,
                           color: '#00000080',
                        },
                     ]}
                  >
                     {'Delivery fee'}
                  </Text>
                  {billing.deliveryPrice === 0 ? (
                     <Text
                        style={[
                           styles.textCommonStyle,
                           {
                              fontFamily: globalStyle.font.medium,
                           },
                        ]}
                     >
                        {'Free'}
                     </Text>
                  ) : (
                     <Text
                        style={[
                           styles.textCommonStyle,
                           { fontFamily: globalStyle.font.medium },
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
                           { fontFamily: globalStyle.font.medium },
                        ]}
                     >
                        {'Tax (Inclusive)'}
                     </Text>
                     <Text
                        style={[
                           styles.textCommonStyle,
                           { fontFamily: globalStyle.font.medium },
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
                           {
                              fontFamily: globalStyle.font.medium,
                              color: '#00000080',
                           },
                        ]}
                     >
                        {'Tax'}
                     </Text>
                     <Text
                        style={[
                           styles.textCommonStyle,
                           { fontFamily: globalStyle.font.medium },
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
                           { fontFamily: globalStyle.font.medium },
                        ]}
                     >
                        {'Total Discount'}
                     </Text>
                     <Text
                        style={[
                           styles.textCommonStyle,
                           { fontFamily: globalStyle.font.medium },
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
                           { fontFamily: globalStyle.font.medium },
                        ]}
                     >
                        {'Loyalty amount applied'}
                     </Text>
                     <Text
                        style={[
                           styles.textCommonStyle,
                           { fontFamily: globalStyle.font.medium },
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
                           { fontFamily: globalStyle.font.medium },
                        ]}
                     >
                        {'Wallet amount used'}
                     </Text>
                     <Text
                        style={[
                           styles.textCommonStyle,
                           { fontFamily: globalStyle.font.medium },
                        ]}
                     >
                        - {formatCurrency(billing.walletAmountUsed)}
                     </Text>
                  </View>
               )}
               {tip && tip !== 0 ? (
                  <View style={[styles.rowCommonStyle]}>
                     <Text
                        style={[
                           styles.textCommonStyle,
                           { fontFamily: globalStyle.font.medium },
                        ]}
                     >
                        {'Tip'}
                     </Text>
                     <Text
                        style={[
                           styles.textCommonStyle,
                           { fontFamily: globalStyle.font.medium },
                        ]}
                     >
                        {formatCurrency(tip)}
                     </Text>
                  </View>
               ) : null}
               <View
                  style={{
                     width: '100%',
                     height: 1,
                     backgroundColor: '#00000030',
                     marginTop: 2,
                     marginBottom: 2,
                  }}
               ></View>
               <View style={[styles.rowCommonStyle]}>
                  <Text
                     style={[
                        styles.textCommonStyle,
                        {
                           fontFamily: globalStyle.font.medium,
                           color: '#00000080',
                           fontSize: 15,
                        },
                     ]}
                  >
                     {'Total'}
                  </Text>
                  <Text
                     style={[
                        styles.textCommonStyle,

                        { fontFamily: globalStyle.font.medium, fontSize: 15 },
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
      marginVertical: 20,
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
