import { FascinateInline_400Regular } from '@expo-google-fonts/dev'
import { TouchableWithoutFeedback, StyleSheet, Text, View } from 'react-native'
import RadioIcon from '../assets/radioIcon'
import { useConfig } from '../lib/config'
import useGlobalStyle from '../globalStyle'

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
   radioStyle,
   additionalIcon: AdditionalIcon = null,
}) => {
   const { appConfig } = useConfig()
   const { globalStyle } = useGlobalStyle()
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
                  ? buttonSettings.borderActiveColor.value || '#000000'
                  : buttonSettings.borderInactiveColor.value || '#A2A2A2',
               borderWidth: 1,
               backgroundColor: '#FFFFFF',
            }
         case 'noOutline': {
            return {}
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
         case 'noOutline':
            return {
               color: buttonSettings.activeTextColor.value || '#ffffff',
            }
      }
   }
   return (
      <TouchableWithoutFeedback onPress={onPress} disabled={disabled}>
         <View
            style={[
               {
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'row',
               },
               styles.buttonContainerStyle,
               containerStyleByVariant(variant),
               buttonStyle ? buttonStyle : null,
               disabled ? { opacity: 0.5 } : null,
            ]}
         >
            {AdditionalIcon ? <AdditionalIcon /> : null}
            {showRadio ? (
               <View
                  style={[
                     {
                        paddingLeft: 12,
                     },
                     radioStyle ? radioStyle : {},
                  ]}
               >
                  <RadioIcon
                     checked={isActive}
                     size={radioSize}
                     stroke={
                        isActive
                           ? appConfig.brandSettings.checkIconSettings
                                .checkIconFillColor.value || '#000000'
                           : appConfig.brandSettings.checkIconSettings
                                .boundaryColor.value || '#A2A2A2'
                     }
                  />
               </View>
            ) : null}
            {children ? (
               <Text
                  style={[
                     styles.buttonTextStyle,
                     textStyleByVariant(variant),
                     textStyle ? textStyle : null,
                     { fontFamily: globalStyle.font.regular },

                  ]}
               >
                  {children}
               </Text>
            ) : null}
         </View>
      </TouchableWithoutFeedback>
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
