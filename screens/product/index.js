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
import { PRODUCTS_QUERY } from '../../graphql'
import { useConfig } from '../../lib/config'
import Carousel, { Pagination } from 'react-native-snap-carousel'
import { LeftArrow } from '../../assets/arrowIcon'
import { formatCurrency } from '../../utils/formatCurrency'
import { getPriceWithDiscount } from '../../utils/getPriceWithDiscount'
import appConfig from '../../brandConfig.json'
import { Button } from '../../components/button'
import { useCart } from '../../context'
import { ModifierPopup } from '../../components/modifierPopup'
import Modal from 'react-native-modal'
import { SafeAreaView } from 'react-native-safe-area-context'

const windowWidth = Dimensions.get('window').width

const ProductScreen = () => {
   const navigation = useNavigation()

   const { params: { productId } = {} } = useRoute()
   const { brand, locationId, brandLocation } = useConfig()
   const { addToCart } = useCart()

   // ref
   const _carousel = React.useRef()

   // state
   const [showReadMore, setShowReadMore] = useState(false)
   const [numberOfLines, setNumberOfLines] = useState(4)
   const [showModifierPopup, setShowModifierPopup] = useState(false)

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

   const onAddItemClick = () => {
      if (products[0].isAvailable) {
         if (
            products[0].productOptions.length > 0 &&
            products[0].isPopupAllowed
         ) {
            const availableProductOptions = products[0].productOptions.filter(
               option => option.isAvailable && option.isPublished
            ).length
            if (availableProductOptions > 0) {
               setShowModifierPopup(true)
            }
         } else {
            addToCart(products[0].defaultCartItem, 1)
         }
      }
   }

   if (productLoading) {
      return (
         <View>
            <Text>Loading</Text>
         </View>
      )
   }
   if (productError) {
      return (
         <View>
            <Text>Something went wrong</Text>
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
                     <View style={styles.leftArrow}>
                        <LeftArrow />
                     </View>
                  </TouchableWithoutFeedback>
                  <Carousel
                     ref={_carousel}
                     data={products[0].assets.images}
                     renderItem={_renderItem}
                     sliderWidth={windowWidth}
                     itemWidth={windowWidth}
                     useScrollView={true}
                  />
               </View>
               <View style={styles.productDetails}>
                  <View style={styles.productDetailsHeader}>
                     <Text style={styles.productName}>{products[0].name}</Text>
                  </View>
                  <View style={styles.priceContainer}>
                     {
                        <>
                           {(products[0].discount ||
                              defaultProductOption?.discount) &&
                           products[0].price > 0 ? (
                              <Text style={styles.productOriginalValue}>
                                 {formatCurrency(
                                    products[0].price +
                                       defaultProductOption.price
                                 )}
                              </Text>
                           ) : null}
                        </>
                     }
                     <Text style={styles.discountPrice}>
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
                        <Text style={styles.additionalText}>
                           {products[0].additionalText}
                        </Text>
                     )}
                     {products[0].description && (
                        <>
                           <Text
                              style={styles.description}
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
                                       color: appConfig.brandSettings.brandColor
                                          .value,
                                       fontWeight: '500',
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
            <Button
               buttonStyle={{ height: 40, margin: 8 }}
               textStyle={{ fontWeight: '500', fontSize: 16 }}
               onPress={() => {
                  onAddItemClick()
               }}
            >
               {isProductOutOfStock ? 'Out Of Stock' : 'ADD ITEM'}
               {' ('}
               {products[0].discount > 0 || defaultProductOption.discount > 0
                  ? formatCurrency(
                       (products[0].price + defaultProductOption.price).toFixed(
                          2
                       )
                    )
                  : null}
               {formatCurrency(
                  (
                     getPriceWithDiscount(
                        products[0].price,
                        products[0].discount
                     ) +
                     getPriceWithDiscount(
                        defaultProductOption.price,
                        defaultProductOption.discount
                     )
                  ).toFixed(2)
               )}

               {')'}
            </Button>
         </View>
         <Modal isVisible={showModifierPopup}>
            <ModifierPopup
               closeModifier={() => {
                  setShowModifierPopup(false)
               }}
               productData={products[0]}
            />
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
   },
   carouselItem: {},
   image: {},
   productName: {
      fontSize: 18,
      fontWeight: '500',
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
      fontSize: 12,
      fontWeight: '500',
      color: '#00000080',
   },
   additionalText: {
      fontSize: '500',
      fontWeight: 14,
      color: '#00000040',
   },
   description: {
      fontWeight: '500',
      fontSize: 14,
      color: '#A2A2A2',
   },
})
export default ProductScreen
