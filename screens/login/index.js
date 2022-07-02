import { useNavigation } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { OtpLogin } from './otp'

const LoginScreen = () => {
   const navigation = useNavigation()
   return (
      <SafeAreaView>
         <OtpLogin />
      </SafeAreaView>
   )
}
export default LoginScreen
