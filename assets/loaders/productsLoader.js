import React, { useEffect, useRef, useState } from 'react'
import { ScrollView, View, Text } from 'react-native'
import useGlobalStyle from '../../globalStyle'
import { Skeleton } from '../../components/skeleton'

export const ProductsLoader = ({
   numberOfProducts = 3,
   heading,
   horizontal = true,
}) => {
   const productsLoader = []
   const { globalStyle } = useGlobalStyle()

   for (var i = 0; i < numberOfProducts; i++) {
      productsLoader.push(
         <View
            key={`product-skeleton-${i}`}
            style={{
               ...styles.product,
               backgroundColor: `hsl(0, 4%, 85%)`,
            }}
         >
            <Skeleton additionalStyle={styles.image} />
            <View
               style={{
                  display: 'flex',
                  marginLeft: 10,
               }}
            >
               <Skeleton additionalStyle={styles.heading} />
            </View>
            <View
               style={{
                  display: 'flex',
                  marginLeft: 'auto',
                  marginRight: 10,
                  marginBottom: 10,
               }}
            >
               <Skeleton additionalStyle={styles.button} />
            </View>
         </View>
      )
   }
   return (
      <>
         {heading && (
            <Text
               style={[
                  styles.productListHeading,
                  { fontFamily: globalStyle.font.semibold },
               ]}
            >
               {heading}
            </Text>
         )}
         <ScrollView style={[styles.productsContainer]} horizontal={horizontal}>
            {productsLoader}
         </ScrollView>
      </>
   )
}

const styles = {
   productsContainer: {},
   product: {
      marginVertical: 10,
      marginHorizontal: 12,
      height: 200,
      width: 156,
      borderRadius: 8,
      display: 'flex',
      justifyContent: 'space-between',
      flexDirection: 'column',
   },
   image: {
      width: '100%',
      height: 115,
      borderTopLeftRadius: 8,
      borderTopLeftRadius: 8,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
   },
   button: {
      width: 60,
      height: 20,
      borderRadius: 8,
   },
   heading: {
      width: 100,
      height: 10,
      borderRadius: 8,
   },
   productListHeading: {
      fontSize: 20,
      lineHeight: 20,
      color: '#fff',
      paddingLeft: 12,
      marginTop: 12,
      marginBottom: 5,
      textTransform: 'uppercase',
   },
}
