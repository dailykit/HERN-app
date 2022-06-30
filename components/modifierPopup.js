import { chain, isEmpty } from 'lodash'
import React, { useState, useEffect } from 'react'
import {
   StyleSheet,
   Text,
   TouchableOpacity,
   View,
   Image,
   ScrollView,
   TouchableWithoutFeedback,
} from 'react-native'
import CloseIcon from '../assets/closeIcon'
import { VegNonVegIcon } from '../assets/vegNonVegIcon'
// import { productData } from '../screens/menu/demoProduct'
import { formatCurrency } from '../utils/formatCurrency'
import { getPriceWithDiscount } from '../utils/getPriceWithDiscount'
import { useModifier } from '../utils/useModifier'
import { Button } from './button'
import { CounterButton } from './counterButton'
import { ModifierCategory } from './modifierCategory'
import appConfig from '../brandConfig.json'
import { DownVector, UpVector } from '../assets/vector'
import { useConfig } from '../lib/config'
import { useQuery } from '@apollo/client'
import { PRODUCT_ONE } from '../graphql'
import { useCart } from '../context'
import { getCartItemWithModifiers } from '../utils'

export const ModifierPopup = ({
   closeModifier,
   forNewItem = false,
   edit = false,
   productCartDetail = null,
   showModifiers = true,
   productData,
}) => {
   // context
   const { brand, locationId, brandLocation } = useConfig()
   const { addToCart, methods } = useCart()

   const [isModifiersLoading, setIsModifiersLoading] = useState(true)
   const [productOption, setProductOption] = useState(null) // for by default choose one product option
   // console.log("product option needed",productData,productOption)
   // const completeProductData = React.useMemo(() => productData, [])
   const [productOptionType, setProductOptionType] = useState(null)
   const [quantity, setQuantity] = useState(1)

   const productOptionsGroupedByProductOptionType = React.useMemo(() => {
      const groupedData = chain(productData.productOptions)
         .groupBy('type')
         .map((value, key) => ({
            type: key,
            data: value,
         }))
         .value()
      return groupedData
   }, [productData])

   const {
      selectedModifierOptions,
      setSelectedModifierOptions,
      errorCategories,
      setErrorCategories,
      status,
   } = useModifier({
      product: productData,
      productOption,
      forNewItem,
      edit,
      setProductOption,
      productCartDetail,
      simpleModifier: true,
   })
   const {
      selectedModifierOptions: nestedSelectedModifierOptions,
      setSelectedModifierOptions: nestedSetSelectedModifierOptions,
      errorCategories: nestedErrorCategories,
      setErrorCategories: nestedSetErrorCategories,
      status: nestedStatus,
   } = useModifier({
      product: productData,
      productOption,
      forNewItem,
      edit,
      setProductOption,
      productCartDetail,
      nestedModifier: true,
   })

   const argsForByLocation = React.useMemo(
      () => ({
         brandId: brand?.id,
         locationId: locationId,
         brand_locationId: brandLocation?.id,
      }),
      [brand, locationId, brandLocation?.id]
   )

   const {
      loading,
      error,
      data: { product: completeProductData = {} } = {},
   } = useQuery(PRODUCT_ONE, {
      variables: {
         id: productData.id,
         params: argsForByLocation,
      },
      onError: error => {
         console.error('kiosk modifier popup', error)
      },
   })

   useEffect(() => {
      if (!isEmpty(completeProductData)) {
         const defaultProductOption =
            completeProductData.productOptions.find(
               x =>
                  x.id === completeProductData.defaultProductOptionId &&
                  x.isPublished &&
                  x.isAvailable
            ) ||
            completeProductData.productOptions.find(
               x => x.isPublished && x.isAvailable
            )
         setProductOption(defaultProductOption)
         setProductOptionType(
            defaultProductOption.type ? defaultProductOption.type : 'null'
         )
         setIsModifiersLoading(false)
      }
   }, [completeProductData])

   useEffect(() => {
      if (!isEmpty(completeProductData) && (forNewItem || edit)) {
         const productOptionId = productCartDetail.childs[0].productOption.id
         const selectedProductOption = completeProductData.productOptions.find(
            x => x.id == productOptionId
         )
         setProductOption(selectedProductOption)
         if (edit) {
            setQuantity(productCartDetail.ids.length)
         }
      }
   }, [completeProductData])
   const handleAddOnCartOn = async () => {
      //check category fulfillment conditions
      const allSelectedOptions = [
         ...selectedModifierOptions.single,
         ...selectedModifierOptions.multiple,
      ]
      const allNestedSelectedOptions = [
         ...nestedSelectedModifierOptions.single,
         ...nestedSelectedModifierOptions.multiple,
      ]
      //no modifier available in product options
      if (!productOption.modifier) {
         // console.log('PASS')
         // addToCart({ ...productOption, quantity })
         const cartItem = getCartItemWithModifiers(
            productOption.cartItem,
            allSelectedOptions.map(x => x.cartItem)
         )
         // const objects = new Array(quantity).fill({ ...cartItem })
         // console.log('cartItem', objects)
         await addToCart(cartItem, quantity)
         addToast(t('Added to the Cart!'), {
            appearance: 'success',
         })
         if (edit) {
            methods.cartItems.delete({
               variables: {
                  where: {
                     id: {
                        _in: productCartDetail.ids,
                     },
                  },
               },
            })
         }
         closeModifier()
         return
      }

      let allCatagories = productOption.modifier?.categories || []
      let allAdditionalCatagories = []
      if (!isEmpty(productOption.additionalModifiers)) {
         productOption.additionalModifiers.forEach(eachAdditionalModifier => {
            eachAdditionalModifier.modifier.categories.forEach(eachCategory => {
               allAdditionalCatagories.push(eachCategory)
            })
         })
      }

      let finalCategories = [...allCatagories, ...allAdditionalCatagories]

      let errorState = []
      for (let i = 0; i < finalCategories.length; i++) {
         const allFoundedOptionsLength = allSelectedOptions.filter(
            x => x.modifierCategoryID === finalCategories[i].id
         ).length

         if (
            finalCategories[i]['isRequired'] &&
            finalCategories[i]['type'] === 'multiple'
         ) {
            const min = finalCategories[i]['limits']['min']
            const max = finalCategories[i]['limits']['max']
            if (
               allFoundedOptionsLength > 0 &&
               min <= allFoundedOptionsLength &&
               (max
                  ? allFoundedOptionsLength <= max
                  : allFoundedOptionsLength <=
                    finalCategories[i].options.length)
            ) {
            } else {
               errorState.push(finalCategories[i].id)
            }
         }
      }
      let nestedFinalCategories = []
      let nestedFinalErrorCategories = []
      // console.log('finalCategories', finalCategories)
      finalCategories.forEach(eachCategory => {
         eachCategory.options.forEach(eachOption => {
            if (eachOption.additionalModifierTemplateId) {
               nestedFinalCategories.push(
                  ...eachOption.additionalModifierTemplate.categories
               )
            }
         })
      })
      if (nestedFinalCategories.length > 0) {
         for (let i = 0; i < nestedFinalCategories.length; i++) {
            const allFoundedOptionsLength = allNestedSelectedOptions.filter(
               x => x.modifierCategoryID === nestedFinalCategories[i].id
            ).length

            if (
               nestedFinalCategories[i]['isRequired'] &&
               nestedFinalCategories[i]['type'] === 'multiple'
            ) {
               const min = nestedFinalCategories[i]['limits']['min']
               const max = nestedFinalCategories[i]['limits']['max']
               if (
                  allFoundedOptionsLength > 0 &&
                  min <= allFoundedOptionsLength &&
                  (max
                     ? allFoundedOptionsLength <= max
                     : allFoundedOptionsLength <=
                       nestedFinalCategories[i].options.length)
               ) {
               } else {
                  nestedFinalErrorCategories.push(nestedFinalCategories[i].id)
               }
            }
         }
      }
      setErrorCategories(errorState)
      nestedSetErrorCategories(nestedFinalErrorCategories)
      if (errorState.length > 0 || nestedFinalErrorCategories.length > 0) {
         // console.log('FAIL')
         return
      } else {
         // console.log('PASS')
         const nestedModifierOptionsGroupByParentModifierOptionId =
            allNestedSelectedOptions.length > 0
               ? chain(allNestedSelectedOptions)
                    .groupBy('parentModifierOptionId')
                    .map((value, key) => ({
                       parentModifierOptionId: +key,
                       data: value,
                    }))
                    .value()
               : []

         if (!isEmpty(nestedModifierOptionsGroupByParentModifierOptionId)) {
            const cartItem = getCartItemWithModifiers(
               productOption.cartItem,
               allSelectedOptions.map(x => x.cartItem),
               nestedModifierOptionsGroupByParentModifierOptionId
            )
            // console.log('finalCartItem', cartItem)
            await addToCart(cartItem, quantity)
         } else {
            const cartItem = getCartItemWithModifiers(
               productOption.cartItem,
               allSelectedOptions.map(x => x.cartItem)
            )
            await addToCart(cartItem, quantity)
         }
         if (edit) {
            methods.cartItems.delete({
               variables: {
                  where: {
                     id: {
                        _in: productCartDetail.ids,
                     },
                  },
               },
            })
         }
         closeModifier()
      }
   }
   const totalAmount = () => {
      if (!productOption) {
         return { total: 0, totalWithoutDiscount: 0, totalDiscount: 0 }
      }
      const productOptionPrice = productOption.price
      const allSelectedOptions = [
         ...selectedModifierOptions.single,
         ...selectedModifierOptions.multiple,
      ]
      const allNestedSelectedOptions = [
         ...nestedSelectedModifierOptions.single,
         ...nestedSelectedModifierOptions.multiple,
      ]
      let allSelectedOptionsPrice = 0
      let allSelectedOptionsPriceWithDiscount = 0
      let allNestedSelectedOptionsPrice = 0
      let allNestedSelectedOptionsPriceWithDiscount = 0
      allSelectedOptions.forEach(x => {
         allSelectedOptionsPrice += x?.modifierCategoryOptionsPrice || 0
         allSelectedOptionsPriceWithDiscount +=
            getPriceWithDiscount(
               x?.modifierCategoryOptionsPrice,
               x?.modifierCategoryOptionsDiscount
            ) || 0
      })
      allNestedSelectedOptions.forEach(x => {
         allNestedSelectedOptionsPrice += x?.modifierCategoryOptionsPrice || 0
         allNestedSelectedOptionsPriceWithDiscount +=
            getPriceWithDiscount(
               x?.modifierCategoryOptionsPrice,
               x?.modifierCategoryOptionsDiscount
            ) || 0
      })
      const totalBaseProductPriceWithDiscount = getPriceWithDiscount(
         productData.price,
         productData.discount
      )
      const totalProductionOptionsPriceWithDiscount = getPriceWithDiscount(
         productOptionPrice,
         productOption.discount
      )
      const totalWithoutDiscount =
         productData.price +
         productOptionPrice +
         allSelectedOptionsPrice +
         allNestedSelectedOptionsPrice
      const totalPrice =
         totalBaseProductPriceWithDiscount +
         totalProductionOptionsPriceWithDiscount +
         allSelectedOptionsPriceWithDiscount +
         allNestedSelectedOptionsPriceWithDiscount

      return {
         totalProductPrice: totalPrice,
         total: totalPrice * quantity,
         totalWithoutDiscount: totalWithoutDiscount * quantity,
         totalDiscount: (totalWithoutDiscount - totalPrice) * quantity,
      }
   }
   //    console.log('productOption', productOption)

   const { totalProductPrice, total, totalWithoutDiscount, totalDiscount } =
      totalAmount()

   return (
      <View style={styles.modifierPopupContainer}>
         <View style={styles.modifierPopupHeader}>
            <Text style={styles.customizationText}>Customization</Text>
            <TouchableOpacity
               onPress={() => {
                  closeModifier()
               }}
               style={{
                  padding: 10,
                  paddingRight: 0,
               }}
            >
               <CloseIcon />
            </TouchableOpacity>
         </View>
         <ScrollView style={{ paddingHorizontal: 12 }}>
            <View style={styles.productDetails}>
               <Image
                  source={{
                     uri: productData.assets.images[0],
                     width: 120,
                     height: 84,
                  }}
               />
               <View style={{ flexShrink: 1, marginLeft: 5 }}>
                  <View
                     style={{
                        display: 'flex',
                        flexDirection: 'row',
                     }}
                  >
                     <VegNonVegIcon size={12} fill={'#61D836'} />
                     <Text style={styles.productName}>{productData.name}</Text>
                  </View>
                  {productData.price > 0 ? (
                     productData.discount > 0 ? (
                        <View
                           style={{
                              display: 'flex',
                              flexDirection: 'row',
                              alignItems: 'center',
                           }}
                        >
                           <Text
                              style={{
                                 textDecorationLine: 'line-through',
                                 marginRight: 5,
                                 fontSize: 12,
                                 color: '#A2A2A2',
                              }}
                           >
                              {formatCurrency(productData.price)}
                           </Text>
                           <Text style={{ fontWeight: '500' }}>
                              {formatCurrency(
                                 getPriceWithDiscount(
                                    productData.price,
                                    productData.discount
                                 )
                              )}
                           </Text>
                        </View>
                     ) : (
                        <Text style={{ fontWeight: '500' }}>
                           {formatCurrency(productData.price)}
                        </Text>
                     )
                  ) : null}
                  <Text style={styles.description}>
                     {productData?.description}
                  </Text>
               </View>
            </View>
            <ScrollView horizontal={true} style={{ marginVertical: 10 }}>
               {isModifiersLoading
                  ? null
                  : productOptionsGroupedByProductOptionType
                       .find(eachType => eachType.type == productOptionType)
                       .data.map((eachOption, index) => {
                          if (!eachOption.isPublished) {
                             return null
                          }

                          return (
                             <TouchableWithoutFeedback
                                key={eachOption.id}
                                onPress={e => {
                                   if (eachOption.isAvailable) {
                                      setProductOption(eachOption)
                                   }
                                }}
                             >
                                <Text
                                   style={[
                                      styles.productOptionButton,
                                      {
                                         borderColor:
                                            productOption.id === eachOption.id
                                               ? appConfig.brandSettings
                                                    .buttonSettings
                                                    .borderActiveColor.value
                                               : appConfig.brandSettings
                                                    .buttonSettings
                                                    .borderInactiveColor.value,
                                         marginHorizontal: index === 0 ? 0 : 6,
                                      },
                                   ]}
                                >
                                   {eachOption.label}

                                   {' (+ '}
                                   {eachOption.discount > 0 && (
                                      <Text>
                                         {formatCurrency(eachOption.price)}
                                      </Text>
                                   )}
                                   {formatCurrency(
                                      getPriceWithDiscount(
                                         eachOption.price,
                                         eachOption.discount
                                      )
                                   )}
                                   {')'}
                                </Text>
                             </TouchableWithoutFeedback>
                          )
                       })}
            </ScrollView>
            {/* <View>
            {productData.productionOptionSelectionStatement ? (
               <Text>{productData.productionOptionSelectionStatement}</Text>
            ) : (
               <Text>Available Options</Text>
            )}
         </View> */}

            {/*
            modifier options
            */}
            {productOption?.modifier ? (
               <View>
                  <Text>Add On:</Text>
                  {!isModifiersLoading &&
                  productOption.additionalModifiers.length > 0
                     ? productOption.additionalModifiers.map(
                          eachAdditionalModifier => {
                             return (
                                <AdditionalModifiers
                                   key={`${eachAdditionalModifier.productOptionId} - ${eachAdditionalModifier.modifierId}`}
                                   eachAdditionalModifier={
                                      eachAdditionalModifier
                                   }
                                   selectedOptions={selectedModifierOptions}
                                   setSelectedOptions={
                                      setSelectedModifierOptions
                                   }
                                   errorCategories={errorCategories}
                                   nestedSelectedModifierOptions={
                                      nestedSelectedModifierOptions
                                   }
                                   nestedSetSelectedModifierOptions={
                                      nestedSetSelectedModifierOptions
                                   }
                                   nestedErrorCategories={nestedErrorCategories}
                                />
                             )
                          }
                       )
                     : null}
                  {!isModifiersLoading &&
                  productOption.modifier &&
                  productOption.modifier?.categories?.length > 0
                     ? productOption.modifier.categories.map(eachCategory => {
                          return (
                             <ModifierCategory
                                key={eachCategory.id}
                                eachCategory={eachCategory}
                                selectedOptions={selectedModifierOptions}
                                setSelectedOptions={setSelectedModifierOptions}
                                errorCategories={errorCategories}
                                nestedSelectedModifierOptions={
                                   nestedSelectedModifierOptions
                                }
                                nestedSetSelectedModifierOptions={
                                   nestedSetSelectedModifierOptions
                                }
                                nestedErrorCategories={nestedErrorCategories}
                             />
                          )
                       })
                     : null}
               </View>
            ) : (
               <Text>Loading</Text>
            )}
         </ScrollView>
         <View
            style={[
               styles.footer,
               {
                  backgroundColor:
                     appConfig.brandSettings.modifierSettings
                        .footerBackgroundColor.value,
               },
            ]}
         >
            <CounterButton
               count={quantity}
               onPlusClick={() => {
                  setQuantity(prev => prev + 1)
               }}
               onMinusClick={() => {
                  setQuantity(prev => prev - 1)
               }}
            />
            <Button
               buttonStyle={{ height: 42, borderRadius: 8 }}
               textStyle={{ fontSize: 14 }}
               onPress={handleAddOnCartOn}
            >
               ADD ITEM {'('}
               {formatCurrency(total.toFixed(2))}
               {totalDiscount > 0 && (
                  <Text
                     style={{
                        textDecorationLine: 'line-through',
                        fontSize: 12,
                     }}
                  >
                     {' '}
                     {formatCurrency(totalWithoutDiscount.toFixed(2))}
                  </Text>
               )}
               {')'}
            </Button>
         </View>
      </View>
   )
}

const AdditionalModifiers = ({
   eachAdditionalModifier,
   selectedOptions,
   setSelectedOptions,
   errorCategories,
   nestedSelectedModifierOptions,
   nestedSetSelectedModifierOptions,
   nestedErrorCategories,
}) => {
   const additionalModifiersType = React.useMemo(
      () => eachAdditionalModifier.type == 'hidden',
      [eachAdditionalModifier]
   )
   const [showCustomize, setShowCustomize] = useState(
      !Boolean(additionalModifiersType)
   )

   return (
      <>
         <View style={{ marginVertical: 6 }}>
            <TouchableWithoutFeedback
               onPress={() => setShowCustomize(prev => !prev)}
            >
               <View
                  className=""
                  style={{
                     display: 'flex',
                     justifyContent: 'space-between',
                     alignItems: 'center',
                     cursor: 'pointer',
                     flexDirection: 'row',
                  }}
               >
                  <Text style={{ fontWeight: '600', fontFamily: 'Metropolis' }}>
                     {eachAdditionalModifier.label}
                  </Text>

                  {showCustomize ? (
                     <UpVector size={18} />
                  ) : (
                     <DownVector size={18} />
                  )}
               </View>
            </TouchableWithoutFeedback>
            {showCustomize &&
               eachAdditionalModifier.modifier &&
               eachAdditionalModifier.modifier.categories.map(
                  (eachModifierCategory, index) => {
                     return (
                        <ModifierCategory
                           key={eachModifierCategory.id}
                           eachCategory={eachModifierCategory}
                           selectedOptions={selectedOptions}
                           setSelectedOptions={setSelectedOptions}
                           errorCategories={errorCategories}
                           nestedSelectedModifierOptions={
                              nestedSelectedModifierOptions
                           }
                           nestedSetSelectedModifierOptions={
                              nestedSetSelectedModifierOptions
                           }
                           nestedErrorCategories={nestedErrorCategories}
                        />
                     )
                  }
               )}
         </View>
      </>
   )
}

const styles = StyleSheet.create({
   modifierPopupContainer: {
      flex: 1,
      backgroundColor: '#fff',
      //   padding: 12,
      borderRadius: 6,
   },
   modifierPopupHeader: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
   },
   customizationText: {
      fontFamily: 'Metropolis',
      fontWeight: '600',
      fontSize: 16,
      lineHeight: 16,
   },
   productDetails: {
      display: 'flex',
      flexDirection: 'row',
      marginVertical: 10,
   },
   productName: {
      fontFamily: 'Metropolis',
      fontWeight: '500',
      fontSize: 14,
      lineHeight: 14,
      flexShrink: 1,
      marginHorizontal: 4,
   },
   description: {
      fontFamily: 'Metropolis',
      fontWeight: '500',
      fontSize: 10,
      lineHeight: 12,
      color: 'rgba(0, 0, 0, 0.6)',
      flexShrink: 1,
   },
   productOptionButton: {
      borderWidth: 1,
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      color: '#000',
      fontSize: 14,
      fontFamily: 'Metropolis',
      fontWeight: '500',
   },
   footer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexDirection: 'row',
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderTopRightRadius: 4,
      borderTopLeftRadius: 4,
   },
})
