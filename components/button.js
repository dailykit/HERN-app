import { TouchableOpacity, StyleSheet, Text } from 'react-native'

export const Button = ({ children, onPress }) => {
   return (
      <TouchableOpacity
         onPress={onPress}
         style={{
            backgroundColor: '#000000',
            borderRadius: 2,
         }}
      >
         <Text style={styles.buttonTextStyle}>{children}</Text>
      </TouchableOpacity>
   )
}

const styles = StyleSheet.create({
   buttonTextStyle: {
      color: '#ffffff',
      paddingHorizontal: 12,
      paddingVertical: 6,
      fontSize: 12,
   },
})
