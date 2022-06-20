import React from 'react'
import { StyleSheet, View } from 'react-native'
import { EmptyCart } from './emptyCart'
import { Button } from '../../components/button'
import { CartHeader } from './cartHeader'
import { useNavigation } from '@react-navigation/native'

const CartScreen = () => {
   const navigation = useNavigation()
   return (
      <View style={{ height: '100%' }}>
         <CartHeader />
         <EmptyCart />
         <View style={{ bottom: 110, position: 'absolute', width: '100%' }}>
            <Button
               buttonStyle={styles.orderNowButtonStyle}
               textStyle={styles.orderNowTextStyle}
               onPress={() => {
                  navigation.navigate('Menu')
               }}
            >
               Order Now
            </Button>
         </View>
      </View>
   )
}

export default CartScreen

const styles = StyleSheet.create({
   orderNowButtonStyle: {
      marginHorizontal: 45,
      height: 42,
      borderRadius: 8,
   },
   orderNowTextStyle: {
      fontSize: 18,
      fontWeight: '500',
   },
})
