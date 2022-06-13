import React from 'react'
import {
   View,
   Text,
   StyleSheet,
   Image,
   ScrollView,
   TouchableOpacity,
   TouchableWithoutFeedback,
} from 'react-native'
import { Divider } from '../../components/divider'
import { ProductList } from '../../components/product'
import { hydratedMenu } from './demoMenu'
import { ProductCategory } from './productCategory'
import appConfig from '../../brandConfig.json'
import { MenuPromotionCarousel } from './menuPromotionCarousel'

const MenuScreen = () => {
   const [selectedCategory, setSelectedCategory] = React.useState(
      hydratedMenu.find(x => x.isCategoryPublished && x.isCategoryAvailable)
         ?.name
   )
   const selectedCategoryWithCompleteData = React.useMemo(() => {
      return hydratedMenu.find(x => x.name === selectedCategory)
   }, [selectedCategory])
   return (
      <View style={{ backgroundColor: '#ffffff' }}>
         <View
            style={{ height: 64, width: '100%', backgroundColor: 'red' }}
         ></View>
         <View>
            <ScrollView style={styles.container} horizontal={true}>
               {hydratedMenu.map((eachCategory, index) => {
                  if (!eachCategory.isCategoryPublished) {
                     return null
                  }
                  const isActiveCategory =
                     selectedCategory === eachCategory.name
                  return (
                     <ProductCategory
                        key={`${eachCategory.name}-${index}`}
                        onCategoryClick={() => {
                           setSelectedCategory(eachCategory.name)
                        }}
                        isActiveCategory={isActiveCategory}
                        eachCategory={eachCategory}
                     />
                  )
               })}
            </ScrollView>
         </View>
         <ScrollView>
            {appConfig.data.showPromotionImageOnMenuPage.value &&
            appConfig.data.menuPagePromotionImage.value.url.length > 0 ? (
               <MenuPromotionCarousel />
            ) : null}
            {hydratedMenu.map((eachCategory, index) => {
               if (!eachCategory.isCategoryPublished) {
                  return null
               }
               return (
                  <View key={eachCategory.name + '--' + index}>
                     <Text style={styles.categoryListName}>
                        {eachCategory.name}
                     </Text>
                     <ProductList productsList={eachCategory.products} />
                     <Divider />
                  </View>
               )
            })}
         </ScrollView>
      </View>
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
      fontWeight: '600',
      marginHorizontal: 12,
   },
})
export default MenuScreen
