import { useLazyQuery } from '@apollo/client'
import { useNavigation } from '@react-navigation/native'
import { isEmpty } from 'lodash'
import React from 'react'
import {
   ScrollView,
   StyleSheet,
   Text,
   TextInput,
   TouchableWithoutFeedback,
   View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LeftArrow } from '../../assets/arrowIcon'
import { ProductList } from '../../components/product'
import { onDemandMenuContext } from '../../context'
import { PRODUCTS_QUERY } from '../../graphql'
import { useConfig } from '../../lib/config'
import useGlobalStyle from '../../globalStyle'

const ProductSearchScreen = () => {
   //    const textRef = React.useRef(null)
   const [searchText, setSearchText] = React.useState('')
   const { brand, locationId, brandLocation } = useConfig()
   const { globalStyle } = useGlobalStyle()
   const navigation = useNavigation()

   const { onDemandMenu } = React.useContext(onDemandMenuContext)
   const [
      fetchProducts,
      { loading, error, data: { products: searchedResult } = {} },
   ] = useLazyQuery(PRODUCTS_QUERY)
   const argsForByLocation = React.useMemo(
      () => ({
         brandId: brand?.id,
         locationId: locationId,
         brand_locationId: brandLocation?.id,
      }),
      [brand, locationId, brandLocation?.id]
   )

   const onTextChange = text => {
      setSearchText(text)
      if (!isEmpty(text)) {
         fetchProducts({
            variables: {
               where: {
                  id: {
                     _in: onDemandMenu.allProductIds,
                  },
                  name: {
                     _ilike: `%${text}%`,
                  },
               },
               params: argsForByLocation,
            },
         })
      }
   }
   return (
      <SafeAreaView style={{ backgroundColor: '#fff' }}>
         <View style={styles.searchHeader}>
            <TouchableWithoutFeedback
               onPress={() => {
                  navigation.goBack()
               }}
            >
               <View style={styles.backIcon}>
                  <LeftArrow fill="#000000" size={30} />
               </View>
            </TouchableWithoutFeedback>
            <View
               style={{
                  flex: 8,
                  justifyContent: 'center',
               }}
            >
               <TextInput
                  style={[
                     styles.input,
                     { fontFamily: globalStyle.font.medium },
                  ]}
                  onChangeText={onTextChange}
                  placeholder={'Search for item...'}
               />
            </View>
         </View>
         <ScrollView>
            <View>
               {isEmpty(searchText)
                  ? null
                  : searchedResult &&
                    searchedResult.length > 0 && (
                       <ProductList productsList={searchedResult} />
                    )}
            </View>
         </ScrollView>
      </SafeAreaView>
   )
}

const styles = StyleSheet.create({
   searchHeader: {
      height: 64,
      padding: 8,
      flexDirection: 'row',
      borderBottomColor: '#00000030',
      borderBottomWidth: 0.5,
   },
   backIcon: {
      justifyContent: 'center',
      paddingRight: 8,
   },
   input: {
      fontSize: 16,
   },
})
export default ProductSearchScreen
