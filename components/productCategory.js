import React from 'react'
import {
   TouchableWithoutFeedback,
   View,
   Text,
   StyleSheet,
   Image,
} from 'react-native'

const categoryViewStyles = {
   cardView: 'cardView',
   iconView: 'iconView',
}

export const ProductCategory = ({
   onCategoryClick,
   isActiveCategory,
   eachCategory,
   backgroundColor,
   textColor,
   viewStyle = 'iconView',
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
               viewStyle === categoryViewStyles.cardView
                  ? {
                       width: 112,
                       backgroundColor: backgroundColor || '#ffffff',
                    }
                  : null,
               isActiveCategory ? categoryStyles.selectedCategory : null,
            ]}
         >
            <Image
               source={{
                  uri:
                     viewStyle === categoryViewStyles.cardView
                        ? eachCategory?.imageUrl
                        : eachCategory?.iconUrl || eachCategory?.imageUrl,
               }}
               style={[
                  categoryStyles.image,
                  viewStyle === categoryViewStyles.cardView
                     ? {
                          width: '100%',
                          height: 105,
                       }
                     : { width: 45, height: 45 },
                  viewStyle === categoryViewStyles.cardView
                     ? {
                          borderBottomLeftRadius: 0,
                          borderBottomRightRadius: 0,
                       }
                     : {},
               ]}
            />
            <Text
               style={[
                  { ...categoryStyles.categoryText, color: textColor },
                  viewStyle === categoryViewStyles.cardView
                     ? { marginVertical: 8 }
                     : { marginTop: 8 },
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
      borderRadius: 10,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      // justifyContent: 'center',
      marginHorizontal: 10,
      marginVertical: 9,
      shadowColor: 'rgba(0, 0, 0, 0.08)',
      shadowOffset: { width: 0, height: 1 },
      shadowRadius: 12,
      elevation: 3,
   },
   selectedCategory: {
      backgroundColor: '#EF5266',
      paddingHorizontal: 8,
      paddingVertical: 5,
   },
   image: {
      borderRadius: 10,
   },
   categoryText: {
      fontFamily: 'Metropolis',
      fontSize: 12,
      lineHeight: 14,
      textTransform: 'capitalize',
      fontWeight: '500',
      textAlign: 'center',
   },
   selectedText: {
      color: '#FFFFFF',
   },
})
