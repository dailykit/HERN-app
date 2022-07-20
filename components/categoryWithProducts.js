import { useSubscription } from '@apollo/client'
import { StyleSheet, Text, View } from 'react-native'
import { Spinner } from '../assets/loaders'
import { onDemandMenuContext } from '../context'
import useGlobalStyle from '../globalStyle'
import { PRODUCTS } from '../graphql'
import { useConfig } from '../lib/config'
import React from 'react'
import { Divider } from './divider'
import { ProductList } from './product'
import { ProductSkeleton } from './productCardSkeleton'

const skeletonList = [1, 2, 3, 4]
export const CategoryWithProducts = ({ category, isSkip }) => {
   const { brand, locationId, brandLocation } = useConfig()
   const { globalStyle } = useGlobalStyle()
   const {
      onDemandMenu: { isMenuLoading },
   } = React.useContext(onDemandMenuContext)

   // params for products query
   const argsForByLocation = React.useMemo(
      () => ({
         brandId: brand?.id,
         locationId: locationId,
         brand_locationId: brandLocation?.id,
      }),
      [brand, locationId, brandLocation?.id]
   )

   // query
   const {
      loading: productsLoading,
      error: productsError,
      data: { products = [] } = {},
   } = useSubscription(PRODUCTS, {
      skip: isMenuLoading || isSkip,
      variables: {
         ids: category.products,
         params: argsForByLocation,
      },
      fetchPolicy: 'cache-first',
   })

   return (
      <View>
         <Text
            style={[
               styles.categoryListName,
               { fontFamily: globalStyle.font.medium },
            ]}
         >
            {category.name}
         </Text>
         {productsLoading || isSkip ? (
            <>
               {skeletonList.map((skt, index) => {
                  return <ProductSkeleton key={`${skt}-${index}`} />
               })}
            </>
         ) : (
            <ProductList productsList={products} />
         )}
         <Divider />
      </View>
   )
}

const styles = StyleSheet.create({
   categoryListName: {
      fontSize: 24,
      lineHeight: 36,
      marginHorizontal: 12,
   },
})
