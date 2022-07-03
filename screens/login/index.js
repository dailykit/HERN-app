import { useNavigation } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { OtpLogin } from './otp'

const LoginScreen = () => {
   const navigation = useNavigation()
   return (
      <SafeAreaView style={{ flex: 1 }}>
         <OtpLogin />
      </SafeAreaView>
   )
}
export default LoginScreen
