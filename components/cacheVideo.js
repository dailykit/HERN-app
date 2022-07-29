import React from 'react'
import { Video } from 'expo-av'
import useGlobalStyle from '../globalStyle'
import { Image, Text, Dimensions, View, StyleSheet } from 'react-native'
import * as FileSystem from 'expo-file-system'
import * as Crypto from 'expo-crypto'

const CacheVideo = props => {
   const [sourceURI, setSourceURI] = React.useState(null)

   React.useEffect(() => {
      ;(async () => {
         const { uri } = props?.source
         const name = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            uri
         )
         const path = `${FileSystem.cacheDirectory}${name}`
         const image = await FileSystem.getInfoAsync(path)
         if (image.exists) {
            setSourceURI(image.uri)
         } else {
            setSourceURI(uri)
            try {
               const newImage = await FileSystem.downloadAsync(uri, path)
               setSourceURI(newImage.uri)
            } catch (error) {
               console.log('Video download error:', error)
            }
         }
      })()
   }, [])

   return <Video {...props} source={{ uri: sourceURI }} />
}

export default CacheVideo
