import { useNavigation } from '@react-navigation/native'
import { OtpLogin } from './otp'

const LoginScreen = () => {
   const navigation = useNavigation()
   return <OtpLogin />
}
export default LoginScreen
