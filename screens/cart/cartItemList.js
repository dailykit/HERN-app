import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useCart } from '../../context'
import React, { useState } from 'react'
import { useConfig } from '../../lib/config'
import Modal from 'react-native-modal'
import { Button } from '../../components/button'
import { CartCard } from './cartCard'
import { ScrollView } from 'react-native-gesture-handler'
import Toast from 'react-native-simple-toast'
import useGlobalStyle from '../../globalStyle'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const CartItemList = () => {
   const {
      cartState,
      combinedCartItems,
      methods,
      setTotalCartItems,
      storedCartId,
      setStoredCartId,
   } = useCart()
   const { appConfig } = useConfig()
   const { globalStyle } = useGlobalStyle()
   const [showClearCartItems, setShowClearCartItems] = useState(false)

   const deleteCart = () => {
      methods.cart.delete({
         variables: {
            id: storedCartId,
         },
         onCompleted: async () => {
            setTotalCartItems(0)
            setStoredCartId(null)
            await AsyncStorage.removeItem('cart-id')
         },
      })
      Toast.show('Cart Cleared!')
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
                        deleteCart()
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
