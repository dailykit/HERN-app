import { isEmpty } from 'lodash'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { DeleteIcon } from '../../assets/deleteIcon'
import { EditIcon } from '../../assets/editIcon'
import { CounterButton } from '../../components/counterButton'
import { useCart } from '../../context'
import { formatCurrency } from '../../utils/formatCurrency'
import React, { useState, useEffect } from 'react'
import { DownVector, UpVector } from '../../assets/vector'
import { ModifierPopup } from '../../components/modifierPopup'
import { PRODUCT_ONE } from '../../graphql'
import { useConfig } from '../../lib/config'
import { useQuery } from '@apollo/client'
import Modal from 'react-native-modal'
import { Button } from '../../components/button'
import appConfig from '../../brandConfig.json'
import { getCartItemWithModifiers } from '../../utils'
import { CartCard } from './cartCard'

export const CartItemList = () => {
   const { cartState, combinedCartItems } = useCart()
   return (
      <View style={{ marginHorizontal: 10 }}>
         <View
            style={{
               flexDirection: 'row',
               alignItems: 'center',
               justifyContent: 'space-between',
               margin: 8,
            }}
         >
            <Text style={styles.itemStyle}>
               Items{'('}
               {cartState?.cart?.cartItems_aggregate?.aggregate?.count}
               {')'}
            </Text>
            <TouchableOpacity
               style={{
                  paddingVertical: 8,
                  paddingLeft: 16,
               }}
            >
               <Text style={styles.clearCartText}>Clear Cart</Text>
            </TouchableOpacity>
         </View>
         {combinedCartItems.map((product, index) => {
            return (
               <CartCard
                  key={product.productId}
                  productData={product}
                  quantity={product?.ids?.length}
                  index={index}
                  //   removeCartItems={removeCartItems}
               />
            )
         })}
      </View>
   )
}

const styles = StyleSheet.create({
   cartContainer: {
      padding: 12,
      borderRadius: 6,
      shadowColor: '#00000030',
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 6,
      elevation: 3,
   },
   clearCartText: {
      color: '#EF5266',
      fontSize: 12,
      fontWeight: '600',
   },
   itemStyle: {
      fontSize: 14,
      fontWeight: '500',
   },
   productMetaDetails: {
      flexDirection: 'row',
   },
   productDetails: {
      marginLeft: 10,
      justifyContent: 'space-between',
      flex: 1,
   },
   productImage: {
      width: 95,
      height: 95,
      resizeMode: 'cover',
   },
   productName: {
      fontSize: 14,
      fontWeight: '500',
   },
   metaDetailsBottom: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
   },
   priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
   },
   originalPrice: {
      marginRight: 6,
      textDecorationLine: 'line-through',
   },
   discountPrice: {
      fontSize: 18,
      fontWeight: '500',
   },
   productOption: {
      flexDirection: 'row',
      justifyContent: 'space-between',
   },
   productOptionLabel: {
      color: '#00000080',
      fontWeight: '500',
   },
   modifierOption: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 3,
      fontSize: 13,
   },
   modifierOptionText: {
      fontWeight: '500',
      color: '#00000080',
      fontSize: 13,
   },
})
