import React, { useEffect } from 'react'
import {
   View,
   Text,
   TouchableOpacity,
   StyleSheet,
   ScrollView,
   Image,
   Button,
   Linking,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Header } from '../../components/header'
import { ProductList } from '../../components/product'
import { ProductCategory } from '../../components/productCategory'
import { useConfig } from '../../lib/config'
import { PromotionCarousel } from './promotionCarousel'
import { onDemandMenuContext } from '../../context'
import { PRODUCTS_QUERY } from '../../graphql'
import { useQuery } from '@apollo/client'
import { SafeAreaView } from 'react-native-safe-area-context'
import useGlobalStyle from '../../globalStyle'
import { ProductsLoader } from '../../assets/loaders/productsLoader'

const HomeScreen = () => {
   const { brand, locationId, brandLocation, appConfig, storeStatus } =
      useConfig()
   const { globalStyle } = useGlobalStyle()
   const navigation = useNavigation()
   const {
      onDemandMenu: { isMenuLoading, allProductIds, categories },
   } = React.useContext(onDemandMenuContext)

   const argsForByLocation = React.useMemo(
      () => ({
         brandId: brand?.id,
         locationId: locationId,
         brand_locationId: brandLocation?.id,
      }),
      [brand, locationId, brandLocation?.id]
   )
   // Trending Products Subscription
   const {
      data: { products: trendingProducts } = {},
      loading,
      error,
   } = useQuery(PRODUCTS_QUERY, {
      variables: {
         where: {
            isArchived: { _eq: false },
            id: {
               _in:
                  appConfig?.data?.trendingProducts?.value.map(val =>
                     parseInt(val.id)
                  ) || [],
            },
         },
         params: argsForByLocation,
      },
   })

   return (
      <SafeAreaView style={{ flex: 1 }}>
         <Header />

         <ScrollView
            style={{
               backgroundColor:
                  appConfig?.brandSettings.homeSettings.backgroundColor.value ||
                  '#ffffff',
            }}
         >
            {/* Catagories List */}
            <ScrollView style={styles.container} horizontal={true}>
               {categories.map((eachCategory, index) => {
                  if (!eachCategory.isCategoryPublished) {
                     return null
                  }
                  return (
                     <ProductCategory
                        key={`${eachCategory.name}-${index}`}
                        onCategoryClick={() => {
                           navigation.navigate('Menu', {
                              categoryName: eachCategory.name,
                           })
                        }}
                        eachCategory={eachCategory}
                        textColor={
                           appConfig?.brandSettings.homeSettings.textColor
                              .value || '#000000'
                        }
                     />
                  )
               })}
            </ScrollView>

            {/* Promotion Carousal */}
            {appConfig?.data?.topPromotionAssets?.value?.length > 0 && (
               <PromotionCarousel
                  data={appConfig?.data?.topPromotionAssets?.value || []}
                  height={204}
               />
            )}

            {/* Trending Products */}
            {trendingProducts == undefined || loading || storeStatus.loading ? (
               <ProductsLoader
                  heading={'Trending Now'}
                  numberOfProducts={
                     appConfig?.data?.trendingProducts?.length || 3
                  }
               />
            ) : trendingProducts.length > 0 ? (
               <ProductList
                  productsList={trendingProducts}
                  heading={'Trending Now'}
                  viewStyle={'verticalCard'}
               />
            ) : null}

            {/* Order Now Block */}
            <View
               style={{
                  ...styles.orderNowContainer,
                  backgroundColor:
                     appConfig?.brandSettings?.orderNow?.backgroundColor
                        ?.value || '#ffffff',
               }}
            >
               <Image
                  source={{
                     uri: appConfig?.data?.orderNow?.image?.value,
                  }}
                  style={styles.orderNowImage}
               />
               <View style={{ marginHorizontal: 14 }}>
                  <Text
                     style={[
                        styles.orderNowHeading,
                        { fontFamily: globalStyle.font.semibold },
                     ]}
                  >
                     {appConfig?.data?.orderNow?.heading?.value || ''}
                  </Text>
                  <Text
                     style={[
                        styles.orderNowSubHeading,
                        { fontFamily: globalStyle.font.regular },
                     ]}
                  >
                     {appConfig?.data?.orderNow?.subHeading?.value || ''}
                  </Text>
                  <TouchableOpacity
                     onPress={async () => {
                        let url = appConfig?.data?.orderNow?.btnRoute?.value
                        await Linking.canOpenURL(url)
                        Linking.openURL(url)
                     }}
                  >
                     <Text
                        style={{
                           ...styles.orderNowBtn,
                           color: globalStyle.color.primary || '#000',
                           fontFamily: globalStyle.font.semibold,
                        }}
                     >
                        Order Now
                     </Text>
                  </TouchableOpacity>
               </View>
            </View>

            {/* Promotion Carousal */}
            {appConfig?.data?.mid1PromotionAssets?.value?.length > 0 && (
               <PromotionCarousel
                  data={appConfig?.data?.mid1PromotionAssets?.value || []}
               />
            )}
            {/* Shop By Collection Block */}
            <View style={styles.showByCollectionContainer}>
               <Text
                  style={[
                     styles.trendingNowHeading,
                     { fontFamily: globalStyle.font.semibold },
                  ]}
               >
                  Shop By Collection
               </Text>
               <ScrollView style={styles.container} horizontal={true}>
                  {categories.map((eachCategory, index) => {
                     if (!eachCategory.isCategoryPublished) {
                        return null
                     }
                     return (
                        <ProductCategory
                           key={`${eachCategory.name}-${index}`}
                           onCategoryClick={() => {
                              navigation.navigate('Menu', {
                                 categoryName: eachCategory.name,
                              })
                           }}
                           eachCategory={eachCategory}
                           textColor={'#000'}
                           viewStyle={'cardView'}
                        />
                     )
                  })}
               </ScrollView>
            </View>

            {/* Promotion Carousal */}
            {appConfig?.data?.bottomPromotionAssets?.value?.length > 0 && (
               <PromotionCarousel
                  data={appConfig?.data?.bottomPromotionAssets?.value || []}
                  height={204}
               />
            )}
         </ScrollView>
      </SafeAreaView>
   )
}

const styles = StyleSheet.create({
   container: {
      display: 'flex',
      flexDirection: 'row',
   },
   categoryListName: {
      fontSize: 24,
      lineHeight: 36,
      marginHorizontal: 12,
   },
   trendingNowHeading: {
      fontSize: 20,
      lineHeight: 20,
      color: '#fff',
      paddingLeft: 12,
      marginTop: 12,
      marginBottom: 5,
      textTransform: 'uppercase',
   },
   orderNowContainer: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      marginHorizontal: 12,
      marginVertical: 12,
      backgroundColor: '#fff',
      borderRadius: 16,
   },
   orderNowImage: {
      width: '100%',
      height: 350,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
   },
   orderNowHeading: {
      fontSize: 13.5,
      lineHeight: 16,
      textAlign: 'center',
      marginTop: 18,
      marginBottom: 6,
   },
   orderNowSubHeading: {
      fontSize: 10,
      lineHeight: 12,
      textAlign: 'center',
      marginTop: 6,
      marginBottom: 6,
   },
   orderNowBtn: {
      textAlign: 'center',
      fontSize: 16,
      lineHeight: 16,
      textDecorationLine: 'underline',
      marginTop: 6,
      marginBottom: 11,
   },
   showByCollectionContainer: {
      marginTop: 12,
      marginBottom: 5,
   },
})

export default HomeScreen
