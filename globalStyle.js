import { useConfig } from './lib/config'
import React, { useState, useEffect } from 'react'
const useGlobalCss = () => {
   const { appConfig, isConfigLoading } = useConfig()
   const [globalCss, setGlobalCss] = useState({
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
      console.log(globalCss)
      setGlobalCss({
         ...globalCss,
         color: {
            ...globalCss?.color,
            primary: appConfig?.brandSettings?.brandColor?.value,
         },
      })
   }, [appConfig])
   return { globalCss }
}

export default useGlobalCss
