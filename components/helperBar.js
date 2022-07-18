import { GFSNeohellenic_700Bold_Italic } from '@expo-google-fonts/dev'
import { Button, View, Text, StyleSheet } from 'react-native'
import useGlobalStyle from '../globalStyle'

export const HelperBar = ({ type = 'info', children }) => {
   return (
      <View style={[styles[`hernHelperBar_${type}`], styles.hernHelperBar]}>
         {children}
      </View>
   )
}

const HelperButton = ({ children, onClick }) => {
   const { globalStyle } = useGlobalStyle()
   return (
      <Button
         onClick={onClick}
         style={[
            styles.hernHelperBar__btn,
            { fontFamily: globalStyle.font.regular },
         ]}
      >
         {children}
      </Button>
   )
}

const Title = ({ children }) => {
   const { globalStyle } = useGlobalStyle()
   return (
      <Text
         style={[
            styles.hernHelperBar__title,
            { fontFamily: globalStyle.font.medium },
         ]}
      >
         {children}
      </Text>
   )
}
const SubTitle = ({ children }) => {
   const { globalStyle } = useGlobalStyle()
   return (
      <Text
         style={[
            styles.hernHelperBar__subtitle,
            { fontFamily: globalStyle.font.regular },
         ]}
      >
         {children}
      </Text>
   )
}

HelperBar.Button = HelperButton
HelperBar.Title = Title
HelperBar.SubTitle = SubTitle

const styles = StyleSheet.create({
   hernHelperBar: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      borderRadius: 4,
      marginBottom: 12,
      borderRadius: 12,
   },
   hernHelperBar_info: {
      backgroundColor: 'rgba(199, 210, 254, 1)',
      color: 'rgba(55, 48, 163, 1)',
   },
   hernHelperBar_success: {
      backgroundColor: 'rgba(167, 243, 208, 1)',
      color: 'rgba(6, 95, 70, 1)',
   },
   hernHelperBar_danger: {
      backgroundColor: 'rgba(254, 202, 202, 1)',
      color: 'rgba(153, 27, 27, 1)',
   },
   hernHelperBar_warning: {
      backgroundColor: 'rgba(253, 230, 138, 1)',
      color: 'rgba(146, 64, 14, 1)',
   },
   hernHelperBar__btn: {
      marginTop: 4,
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 4,

      fontSize: 14,
      lineHeight: 20,
   },
   hernHelperBar__title: {
      textAlign: 'center',

      fontSize: 15,
      lineHeight: 18,
   },
   hernHelperBar__subtitle: {
      textAlign: 'center',
   },
})
