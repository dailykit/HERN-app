import moment from 'moment'
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { combineCartItems } from '../../utils'
import { formatCurrency } from '../../utils/formatCurrency'
import useGlobalStyle from '../../globalStyle'

export const CartItem = ({ products, createdAt }) => {
   const cartItems = React.useMemo(() => combineCartItems(products), [products])
   const { globalStyle } = useGlobalStyle()

   return (
      <View>
         <View style={styles.cartItemHeader}>
            <Text
               style={[
                  styles.itemCount,
                  { fontFamily: globalStyle.font.semibold },
               ]}
            >
               Item(s)({cartItems.length})
            </Text>

            <Text
               style={[
                  styles.orderDate,
                  { fontFamily: globalStyle.font.mediumItalic },
               ]}
            >
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
                        <Text style={{ fontFamily: globalStyle.font.medium }}>
                           {product.name}{' '}
                        </Text>
                     </View>
                  </View>
               </View>
            )
         })}
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
      color: '#00000080',
   },
   itemCount: {
      fontSize: 14,
   },
   productOptionText: {
      marginVertical: 3,
   },
   modifierOptionText: {
      marginVertical: 3,
   },
   cartItemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
   },
})
