import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NoInternetConnectionSVG } from '../assets/noInternetConnection'
import useGlobalStyle from '../globalStyle'

const NoNetworkConnection = props => {
   const { globalStyle } = useGlobalStyle()

   return (
      <SafeAreaView style={{ flex: 1 }}>
         <View
            style={{
               height: 64,
               backgroundColor: '#000',
               justifyContent: 'center',
               paddingHorizontal: 10,
            }}
         >
            <Text style={{ color: '#fff', fontSize: 16 }}>
               {props.route.name}
            </Text>
         </View>
         <View
            style={{
               flex: 1,
            }}
         >
            <View
               style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
               }}
            >
               <Text
                  style={{ fontFamily: globalStyle.font.bold, fontSize: 24 }}
               >
                  Oops! No internet connection!
               </Text>
               <Text
                  style={{ fontFamily: globalStyle.font.regular, fontSize: 14 }}
               >
                  Please check your internet connection and try again
               </Text>
            </View>
            <View style={{ flex: 1 }}>
               <NoInternetConnectionSVG />
            </View>
         </View>
      </SafeAreaView>
   )
}

export default NoNetworkConnection
