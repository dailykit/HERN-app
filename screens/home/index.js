import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import SafeAreaView from 'react-native-safe-area-view'
import { useNavigation } from '@react-navigation/native'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/client'
const BRANDS = gql`
   query brands {
      brands {
         id
      }
   }
`
const HomeScreen = () => {
   const navigation = useNavigation()

   return (
      <SafeAreaView>
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
      </SafeAreaView>
   )
}

export default HomeScreen
