import { TouchableOpacity, View, Text, StyleSheet } from 'react-native'
import { useConfig } from '../lib/config'
import useGlobalStyle from '../globalStyle'

export const CounterButton = ({ count = 1, onPlusClick, onMinusClick }) => {
   const { appConfig } = useConfig()
   const { globalStyle } = useGlobalStyle()
   const { backgroundColor, iconColor, countBackgroundColor, countColor } =
      appConfig?.brandSettings.counterButtonSettings || {}
   return (
      <View
         style={[
            styles.counterContainer,
            {
               backgroundColor: backgroundColor.value,
            },
         ]}
      >
         <TouchableOpacity
            style={[styles.textWrapperStyle]}
            onPress={onMinusClick}
         >
            <Text
               style={[
                  styles.textStyle,
                  {
                     color: iconColor.value,
                     fontFamily: globalStyle.font.semibold,
                  },
               ]}
            >
               -
            </Text>
         </TouchableOpacity>
         <View
            style={[
               styles.textWrapperStyle,
               {
                  backgroundColor: countBackgroundColor.value,
               },
            ]}
         >
            <Text
               style={[
                  styles.textStyle,
                  {
                     color: countColor.value,
                     fontFamily: globalStyle.font.semibold,
                  },
               ]}
            >
               {count}
            </Text>
         </View>
         <TouchableOpacity
            style={[styles.textWrapperStyle]}
            onPress={onPlusClick}
         >
            <Text
               style={[
                  styles.textStyle,
                  {
                     color: iconColor.value,
                     fontFamily: globalStyle.font.semibold,
                  },
               ]}
            >
               +
            </Text>
         </TouchableOpacity>
      </View>
   )
}

const styles = StyleSheet.create({
   counterContainer: {
      display: 'flex',
      flexDirection: 'row',
      width: 90,
      height: 30,
      borderRadius: 15,
   },
   textWrapperStyle: {
      flex: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
   },
   textStyle: {
      fontSize: 14,
   },
})
