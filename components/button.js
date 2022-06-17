import { FascinateInline_400Regular } from '@expo-google-fonts/dev'
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native'
import RadioIcon from '../assets/radioIcon'
import appConfig from '../brandConfig.json'

export const Button = ({
   children,
   onPress,
   buttonStyle = null,
   textStyle = null,
   variant = 'primary',
   isActive = false,
   showRadio = false,
   radioSize = 16,
   disabled = false,
}) => {
   const { buttonSettings } = appConfig.brandSettings
   const containerStyleByVariant = variant => {
      switch (variant) {
         case 'primary':
            return {
               backgroundColor: buttonSettings.buttonBGColor.value || '#000000',
            }
         case 'outline':
            return {
               borderColor: isActive
                  ? buttonSettings.borderActiveColor.value
                  : buttonSettings.borderInactiveColor.value,
               borderWidth: 1,
               backgroundColor: '#FFFFFF',
            }
      }
   }
   const textStyleByVariant = variant => {
      switch (variant) {
         case 'primary':
            return {
               color: buttonSettings.textColor.value || '#ffffff',
            }
         case 'outline':
            return { color: '#000000' }
      }
   }
   return (
      <TouchableOpacity
         onPress={onPress}
         disabled={disabled}
         style={[
            styles.buttonContainerStyle,
            containerStyleByVariant(variant),
            buttonStyle ? buttonStyle : null,
            {
               display: 'flex',
               justifyContent: 'center',
               alignItems: 'center',
               flexDirection: 'row',
            },
            disabled ? { opacity: 0.5 } : null,
         ]}
      >
         {showRadio ? (
            <View
               style={{
                  paddingLeft: 12,
               }}
            >
               <RadioIcon
                  checked={isActive}
                  size={radioSize}
                  stroke={
                     isActive
                        ? appConfig.brandSettings.checkIconSettings
                             .checkIconFillColor.value
                        : appConfig.brandSettings.checkIconSettings
                             .boundaryColor.value
                  }
               />
            </View>
         ) : null}
         <Text
            style={[
               styles.buttonTextStyle,
               textStyleByVariant(variant),
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
