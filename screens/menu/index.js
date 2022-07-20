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
import { CategoryWithProducts } from '../../components/categoryWithProducts'

const floatingMenuPosition = 'RIGHT'

const MenuScreen = ({ route }) => {
   // context
   const { brand, locationId, brandLocation, appConfig } = useConfig()
   const { globalStyle } = useGlobalStyle()
   const {
      onDemandMenu: { categories },
      isMenuLoading,
   } = React.useContext(onDemandMenuContext)
   const navigation = useNavigation()
   // state
   const [status, setStatus] = useState('loading')
   const categoryScroller = useRef()

   const [selectedCategoryName, setSelectedCategoryName] = React.useState(
      route?.params?.categoryName ||
         categories.find(x => x.isCategoryPublished && x.isCategoryAvailable)
            ?.name ||
         ''
   )

   useEffect(() => {
      categoryScroller.current?.scrollToIndex({
         index: categories.findIndex(x => x.name == selectedCategoryName),
         animated: true,
         viewPosition: 0,
      })
   }, [selectedCategoryName])

   React.useEffect(() => {
      if (categories.length) {
         setSelectedCategoryName(
            route?.params?.categoryName ||
               categories.find(
                  x => x.isCategoryPublished && x.isCategoryAvailable
               )?.name
         )
         setStatus('success')
      }
   }, [categories, route?.params?.categoryName])

   return (
      <SafeAreaView style={{ backgroundColor: '#ffffff', flex: 1 }}>
         <Header />
         {status === 'loading' ? (
            <Spinner size="large" showText={true} />
         ) : (
            <>
               {appConfig.brandSettings.menuSettings.productCategoryView.value
                  .value === 'NAVBAR' ? (
                  <View>
                     <ScrollView style={styles.container} horizontal={true}>
                        {categories.map((eachCategory, index) => {
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
                        categories={categories}
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
                           { fontFamily: globalStyle.font.regular },
                        ]}
                     >
                        Search for item...
                     </Text>
                  </View>
               </TouchableWithoutFeedback>
               <FlatList
                  ref={categoryScroller}
                  initialScrollIndex={categories.findIndex(
                     x => x.name == selectedCategoryName
                  )}
                  data={categories}
                  renderItem={({ item: eachCategory, index: fIndex }) => {
                     if (
                        !eachCategory.isCategoryPublished ||
                        eachCategory.products.length === 0
                     ) {
                        return null
                     }
                     return (
                        <CategoryWithProducts
                           category={eachCategory}
                           key={eachCategory.name + '--' + fIndex}
                        />
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
               />
            </>
         )}
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
      width: '100%',
      alignItems: 'flex-end',
      right: -35,
   },
})
export default MenuScreen
