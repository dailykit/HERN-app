import { Text, View, ActivityIndicator } from 'react-native'
import { useConfig } from '../../lib/config'

export const Spinner = ({
   size = 'small',
   text,
   color,
   showText = false,
   style = {},
   textStyle = {},
}) => {
   const { appConfig } = useConfig()
   return (
      <View
         style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 80,
            ...style,
         }}
      >
         <ActivityIndicator
            size={size}
            color={
               color || appConfig?.brandSettings?.brandColor?.value || '#000000'
            }
         />
         {showText && (
            <Text style={{ marginTop: 8, ...textStyle }}>
               {text || 'Loading...'}
            </Text>
         )}
      </View>
   )
}
