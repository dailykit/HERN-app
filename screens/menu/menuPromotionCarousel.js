import React from 'react'
import appConfig from '../../brandConfig.json'
import Carousel, { Pagination } from 'react-native-snap-carousel'
import { Image, Text, Dimensions, View, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const windowWidth = Dimensions.get('window').width

export const MenuPromotionCarousel = () => {
   const _carousel = React.useRef(null)
   const [activeIndex, setActiveIndex] = React.useState(0)
   const _renderItem = ({ item, index }) => {
      return (
         <View style={styles.carouselItem} key={item}>
            <Image
               source={{
                  uri: item,
                  width: windowWidth - 20,
                  height: 128,
               }}
            />
         </View>
      )
   }
   return (
      <View>
         <Carousel
            ref={_carousel}
            data={appConfig.data.menuPagePromotionImage.value.url}
            renderItem={_renderItem}
            sliderWidth={windowWidth - 10}
            itemWidth={windowWidth}
            useScrollView={true}
            onSnapToItem={index => setActiveIndex(index)}
         />
         <Pagination
            dotsLength={appConfig.data.menuPagePromotionImage.value.url.length}
            activeDotIndex={activeIndex}
            carouselRef={_carousel}
            dotStyle={{
               width: 8,
               height: 8,
               borderRadius: 5,
               marginHorizontal: 0,
               backgroundColor: 'rgba(0, 0, 0, 0.92)',
            }}
            inactiveDotOpacity={0.4}
            inactiveDotScale={0.6}
            tappableDots={true}
            containerStyle={{
               paddingVertical: 0,
            }}
         />
      </View>
   )
}

const styles = StyleSheet.create({
   carouselItem: {
      margin: 10,
      height: 'auto',
   },
   carouselDots: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
   },
   carouselDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#ffffff',
      marginHorizontal: 1,
      borderColor: '#000000',
      borderWidth: 1,
   },
   activeCarouselDot: {
      backgroundColor: '#000000',
   },
})
