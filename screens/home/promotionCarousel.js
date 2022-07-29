import React from 'react'
import Carousel, { Pagination } from 'react-native-snap-carousel'
import { Image, Text, Dimensions, View, StyleSheet } from 'react-native'
import CacheVideo from '../../components/cacheVideo'
import useGlobalStyle from '../../globalStyle'
const windowWidth = Dimensions.get('window').width

export const PromotionCarousel = ({ data, height = 128, showDots = true }) => {
   const { globalStyle } = useGlobalStyle()
   const _carousel = React.useRef(null)
   const [activeIndex, setActiveIndex] = React.useState(0)
   const _renderItem = ({ item, index }) => {
      return (
         <View style={styles.carouselItem} key={item.value}>
            {item?.type === 'imageUpload' && (
               <Image
                  source={{
                     uri: item?.value,
                     width: windowWidth - 20,
                     height: height,
                  }}
                  style={styles.image}
               />
            )}
            {item?.type === 'videoUpload' && (
               <CacheVideo
                  style={{ ...styles.image, height: height }}
                  source={{ uri: item?.value }}
                  shouldPlay={true}
                  resizeMode={'stretch'}
                  isMuted={true}
                  useNativeControls={false}
                  isLooping
               />
            )}
         </View>
      )
   }
   return (
      <View>
         <Carousel
            ref={_carousel}
            data={data.map(asset => {
               return {
                  type: asset[0]?.value?.userInsertType,
                  value: asset[0]?.value?.value,
               }
            })}
            renderItem={_renderItem}
            sliderWidth={windowWidth - 10}
            itemWidth={windowWidth}
            useScrollView={true}
            onSnapToItem={index => setActiveIndex(index)}
         />
         {showDots && (
            <Pagination
               dotsLength={data.length}
               activeDotIndex={activeIndex}
               carouselRef={_carousel}
               dotStyle={{
                  width: 8,
                  height: 8,
                  borderRadius: 5,
                  marginHorizontal: -10,
                  backgroundColor: globalStyle.color.primary,
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
