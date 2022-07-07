import React from 'react'
import {
   Image,
   View,
   StyleSheet,
   Text,
   TouchableWithoutFeedback,
   TouchableOpacity,
} from 'react-native'
import { formatCurrency } from '../utils/formatCurrency'
import { getPriceWithDiscount } from '../utils/getPriceWithDiscount'
import { useConfig } from '../lib/config'

export const ModifierOptionCard = ({
   modifierOption,
   checkIcon: CheckIcon,
   onCardClick,
   showCustomize = true,
   onCustomizeClick = () => {},
}) => {
   const { appConfig } = useConfig()
   return (
      <TouchableWithoutFeedback onPress={onCardClick}>
         <View
            style={styles.modifierOptionCardContainer}
            onPress={() => {
               onCardClick()
            }}
         >
            <Image
               source={{
                  uri:
                     modifierOption.image ||
                     appConfig?.brandSettings.productSettings.defaultImage
                        .value ||
                     '',
                  height: 36,
                  width: 36,
               }}
               style={styles.modifierImage}
            />
            <View style={styles.modifierOptionDetails}>
               <Text style={styles.modifierOptionName}>
                  {modifierOption.name}
               </Text>
               <View
                  style={{
                     display: 'flex',
                     flexDirection: 'row',
                     marginTop: 3,
                  }}
               >
                  {modifierOption.discount && modifierOption.price > 0 ? (
                     <Text style={styles.modifierOptionOriginalValue}>
                        {formatCurrency(modifierOption.price)}
                     </Text>
                  ) : null}
                  {getPriceWithDiscount(
                     modifierOption.price,
                     modifierOption.discount
                  ) > 0 ? (
                     <Text style={styles.modifierOptionPrice}>
                        {formatCurrency(
                           getPriceWithDiscount(
                              modifierOption.price,
                              modifierOption.discount
                           )
                        )}
                     </Text>
                  ) : null}
               </View>
            </View>
            <View style={styles.checkIcon}>
               <CheckIcon />
            </View>

            {showCustomize && modifierOption.additionalModifierTemplateId ? (
               <TouchableOpacity
                  style={styles.customizeContainer}
                  onPress={() => {
                     onCustomizeClick()
                  }}
               >
                  <Text style={styles.customizeText}>customize</Text>
               </TouchableOpacity>
            ) : null}
         </View>
      </TouchableWithoutFeedback>
   )
}

const styles = StyleSheet.create({
   modifierOptionCardContainer: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 3,
   },
   modifierImage: {
      flex: 1,
   },
   modifierOptionDetails: {
      flex: 10,
      marginHorizontal: 7,
   },
   checkIcon: {
      flex: 1,
   },
   modifierOptionName: {
      fontFamily: 'Metropolis',
      fontWeight: '500',
   },
   modifierOptionOriginalValue: {
      textDecorationLine: 'line-through',
      fontFamily: 'Metropolis',
      fontWeight: '500',
      fontSize: 12,
      lineHeight: 12,
      color: '#A2A2A2',
      opacity: 0.5,
      marginRight: 5,
   },
   modifierOptionPrice: {
      fontFamily: 'Metropolis',
      fontWeight: '500',
      fontSize: 12,
      lineHeight: 12,
      color: '#A2A2A2',
   },
   customizeContainer: {
      position: 'absolute',
      right: 0,
      bottom: 0,
   },
   customizeText: {
      fontFamily: 'Metropolis',
      fontWeight: '400',
      lineHeight: 8,
      fontSize: 9,
      paddingTop: 3,
      paddingLeft: 6,
      textDecorationLine: 'underline',
   },
})
