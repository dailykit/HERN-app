import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native'
import { FloatingMenuIcon } from '../assets/floatingMenuIcon'
import React from 'react'
import { Button } from './button'
import Modal from 'react-native-modal'
import { ScrollView } from 'react-native-gesture-handler'
import { useConfig } from '../lib/config'

export const FloatingMenu = ({
   hydratedMenu,
   selectedCategoryName,
   onCategoryClick,
}) => {
   const { appConfig } = useConfig()
   const [showModal, setShowModal] = React.useState(false)

   const Icon = () => {
      return <FloatingMenuIcon size={20} />
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
                                            color: appConfig.brandSettings
                                               .brandColor.value,
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
                                            color: appConfig.brandSettings
                                               .brandColor.value,
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
            }}
            textStyle={{
               fontSize: 16,
               paddingHorizontal: 8,
               color: '#000000',
               fontWeight: '600',
            }}
            additionalIcon={Icon}
            onPress={() => {
               setShowModal(true)
            }}
         >
            Menu
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
      fontWeight: '600',
      fontSize: 12,
      fontFamily: 'Metropolis',
      color: '#00000085',
   },
})
