import { useConfig } from './lib/config'
import React, { useState, useEffect } from 'react'
const useGlobalStyle = () => {
   const { appConfig, isConfigLoading } = useConfig()
   const [globalStyle, setGlobalStyle] = useState({
      font: {
         regular: 'Metropolis',
         medium: 'MetropolisMedium',
         semibold: 'MetropolisSemiBold',
         bold: 'MetropolisBold',
         italic: 'MetropolisRegularItalic',
      },
      color: {
         primary: appConfig?.brandSettings?.brandColor?.value,
         highlight: '#03DAC6',
         grey: '#A2A2A2',
      },
   })
   useEffect(() => {
      setGlobalStyle({
         ...globalStyle,
         color: {
            ...globalStyle?.color,
            primary: appConfig?.brandSettings?.brandColor?.value,
         },
      })
   }, [appConfig])
   return { globalStyle }
}

export default useGlobalStyle
