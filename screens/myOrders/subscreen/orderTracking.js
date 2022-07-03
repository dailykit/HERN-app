import { useQuery, useSubscription } from '@apollo/client'
import { useRoute } from '@react-navigation/native'
import React, { useState } from 'react'
import {
   ActivityIndicator,
   StyleSheet,
   Text,
   View,
   ScrollView,
   Image,
} from 'react-native'
import { GET_ORDER_DETAIL_ONE_SUBS } from '../../../graphql'
import { SubScreenHeader } from './component/header'
import appConfig from '../../../brandConfig.json'
import { isEmpty, isNull } from 'lodash'
import moment from 'moment'
import { ProfileIcon } from '../../../assets/profileIcon'
import { MapTracking } from './component/deliveryTrackingOnMap'
import { CardsIcon } from '../../../assets/cardsIcon'
import { formatCurrency } from '../../../utils/formatCurrency'
import { combineCartItems } from '../../../utils'
import { BillingDetails } from './component/billingDetails'
import { DeliveryProgressBar } from './component/deliveryProgressBar'
import { Spinner } from '../../../assets/loaders'
import { SafeAreaView } from 'react-native-safe-area-context'

const OrderTrackingScreen = () => {
   const route = useRoute()
   const cartId = React.useMemo(() => route.params.cartId, [])

   const {
      loading,
      error,
      data: { carts = [] } = {},
   } = useSubscription(GET_ORDER_DETAIL_ONE_SUBS, {
      variables: {
         where: {
            id: {
               _eq: cartId,
            },
         },
      },
   })
   const cart = React.useMemo(() => carts[0], [carts])

   return (
      <SafeAreaView style={{ flex: 1 }}>
         <SubScreenHeader title={`Order ${cartId}`} />
         <ScrollView>
            <View style={{ padding: 8, backgroundColor: '#ffffff' }}>
               {loading ? (
                  <Spinner size={'large'} showText={true} />
               ) : error ? (
                  <Text> Something went wrong</Text>
               ) : isNull(cart.order.isAccepted) &&
                 isNull(cart.order.isRejected) ? (
                  <View>
                     <AcceptingOrder />
                     <OrderDetail cart={cart} />
                  </View>
               ) : cart.order.isAccepted ? (
                  <View>
                     <MapTracking />
                     <DeliveryProgressBar
                        orderStatus={cart.status}
                        deliveryInfo={cart.order.deliveryInfo || {}}
                     />
                     <OrderDetail cart={cart} />
                  </View>
               ) : (
                  <View>
                     <RejectedOrder />
                     <OrderDetail cart={cart} />
                  </View>
               )}
            </View>
         </ScrollView>
      </SafeAreaView>
   )
}

const AcceptingOrder = () => {
   return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
         <ActivityIndicator
            size="large"
            color={appConfig.brandSettings.brandColor.value}
         />
         <Text style={{ fontStyle: 'italic', marginLeft: 8 }}>
            Waiting for Accepting Order
         </Text>
      </View>
   )
}

const RejectedOrder = () => {
   return (
      <View>
         <Text>Your order has been Rejected.</Text>
      </View>
   )
}

const OrderDetail = ({ cart }) => {
   const [componentStatus, setComponentStatus] = useState('loading')
   const [cartItems, setCartItems] = useState()

   React.useEffect(() => {
      setCartItems(combineCartItems(cart.cartItems))
      setComponentStatus('success')
   }, [cart])

   const label = React.useMemo(() => {
      if (cart?.fulfillmentInfo?.type) {
         const fulfillmentType = cart?.fulfillmentInfo?.type
         switch (fulfillmentType) {
            case 'ONDEMAND_DELIVERY':
               return 'Delivery At'
            case 'PREORDER_DELIVERY':
               return 'Delivery At'
            case 'PREORDER_PICKUP':
               return 'Pickup From'
            case 'ONDEMAND_PICKUP':
               return 'Pickup From'
            case 'PREORDER_DINEIN':
               return 'Dine In At'
            case 'ONDEMAND_DINEIN':
               return 'Dine In At'
         }
      } else {
         return null
      }
   }, [cart?.fulfillmentInfo?.type])

   const getTitle = type => {
      switch (type) {
         case 'ONDEMAND_DELIVERY':
            return 'Delivery'
         case 'PREORDER_DELIVERY':
            return 'Schedule Delivery'
         case 'PREORDER_PICKUP':
            return 'Schedule Pickup'
         case 'ONDEMAND_PICKUP':
            return 'Pickup'
      }
   }
   if (componentStatus === 'loading') {
      return <Spinner size={'large'} showText={true} />
   }
   return (
      <View
         style={{
            paddingTop: 12,
            height: '100%',
            backgroundColor: '#ffffff',
         }}
      >
         <View style={styles.userInfo}>
            <Text style={{ fontWeight: '500' }}>
               <ProfileIcon /> {'  '}
               {cart.customerInfo.customerFirstName}{' '}
               {cart.customerInfo.customerLastName}
            </Text>
            <Text style={{ marginLeft: 20 }}>
               {cart.customerInfo.customerPhone}
            </Text>
         </View>
         <View style={styles.addressContainer}>
            <View style={{ flexDirection: 'row' }}>
               <Text style={{ fontWeight: '500' }}>{label}</Text>
            </View>
            {cart.address.label ? <Text>{cart.address.label}</Text> : null}
            <Text>{`${cart.address?.line1}`}</Text>
            <Text>
               {`${cart.address?.city} ${cart.address?.state} ${cart.address?.country},${cart.address?.zipcode}`}
            </Text>
         </View>
         <View style={styles.fulfillmentContainer}>
            <Text style={styles.fulfillmentInfo}>
               {getTitle(cart?.fulfillmentInfo?.type)}
            </Text>
            <Text style={styles.fulfillmentInfo}>
               {' '}
               on{' '}
               {moment(cart?.fulfillmentInfo?.slot?.from).format('DD MMM YYYY')}
               {' ('}
               {moment(cart?.fulfillmentInfo?.slot?.from).format('HH:mm')}
               {'-'}
               {moment(cart?.fulfillmentInfo?.slot?.to).format('HH:mm')}
               {')'}
            </Text>
         </View>
         <View style={styles.paymentDetails}>
            <CardsIcon />
            <Text style={{ marginHorizontal: 6, fontWeight: '500' }}>
               Payment Details:
            </Text>
            <Text>{cart.availablePaymentOption?.label || 'N/A'}</Text>
         </View>
         <View style={styles.cartItemHeader}>
            <Text style={styles.itemCount}>Item(s)({cartItems.length})</Text>
            <Text style={styles.orderDate}>
               {moment(cart.order?.created_at).format('DD MMM YY hh:mm a')}
            </Text>
         </View>

         {cartItems.map((product, index) => {
            return (
               <View key={`${product.id}-${index}`}>
                  <View style={styles.productHeader}>
                     <View
                        style={{
                           flexDirection: 'row',
                           flexShrink: 1,
                           marginRight: 10,
                        }}
                     >
                        <View style={{ flexDirection: 'row' }}>
                           <Image
                              source={{
                                 uri: product.image,
                                 height: 80,
                                 width: 80,
                              }}
                           />
                           <Text>
                              {product.name}{' '}
                              {product.price > 0 ? (
                                 product.discount !== 0 ? (
                                    <>
                                       <Text
                                          style={{
                                             textDecorationLine: 'line-through',
                                             color: '#a2a2a2',
                                             marginRight: 4,
                                          }}
                                       >
                                          {formatCurrency(product.price)}
                                       </Text>
                                       <Text>
                                          {formatCurrency(
                                             product.price - product.discount
                                          )}
                                       </Text>
                                    </>
                                 ) : (
                                    <Text>{formatCurrency(product.price)}</Text>
                                 )
                              ) : null}
                           </Text>
                        </View>
                     </View>
                     <Text>x{product.ids.length}</Text>
                  </View>
                  {product.childs.length > 0 ? (
                     <View style={{ marginLeft: 6 }}>
                        <View style={styles.productOption}>
                           <Text style={styles.productOptionText}>
                              {product.childs[0].productOption.label}
                           </Text>
                           {product.childs[0].price !== 0 ? (
                              <View
                                 style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                 }}
                              >
                                 {product.childs[0].discount != 0 ? (
                                    <Text
                                       style={{
                                          textDecorationLine: 'line-through',
                                          color: '#a2a2a2',
                                          marginRight: 4,
                                       }}
                                    >
                                       {formatCurrency(product.childs[0].price)}
                                    </Text>
                                 ) : null}
                                 <Text style={styles.productOptionText}>
                                    {formatCurrency(
                                       product.childs[0].price -
                                          product.childs[0].discount
                                    )}
                                 </Text>
                              </View>
                           ) : null}
                        </View>
                        <View>
                           {product.childs[0].childs.length > 0 ? (
                              <View>
                                 {product.childs[0].childs.map(
                                    (eachModifier, index) => {
                                       return (
                                          <View
                                             key={`${eachModifier.id}-${index}`}
                                          >
                                             <View>
                                                <Text
                                                   style={
                                                      styles.modifierOptionText
                                                   }
                                                >
                                                   {
                                                      eachModifier
                                                         .modifierOption.name
                                                   }
                                                </Text>
                                                {eachModifier.price !== 0 ? (
                                                   <View
                                                      style={{
                                                         flexDirection: 'row',
                                                         alignItems: 'center',
                                                      }}
                                                   >
                                                      {eachModifier.discount !=
                                                      0 ? (
                                                         <Text
                                                            style={{
                                                               textDecorationLine:
                                                                  'line-through',
                                                               color: '#a2a2a2',
                                                               marginRight: 4,
                                                            }}
                                                         >
                                                            {formatCurrency(
                                                               eachModifier.price
                                                            )}
                                                         </Text>
                                                      ) : null}
                                                      <Text
                                                         style={
                                                            styles.modifierOptionText
                                                         }
                                                      >
                                                         {formatCurrency(
                                                            eachModifier.price -
                                                               eachModifier.discount
                                                         )}
                                                      </Text>
                                                   </View>
                                                ) : null}
                                             </View>
                                          </View>
                                       )
                                    }
                                 )}
                              </View>
                           ) : null}
                        </View>
                     </View>
                  ) : null}
               </View>
            )
         })}
         <View
            style={{
               height: 1,
               backgroundColor: '#a2a2a2',
               marginVertical: 15,
            }}
         ></View>
         <BillingDetails billing={cart.cartOwnerBilling} />
      </View>
   )
}

const styles = StyleSheet.create({
   assignedName: {
      color: '#00000080',
      marginLeft: 8,
   },
   assignedPhone: {
      color: '#00000060',
      marginLeft: 8,
   },
   time: {
      fontStyle: 'italic',
      fontFamily: 'Metropolis',
      fontSize: 10,
      marginLeft: 4,
   },

   headerContainer: {
      height: 64,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 10,
   },
   orderCard: {
      marginVertical: 6,
      borderWidth: 1,
      borderColor: '#00000010',
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 6,
   },
   orderCardHeader: {
      flexDirection: 'row',
   },
   productHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 4,
   },
   productOption: {
      flexDirection: 'row',
      justifyContent: 'space-between',
   },
   orderStatusInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
   },
   divider: {
      height: 1,
      backgroundColor: '#00000010',
      marginVertical: 6,
   },
   fulfillmentInfo: {
      color: '#000000',
      fontWeight: '500',
   },
   itemCount: {
      fontSize: 14,
      fontWeight: '500',
   },
   productOptionText: {
      marginVertical: 3,
      color: '#00000080',
   },
   modifierOptionText: {
      marginVertical: 3,
      color: '#00000080',
   },
   cartItemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
   },
   orderDate: {
      fontStyle: 'italic',
   },
   addressContainer: {
      marginVertical: 10,
      borderWidth: 1,
      borderColor: '#00000020',
      padding: 6,
      borderRadius: 6,
   },
   address: {},
   paymentDetails: {
      marginVertical: 10,
      borderWidth: 1,
      borderColor: '#00000020',
      padding: 6,
      borderRadius: 6,
      flexDirection: 'row',
      height: 45,
      alignItems: 'center',
   },
   fulfillmentContainer: {
      marginVertical: 10,
      borderWidth: 1,
      borderColor: '#00000020',
      padding: 6,
      borderRadius: 6,
      flexDirection: 'row',
      height: 45,
      alignItems: 'center',
   },
   userInfo: {
      flexDirection: 'row',
      marginBottom: 4,
      borderWidth: 1,
      borderColor: '#00000020',
      borderRadius: 6,
      padding: 6,
      height: 45,
      alignItems: 'center',
   },
})
export default OrderTrackingScreen
