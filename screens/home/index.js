import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import SafeAreaView from 'react-native-safe-area-view'
import { useNavigation } from '@react-navigation/native'
import { Header } from '../../components/header'

const HomeScreen = () => {
   const navigation = useNavigation()
   return (
      <View>
         <Header />
         <View
            style={{
               display: 'flex',
               justifyContent: 'center',
               alignItems: 'center',
               height: '100%',
            }}
         >
            <Text>This is a Home Screen</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Menu')}>
               <Text>Move to Menu</Text>
            </TouchableOpacity>
         </View>
      </View>
   )
}

export default HomeScreen
