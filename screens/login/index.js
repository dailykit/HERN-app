import { useNavigation } from '@react-navigation/native'
import { OtpLogin } from './otp'

const LoginScreen = () => {
   const navigation = useNavigation()
   console.log('this is route', navigation.getState())
   return <OtpLogin />
}
export default LoginScreen
