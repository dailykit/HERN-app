import React, { useState, useRef, useEffect } from 'react'
import {
   View,
   Text,
   StyleSheet,
   Image,
   FlatList,
   ScrollView,
   TouchableOpacity,
   TouchableWithoutFeedback,
   ActivityIndicator,
} from 'react-native'
import { Divider } from '../../components/divider'
import { ProductList } from '../../components/product'
import { ProductCategory } from '../../components/productCategory'
import { Header } from '../../components/header'
import { onDemandMenuContext } from '../../context'
import { useConfig } from '../../lib/config'
import { useSubscription } from '@apollo/client'
import { PRODUCTS } from '../../graphql'
import { PromotionCarousel } from '../home/promotionCarousel'
import SearchIcon from '../../assets/searchIcon'
import { useNavigation } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Spinner } from '../../assets/loaders'
import { FloatingMenu } from '../../components/floatingMenu'

const MenuScreen = ({ route }) => {
   // context
   const { brand, locationId, brandLocation, appConfig } = useConfig()
   const {
      onDemandMenu: { isMenuLoading, allProductIds, categories },
   } = React.useContext(onDemandMenuContext)
   const navigation = useNavigation()
   // state
   const [status, setStatus] = useState('loading')
   const [productsList, setProductsList] = React.useState([])
   const [hydratedMenu, setHydratedMenu] = React.useState([])
   const categoryScroller = useRef()

   const argsForByLocation = React.useMemo(
      () => ({
         brandId: brand?.id,
         locationId: locationId,
         brand_locationId: brandLocation?.id,
      }),
      [brand, locationId, brandLocation?.id]
   )

   const [selectedCategoryName, setSelectedCategoryName] = React.useState(
      route?.params?.categoryName ||
         hydratedMenu.find(x => x.isCategoryPublished && x.isCategoryAvailable)
            ?.name ||
         ''
   )

   useEffect(() => {
      categoryScroller.current?.scrollToIndex({
         index: hydratedMenu.findIndex(x => x.name == selectedCategoryName),
         animated: true,
         viewPosition: 0,
      })
   }, [selectedCategoryName])

   const selectedCategoryWithCompleteData = React.useMemo(() => {
      return hydratedMenu.find(x => x.name === selectedCategoryName)
   }, [selectedCategoryName])

   // query
   const { loading: productsLoading, error: productsError } = useSubscription(
      PRODUCTS,
      {
         skip: isMenuLoading,
         variables: {
            ids: allProductIds,
            params: argsForByLocation,
         },
         // fetchPolicy: 'network-only',
         onSubscriptionData: ({ subscriptionData }) => {
            const { data } = subscriptionData
            if (data && data.products.length) {
               setProductsList(data.products)
            }
         },
      }
   )

   React.useEffect(() => {
      if (productsError) {
         setStatus('error')
      }
   }, [productsError])

   React.useEffect(() => {
      if (productsList.length && categories.length) {
         const updatedMenu = categories.map(category => {
            const updatedProducts = category.products
               .map(productId => {
                  const found = productsList.find(({ id }) => id === productId)
                  if (found) {
                     return found
                  }
                  return null
               })
               .filter(Boolean)
            return {
               ...category,
               products: updatedProducts,
            }
         })
         setHydratedMenu(updatedMenu)
         setStatus('success')
      }
   }, [productsList, categories])

   React.useEffect(() => {
      if (hydratedMenu.length) {
         setSelectedCategoryName(
            route?.params?.categoryName ||
               hydratedMenu.find(
                  x => x.isCategoryPublished && x.isCategoryAvailable
               )?.name
         )
      }
   }, [hydratedMenu, route?.params?.categoryName])

   return (
      <SafeAreaView style={{ backgroundColor: '#ffffff', flex: 1 }}>
         <Header />
         {status === 'loading' ? (
            <Spinner size="large" showText={true} />
         ) : status === 'error' ? (
            <Text>Error</Text>
         ) : null}
         {status === 'success' ? (
            <>
               {appConfig.brandSettings.menuSettings.productCategoryView.value
                  .value === 'NAVBAR' ? (
                  <View>
                     <ScrollView style={styles.container} horizontal={true}>
                        {hydratedMenu.map((eachCategory, index) => {
                           if (!eachCategory.isCategoryPublished) {
                              return null
                           }
                           const isActiveCategory =
                              selectedCategoryName === eachCategory.name
                           return (
                              <ProductCategory
                                 key={`${eachCategory.name}-${index}`}
                                 onCategoryClick={() => {
                                    setSelectedCategoryName(eachCategory.name)
                                 }}
                                 isActiveCategory={isActiveCategory}
                                 eachCategory={eachCategory}
                              />
                           )
                        })}
                     </ScrollView>
                  </View>
               ) : (
                  <View style={styles.floatingMenuContainer}>
                     <FloatingMenu
                        hydratedMenu={hydratedMenu}
                        selectedCategoryName={selectedCategoryName}
                        onCategoryClick={name => {
                           setSelectedCategoryName(name)
                        }}
                     />
                  </View>
               )}
               <TouchableWithoutFeedback
                  onPress={() => {
                     navigation.navigate('ProductSearch')
                  }}
               >
                  <View style={styles.searchBar}>
                     <SearchIcon size={14} />
                     <Text style={styles.searchBarText}>
                        Search for item...
                     </Text>
                  </View>
               </TouchableWithoutFeedback>
               {appConfig.data.showPromotionImageOnMenuPage.value &&
               appConfig.data.menuPagePromotionImage.value.url.length > 0 ? (
                  <PromotionCarousel
                     data={appConfig.data.menuPagePromotionImage.value}
                  />
               ) : null}
               <FlatList
                  ref={categoryScroller}
                  initialScrollIndex={hydratedMenu.findIndex(
                     x => x.name == selectedCategoryName
                  )}
                  data={hydratedMenu}
                  renderItem={({ item: eachCategory, index: fIndex }) => {
                     if (
                        !eachCategory.isCategoryPublished ||
                        eachCategory.products.length === 0
                     ) {
                        return null
                     }
                     return (
                        <View key={eachCategory.name + '--' + fIndex}>
                           <Text style={styles.categoryListName}>
                              {eachCategory.name}
                           </Text>
                           <ProductList productsList={eachCategory.products} />
                           <Divider />
                        </View>
                     )
                  }}
                  contentContainerStyle={{ paddingBottom: 60 }}
               />
            </>
         ) : null}
      </SafeAreaView>
   )
}

const MenuScreenHeader = () => {
   return <View style={{ height: '64px', width: '100%' }}></View>
}
const styles = StyleSheet.create({
   container: {
      display: 'flex',
      flexDirection: 'row',
   },
   categoryListName: {
      fontFamily: 'Metropolis',
      fontSize: 24,
      lineHeight: 36,
      fontWeight: '600',
      marginHorizontal: 12,
   },
   searchBar: {
      flexDirection: 'row',
      height: 46,
      marginHorizontal: 12,
      marginVertical: 6,
      alignItems: 'center',
      paddingHorizontal: 10,
      shadowColor: 'rgba(0, 0, 0, 0.08)',
      backgroundColor: '#fff',
      shadowOffset: { width: 0, height: 1 },
      shadowRadius: 12,
      elevation: 4,
      borderWidth: 0.5,
      borderColor: '#00000008',
      borderRadius: 6,
   },
   searchBarText: {
      fontWeight: '500',
      fontFamily: 'Metropolis',
      fontSize: 14,
      color: '#00000060',
      marginLeft: 10,
   },
   floatingMenuContainer: {
      position: 'absolute',
      bottom: 10,
      zIndex: 10000000,
      width: '100%',
      alignItems: 'center',
   },
})
export default MenuScreen
