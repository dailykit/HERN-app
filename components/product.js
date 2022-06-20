import React, { useState, useEffect } from 'react'
import { ScrollView, Text, StyleSheet, View, Image } from 'react-native'
import { chain } from 'lodash'
import { formatCurrency } from '../utils/formatCurrency'
import { getPriceWithDiscount } from '../utils/getPriceWithDiscount'
import { Button } from './button'
import { VegNonVegIcon } from '../assets/vegNonVegIcon'
import appConfig from '../brandConfig.json'
import { ModifierPopup } from './modifierPopup'
import Modal from 'react-native-modal'

export const ProductList = ({ productsList }) => {
   // group the product list by product type
   const groupedByType = React.useMemo(() => {
      const data = chain(productsList)
         .groupBy('subCategory')
         .map((value, key) => ({
            type: key,
            products: value,
         }))
         .value()
      const nullData = data.filter(x => x.type === 'null')
      const nonNullData = data.filter(x => x.type !== 'null')
      return [...nonNullData, ...nullData]
   }, [productsList])

   const [currentGroupProducts, setCurrentGroupedProduct] = useState(
      groupedByType[0].products
   )

   useEffect(() => {
      setCurrentGroupedProduct(groupedByType[0].products)
   }, [productsList])
   return (
      <ScrollView
         contentContainerStyle={{
            display: 'flex',
            flexWrap: 'wrap',
            flexDirection: 'row',
         }}
      >
         {currentGroupProducts.map(eachProduct => {
            const publishedProductOptions =
               eachProduct.productOptions.length > 0 &&
               eachProduct.productOptions.filter(option => option.isPublished)
                  .length == 0
            if (!eachProduct.isPublished || publishedProductOptions) {
               return null
            }
            return (
               <ProductCard key={eachProduct.id} productData={eachProduct} />
            )
         })}
      </ScrollView>
   )
}

export const ProductCard = ({ productData }) => {
   const isStoreAvailable = true
   const [showModifierPopup, setShowModifierPopup] = useState(false)
   const defaultProductOption = React.useMemo(() => {
      if (productData.productOptions.length === 0) {
         return {}
      }
      if (isProductOutOfStock) {
         return productData.productOptions[0]
      }
      return (
         productData.productOptions.find(
            x =>
               x.id === productData.defaultProductOptionId &&
               x.isPublished &&
               x.isAvailable
         ) ||
         productData.productOptions.find(x => x.isPublished && x.isAvailable)
      )
   }, [productData, isProductOutOfStock])

   const showAddToCartButton = React.useMemo(() => {
      // if product has modifier option then add to cart handle by modifier
      if (productData.productOptions.length > 0 && productData.isPopupAllowed) {
         return true
      } else {
         // else we will hide add to cart button
         if (isStoreAvailable) {
            return true
         } else {
            return false
         }
      }
   }, [isStoreAvailable])

   const isProductOutOfStock = React.useMemo(() => {
      if (productData.isAvailable) {
         if (
            productData.productOptions.length > 0 &&
            productData.isPopupAllowed
         ) {
            const availableProductOptions = productData.productOptions.filter(
               option => option.isPublished && option.isAvailable
            ).length
            if (availableProductOptions > 0) {
               return false
            } else {
               return true
            }
         } else {
            return false
         }
      }
      return true
   }, [productData])

   return (
      <View style={styles.productContainer}>
         <View style={styles.productFloatContainer}>
            <Image
               source={{
                  uri:
                     productData.assets.images[0] ||
                     appConfig.brandSettings.productSettings.defaultImage.value,
                  width: 156,
                  height: 100,
               }}
               style={styles.floatingImage}
            />
            <View
               style={{
                  width: '100%',
                  top: -17,
                  bottom: 0,
                  //   backgroundColor: 'red',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '46%',
               }}
            >
               <View>
                  <Text style={styles.productName}>{productData.name}</Text>
                  <Text style={styles.additionalText}>
                     {productData.additionalText || ''}
                  </Text>
               </View>
               <View style={styles.footer}>
                  <View style={styles.footerLeft}>
                     <VegNonVegIcon size={12} fill={'#61D836'} />
                     <View style={styles.priceContainer}>
                        <Text style={styles.productDiscountValue}>
                           {formatCurrency(
                              getPriceWithDiscount(
                                 productData.price,
                                 productData.discount
                              ) +
                                 getPriceWithDiscount(
                                    defaultProductOption?.price || 0,
                                    defaultProductOption?.discount || 0
                                 )
                           )}
                        </Text>
                        {
                           <>
                              {(productData.discount ||
                                 defaultProductOption?.discount) &&
                              productData.price > 0 ? (
                                 <Text style={styles.productOriginalValue}>
                                    {formatCurrency(
                                       productData.price +
                                          defaultProductOption.price
                                    )}
                                 </Text>
                              ) : null}
                           </>
                        }
                     </View>
                  </View>
                  <View>
                     <Button
                        onPress={() => {
                           setShowModifierPopup(true)
                        }}
                     >
                        +ADD
                     </Button>
                  </View>
               </View>
            </View>
         </View>
         {/* {showModifierPopup && <ModifierPopup />} */}
         <Modal isVisible={showModifierPopup}>
            <ModifierPopup
               closeModifier={() => {
                  setShowModifierPopup(false)
               }}
               productData={productData}
            />
         </Modal>
      </View>
   )
}

const styles = StyleSheet.create({
   productContainer: {
      width: 176,
      height: 206,
      position: 'relative',
      margin: 10,
   },
   productFloatContainer: {
      width: 176,
      height: 176,
      position: 'absolute',
      bottom: 0,
      borderRadius: 6,
      shadowColor: 'rgba(0, 0, 0, 0.08)',
      shadowOffset: { width: 0, height: 1 },
      shadowRadius: 12,
      elevation: 3,
      paddingHorizontal: 10,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
   },
   floatingImage: {
      borderRadius: 4,
      top: -30,
   },
   productName: {
      fontSize: 12,
      fontWeight: '500',
   },
   additionalText: {
      fontWeight: '500',
      fontSize: 10,
      lineHeight: 10,
      marginVertical: 3,
      color: 'rgba(0, 0, 0, 0.39)',
   },
   footer: {
      bottom: 0,
      //   backgroundColor: 'yellow',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
   },
   footerLeft: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
   },
   priceContainer: {
      marginHorizontal: 4,
   },
   productOriginalValue: {
      color: 'rgba(24, 24, 24, 0.28)',
      textDecorationLine: 'line-through',
      textDecorationStyle: 'solid',
      fontWeight: '800',
      fontSize: 10,
   },
   productDiscountValue: {
      color: '#181818',
      fontSize: 12,
      fontWeight: '800',
   },
})
