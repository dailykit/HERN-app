import React, { useState, useEffect } from 'react'
import {
   ScrollView,
   Text,
   StyleSheet,
   View,
   Image,
   TouchableWithoutFeedback,
   Dimensions,
} from 'react-native'
import { chain } from 'lodash'
import { formatCurrency } from '../utils/formatCurrency'
import { getPriceWithDiscount } from '../utils/getPriceWithDiscount'
import { Button } from './button'
import { VegNonVegIcon } from '../assets/vegNonVegIcon'
import { ModifierPopup } from './modifierPopup'
import Modal from 'react-native-modal'
import { useCart } from '../context'
import { useConfig } from '../lib/config'
import { useNavigation } from '@react-navigation/native'
import { PRODUCT_ONE } from '../graphql'
import { CounterButton } from './counterButton'
import { client } from '../lib/apollo'
import { getCartItemWithModifiers } from '../utils'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import CustomBackdrop from './modalBackdrop'
import useGlobalStyle from '../globalStyle'

const windowHeight = Dimensions.get('window').height

const productViewStyles = {
   verticalCard: 'verticalCard',
   horizontalCard: 'horizontalCard',
}

export const ProductList = ({
   productsList,
   heading,
   viewStyle = 'horizontalCard',
}) => {
   const { globalStyle } = useGlobalStyle()
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
         {heading && (
            <Text
               style={[
                  styles.productListHeading,
                  { fontFamily: globalStyle.font.semibold },
               ]}
            >
               {heading}
            </Text>
         )}
         <ScrollView
            contentContainerStyle={{ display: 'flex' }}
            horizontal={viewStyle !== productViewStyles.horizontalCard}
         >
            {currentGroupProducts.length > 0 ? (
               currentGroupProducts.map((eachProduct, index) => {
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
               })
            ) : (
               <View
                  style={[
                     styles.noProductsMsgContainer,
                     { fontFamily: globalStyle.font.regular },
                  ]}
               >
                  <Text style={{ fontFamily: globalStyle.font.medium }}>
                     No Products Found
                  </Text>
               </View>
            )}
         </ScrollView>
      </View>
   )
}

export const ProductCard = ({ productData, viewStyle = 'verticalCard' }) => {
   const { cartState, methods, addToCart, combinedCartItems } = useCart()
   const { brand, locationId, brandLocation, appConfig } = useConfig()
   const { globalStyle } = useGlobalStyle()
   const bottomSheetModalRef = React.useRef(null)

   // variables
   const snapPoints = React.useMemo(() => ['90%'], [])

   const navigation = useNavigation()
   const isStoreAvailable = true
   const [showModifierPopup, setShowModifierPopup] = useState(false)
   const [availableQuantityInCart, setAvailableQuantityInCart] = useState(0)
   const [showChooseIncreaseType, setShowChooseIncreaseType] = useState(false) // show I'll choose or repeat last one popup

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

   React.useEffect(() => {
      if (combinedCartItems) {
         const allCartItemsIdsForThisProducts = combinedCartItems
            .filter(x => x.productId === productData.id)
            .map(x => x.ids)
            .flat().length
         setAvailableQuantityInCart(allCartItemsIdsForThisProducts)
      }
   }, [combinedCartItems])

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
   }

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
                  // setShowModifierPopup(true)
                  bottomSheetModalRef.current?.present()
               }
            } else {
               addToCart(productData.defaultCartItem, 1)
            }
         }
      }
   }
   const argsForByLocation = React.useMemo(
      () => ({
         brandId: brand?.id,
         locationId: locationId,
         brand_locationId: brandLocation?.id,
      }),
      [brand, locationId, brandLocation?.id]
   )

   const repeatLastOne = async productData => {
      const { data: { product: productCompleteData = {} } = {} } =
         await client.query({
            query: PRODUCT_ONE,
            variables: {
               id: productData.id,
               params: argsForByLocation,
            },
         })

      const cartDetailSelectedProduct = cartState.cartItems
         .filter(x => x.productId === productData.id)
         .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
         .pop()

      if (cartDetailSelectedProduct.childs.length === 0) {
         addToCart(productData.defaultCartItem, 1)
         setShowChooseIncreaseType(false)
         return
      }

      const productOptionId =
         cartDetailSelectedProduct.childs[0].productOption.id
      const modifierCategoryOptionsIds =
         cartDetailSelectedProduct.childs[0].childs.map(
            x => x?.modifierOption?.id
         )

      //selected product option
      const selectedProductOption = productCompleteData.productOptions?.find(
         x => x.id == productOptionId
      )

      // select all modifier option id which has modifier option ( parent modifier option id)
      const modifierOptionsConsistAdditionalModifiers =
         cartDetailSelectedProduct.childs[0].childs
            .map(eachModifierOption => {
               if (eachModifierOption.childs.length > 0) {
                  return {
                     parentModifierOptionId:
                        eachModifierOption.modifierOption.id,
                     selectedModifierOptionIds: eachModifierOption.childs.map(
                        x => x.modifierOption.id
                     ),
                  }
               } else {
                  return null
               }
            })
            .filter(eachId => eachId !== null)

      //selected modifiers
      let singleModifier = []
      let multipleModifier = []
      let singleAdditionalModifier = []
      let multipleAdditionalModifier = []
      if (selectedProductOption.modifier) {
         selectedProductOption.modifier.categories.forEach(category => {
            category.options.forEach(option => {
               const selectedOption = {
                  modifierCategoryID: category.id,
                  modifierCategoryOptionsID: option.id,
                  modifierCategoryOptionsPrice: option.price,
                  cartItem: option.cartItem,
               }
               if (category.type === 'single') {
                  if (modifierCategoryOptionsIds.includes(option.id)) {
                     singleModifier = singleModifier.concat(selectedOption)
                  }
               }
               if (category.type === 'multiple') {
                  if (modifierCategoryOptionsIds.includes(option.id)) {
                     multipleModifier = multipleModifier.concat(selectedOption)
                  }
               }
            })
         })
      }

      const allSelectedOptions = [...singleModifier, ...multipleModifier]

      if (selectedProductOption.additionalModifiers) {
         selectedProductOption.additionalModifiers.forEach(option => {
            option.modifier.categories.forEach(category => {
               category.options.forEach(option => {
                  const selectedOption = {
                     modifierCategoryID: category.id,
                     modifierCategoryOptionsID: option.id,
                     modifierCategoryOptionsPrice: option.price,
                     cartItem: option.cartItem,
                  }
                  if (category.type === 'single') {
                     if (modifierCategoryOptionsIds.includes(option.id)) {
                        singleAdditionalModifier =
                           singleAdditionalModifier.concat(selectedOption)
                     }
                  }
                  if (category.type === 'multiple') {
                     if (modifierCategoryOptionsIds.includes(option.id)) {
                        multipleAdditionalModifier =
                           multipleAdditionalModifier.concat(selectedOption)
                     }
                  }
               })
            })
         })
         const modifierOptionsConsistAdditionalModifiersWithData =
            modifierOptionsConsistAdditionalModifiers.map(
               eachModifierOptionsConsistAdditionalModifiers => {
                  let additionalModifierOptions = []
                  selectedProductOption.additionalModifiers.forEach(
                     additionalModifier => {
                        if (additionalModifier.modifier) {
                           additionalModifier.modifier.categories.forEach(
                              eachCategory => {
                                 eachCategory.options.forEach(eachOption => {
                                    if (eachOption.additionalModifierTemplate) {
                                       eachOption.additionalModifierTemplate.categories.forEach(
                                          eachCategory => {
                                             additionalModifierOptions.push(
                                                ...eachCategory.options.map(
                                                   eachOptionTemp => ({
                                                      ...eachOptionTemp,
                                                      categoryId:
                                                         eachCategory.id,
                                                   })
                                                )
                                             )
                                          }
                                       )
                                    }
                                 })
                              }
                           )
                        }
                     }
                  )
                  // for single modifiers
                  if (selectedProductOption.modifier) {
                     selectedProductOption.modifier.categories.forEach(
                        eachCategory => {
                           eachCategory.options.forEach(eachOption => {
                              if (eachOption.additionalModifierTemplateId) {
                                 if (eachOption.additionalModifierTemplate) {
                                    eachOption.additionalModifierTemplate.categories.forEach(
                                       eachCategory => {
                                          additionalModifierOptions.push(
                                             ...eachCategory.options.map(
                                                eachOptionTemp => ({
                                                   ...eachOptionTemp,
                                                   categoryId: eachCategory.id,
                                                })
                                             )
                                          )
                                       }
                                    )
                                 }
                              }
                           })
                        }
                     )
                  }

                  const mapedModifierOptions =
                     eachModifierOptionsConsistAdditionalModifiers.selectedModifierOptionIds.map(
                        eachId => {
                           const additionalModifierOption =
                              additionalModifierOptions.find(
                                 x => x.id === eachId
                              )
                           const selectedOption = {
                              modifierCategoryID:
                                 additionalModifierOption.categoryId,
                              modifierCategoryOptionsID:
                                 additionalModifierOption.id,
                              modifierCategoryOptionsPrice:
                                 additionalModifierOption.price,
                              cartItem: additionalModifierOption.cartItem,
                           }
                           return selectedOption
                        }
                     )
                  return {
                     ...eachModifierOptionsConsistAdditionalModifiers,
                     data: mapedModifierOptions,
                  }
               }
            )

         // root modifiers options + additional modifier's modifier options
         const resultSelectedModifier = [
            ...allSelectedOptions,
            ...singleAdditionalModifier,
            ...multipleAdditionalModifier,
         ]
         const cartItem = getCartItemWithModifiers(
            selectedProductOption.cartItem,
            resultSelectedModifier.map(x => x.cartItem),
            modifierOptionsConsistAdditionalModifiersWithData
         )

         addToCart(cartItem, 1)
         setShowChooseIncreaseType(false)
         return
      }

      const cartItem = getCartItemWithModifiers(
         selectedProductOption.cartItem,
         allSelectedOptions.map(x => x.cartItem)
      )

      addToCart(cartItem, 1)
      setShowChooseIncreaseType(false)
   }
   const handlePresentModalPress = React.useCallback(() => {
      bottomSheetModalRef.current?.present()
   }, [])
   const handleSheetChanges = React.useCallback(index => {
      console.log('handleSheetChanges', index)
   }, [])

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
                        style={[
                           styles.productName,
                           { fontFamily: globalStyle.font.medium },
                        ]}
                        numberOfLines={
                           viewStyle === productViewStyles.verticalCard ? 1 : 0
                        }
                     >
                        {productData.name}
                     </Text>
                     <Text
                        style={[
                           styles.additionalText,
                           { fontFamily: globalStyle.font.regular },
                        ]}
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
                           <Text
                              style={[
                                 styles.productDiscountValue,
                                 { fontFamily: globalStyle.font.medium },
                              ]}
                           >
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
                                    <Text
                                       style={[
                                          styles.productOriginalValue,
                                          {
                                             fontFamily:
                                                globalStyle.font.regular,
                                          },
                                       ]}
                                    >
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
                        {availableQuantityInCart === 0 ? (
                           <Button
                              onPress={() => {
                                 handelAddToCartClick()
                              }}
                           >
                              +ADD
                           </Button>
                        ) : (
                           <CounterButton
                              count={availableQuantityInCart}
                              onMinusClick={() => {
                                 const idsAv = combinedCartItems
                                    .filter(x => x.productId === productData.id)
                                    .map(x => x.ids)
                                    .flat()
                                 removeCartItems([idsAv[idsAv.length - 1]])
                              }}
                              onPlusClick={() => {
                                 if (
                                    productData.productOptions.length > 0 &&
                                    productData.isPopupAllowed
                                 ) {
                                    setShowChooseIncreaseType(true)
                                 } else {
                                    addToCart(productData.defaultCartItem, 1)
                                 }
                              }}
                           />
                        )}
                     </View>
                  </View>
               </View>
            </View>
            {/* {showModifierPopup && <ModifierPopup />} */}
            <BottomSheetModal
               ref={bottomSheetModalRef}
               snapPoints={snapPoints}
               index={0}
               enablePanDownToClose={true}
               handleComponent={() => null}
               backdropComponent={CustomBackdrop}
            >
               <ModifierPopup
                  closeModifier={() => {
                     // setShowModifierPopup(false)
                     bottomSheetModalRef.current?.dismiss()
                  }}
                  productData={productData}
               />
            </BottomSheetModal>
            <Modal isVisible={showModifierPopup}>
               <ModifierPopup
                  closeModifier={() => {
                     setShowModifierPopup(false)
                  }}
                  productData={productData}
               />
            </Modal>
            <Modal
               isVisible={showChooseIncreaseType}
               onBackdropPress={() => {
                  setShowChooseIncreaseType(false)
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
                        Repeat last used customization?
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
                           setShowChooseIncreaseType(false)
                           setShowModifierPopup(true)
                        }}
                     >
                        I'LL CHOOSE
                     </Button>
                     <Button
                        buttonStyle={{
                           flex: 1,
                           marginLeft: 20,
                        }}
                        onPress={async () => {
                           await repeatLastOne(productData)
                        }}
                     >
                        REPEAT LAST ONE
                     </Button>
                  </View>
               </View>
            </Modal>
         </View>
      </TouchableWithoutFeedback>
   )
}

const styles = StyleSheet.create({
   productListHeading: {
      fontSize: 20,
      lineHeight: 20,
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
   },
   additionalText: {
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

      fontSize: 10,
   },
   productDiscountValue: {
      color: '#181818',
      fontSize: 12,
   },
   noProductsMsgContainer: {
      display: 'flex',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
   },
})
