import { View } from 'react-native'
import { AccountHeader } from './header'
import { UserInfo } from './userInfo'

const AccountScreen = () => {
   return (
      <View>
         <AccountHeader />
         <View style={{ marginHorizontal: 12 }}>
            <UserInfo />
         </View>
      </View>
   )
}

export default AccountScreen
