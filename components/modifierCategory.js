import { useCallback, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { ModifierOptionCard } from './modifierOption'
import appConfig from '../brandConfig.json'
import RadioIcon from '../assets/radioIcon'
import CheckIcon from '../assets/checkIcon'
import UncheckIcon from '../assets/uncheckIcon'

export const ModifierCategory = props => {
   const {
      eachCategory,
      selectedOptions,
      config,
      setSelectedOptions,
      errorCategories,
      nestedSelectedModifierOptions,
      nestedSetSelectedModifierOptions,
      nestedErrorCategories,
      parentModifierOptionId = null,
   } = props

   const renderConditionText = category => {
      if (category.type === 'single') {
         return 'CHOOSE ONE*'
      } else {
         if (category.isRequired) {
            if (category.limits.min) {
               if (category.limits.max) {
                  return `(CHOOSE AT LEAST ${category.limits.min} AND AT MOST ${category.limits.max})*`
               } else {
                  return `(CHOOSE AT LEAST ${category.limits.min})*`
               }
            } else {
               if (category.limits.max) {
                  return `(CHOOSE AT LEAST 1 AND AT MOST ${category.limits.max})*`
               } else {
                  return `(CHOOSE AT LEAST 1)*`
               }
            }
         } else {
            if (category.limits.max) {
               return '(CHOOSE AS MANY AS YOU LIKE)'
            } else {
               return `(CHOOSE AS MANY AS YOU LIKE UPTO ${category.limits.max})`
            }
         }
      }
   }

   const onCheckClick = (eachOption, eachModifierCategory) => {
      //selected option
      const selectedOption = {
         modifierCategoryID: eachModifierCategory.id,
         modifierCategoryOptionsID: eachOption.id,
         modifierCategoryOptionsPrice: eachOption.price,
         modifierCategoryOptionsDiscount: eachOption.discount,
         cartItem: eachOption.cartItem,
         parentModifierOptionId: parentModifierOptionId,
      }
      //modifierCategoryOptionID
      //modifierCategoryID
      if (eachModifierCategory.type === 'single') {
         const existCategoryIndex = selectedOptions.single.findIndex(
            x => x.modifierCategoryID == eachModifierCategory.id
         )
         //single-->already exist category
         if (existCategoryIndex !== -1) {
            //for uncheck the option
            if (
               selectedOptions.single[existCategoryIndex][
                  'modifierCategoryOptionsID'
               ] === eachOption.id &&
               !eachModifierCategory.isRequired
            ) {
               const newSelectedOptions = selectedOptions.single.filter(
                  x =>
                     x.modifierCategoryID !== eachModifierCategory.id &&
                     x.modifierCategoryOptionsID !== eachOption.id
               )
               setSelectedOptions({
                  ...selectedOptions,
                  single: newSelectedOptions,
               })
               return
            }
            const newSelectedOptions = selectedOptions.single
            newSelectedOptions[existCategoryIndex] = selectedOption
            setSelectedOptions({
               ...selectedOptions,
               single: newSelectedOptions,
            })
            return
         } else {
            //single--> already not exist
            setSelectedOptions({
               ...selectedOptions,
               single: [...selectedOptions.single, selectedOption],
            })
            return
         }
      }
      if (eachModifierCategory.type === 'multiple') {
         const existOptionIndex = selectedOptions.multiple.findIndex(
            x => x.modifierCategoryOptionsID == eachOption.id
         )

         //already exist option
         if (existOptionIndex !== -1) {
            const newSelectedOptions = selectedOptions.multiple.filter(
               x => x.modifierCategoryOptionsID !== eachOption.id
            )
            setSelectedOptions({
               ...selectedOptions,
               multiple: newSelectedOptions,
            })
            return
         }
         //new option select
         else {
            setSelectedOptions({
               ...selectedOptions,
               multiple: [...selectedOptions.multiple, selectedOption],
            })
         }
      }
   }
   return (
      <View>
         <View style={styles.categoryHeader}>
            <Text style={styles.categoryName}>{eachCategory.name}</Text>
            <Text style={styles.categoryMessageText}>
               {'('}
               {renderConditionText(eachCategory)}
               {')'}
            </Text>
         </View>
         {errorCategories.includes(eachCategory.id) && (
            <Text style={styles.categoryError}>
               You have to choose this category.
            </Text>
         )}
         <View style={styles.modifierOptionsContainer}>
            {eachCategory.options.map(eachOption => (
               <ModifierOption
                  key={eachOption.id}
                  eachOption={eachOption}
                  onCheckClick={onCheckClick}
                  selectedOptions={selectedOptions}
                  eachCategory={eachCategory}
                  nestedSelectedModifierOptions={nestedSelectedModifierOptions}
                  nestedSetSelectedModifierOptions={
                     nestedSetSelectedModifierOptions
                  }
                  nestedErrorCategories={nestedErrorCategories}
                  parentModifierOptionId={parentModifierOptionId}
               />
            ))}
         </View>
      </View>
   )
}
const ModifierOption = ({
   eachOption,
   onCheckClick,
   selectedOptions,
   eachCategory,
   nestedSelectedModifierOptions,
   nestedSetSelectedModifierOptions,
   nestedErrorCategories,
}) => {
   const [showAdditionalModifierOptions, setShowAdditionalModifierOptions] =
      useState(false)
   const onCustomizeClick = () => {
      setShowAdditionalModifierOptions(prev => !prev)
   }

   const ConditionalIcon = useCallback(() => {
      const {
         checkIconFillColor,
         checkIconTickColor,
         checkIconUnFillColor,
         boundaryColor,
      } = appConfig.brandSettings.checkIconSettings
      const Icon = () => {
         const isOptionSelected = selectedOptions[eachCategory.type].find(
            x =>
               x.modifierCategoryID === eachCategory.id &&
               x.modifierCategoryOptionsID === eachOption.id
         )
         return eachCategory.type === 'single' ? (
            Boolean(isOptionSelected) ? (
               <RadioIcon checked={true} stroke={checkIconFillColor.value} />
            ) : (
               <RadioIcon stroke={boundaryColor.value} />
            )
         ) : Boolean(isOptionSelected) ? (
            <CheckIcon
               fill={checkIconFillColor.value}
               checkFill={checkIconTickColor.value}
            />
         ) : (
            <UncheckIcon
               fill={checkIconUnFillColor.value}
               stroke={boundaryColor.value}
            />
         )
      }
      return <Icon />
   }, [selectedOptions])
   return (
      <View>
         <ModifierOptionCard
            modifierOption={eachOption}
            onCardClick={() => {
               onCheckClick(eachOption, eachCategory)
            }}
            checkIcon={ConditionalIcon}
            showPrice={true}
            onCustomizeClick={onCustomizeClick}
         />
         {showAdditionalModifierOptions &&
            eachOption.additionalModifierTemplate.categories.map(
               eachAdditionalCategory => (
                  <View style={{ marginLeft: 10 }}>
                     <ModifierCategory
                        key={`${eachAdditionalCategory.id} - ${eachOption.id}`}
                        eachCategory={eachAdditionalCategory}
                        selectedOptions={nestedSelectedModifierOptions}
                        setSelectedOptions={nestedSetSelectedModifierOptions}
                        errorCategories={nestedErrorCategories}
                        parentModifierOptionId={eachOption.id}
                     />
                  </View>
               )
            )}
      </View>
   )
}

const styles = StyleSheet.create({
   categoryContainer: {},
   categoryHeader: {
      marginVertical: 8,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 3,
   },
   categoryName: {
      fontWeight: '600',
      fontSize: 18,
      lineHeight: 18,
   },
   categoryMessageText: {
      fontWeight: '400',
      lineHeight: 10,
      fontSize: 10,
      marginHorizontal: 8,
   },
   categoryError: {
      fontStyle: 'italic',
      fontSize: 11,
      color: 'red',
   },
   modifierOptionsContainer: {},
})
