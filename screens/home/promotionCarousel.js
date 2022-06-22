import React from 'react'
import Carousel, { Pagination } from 'react-native-snap-carousel'
import { Image, Text, Dimensions, View, StyleSheet } from 'react-native'

const windowWidth = Dimensions.get('window').width

export const PromotionCarousel = ({ data, height = 128, showDots = true }) => {
   const _carousel = React.useRef(null)
   const [activeIndex, setActiveIndex] = React.useState(0)
   const _renderItem = ({ item, index }) => {
      return (
         <View style={styles.carouselItem} key={item}>
            <Image
               source={{
                  uri: item,
                  width: windowWidth - 20,
                  height: height,
               }}
               style={styles.image}
            />
         </View>
      )
   }
   return (
      <View>
         <Carousel
            ref={_carousel}
            data={data.url}
            renderItem={_renderItem}
            sliderWidth={windowWidth - 10}
            itemWidth={windowWidth}
            useScrollView={true}
            onSnapToItem={index => setActiveIndex(index)}
         />
         {showDots && (
            <Pagination
               dotsLength={data.url.length}
               activeDotIndex={activeIndex}
               carouselRef={_carousel}
               dotStyle={{
                  width: 8,
                  height: 8,
                  borderRadius: 5,
                  marginHorizontal: -10,
                  backgroundColor: '#EF5266',
               }}
               inactiveDotOpacity={0.4}
               inactiveDotScale={1}
               tappableDots={true}
               containerStyle={{
                  paddingVertical: 0,
               }}
            />
         )}
      </View>
   )
}

const styles = StyleSheet.create({
   carouselItem: {
      margin: 10,
      height: 'auto',
   },
   image: {
      borderRadius: 6,
   },
})
