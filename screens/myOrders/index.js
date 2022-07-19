import {
   ScrollView,
   StyleSheet,
   Text,
   TouchableWithoutFeedback,
   View,
} from 'react-native'
import { useUser } from '../../context/user'
import { GET_ORDER_DETAILS } from '../../graphql'
import { useSubscription } from '@apollo/client'
import React, { useState } from 'react'
import moment from 'moment'
import { formatCurrency } from '../../utils/formatCurrency'
import { Button } from '../../components/button'
import { CartItem } from './cartItem'
import { useNavigation } from '@react-navigation/native'
import { LoginScreenForAuthScreen } from '../../components/authScreenLogin'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Spinner } from '../../assets/loaders'
import { useConfig } from '../../lib/config'
import useGlobalStyle from '../../globalStyle'

const MyOrdersScreen = () => {
   const { globalStyle } = useGlobalStyle()
   // context
   const { user, isLoading: userLoading } = useUser()

   // state
   const [orders, setOrders] = useState([])
   const [componentStatus, setComponentStatus] = useState('loading')

   const {
      error,
      loading: orderHistoryLoading,
      data: { carts = [] } = {},
   } = useSubscription(GET_ORDER_DETAILS, {
      skip: !user?.keycloakId,
      variables: {
         where: {
            customerKeycloakId: {
               _eq: user?.keycloakId,
            },
            status: { _neq: 'CART_PENDING' },
         },
      },
   })
   React.useEffect(() => {
      if (!orderHistoryLoading) {
         setComponentStatus('success')
         setOrders(carts)
      }
   }, [orderHistoryLoading])

   return (
      <SafeAreaView style={{ flex: 1 }}>
         <Header />
         <ScrollView>
            {userLoading ? (
               <Spinner size="large" showText={true} />
            ) : user?.keycloakId ? (
               orderHistoryLoading || componentStatus === 'loading' ? (
                  <Spinner size="large" showText={true} />
               ) : error ? (
                  <Text style={{ fontFamily: globalStyle.font.medium }}>
                     Something went wrong
                  </Text>
               ) : (
                  <View style={{ paddingHorizontal: 10 }}>
                     {orders.length === 0 ? (
                        <NoOrdersAvailable />
                     ) : (
                        orders.map(eachOrder => {
                           return (
                              <OrderCard key={eachOrder.id} order={eachOrder} />
                           )
                        })
                     )}
                  </View>
               )
            ) : (
               <LoginScreenForAuthScreen />
            )}
         </ScrollView>
      </SafeAreaView>
   )
}
const NoOrdersAvailable = () => {
   const { globalStyle } = useGlobalStyle()

   return (
      <View>
         <Text style={{ fontFamily: globalStyle.font.medium }}>
            No orders available
         </Text>
      </View>
   )
}
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
const OrderCard = ({ order }) => {
   const { globalStyle } = useGlobalStyle()

   const navigation = useNavigation()
   const handleCardOnPress = () => {
      if (order.status === 'ORDER_DELIVERED') {
         navigation.navigate('OrderDetail', {
            cartId: order.id,
         })
      } else {
         if (
            order.fulfillmentInfo.type === 'PREORDER_DELIVERY' ||
            order.fulfillmentInfo.type === 'ONDEMAND_DELIVERY'
         ) {
            navigation.navigate('OrderTracking', {
               cartId: order.id,
            })
         } else {
            navigation.navigate('OrderDetail', {
               cartId: order.id,
            })
         }
      }
   }
   return (
      <TouchableWithoutFeedback onPress={handleCardOnPress}>
         <View style={styles.orderCard}>
            <View style={styles.orderCardHeader}></View>
            <CartItem
               products={order?.cartItems}
               createdAt={order?.order?.created_at}
            />
            <View style={styles.divider}></View>
            <View
               style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
               {(order?.fulfillmentInfo?.type === 'PREORDER_PICKUP' ||
                  order?.fulfillmentInfo?.type === 'PREORDER_DELIVERY') && (
                  <View>
                     <Text
                        style={[
                           styles.fulfillmentInfo,
                           { fontFamily: globalStyle.font.regular },
                        ]}
                     >
                        {getTitle(order?.fulfillmentInfo?.type)}
                     </Text>
                     <Text
                        style={[
                           styles.fulfillmentInfo,
                           { fontFamily: globalStyle.font.regular },
                        ]}
                     >
                        on{' '}
                        {moment(order?.fulfillmentInfo?.slot?.from).format(
                           'DD MMM YYYY'
                        )}
                        {' ('}
                        {moment(order?.fulfillmentInfo?.slot?.from).format(
                           'HH:mm'
                        )}
                        {'-'}
                        {moment(order?.fulfillmentInfo?.slot?.to).format(
                           'HH:mm'
                        )}
                        {')'}
                     </Text>
                  </View>
               )}
               <Text>
                  {formatCurrency(order.billingDetails.itemTotal.value)}
               </Text>
            </View>
            <View style={styles.divider}></View>
            <View style={styles.orderStatusInfo}>
               <OrderStatus order={order} />
               <Button
                  variant="noOutline"
                  textStyle={{
                     fontSize: 12,
                     fontFamily: globalStyle.font.regular,
                  }}
                  onPress={handleCardOnPress}
               >
                  {order.status === 'ORDER_DELIVERED'
                     ? 'View Details'
                     : 'Track Order'}
               </Button>
            </View>
         </View>
      </TouchableWithoutFeedback>
   )
}

const OrderStatus = ({ order }) => {
   const { globalStyle } = useGlobalStyle()

   const statusLabel = React.useMemo(() => {
      switch (order.status) {
         case 'ORDER_PENDING':
            return 'Pending'
         case 'ORDER_UNDER_PROCESSING':
            return 'Under Processing'
         case 'ORDER_READY_TO_ASSEMBLE':
            return 'Ready To Assemble'
         case 'ORDER_READY_TO_DISPATCH':
            return 'Ready To Dispatch'
         case 'ORDER_OUT_FOR_DELIVERY':
            return 'Out For Delivery'
         case 'ORDER_DELIVERED':
            return 'Delivered'
         default:
            return 'Status Not Available'
      }
   }, [])
   return (
      <Text style={{ fontFamily: globalStyle.font.regular }}>
         Order {statusLabel}
      </Text>
   )
}

const PleaseLogIn = () => {
   const { globalStyle } = useGlobalStyle()

   return (
      <View>
         <Text style={{ fontFamily: globalStyle.font.medium }}>
            Please login
         </Text>
      </View>
   )
}

const Header = () => {
   const { appConfig } = useConfig()
   const { globalStyle } = useGlobalStyle()

   return (
      <View
         style={[
            styles.headerContainer,
            {
               backgroundColor:
                  appConfig.brandSettings.headerSettings?.backgroundColor
                     ?.value || '#ffffff',
            },
         ]}
      >
         <Text
            style={{
               color:
                  appConfig.brandSettings.headerSettings?.textColor?.value ||
                  '#000000',
               fontSize: 16,
               fontFamily: globalStyle.font.regular,
            }}
         >
            My Orders
         </Text>
      </View>
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
      color: '#00000080',
   },
})
export default MyOrdersScreen
