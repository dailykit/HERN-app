import { View, Dimensions } from 'react-native'
import { Skeleton } from './skeleton'

export const ProductSkeleton = () => {
   return (
      <View
         style={{
            flexDirection: 'row',
            position: 'relative',
         }}
      >
         <Skeleton
            additionalStyle={{ margin: 10, borderRadius: 6 }}
            width={Dimensions.get('window').width * 0.4}
            height={90}
         />
         <View
            style={{
               marginTop: 7,
            }}
         >
            <View>
               <Skeleton
                  width={120}
                  height={15}
                  additionalStyle={{ margin: 3, borderRadius: 4 }}
               />
            </View>
            <Skeleton
               width={60}
               height={15}
               additionalStyle={{ margin: 3, borderRadius: 4 }}
            />
         </View>
         <View
            style={{
               position: 'absolute',
               right: 20,
               bottom: 0,
            }}
         >
            <Skeleton
               width={90}
               height={35}
               additionalStyle={{
                  marginBottom: 7,
                  borderRadius: 15,
               }}
            />
         </View>
      </View>
   )
}
