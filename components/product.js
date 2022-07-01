import React, { useState, useEffect } from 'react'
import {
   ScrollView,
   Text,
   StyleSheet,
   View,
   Image,
   TouchableWithoutFeedback,
} from 'react-native'
import { chain } from 'lodash'
import { formatCurrency } from '../utils/formatCurrency'
import { getPriceWithDiscount } from '../utils/getPriceWithDiscount'
import { Button } from './button'
import { VegNonVegIcon } from '../assets/vegNonVegIcon'
import appConfig from '../brandConfig.json'
import { ModifierPopup } from './modifierPopup'
import Modal from 'react-native-modal'
import { useCart } from '../context'
import { useConfig } from '../lib/config'
import { useNavigation } from '@react-navigation/native'

const productViewStyles = {
   verticalCard: 'verticalCard',
   horizontalCard: 'horizontalCard',
}

export const ProductList = ({
   productsList,
   heading,
   viewStyle = 'horizontalCard',
}) => {
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

   const [currentGroupProducts, setCurrentGroupedProduct] = useState([])

   useEffect(() => {
      if (groupedByType.length > 0) {
         setCurrentGroupedProduct(groupedByType[0].products)
      }
   }, [groupedByType])
   return (
      <View>
         {heading && <Text style={styles.productListHeading}>{heading}</Text>}
         <ScrollView
            contentContainerStyle={{ display: 'flex' }}
            horizontal={viewStyle !== productViewStyles.horizontalCard}
         >
            {currentGroupProducts.map((eachProduct, index) => {
               const publishedProductOptions =
                  eachProduct.productOptions.length > 0 &&
                  eachProduct.productOptions.filter(
                     option => option.isPublished
                  ).length == 0
               if (!eachProduct.isPublished || publishedProductOptions) {
                  return null
               }
               return (
                  <ProductCard
                     key={`${eachProduct.id}-${eachProduct.type}-${index}`}
                     productData={eachProduct}
                     viewStyle={viewStyle}
                  />
               )
            })}
         </ScrollView>
      </View>
   )
}

export const ProductCard = ({ productData, viewStyle = 'verticalCard' }) => {
   const { cartState, methods, addToCart, combinedCartItems } = useCart()
   const { locationId } = useConfig()
   const navigation = useNavigation()
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

   const handelAddToCartClick = () => {
      // product availability
      if (!locationId) {
         navigation.navigate('LocationSelector')
         return
      }
      if (productData.isAvailable) {
         if (showAddToCartButton) {
            if (
               productData.productOptions.length > 0 &&
               productData.isPopupAllowed
            ) {
               const availableProductOptions =
                  productData.productOptions.filter(
                     option => option.isAvailable && option.isPublished
                  ).length
               if (availableProductOptions > 0) {
                  setShowModifierPopup(true)
               }
            } else {
               addToCart(productData.defaultCartItem, 1)
            }
         }
      }
   }

   return (
      <TouchableWithoutFeedback
         onPress={() => {
            navigation.navigate('ProductScreen', {
               productId: productData.id,
            })
         }}
      >
         <View
            style={{
               ...styles.productContainer,
               width:
                  viewStyle === productViewStyles.verticalCard ? 156 : 'auto',
               height:
                  viewStyle === productViewStyles.verticalCard ? 200 : 'auto',
            }}
         >
            <View
               style={{
                  ...styles.productFloatContainer,
                  flexDirection:
                     viewStyle === productViewStyles.horizontalCard
                        ? 'row'
                        : 'column',
               }}
            >
               <Image
                  source={{
                     uri:
                        productData.assets.images[0] ||
                        appConfig.brandSettings.productSettings.defaultImage
                           .value,
                  }}
                  style={{
                     ...styles.floatingImage,
                     ...(viewStyle === productViewStyles.horizontalCard
                        ? {
                             borderRadius: 4,
                             width: '40%',
                             height: '100%',
                          }
                        : {
                             borderTopLeftRadius: 4,
                             borderTopRightRadius: 4,
                             width: '100%',
                             height: 115,
                          }),
                  }}
               />
               <View
                  style={{
                     ...(viewStyle === productViewStyles.horizontalCard
                        ? {
                             paddingVertical: 8,
                             width: '60%',
                             marginBottom: 0,
                          }
                        : {
                             width: '100%',
                             marginVertical: 10,
                          }),
                     display: 'flex',
                     flexDirection: 'column',
                     paddingHorizontal: 10,
                  }}
               >
                  <View>
                     <Text
                        style={styles.productName}
                        numberOfLines={
                           viewStyle === productViewStyles.verticalCard ? 1 : 0
                        }
                     >
                        {productData.name}
                     </Text>
                     <Text
                        style={styles.additionalText}
                        numberOfLines={
                           viewStyle === productViewStyles.verticalCard ? 1 : 0
                        }
                     >
                        {productData.additionalText || ' '}
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
                              handelAddToCartClick()
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
      </TouchableWithoutFeedback>
   )
}

const styles = StyleSheet.create({
   productListHeading: {
      fontSize: 20,
      lineHeight: 20,
      fontWeight: '500',
      color: '#fff',
      paddingLeft: 12,
      marginTop: 12,
      marginBottom: 5,
      textTransform: 'uppercase',
   },
   productContainer: {
      position: 'relative',
      marginHorizontal: 10,
      marginVertical: 10,
   },
   productFloatContainer: {
      width: '100%',
      borderRadius: 6,
      shadowColor: 'rgba(0, 0, 0, 0.08)',
      backgroundColor: '#fff',
      shadowOffset: { width: 0, height: 1 },
      shadowRadius: 12,
      elevation: 3,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
   },
   floatingImage: {},
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
