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
import appConfig from '../../brandConfig.json'
import { useConfig } from '../../lib/config'
import { PromotionCarousel } from './promotionCarousel'
import { onDemandMenuContext } from '../../context'
import { PRODUCTS_QUERY } from '../../graphql'
import { useQuery } from '@apollo/client'

const HomeScreen = () => {
   const { brand, locationId, brandLocation } = useConfig()
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
         ids: appConfig?.data?.trendingProducts?.value || [],
         params: argsForByLocation,
      },
   })

   return (
      <View>
         <Header />

         <ScrollView
            style={{
               backgroundColor:
                  appConfig.brandSettings.homeSettings.backgroundColor.value,
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
                           appConfig.brandSettings.homeSettings.textColor.value
                        }
                     />
                  )
               })}
            </ScrollView>

            {/* Promotion Carousal */}
            <PromotionCarousel
               data={appConfig.data.topPromotionImages.value}
               height={204}
            />

            {/* Trending Products */}
            {trendingProducts && trendingProducts.length && !loading ? (
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
                  <Text style={styles.orderNowHeading}>
                     {appConfig?.data?.orderNow?.heading?.value || ''}
                  </Text>
                  <Text style={styles.orderNowSubHeading}>
                     {appConfig?.data?.orderNow?.subHeading?.value || ''}
                  </Text>
                  <TouchableOpacity onPress={() => {}}>
                     <Text
                        style={{
                           ...styles.orderNowBtn,
                           color:
                              appConfig?.brandSettings?.orderNow?.btnColor
                                 ?.value || '#EF5266',
                        }}
                     >
                        Order Now
                     </Text>
                  </TouchableOpacity>
               </View>
            </View>

            {/* Promotion Carousal */}
            <PromotionCarousel
               data={appConfig.data.mid1PromotionImages.value}
            />

            {/* Shop By Collection Block */}
            <View style={styles.showByCollectionContainer}>
               <Text style={styles.trendingNowHeading}>Shop By Collection</Text>
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
            <PromotionCarousel
               data={appConfig.data.bottomPromotionImages.value}
               height={204}
            />
         </ScrollView>
      </View>
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
      fontWeight: '600',
      marginHorizontal: 12,
   },
   trendingNowHeading: {
      fontSize: 20,
      lineHeight: 20,
      fontWeight: '500',
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
      fontWeight: '600',
      fontSize: 16,
      lineHeight: 16,
      textAlign: 'center',
      marginTop: 18,
      marginBottom: 6,
   },
   orderNowSubHeading: {
      fontWeight: '400',
      fontSize: 10,
      lineHeight: 10,
      textAlign: 'center',
      marginTop: 6,
      marginBottom: 6,
   },
   orderNowBtn: {
      textAlign: 'center',
      fontWeight: '600',
      fontSize: 16,
      lineHeight: 16,
      textDecorationLine: 'underline',
      marginTop: 6,
      marginBottom: 11,
      color: '#EF5266',
   },
   showByCollectionContainer: {
      marginTop: 12,
      marginBottom: 5,
   },
})

export default HomeScreen
