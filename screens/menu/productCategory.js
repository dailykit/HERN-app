import React from 'react'
import {
   TouchableWithoutFeedback,
   View,
   Text,
   StyleSheet,
   Image,
} from 'react-native'

export const ProductCategory = ({
   onCategoryClick,
   isActiveCategory,
   eachCategory,
}) => {
   return (
      <TouchableWithoutFeedback
         onPress={() => {
            onCategoryClick()
         }}
      >
         <View
            style={[
               categoryStyles.category,
               isActiveCategory ? categoryStyles.selectedCategory : null,
            ]}
         >
            <Image
               source={{
                  uri: eachCategory?.imageUrl,
                  width: 20,
                  height: 20,
               }}
               style={categoryStyles.image}
            />
            <Text
               style={[
                  categoryStyles.categoryText,
                  isActiveCategory ? categoryStyles.selectedText : null,
               ]}
            >
               {eachCategory.name}
            </Text>
         </View>
      </TouchableWithoutFeedback>
   )
}

const categoryStyles = StyleSheet.create({
   category: {
      borderRadius: 20,
      backgroundColor: '#FFFFFF',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: 8,
      marginHorizontal: 10,
      marginVertical: 9,
      shadowColor: 'rgba(0, 0, 0, 0.08)',
      shadowOffset: { width: 0, height: 1 },
      shadowRadius: 12,
      elevation: 3,
   },
   selectedCategory: {
      backgroundColor: '#EF5266',
   },
   image: {
      borderRadius: 10,
   },
   categoryText: {
      fontFamily: 'Metropolis',
      fontSize: 14,
      lineHeight: 16,
      textTransform: 'uppercase',
      fontWeight: '500',
      marginLeft: 4,
   },
   selectedText: {
      color: '#FFFFFF',
   },
})
