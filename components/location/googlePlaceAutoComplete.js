import React from 'react'
import { ScrollView, View, StyleSheet, TouchableOpacity } from 'react-native'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import GPSicon from '../../assets/GPSicon'
import { get_env } from '../../utils/get_env'
import useGlobalStyle from '../../globalStyle'

export const GooglePlacesAutocompleteWrapper = ({
   formatAddress = () => {},
   onGPSiconClick,
   showGPSicon = true,
   googleContainerStyle,
}) => {
   const { globalStyle } = useGlobalStyle()
   const _googleRef = React.useRef()
   React.useEffect(() => {
      _googleRef.current.focus()
   }, [])
   return (
      <View
         style={[
            styles.container,
            googleContainerStyle ? googleContainerStyle : {},
         ]}
      >
         <GooglePlacesAutocomplete
            ref={_googleRef}
            placeholder="Search for area, street name..."
            onPress={(data, details = null) => {
               // 'details' is provided when fetchDetails = true
               formatAddress(data)
               // console.log(data, details)
            }}
            minLength={2}
            fetchDetails={true}
            query={{
               key: `${get_env('GOOGLE_API_KEY')}`,
               language: 'en',
            }}
            styles={{
               textInput: {
                  fontFamily: globalStyle.font.medium,
                  shadowColor: '#000000',
                  elevation: 6,
                  paddingRight: 35,
                  borderRadius: 8,
               },
               listView: {
                  fontFamily: globalStyle.font.medium,
                  zIndex: 10000,
                  position: 'absolute',
                  top: 50,
               },
            }}
            onFail={error => console.error('Hello', error)}
            debounce={200}
         />
         {showGPSicon ? (
            <TouchableOpacity
               style={{
                  position: 'absolute',
                  right: 0,
                  top: 10,
                  paddingHorizontal: 10,
               }}
               onPress={onGPSiconClick}
            >
               <GPSicon />
            </TouchableOpacity>
         ) : null}
      </View>
   )
}
const styles = StyleSheet.create({
   container: {
      height: 50,
      // backgroundColor: '#ecf0f1',
      borderRadius: 8,
      position: 'relative',
   },
})
