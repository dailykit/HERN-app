import { Text, View, ActivityIndicator } from 'react-native'
import appConfig from '../../brandConfig.json'

export const Spinner = ({
   size = 'small',
   text,
   color,
   showText = false,
   style,
}) => {
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
            <Text style={{ marginTop: 8 }}>{text || 'Loading...'}</Text>
         )}
      </View>
   )
}
