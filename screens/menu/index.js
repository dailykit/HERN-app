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
import useGlobalStyle from '../../globalStyle'

const floatingMenuPosition = 'RIGHT'

const MenuScreen = ({ route }) => {
   // context
   const { brand, locationId, brandLocation, appConfig } = useConfig()
   const { globalStyle } = useGlobalStyle()
   const { hydratedMenu, productsStatus: status } =
      React.useContext(onDemandMenuContext)
   const navigation = useNavigation()
   // state
   const categoryScroller = useRef()

   const [selectedCategoryName, setSelectedCategoryName] = React.useState(
      route?.params?.categoryName ||
         hydratedMenu.find(x => x.isCategoryPublished && x.isCategoryAvailable)
            ?.name ||
         ''
   )
   const [isMenuLoading, setIsMenuLoading] = React.useState(true)

   React.useEffect(() => {
      setIsMenuLoading(false)
   }, [])

   useEffect(() => {
      if (hydratedMenu.length > 0 && selectedCategoryName.length > 0) {
         categoryScroller.current?.scrollToIndex({
            index: hydratedMenu.findIndex(x => x.name == selectedCategoryName),
            animated: true,
            viewPosition: 0,
         })
      }
   }, [selectedCategoryName, hydratedMenu])

   const selectedCategoryWithCompleteData = React.useMemo(() => {
      return hydratedMenu.find(x => x.name === selectedCategoryName)
   }, [selectedCategoryName])

   React.useEffect(() => {
      if (hydratedMenu.length > 0 && route?.params?.categoryName?.length > 0) {
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
         {status === 'loading' || isMenuLoading ? (
            <Spinner size="large" showText={true} />
         ) : status === 'error' ? (
            <Text style={{ fontFamily: globalStyle.font.medium }}>Error</Text>
         ) : null}
         {status === 'success' && !isMenuLoading && hydratedMenu.length > 0 ? (
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
                  <View
                     style={
                        floatingMenuPosition === 'CENTER'
                           ? styles.floatingMenuContainer
                           : styles.floatingMenuContainerRight
                     }
                  >
                     <FloatingMenu
                        hydratedMenu={hydratedMenu}
                        selectedCategoryName={selectedCategoryName}
                        onCategoryClick={name => {
                           setSelectedCategoryName(name)
                        }}
                        position={floatingMenuPosition}
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
                     <Text
                        style={[
                           styles.searchBarText,
                           { fontFamily: globalStyle.font.medium },
                        ]}
                     >
                        Search for item...
                     </Text>
                  </View>
               </TouchableWithoutFeedback>
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
                           <Text
                              style={[
                                 styles.categoryListName,
                                 { fontFamily: globalStyle.font.medium },
                              ]}
                           >
                              {eachCategory.name}
                           </Text>
                           <ProductList productsList={eachCategory.products} />
                           <Divider />
                        </View>
                     )
                  }}
                  contentContainerStyle={{ paddingBottom: 90 }}
                  ListHeaderComponent={() => {
                     return (
                        <>
                           {appConfig?.data?.showPromotionImageOnMenuPage
                              ?.value &&
                           appConfig?.data?.menuPagePromotionAssets?.value
                              ?.length > 0 ? (
                              <PromotionCarousel
                                 data={
                                    appConfig?.data?.menuPagePromotionAssets
                                       ?.value
                                 }
                              />
                           ) : null}
                        </>
                     )
                  }}
                  nestedScrollEnabled={true}
                  onScrollToIndexFailed={err => {
                     console.log('err', err)
                  }}
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
      fontSize: 24,
      lineHeight: 36,
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
   floatingMenuContainerRight: {
      position: 'absolute',
      bottom: 10,
      zIndex: 10000000,
      alignItems: 'flex-end',
      right: -35,
   },
})
export default MenuScreen
