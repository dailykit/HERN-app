import { isEmpty } from 'lodash'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { DeleteIcon } from '../../assets/deleteIcon'
import { EditIcon } from '../../assets/editIcon'
import { CounterButton } from '../../components/counterButton'
import { useCart } from '../../context'
import { formatCurrency } from '../../utils/formatCurrency'
import React, { useState, useEffect, useRef } from 'react'
import { DownVector, UpVector } from '../../assets/vector'
import { ModifierPopup } from '../../components/modifierPopup'
import { PRODUCT_ONE } from '../../graphql'
import { useConfig } from '../../lib/config'
import { useQuery } from '@apollo/client'
import Modal from 'react-native-modal'
import { Button } from '../../components/button'
import { getCartItemWithModifiers } from '../../utils'
import Toast from 'react-native-simple-toast'
import useGlobalStyle from '../../globalStyle'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import CustomBackdrop from '../../components/modalBackdrop'
import Toast from 'react-native-simple-toast'

export const CartCard = ({ productData, quantity }) => {
   // context
   const { brand, locationId, brandLocation, appConfig } = useConfig()
   const { globalStyle } = useGlobalStyle()
   const { addToCart, methods } = useCart()

   // Ref
   const bottomSheetModalRef = useRef()

   // State
   const [modifyProductId, setModifyProductId] = useState(null)
   const [modifyProduct, setModifyProduct] = useState(null)
   const [modifierType, setModifierType] = useState(null)
   const [cartDetailSelectedProduct, setCartDetailSelectedProduct] =
      useState(null)
   const [showAdditionalDetailsOnCard, setShowAdditionalDetailsOnCard] =
      useState(false) // show modifier and product options details
   const [showChooseIncreaseType, setShowChooseIncreaseType] = useState(false) // show I'll choose or repeat last one popup
   const [forRepeatLastOne, setForRepeatLastOne] = useState(false) // to run repeatLastOne fn in PRODUCTS query

   const [showDeleteItemModal, setShowDeleteItemModal] = useState(false)

   const argsForByLocation = React.useMemo(
      () => ({
         brandId: brand?.id,
         locationId: locationId,
         brand_locationId: brandLocation?.id,
      }),
      [brand, locationId, brandLocation?.id]
   )

   const { data: repeatLastOneData } = useQuery(PRODUCT_ONE, {
      skip: !modifyProductId,
      variables: {
         id: modifyProductId,
         params: argsForByLocation,
      },
      onCompleted: data => {
         // use for repeat last one order
         if (forRepeatLastOne) {
            if (data) {
               return
            }
         }
         if (data) {
            setModifyProduct(data.product)
         }
      },
   })

   useEffect(() => {
      if (repeatLastOneData && forRepeatLastOne) {
         repeatLastOne(repeatLastOneData.product)
      }
   }, [repeatLastOneData, forRepeatLastOne])

   const repeatLastOne = productData => {
      if (cartDetailSelectedProduct.childs.length === 0) {
         addToCart(productData.defaultCartItem, 1)
         Toast.show('Item added into cart.')
         setForRepeatLastOne(false)
         setModifyProduct(null)
         setModifyProductId(null)
         setCartDetailSelectedProduct(null)
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
      const selectedProductOption = productData.productOptions?.find(
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
         setForRepeatLastOne(false)
         setModifyProduct(null)
         setModifyProductId(null)
         setCartDetailSelectedProduct(null)
         setShowChooseIncreaseType(false)
         return
      }

      const cartItem = getCartItemWithModifiers(
         selectedProductOption.cartItem,
         allSelectedOptions.map(x => x.cartItem)
      )

      addToCart(cartItem, 1)
      Toast.show('Item added into cart.')
      setForRepeatLastOne(false)
      setModifyProduct(null)
      setModifyProductId(null)
      setCartDetailSelectedProduct(null)
      setShowChooseIncreaseType(false)
   }

   let totalPrice = 0
   let totalDiscount = 0
   const price = product => {
      if (!isEmpty(product)) {
         totalPrice += product.price
         totalDiscount += product.discount
         if (!isEmpty(product.childs)) {
            product.childs.forEach(product => {
               price(product)
            })
         }
         return {
            totalPrice: totalPrice * quantity,
            totalDiscount: totalDiscount * quantity,
         }
      }
   }
   const getTotalPrice = React.useMemo(() => price(productData), [productData])
   const isProductAvailable = product => {
      // const selectedProductOption = product.product.productOptions.find(
      //    option => option.id === product.childs[0]?.productOption?.id
      // )
      const selectedProductOption = product.productOption

      if (!isEmpty(selectedProductOption)) {
         return (
            product.product.isAvailable &&
            product.product.isPublished &&
            !product.product.isArchived &&
            selectedProductOption.isAvailable &&
            !selectedProductOption.isArchived &&
            selectedProductOption.isPublished
         )
      } else {
         return product.product.isAvailable && product.product.isPublished
      }
   }

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
   const chooseIncreaseTypeModalDismiss = useRef()
   return (
      <View style={[styles.cartContainer]}>
         <View style={styles.productMetaDetails}>
            <View>
               <Image
                  source={{
                     uri:
                        productData?.image ||
                        appConfig?.brandSettings?.productSettings?.defaultImage
                           ?.value,
                     width: 95,
                     height: 95,
                  }}
                  style={styles.productImage}
               />
            </View>
            <View style={styles.productDetails}>
               <View
                  style={{
                     flexDirection: 'row',
                  }}
               >
                  <View style={{ flex: 10 }}>
                     <Text
                        style={[
                           styles.productName,
                           { fontFamily: globalStyle.font.medium },
                        ]}
                     >
                        {productData.name}
                     </Text>
                  </View>
                  <View style={{ flex: 1, justifyContent: 'center' }}>
                     {productData.childs.length > 0 ? (
                        <TouchableOpacity
                           style={{
                              padding: 6,
                              marginBottom: 6,
                           }}
                           onPress={() => {
                              setModifierType('edit')
                              setCartDetailSelectedProduct(productData)
                              setModifyProductId(productData.productId)
                              bottomSheetModalRef.current?.present()
                           }}
                        >
                           <EditIcon />
                        </TouchableOpacity>
                     ) : null}
                     <TouchableOpacity
                        style={{
                           padding: 6,
                        }}
                        onPress={() => {
                           setShowDeleteItemModal(true)
                           // removeCartItems(productData.ids)
                        }}
                     >
                        <DeleteIcon stroke={'#40404099'} />
                     </TouchableOpacity>
                  </View>
               </View>
               <View style={styles.metaDetailsBottom}>
                  {isProductAvailable(productData) ? (
                     <CounterButton
                        count={productData.ids.length}
                        onMinusClick={() => {
                           removeCartItems([
                              productData.ids[productData.ids.length - 1],
                           ])
                           Toast.show('Removing Item...')
                        }}
                        onPlusClick={() => {
                           if (productData.childs.length > 0) {
                              setShowChooseIncreaseType(true)
                           } else {
                              setCartDetailSelectedProduct(productData)
                              setModifyProductId(productData.productId)
                              setForRepeatLastOne(true)
                           }
                        }}
                     />
                  ) : (
                     <Text
                        style={{
                           color: '#f33737',
                           fontFamily: globalStyle.font.medium,
                           fontSize: 13,
                        }}
                     >
                        This product is not available
                     </Text>
                  )}
                  <View style={styles.priceContainer}>
                     {getTotalPrice.totalDiscount > 0 && (
                        <Text
                           style={[
                              styles.originalPrice,
                              { fontFamily: globalStyle.font.regular },
                           ]}
                        >
                           {formatCurrency(getTotalPrice.totalPrice)}
                        </Text>
                     )}
                     <Text
                        style={[
                           styles.discountPrice,
                           { fontFamily: globalStyle.font.regular },
                        ]}
                     >
                        {getTotalPrice.totalPrice !== 0
                           ? formatCurrency(
                                getTotalPrice.totalPrice -
                                   getTotalPrice.totalDiscount
                             )
                           : null}
                     </Text>
                  </View>
               </View>
            </View>
         </View>
         <AdditionalDetails
            productData={productData}
            showAdditionalDetailsOnCard={true}
         />
         <BottomSheetModal
            ref={bottomSheetModalRef}
            snapPoints={['90%']}
            index={0}
            enablePanDownToClose={true}
            handleComponent={() => null}
            backdropComponent={CustomBackdrop}
         >
            {modifyProduct ? (
               <ModifierPopup
                  closeModifier={() => {
                     setModifyProduct(null)
                     setModifyProductId(null)
                     setModifierType(null)
                     bottomSheetModalRef.current.dismiss()
                  }}
                  productData={modifyProduct}
                  forNewItem={Boolean(modifierType === 'newItem')}
                  edit={Boolean(modifierType === 'edit')}
                  productCartDetail={cartDetailSelectedProduct}
               />
            ) : null}
         </BottomSheetModal>
         <Modal
            isVisible={showChooseIncreaseType}
            onBackdropPress={() => {
               setShowChooseIncreaseType(false)
            }}
            onModalHide={() => {
               if (chooseIncreaseTypeModalDismiss.current) {
                  chooseIncreaseTypeModalDismiss.current()
                  chooseIncreaseTypeModalDismiss.current = null
               }
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
                     Repeat last used customization???
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
                        setModifierType('newItem')
                        setCartDetailSelectedProduct(productData)
                        setModifyProductId(productData.productId)
                        // bottomSheetModalRef.current.present()
                        chooseIncreaseTypeModalDismiss.current = () => {
                           bottomSheetModalRef.current.present()
                        }
                     }}
                  >
                     I'LL CHOOSE
                  </Button>
                  <Button
                     buttonStyle={{
                        flex: 1,
                        marginLeft: 20,
                     }}
                     onPress={() => {
                        setShowChooseIncreaseType(false)
                        setCartDetailSelectedProduct(productData)
                        setModifyProductId(productData.productId)
                        // setForRepeatLastOne(true)
                        chooseIncreaseTypeModalDismiss.current = () => {
                           setForRepeatLastOne(true)
                        }
                        Toast.show('Updating Cart Items...')
                     }}
                  >
                     REPEAT LAST ONE
                  </Button>
               </View>
            </View>
         </Modal>
         <Modal
            isVisible={showDeleteItemModal}
            onBackdropPress={() => {
               setShowDeleteItemModal(false)
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
                     Remove Item from Cart?
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
                        setShowDeleteItemModal(false)
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
                        setShowDeleteItemModal(false)
                        removeCartItems(productData.ids)
                        Toast.show('Removing Item from Cart...')
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
const AdditionalDetails = ({ productData }) => {
   const [showAdditionalDetailsOnCard, setShowAdditionalDetailsOnCard] =
      React.useState(false)

   const { globalStyle } = useGlobalStyle()
   return (
      <View style={{ marginTop: 12 }}>
         {productData.childs.length > 0 && (
            <TouchableOpacity
               onPress={() => {
                  setShowAdditionalDetailsOnCard(prev => !prev)
               }}
               style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  height: 36,
                  backgroundColor: globalStyle.color.primary,
                  borderRadius: 4,
                  paddingHorizontal: 12,
               }}
            >
               <Text
                  style={{ fontFamily: globalStyle.font.medium, color: '#fff' }}
               >
                  Customizable
               </Text>
               {showAdditionalDetailsOnCard ? (
                  <UpVector size={14} />
               ) : (
                  <DownVector size={14} />
               )}
            </TouchableOpacity>
         )}
         {showAdditionalDetailsOnCard ? (
            <View
               style={{
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  backgroundColor: '#00000005',
                  borderRadius: 4,
               }}
            >
               <View style={styles.productOption}>
                  <Text
                     style={[
                        styles.productOptionLabel,
                        { fontFamily: globalStyle.font.medium },
                     ]}
                  >
                     {productData.childs[0].productOption.label || 'N/A'}
                  </Text>
                  {productData.childs[0].price !== 0 ? (
                     <View>
                        {
                           <>
                              {productData.childs[0].discount > 0 ? (
                                 <Text
                                    style={{
                                       color: '#00000080',
                                       fontFamily: globalStyle.font.medium,
                                    }}
                                 >
                                    {formatCurrency(
                                       productData.childs[0].price
                                    )}
                                 </Text>
                              ) : null}
                              <Text
                                 style={{
                                    marginLeft: 6,
                                    color: '#00000080',
                                    fontFamily: globalStyle.font.medium,
                                    fontSize: 13,
                                 }}
                              >
                                 {formatCurrency(
                                    productData.childs[0].price -
                                       productData.childs[0].discount
                                 )}
                              </Text>
                           </>
                        }
                     </View>
                  ) : null}
               </View>
               <View>
                  {productData.childs[0].childs.some(
                     each => each.modifierOption
                  ) && (
                     <>
                        <View>
                           {productData.childs.length > 0 &&
                              productData.childs[0].childs.map(
                                 (modifier, index) =>
                                    modifier.modifierOption ? (
                                       <View key={index}>
                                          <View style={styles.modifierOption}>
                                             <Text
                                                style={[
                                                   styles.modifierOptionText,
                                                   {
                                                      fontFamily:
                                                         globalStyle.font
                                                            .medium,
                                                   },
                                                ]}
                                             >
                                                {modifier.modifierOption.name}
                                             </Text>

                                             {modifier.price !== 0 && (
                                                <View>
                                                   {
                                                      <>
                                                         {modifier.discount >
                                                         0 ? (
                                                            <Text
                                                               style={[
                                                                  [
                                                                     styles.modifierOptionText,
                                                                     {
                                                                        fontFamily:
                                                                           globalStyle
                                                                              .font
                                                                              .medium,
                                                                     },
                                                                  ],
                                                                  {
                                                                     textDecoration:
                                                                        'line-through',
                                                                  },
                                                               ]}
                                                            >
                                                               {formatCurrency(
                                                                  modifier.price
                                                               )}
                                                            </Text>
                                                         ) : null}
                                                         <Text
                                                            style={[
                                                               [
                                                                  styles.modifierOptionText,
                                                                  {
                                                                     fontFamily:
                                                                        globalStyle
                                                                           .font
                                                                           .medium,
                                                                  },
                                                               ],
                                                               {
                                                                  marginLeft: 6,
                                                               },
                                                            ]}
                                                         >
                                                            {formatCurrency(
                                                               modifier.price -
                                                                  modifier.discount
                                                            )}
                                                         </Text>
                                                      </>
                                                   }
                                                </View>
                                             )}
                                          </View>
                                          {modifier.childs.length > 0 && (
                                             <View style={{ marginLeft: 12 }}>
                                                {modifier.childs.map(
                                                   (
                                                      eachNestedModifier,
                                                      index
                                                   ) => {
                                                      return (
                                                         <View
                                                            key={index}
                                                            style={
                                                               styles.modifierOption
                                                            }
                                                         >
                                                            <Text
                                                               style={[
                                                                  [
                                                                     styles.modifierOptionText,
                                                                     {
                                                                        fontFamily:
                                                                           globalStyle
                                                                              .font
                                                                              .medium,
                                                                     },
                                                                  ],
                                                               ]}
                                                            >
                                                               {
                                                                  eachNestedModifier
                                                                     .modifierOption
                                                                     .name
                                                               }
                                                            </Text>
                                                            {eachNestedModifier.price !==
                                                               0 && (
                                                               <View>
                                                                  {
                                                                     <>
                                                                        {eachNestedModifier.discount >
                                                                           0 && (
                                                                           <Text
                                                                              style={[
                                                                                 [
                                                                                    styles.modifierOptionText,
                                                                                    {
                                                                                       fontFamily:
                                                                                          globalStyle
                                                                                             .font
                                                                                             .medium,
                                                                                    },
                                                                                 ],
                                                                                 {
                                                                                    textDecoration:
                                                                                       'line-through',
                                                                                 },
                                                                              ]}
                                                                           >
                                                                              {formatCurrency(
                                                                                 eachNestedModifier.price
                                                                              )}
                                                                           </Text>
                                                                        )}
                                                                        <Text
                                                                           style={[
                                                                              [
                                                                                 styles.modifierOptionText,
                                                                                 {
                                                                                    fontFamily:
                                                                                       globalStyle
                                                                                          .font
                                                                                          .medium,
                                                                                 },
                                                                              ],
                                                                              {
                                                                                 marginLeft: 6,
                                                                              },
                                                                           ]}
                                                                        >
                                                                           {formatCurrency(
                                                                              eachNestedModifier.price -
                                                                                 eachNestedModifier.discount
                                                                           )}
                                                                        </Text>
                                                                     </>
                                                                  }
                                                               </View>
                                                            )}
                                                         </View>
                                                      )
                                                   }
                                                )}
                                             </View>
                                          )}
                                       </View>
                                    ) : null
                              )}
                        </View>
                     </>
                  )}
               </View>
            </View>
         ) : null}
      </View>
   )
}

const styles = StyleSheet.create({
   cartContainer: {
      padding: 6,
      paddingVertical: 12,
      borderRadius: 4,
      // shadowColor: '#00000030',
      // shadowOffset: { width: 0, height: 2 },
      // shadowRadius: 6,
      // elevation: 3,
      marginBottom: 6,
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
   },
   clearCartText: {
      fontSize: 12,
   },
   itemStyle: {
      fontSize: 14,
   },
   productMetaDetails: {
      flexDirection: 'row',
      marginBottom: -6,
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
      borderRadius: 6,
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
      fontSize: 13,
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
