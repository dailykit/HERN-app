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
import { ProductList } from '../../components/product'
import { hydratedMenu } from './demoMenu'
import { ProductCategory } from './productCategory'

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
         <ScrollView style={categoryStyles.container} horizontal={true}>
            {hydratedMenu.map((eachCategory, index) => {
               if (!eachCategory.isCategoryPublished) {
                  return null
               }
               const isActiveCategory = selectedCategory === eachCategory.name
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
         <ScrollView>
            <ProductList
               productsList={selectedCategoryWithCompleteData.products}
            />
         </ScrollView>
      </View>
   )
}

const MenuScreenHeader = () => {
   return <View style={{ height: '64px', width: '100%' }}></View>
}
const categoryStyles = StyleSheet.create({
   container: {
      display: 'flex',
      flexDirection: 'row',
   },
})
export default MenuScreen
