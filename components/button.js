import { TouchableOpacity, StyleSheet, Text } from 'react-native'
import appConfig from '../brandConfig.json'

export const Button = ({
   children,
   onPress,
   buttonStyle = null,
   textStyle = null,
}) => {
   return (
      <TouchableOpacity
         onPress={onPress}
         style={[
            styles.buttonContainerStyle,
            {
               backgroundColor:
                  appConfig.brandSettings.buttonSettings.buttonBGColor.value ||
                  '#000000',
            },
            buttonStyle ? buttonStyle : null,
         ]}
      >
         <Text
            style={[
               styles.buttonTextStyle,
               {
                  color:
                     appConfig.brandSettings.buttonSettings.textColor.value ||
                     '#ffffff',
               },
               textStyle ? textStyle : null,
            ]}
         >
            {children}
         </Text>
      </TouchableOpacity>
   )
}

const styles = StyleSheet.create({
   buttonContainerStyle: {
      borderRadius: 4,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
   },
   buttonTextStyle: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      fontSize: 12,
   },
})
