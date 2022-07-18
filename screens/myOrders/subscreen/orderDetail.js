import { useQuery } from '@apollo/client'
import { useRoute } from '@react-navigation/native'
import moment from 'moment'
import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native'
import { GET_ORDER_DETAIL_ONE } from '../../../graphql'
import { combineCartItems } from '../../../utils'
import { formatCurrency } from '../../../utils/formatCurrency'
import { SubScreenHeader } from './component/header'
import { BillingDetails } from './component/billingDetails'
import { CardsIcon } from '../../../assets/cardsIcon'
import { ProfileIcon } from '../../../assets/profileIcon'
import { Spinner } from '../../../assets/loaders'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useConfig } from '../../../lib/config'
import useGlobalCss from '../../../globalStyle'

const OrderDetailScreen = ({ products, createdAt }) => {
   const { appConfig } = useConfig()
   const { globalCss } = useGlobalCss()
   const route = useRoute()
   const [componentStatus, setComponentStatus] = React.useState('loading')
   const [cartItems, setCartItems] = React.useState([])
   // console.log('cartID', route.params.cartId)
   const {
      loading,
      error,
      data: { carts = [] } = {},
   } = useQuery(GET_ORDER_DETAIL_ONE, {
      variables: {
         where: {
            id: {
               _eq: route.params.cartId,
            },
         },
      },
   })

   React.useEffect(() => {
      if (!loading) {
         if (error) {
            setComponentStatus('error')
         } else {
            setCartItems(combineCartItems(carts[0].cartItems))
            setComponentStatus('success')
         }
      }
   }, [loading, carts])
   const label = React.useMemo(() => {
      if (carts[0]?.fulfillmentInfo?.type) {
         const fulfillmentType = carts[0]?.fulfillmentInfo?.type
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
   }, [carts[0]?.fulfillmentInfo?.type])
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

   return (
      <SafeAreaView style={{ backgroundColor: '#ffffff', flex: 1 }}>
         <SubScreenHeader title={'Order Detail'} />
         {componentStatus === 'loading' ? (
            <Spinner size={'large'} showText={true} />
         ) : componentStatus === 'error' ? (
            <Text style={{ fontFamily: globalCss.font.medium }}>
               Something went wrong
            </Text>
         ) : (
            <ScrollView>
               <View
                  style={{
                     padding: 12,
                     height: '100%',
                     backgroundColor: '#ffffff',
                  }}
               >
                  <View style={styles.userInfo}>
                     <Text style={{ fontFamily: globalCss.font.semibold }}>
                        <ProfileIcon /> {'  '}
                        {carts[0].customerInfo.customerFirstName}{' '}
                        {carts[0].customerInfo.customerLastName}
                     </Text>
                     <Text
                        style={{
                           fontFamily: globalCss.font.regular,
                           marginLeft: 20,
                        }}
                     >
                        {carts[0].customerInfo.customerPhone}
                     </Text>
                  </View>
                  <View style={styles.addressContainer}>
                     <View style={{ flexDirection: 'row' }}>
                        <Text style={{ fontFamily: globalCss.font.semibold }}>
                           {label}
                        </Text>
                     </View>
                     {carts[0].address.label ? (
                        <Text style={{ fontFamily: globalCss.font.regular }}>
                           carts[0].address.label
                        </Text>
                     ) : null}
                     <Text
                        style={{ fontFamily: globalCss.font.regular }}
                     >{`${carts[0].address?.line1}`}</Text>
                     <Text style={{ fontFamily: globalCss.font.regular }}>
                        {`${carts[0].address?.city} ${carts[0].address?.state} ${carts[0].address?.country},${carts[0].address?.zipcode}`}
                     </Text>
                  </View>
                  <View style={styles.fulfillmentContainer}>
                     <Text
                        style={[
                           styles.fulfillmentInfo,
                           { fontFamily: globalCss.font.semibold },
                        ]}
                     >
                        {getTitle(carts[0]?.fulfillmentInfo?.type)}
                     </Text>

                     <Text
                        style={[
                           styles.fulfillmentInfo,
                           { fontFamily: globalCss.font.semibold },
                        ]}
                     >
                        {' '}
                        on{' '}
                        {moment(carts[0]?.fulfillmentInfo?.slot?.from).format(
                           'DD MMM YYYY'
                        )}
                        {' ('}
                        {moment(carts[0]?.fulfillmentInfo?.slot?.from).format(
                           'HH:mm'
                        )}
                        {'-'}
                        {moment(carts[0]?.fulfillmentInfo?.slot?.to).format(
                           'HH:mm'
                        )}
                        {')'}
                     </Text>
                  </View>
                  <View style={styles.paymentDetails}>
                     <CardsIcon />
                     <Text
                        style={{
                           marginHorizontal: 6,
                           fontFamily: globalCss.font.semibold,
                        }}
                     >
                        Payment Details:
                     </Text>
                     <Text style={{ fontFamily: globalCss.font.regular }}>
                        {carts[0].availablePaymentOption?.label || 'N/A'}
                     </Text>
                  </View>
                  <View style={styles.cartItemHeader}>
                     <Text
                        style={[
                           styles.itemCount,
                           { fontFamily: globalCss.font.semibold },
                        ]}
                     >
                        Item(s)({cartItems.length})
                     </Text>

                     <Text style={{ fontFamily: globalCss.font.italic }}>
                        {moment(createdAt).format('DD MMM YY hh:mm a')}
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
                                    <Text
                                       style={{
                                          fontFamily: globalCss.font.medium,
                                       }}
                                    >
                                       {product.name}{' '}
                                       {product.price > 0 ? (
                                          product.discount !== 0 ? (
                                             <>
                                                <Text
                                                   style={{
                                                      fontFamily:
                                                         globalCss.font.regular,
                                                      textDecorationLine:
                                                         'line-through',
                                                      color: globalCss.color
                                                         .grey,
                                                      marginRight: 4,
                                                   }}
                                                >
                                                   {formatCurrency(
                                                      product.price
                                                   )}
                                                </Text>
                                                <Text
                                                   style={{
                                                      fontFamily:
                                                         globalCss.font.regular,
                                                   }}
                                                >
                                                   {formatCurrency(
                                                      product.price -
                                                         product.discount
                                                   )}
                                                </Text>
                                             </>
                                          ) : (
                                             <Text
                                                style={{
                                                   fontFamily:
                                                      globalCss.font.regular,
                                                }}
                                             >
                                                {formatCurrency(product.price)}
                                             </Text>
                                          )
                                       ) : null}
                                    </Text>
                                 </View>
                              </View>
                              <Text
                                 style={{
                                    fontFamily: globalCss.font.regular,
                                 }}
                              >
                                 x{product.ids.length}
                              </Text>
                           </View>
                           {product.childs.length > 0 ? (
                              <View style={{ marginLeft: 6 }}>
                                 <View style={styles.productOption}>
                                    <Text
                                       style={[
                                          styles.productOptionText,
                                          { fontFamily: globalCss.font.medium },
                                       ]}
                                    >
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
                                                   textDecorationLine:
                                                      'line-through',
                                                   color: globalCss.color.grey,
                                                   marginRight: 4,
                                                   fontFamily:
                                                      globalCss.font.regular,
                                                }}
                                             >
                                                {formatCurrency(
                                                   product.childs[0].price
                                                )}
                                             </Text>
                                          ) : null}
                                          <Text
                                             style={[
                                                styles.productOptionText,
                                                {
                                                   fontFamily:
                                                      globalCss.font.medium,
                                                },
                                             ]}
                                          >
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
                                                            style={[
                                                               styles.modifierOptionText,
                                                               {
                                                                  fontFamily:
                                                                     globalCss
                                                                        .font
                                                                        .medium,
                                                               },
                                                            ]}
                                                         >
                                                            {
                                                               eachModifier
                                                                  .modifierOption
                                                                  .name
                                                            }
                                                         </Text>
                                                         {eachModifier.price !==
                                                         0 ? (
                                                            <View
                                                               style={{
                                                                  flexDirection:
                                                                     'row',
                                                                  alignItems:
                                                                     'center',
                                                               }}
                                                            >
                                                               {eachModifier.discount !=
                                                               0 ? (
                                                                  <Text
                                                                     style={{
                                                                        textDecorationLine:
                                                                           'line-through',
                                                                        color: globalCss
                                                                           .color
                                                                           .grey,
                                                                        marginRight: 4,
                                                                     }}
                                                                  >
                                                                     {formatCurrency(
                                                                        eachModifier.price
                                                                     )}
                                                                  </Text>
                                                               ) : null}
                                                               <Text
                                                                  style={[
                                                                     styles.modifierOptionText,
                                                                     {
                                                                        fontFamily:
                                                                           globalCss
                                                                              .font
                                                                              .medium,
                                                                     },
                                                                  ]}
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
                        backgroundColor: globalCss.color.grey,
                        marginVertical: 15,
                     }}
                  ></View>
                  <BillingDetails billing={carts[0].cartOwnerBilling} />
               </View>
            </ScrollView>
         )}
      </SafeAreaView>
   )
}

const styles = StyleSheet.create({
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
   },
   itemCount: {
      fontSize: 14,
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
export default OrderDetailScreen
