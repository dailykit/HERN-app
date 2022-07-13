import { useSubscription } from '@apollo/client'
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { NoDataIcon } from '../../../assets/noDataIcon'
import { useCart } from '../../../context'
import { useUser } from '../../../context/user'
import { COUPONS } from '../../../graphql'
import { useConfig } from '../../../lib/config'
import { SubScreenHeader } from './header'
import { Spinner } from '../../../assets/loaders'
import { SafeAreaView } from 'react-native-safe-area-context'

const OffersScreen = () => {
   // context
   const { user } = useUser()
   const { brand } = useConfig()
   const { cartState } = useCart()

   // state
   const [availableCoupons, setAvailableCoupons] = React.useState([])
   const [isCouponsLoading, setIsCouponsLoading] = React.useState(true)

   const { loading, error } = useSubscription(COUPONS, {
      variables: {
         params: {
            cartId: cartState?.cart?.id,
            ...(user?.keycloakId && { keycloakId: user?.keycloakId }),
         },
         brandId: brand.id,
      },
      onSubscriptionData: data => {
         const coupons = data.subscriptionData.data.coupons
         setAvailableCoupons([
            ...coupons.filter(coupon => coupon.visibilityCondition.isValid),
         ])
         setIsCouponsLoading(false)
      },
   })

   console.log('==> Offers: ', availableCoupons)

   return (
      <SafeAreaView style={{ flex: 1 }}>
         <SubScreenHeader title={'Check Offers'} />
         <View style={{ backgroundColor: '#fff', height: '100%', padding: 12 }}>
            <Text style={styles.couponTextStyle}>Coupons</Text>
            {isCouponsLoading ? (
               <Spinner size={'large'} showText={true} />
            ) : error ? (
               <Text style={{ fontFamily: 'MetropolisMedium' }}>
                  Something went wrong
               </Text>
            ) : availableCoupons.length === 0 ? (
               <View
                  style={{
                     flexDirection: 'column',
                     alignItems: 'center',
                     justifyContent: 'center',
                     height: '50%',
                  }}
               >
                  <NoDataIcon />
                  <Text style={styles.noCoupons}>No coupons available</Text>
               </View>
            ) : (
               <View>
                  {availableCoupons.map(eachCoupon => {
                     return (
                        <CouponCard
                           eachCoupon={eachCoupon}
                           key={eachCoupon.id}
                        />
                     )
                  })}
               </View>
            )}
         </View>
      </SafeAreaView>
   )
}
const CouponCard = ({ coupon }) => {
   return (
      <View style={styles.cardContainer}>
         <Text style={styles.codeText}>{coupon.code}</Text>
         <Text style={styles.codeDetail}>{coupon.metaDetails.title}</Text>
         <Text style={styles.codeDetail}>{coupon.metaDetails.description}</Text>
      </View>
   )
}
export default OffersScreen

const styles = StyleSheet.create({
   couponTextStyle: {
      fontWeight: '500',
      fontSize: 16,
   },
   noCoupons: {
      fontWeight: '600',
      fontSize: 16,
      marginVertical: 10,
   },
   cardContainer: {
      marginVertical: 8,
      borderWidth: 1,
      borderColor: '#00000010',
      padding: 13,
      borderRadius: 10,
   },
   codeText: {
      fontSize: 18,
      fontWeight: '500',
      marginVertical: 2,
   },
   codeDetail: {
      fontSize: 14,
      fontWeight: '500',

      marginVertical: 2,
   },
})
