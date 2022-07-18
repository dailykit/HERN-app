import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native'
import { FloatingMenuIcon } from '../assets/floatingMenuIcon'
import React from 'react'
import { Button } from './button'
import Modal from 'react-native-modal'
import { ScrollView } from 'react-native-gesture-handler'
import { useConfig } from '../lib/config'
import useGlobalStyle from '../globalStyle'

export const FloatingMenu = ({
   hydratedMenu,
   selectedCategoryName,
   onCategoryClick,
   position,
}) => {
   const { appConfig } = useConfig()
   const { globalStyle } = useGlobalStyle()
   const [showModal, setShowModal] = React.useState(false)

   const Icon = () => {
      return <FloatingMenuIcon size={30} fill={'#ffffff'} />
   }
   return (
      <View style={{ width: 120 }}>
         <Modal
            isVisible={showModal}
            onBackdropPress={() => {
               setShowModal(false)
            }}
            style={{
               alignItems: 'center',
            }}
         >
            <View style={styles.categoryContainer}>
               <ScrollView>
                  {hydratedMenu.map((eachCategory, index) => {
                     if (!eachCategory.isCategoryPublished) {
                        return null
                     }
                     return (
                        <TouchableWithoutFeedback
                           onPress={() => {
                              onCategoryClick(eachCategory.name)
                              setShowModal(false)
                           }}
                           key={`${eachCategory.name}-${index}`}
                        >
                           <View
                              style={[
                                 styles.categoryInfo,
                                 selectedCategoryName === eachCategory.name
                                    ? {
                                         backgroundColor: '#f9f9f9',
                                         borderRadius: 8,
                                      }
                                    : {},
                              ]}
                           >
                              <Text
                                 style={[
                                    styles.categoryText,
                                    selectedCategoryName === eachCategory.name
                                       ? {
                                            color: globalStyle.color.primary,
                                            fontFamily:
                                               globalStyle.font.regular,
                                         }
                                       : {},
                                 ]}
                              >
                                 {eachCategory.name}
                              </Text>
                              <Text
                                 style={[
                                    styles.categoryText,
                                    selectedCategoryName === eachCategory.name
                                       ? {
                                            color: globalStyle.color.primary,
                                            fontFamily:
                                               globalStyle.font.regular,
                                         }
                                       : {},
                                 ]}
                              >
                                 {eachCategory.products.length}
                              </Text>
                           </View>
                        </TouchableWithoutFeedback>
                     )
                  })}
               </ScrollView>
            </View>
         </Modal>
         <Button
            buttonStyle={{
               opacity: 0.9,
               alignItems: 'center',
               paddingHorizontal: 12,
               height: 40,
               elevation: 4,

               ...(position === 'RIGHT'
                  ? {
                       flexDirection: 'column',
                       paddingHorizontal: 0,
                       height: 60,
                       borderRadius: 30,
                       width: 60,
                    }
                  : {}),
            }}
            textStyle={{
               fontSize: 16,
               paddingHorizontal: 8,
               color: '#000000',
               fontFamily: globalStyle.font.medium,
            }}
            additionalIcon={Icon}
            onPress={() => {
               setShowModal(true)
            }}
         >
            {position === 'RIGHT' ? null : 'Menu'}
         </Button>
      </View>
   )
}

const styles = StyleSheet.create({
   categoryContainer: {
      height: 446,
      backgroundColor: '#fff',
      borderRadius: 8,
      width: 280,
   },
   categoryInfo: {
      display: 'flex',
      flexDirection: 'row',
      height: 30,
      paddingHorizontal: 12,
      justifyContent: 'space-between',
      alignItems: 'center',
   },
   categoryText: {
      fontSize: 12,
      color: '#00000085',
   },
})
