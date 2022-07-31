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
import { getCartItemWithModifiers } from '../../utils'
import { CartCard } from './cartCard'
import { ScrollView } from 'react-native-gesture-handler'
import Toast from 'react-native-simple-toast'
import useGlobalStyle from '../../globalStyle'
import Toast from 'react-native-simple-toast'

export const CartItemList = () => {
   const { cartState, combinedCartItems, methods } = useCart()
   const { appConfig } = useConfig()
   const { globalStyle } = useGlobalStyle()
   const [showClearCartItems, setShowClearCartItems] = useState(false)
   const removeCartItems = cartItemIds => {
      methods.cartItems.delete({
         variables: {
            where: {
               id: {
                  _in: cartItemIds,
               },
            },
         },
      })
      Toast.show('Item removed!')
   }
   return (
      <View style={{ marginHorizontal: 10 }}>
         <View
            style={{
               flexDirection: 'row',
               alignItems: 'center',
               justifyContent: 'space-between',
               marginTop: 8,
            }}
         >
            <Text
               style={[
                  styles.itemStyle,
                  { fontFamily: globalStyle.font.semibold },
               ]}
            >
               Items{'('}
               {cartState?.cart?.cartItems_aggregate?.aggregate?.count}
               {')'}
            </Text>
            <TouchableOpacity
               style={{
                  paddingVertical: 8,
                  paddingLeft: 16,
               }}
               onPress={() => {
                  // const cartItemsIds = combinedCartItems
                  //    .map(each => each.ids)
                  //    .flat()
                  // removeCartItems(cartItemsIds)
                  setShowClearCartItems(true)
               }}
            >
               <Text
                  style={[
                     styles.clearCartText,
                     {
                        fontFamily: globalStyle.font.medium,
                        color: globalStyle.color.primary,
                     },
                  ]}
               >
                  Clear Cart
               </Text>
            </TouchableOpacity>
         </View>
         <ScrollView>
            {combinedCartItems.map((product, index) => {
               return (
                  <CartCard
                     key={`${product.productId}-${index}`}
                     productData={product}
                     quantity={product?.ids?.length}
                     index={index}
                     //   removeCartItems={removeCartItems}
                  />
               )
            })}
         </ScrollView>
         <Modal
            isVisible={showClearCartItems}
            onBackdropPress={() => {
               setShowClearCartItems(false)
            }}
         >
            <View style={{ backgroundColor: 'white', padding: 12 }}>
               <View style={{ marginBottom: 12 }}>
                  <Text
                     style={{
                        fontSize: 16,
                        fontFamily: globalStyle.font.medium,
                     }}
                  >
                     Clear Cart Items?
                  </Text>
               </View>
               <View style={{ flexDirection: 'row' }}>
                  <Button
                     variant="outline"
                     isActive={true}
                     textStyle={{
                        color:
                           appConfig.brandSettings.buttonSettings
                              .activeTextColor.value || '#000000',
                     }}
                     buttonStyle={{
                        flex: 1,
                        marginRight: 20,
                     }}
                     onPress={() => {
                        setShowClearCartItems(false)
                     }}
                  >
                     NO
                  </Button>
                  <Button
                     buttonStyle={{
                        flex: 1,
                        marginLeft: 20,
                     }}
                     onPress={() => {
                        const cartItemsIds = combinedCartItems
                           .map(each => each.ids)
                           .flat()
                        setShowClearCartItems(false)
                        removeCartItems(cartItemsIds)
                        Toast.show('Removing Cart Items...')
                     }}
                  >
                     YES
                  </Button>
               </View>
            </View>
         </Modal>
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
      fontSize: 12,
   },
   itemStyle: {
      fontSize: 14,
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
   },
   productOption: {
      flexDirection: 'row',
      justifyContent: 'space-between',
   },
   productOptionLabel: {
      color: '#00000080',
   },
   modifierOption: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 3,
      fontSize: 13,
   },
   modifierOptionText: {
      color: '#00000080',
      fontSize: 13,
   },
})
