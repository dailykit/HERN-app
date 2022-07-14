// this is a component used to redirect on login screen

import { useNavigation } from '@react-navigation/native'
import { StyleSheet, Text, View } from 'react-native'
import { LoginIcon } from '../assets/loginIcon'
import { Button } from './button'

// this will render on screen where customer has to be authorize to access that screen
export const LoginScreenForAuthScreen = () => {
   const navigation = useNavigation()
   return (
      <View
         style={{
            alignItems: 'center',
            height: '100%',
         }}
      >
         <View
            style={{
               flex: 1,
               justifyContent: 'center',
               alignItems: 'center',
            }}
         >
            <Text style={{ fontFamily: 'MetropolisSemiBold', fontSize: 20 }}>
               Oops! You're not logged in yet
            </Text>
            <Text
               style={{ fontFamily: 'MetropolisMedium', color: '#00000060' }}
            >
               Login to continue
            </Text>
         </View>
         <View
            style={{
               flex: 4,
               justifyContent: 'center',
            }}
         >
            <LoginIcon />
         </View>
         <View style={{ flex: 2 }}>
            <Button
               onPress={() => {
                  navigation.navigate('Login')
               }}
               buttonStyle={styles.buttonStyle}
               textStyle={styles.textStyle}
            >
               Login
            </Button>
         </View>
      </View>
   )
}

const styles = StyleSheet.create({
   buttonStyle: {
      height: 40,
      paddingHorizontal: 80,
   },
   textStyle: {
      fontSize: 20,
   },
})
