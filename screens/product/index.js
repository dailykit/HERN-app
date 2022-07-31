import { useQuery } from '@apollo/client'
import { useNavigation, useRoute } from '@react-navigation/native'
import React, { useState } from 'react'
import {
   Dimensions,
   Image,
   ScrollView,
   StyleSheet,
   Text,
   TouchableWithoutFeedback,
   View,
} from 'react-native'
import { PRODUCTS_QUERY, PRODUCT_ONE } from '../../graphql'
import { useConfig } from '../../lib/config'
import Carousel, { Pagination } from 'react-native-snap-carousel'
import { LeftArrow } from '../../assets/arrowIcon'
import { formatCurrency } from '../../utils/formatCurrency'
import { getPriceWithDiscount } from '../../utils/getPriceWithDiscount'
import { Button } from '../../components/button'
import { useCart } from '../../context'
import { ModifierPopup } from '../../components/modifierPopup'
import Modal from 'react-native-modal'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Spinner } from '../../assets/loaders'
import useGlobalStyle from '../../globalStyle'
import { isEmpty } from 'lodash'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import CustomBackdrop from '../../components/modalBackdrop'
import { CounterButton } from '../../components/counterButton'
import Toast from 'react-native-simple-toast'
import { getCartItemWithModifiers } from '../../utils'
import { client } from '../../lib/apollo'

const windowWidth = Dimensions.get('window').width

const ProductScreen = () => {
   const { brand, locationId, brandLocation, appConfig } = useConfig()
   const { globalStyle } = useGlobalStyle()
   const navigation = useNavigation()
   const { params: { productId } = {} } = useRoute()
   const {
      cartState,
      methods,
      addToCart,
      combinedCartItems,
      storedCartId,
      setTotalCartItems,
   } = useCart()
   const [availableQuantityInCart, setAvailableQuantityInCart] = useState(0)
   const [showChooseIncreaseType, setShowChooseIncreaseType] = useState(false) // show I'll choose or repeat last one popup

   // ref
   const _carousel = React.useRef()
   const bottomSheetModalRef = React.useRef()

   // state
   const [showReadMore, setShowReadMore] = useState(false)
   const [numberOfLines, setNumberOfLines] = useState(4)

   const argsForByLocation = React.useMemo(
      () => ({
         brandId: brand?.id,
         locationId: locationId,
         brand_locationId: brandLocation?.id,
      }),
      [brand, locationId, brandLocation?.id]
   )

   const {
      loading: productLoading,
      error: productError,
      data: { products = [] } = {},
   } = useQuery(PRODUCTS_QUERY, {
      variables: {
         where: {
            id: {
               _eq: productId,
            },
         },
         params: argsForByLocation,
      },
   })

   const _renderItem = ({ item, index }) => {
      return (
         <View style={styles.carouselItem} key={item}>
            <Image
               source={{
                  uri: item,
                  width: windowWidth,
                  height: 255,
               }}
               style={styles.image}
            />
         </View>
      )
   }

   React.useEffect(() => {
      if (combinedCartItems && products.length > 0) {
         const allCartItemsIdsForThisProducts = combinedCartItems
            .filter(x => x.productId === products[0].id)
            .map(x => x.ids)
            .flat().length
         setAvailableQuantityInCart(allCartItemsIdsForThisProducts)
      }
   }, [combinedCartItems, products])

   React.useEffect(() => {
      if (storedCartId == null) {
         setAvailableQuantityInCart(0)
      }
   }, [storedCartId])

   const isProductOutOfStock = React.useMemo(() => {
      if (products[0]?.isAvailable) {
         if (
            products[0].productOptions.length > 0 &&
            products[0].isPopupAllowed
         ) {
            const availableProductOptions = products[0].productOptions.filter(
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
   }, [products])

   const defaultProductOption = React.useMemo(() => {
      if (productLoading) {
         return {}
      }
      if (products[0]?.productOptions?.length === 0) {
         return {}
      }
      if (isProductOutOfStock) {
         return products[0].productOptions[0]
      }
      return (
         products[0].productOptions.find(
            x =>
               x.id === products[0].defaultProductOptionId &&
               x.isPublished &&
               x.isAvailable
         ) ||
         products[0].productOptions.find(x => x.isPublished && x.isAvailable)
      )
   }, [products, isProductOutOfStock])

   const onTextLayout = React.useCallback(
      e => {
         if (numberOfLines !== undefined) {
            setShowReadMore(e.nativeEvent.lines.length > numberOfLines)
         }
      },
      [numberOfLines]
   )

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
      setTotalCartItems(prev => prev - 1)
      Toast.show('Item removed!')
   }

   const onAddItemClick = () => {
      if (!locationId) {
         navigation.navigate('LocationSelector')
         return
      }
      if (products[0].isAvailable) {
         if (
            products[0].productOptions.length > 0 &&
            products[0].isPopupAllowed
         ) {
            const availableProductOptions = products[0].productOptions.filter(
               option => option.isAvailable && option.isPublished
            ).length
            if (availableProductOptions > 0) {
               bottomSheetModalRef.current.present()
            }
         } else {
            addToCart(products[0].defaultCartItem, 1)
            Toast.show('Item added into cart.')
            setAvailableQuantityInCart(prev => prev + 1)
         }
      }
   }

   const repeatLastOne = async productData => {
      const { data: { product: productCompleteData = {} } = {} } =
         await client.query({
            query: PRODUCT_ONE,
            variables: {
               id: productData.id,
               params: argsForByLocation,
            },
         })
      setAvailableQuantityInCart(prev => prev + 1)
      const cartDetailSelectedProduct = cartState.cartItems
         .filter(x => x.productId === productData.id)
         .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
         .pop()

      if (cartDetailSelectedProduct.childs.length === 0) {
         addToCart(productData.defaultCartItem, 1)
         Toast.show('Item added into cart.')
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
         Toast.show('Item added into cart.')
         setShowChooseIncreaseType(false)
         return
      }

      const cartItem = getCartItemWithModifiers(
         selectedProductOption.cartItem,
         allSelectedOptions.map(x => x.cartItem)
      )

      addToCart(cartItem, 1)
      setShowChooseIncreaseType(false)
      Toast.show('Item added into cart.')
   }

   if (productLoading) {
      return (
         <View>
            <Spinner size={'large'} showText={true} />
         </View>
      )
   }
   if (productError) {
      return (
         <View>
            <Text style={{ fontFamily: globalStyle.font.medium }}>
               Something went wrong
            </Text>
         </View>
      )
   }
   return (
      <SafeAreaView style={styles.productScreen}>
         <View style={{ flex: 10 }}>
            <ScrollView>
               <View style={styles.imageContainer}>
                  <TouchableWithoutFeedback
                     onPress={() => {
                        navigation.goBack()
                     }}
                  >
                     <View
                        style={[
                           styles.leftArrow,
                           { backgroundColor: globalStyle.color.primary },
                        ]}
                     >
                        <LeftArrow />
                     </View>
                  </TouchableWithoutFeedback>
                  <Carousel
                     ref={_carousel}
                     data={
                        !products[0].assets.images ||
                        products[0].assets.images?.length == 0
                           ? [
                                appConfig.brandSettings.productSettings
                                   .defaultImage.value,
                             ]
                           : products[0].assets.images
                     }
                     renderItem={_renderItem}
                     sliderWidth={windowWidth}
                     itemWidth={windowWidth}
                     useScrollView={true}
                  />
               </View>
               <View style={styles.productDetails}>
                  <View style={styles.productDetailsHeader}>
                     <Text
                        style={[
                           styles.productName,
                           { fontFamily: globalStyle.font.medium },
                        ]}
                     >
                        {products[0].name}
                     </Text>
                  </View>
                  <View style={styles.priceContainer}>
                     {
                        <>
                           {(products[0].discount ||
                              defaultProductOption?.discount) &&
                           products[0].price > 0 ? (
                              <Text
                                 style={[
                                    styles.productOriginalValue,
                                    { fontFamily: globalStyle.font.medium },
                                 ]}
                              >
                                 {formatCurrency(
                                    products[0].price +
                                       defaultProductOption.price
                                 )}
                              </Text>
                           ) : null}
                        </>
                     }

                     <Text
                        style={[
                           styles.discountPrice,
                           {
                              fontFamily: globalStyle.font.medium,
                           },
                        ]}
                     >
                        {formatCurrency(
                           getPriceWithDiscount(
                              products[0].price,
                              products[0].discount
                           ) +
                              getPriceWithDiscount(
                                 defaultProductOption?.price || 0,
                                 defaultProductOption?.discount || 0
                              )
                        )}
                     </Text>
                  </View>
                  <View>
                     {products[0].additionalText && (
                        <Text
                           style={[
                              styles.additionalText,
                              {
                                 fontFamily: globalStyle.font.medium,
                                 color: globalStyle.color.grey,
                              },
                           ]}
                        >
                           {products[0].additionalText}
                        </Text>
                     )}
                     {products[0].description && (
                        <>
                           <Text
                              style={[
                                 styles.description,
                                 {
                                    fontFamily: globalStyle.font.medium,
                                    color: globalStyle.color.primary,
                                 },
                              ]}
                              numberOfLines={numberOfLines}
                              onTextLayout={onTextLayout}
                           >
                              {products[0].description}
                           </Text>
                           {showReadMore && (
                              <TouchableWithoutFeedback
                                 onPress={() => {
                                    setNumberOfLines(undefined)
                                    setShowReadMore(false)
                                 }}
                              >
                                 <Text
                                    style={{
                                       color: globalStyle.color.highlight,
                                       fontFamily: globalStyle.font.medium,
                                       fontSize: 14,
                                       textAlign: 'right',
                                    }}
                                 >
                                    Read More
                                 </Text>
                              </TouchableWithoutFeedback>
                           )}
                        </>
                     )}
                  </View>
               </View>
            </ScrollView>
         </View>
         <View style={{ flex: 1, backgroundColor: '#000' }}>
            {availableQuantityInCart === 0 ? (
               <Button
                  buttonStyle={{ height: 40, margin: 8 }}
                  textStyle={{
                     fontSize: 16,
                  }}
                  onPress={() => {
                     onAddItemClick()
                  }}
               >
                  {isProductOutOfStock ? 'Out Of Stock' : 'ADD ITEM'}
                  {' ('}
                  {products[0].discount > 0 || defaultProductOption.discount > 0
                     ? formatCurrency(
                          (
                             products[0].price + defaultProductOption.price
                          ).toFixed(2)
                       )
                     : null}
                  {formatCurrency(
                     (
                        getPriceWithDiscount(
                           products[0].price,
                           products[0].discount
                        ) +
                        (isEmpty(defaultProductOption)
                           ? 0
                           : getPriceWithDiscount(
                                defaultProductOption.price,
                                defaultProductOption.discount
                             ))
                     ).toFixed(2)
                  )}

                  {')'}
               </Button>
            ) : (
               <View
                  style={{
                     justifyContent: 'center',
                     alignItems: 'flex-end',
                     flex: 1,
                     marginRight: 30,
                  }}
               >
                  <CounterButton
                     count={availableQuantityInCart}
                     onMinusClick={() => {
                        const idsAv = combinedCartItems
                           .filter(x => x.productId === products[0].id)
                           .map(x => x.ids)
                           .flat()
                        removeCartItems([idsAv[idsAv.length - 1]])
                        setAvailableQuantityInCart(prev => prev - 1)
                     }}
                     onPlusClick={() => {
                        if (
                           products[0].productOptions.length > 0 &&
                           products[0].isPopupAllowed
                        ) {
                           setShowChooseIncreaseType(true)
                        } else {
                           addToCart(products[0].defaultCartItem, 1)
                           setAvailableQuantityInCart(prev => prev + 1)
                           Toast.show('Item added into cart.')
                        }
                     }}
                  />
               </View>
            )}
         </View>
         <BottomSheetModal
            ref={bottomSheetModalRef}
            snapPoints={['90%']}
            index={0}
            enablePanDownToClose={true}
            handleComponent={() => null}
            backdropComponent={CustomBackdrop}
         >
            <ModifierPopup
               closeModifier={() => {
                  bottomSheetModalRef.current?.dismiss()
               }}
               productData={products[0]}
               onComplete={quantity => {
                  setAvailableQuantityInCart(prev => prev + quantity)
               }}
            />
         </BottomSheetModal>
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
                        // setShowModifierPopup(true)
                        bottomSheetModalRef.current?.present()
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
                        await repeatLastOne(products[0])
                     }}
                  >
                     REPEAT LAST ONE
                  </Button>
               </View>
            </View>
         </Modal>
      </SafeAreaView>
   )
}

const styles = StyleSheet.create({
   productScreen: {
      flex: 1,
      backgroundColor: '#ffffff',
   },
   imageContainer: {
      position: 'relative',
   },
   leftArrow: {
      position: 'absolute',
      top: 20,
      left: 20,
      zIndex: 1000,
      borderRadius: 20,
      opacity: 0.9,
   },
   carouselItem: {},
   image: {},
   productName: {
      fontSize: 18,
   },
   productDetails: {
      paddingHorizontal: 21,
      paddingVertical: 15,
   },
   productDetailsHeader: {
      marginBottom: 10,
   },
   priceContainer: {
      marginBottom: 18,
   },
   productOriginalValue: {
      fontSize: 12,
      color: '#00000080',
   },
   discountPrice: {
      fontSize: 14,
      color: '#000',
   },
   additionalText: {
      fontSize: 14,
      // color: '#00000080',
      marginBottom: 20,
   },
   description: {
      fontSize: 14,
   },
})
export default ProductScreen
