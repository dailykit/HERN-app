import React from 'react'
import {
   ActivityIndicator,
   StyleSheet,
   Text,
   TouchableOpacity,
   View,
} from 'react-native'
import { EditIcon } from '../../assets/editIcon'
import LocationIcon from '../../assets/locationIcon'
import { useCart } from '../../context'
import { useConfig } from '../../lib/config'
import { DownVector } from '../../assets/vector'
import { useNavigation } from '@react-navigation/native'
import useGlobalStyle from '../../globalStyle'
import { gql, useQuery } from '@apollo/client'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const Address = () => {
   const { orderTabs, selectedOrderTab, appConfig } = useConfig()
   const { globalStyle } = useGlobalStyle()
   const navigation = useNavigation()
   const { storedCartId } = useCart()
   const [numberOfLines, setNumberOfLines] = React.useState(1)

   const { data: { carts = [] } = {}, loading } = useQuery(
      GET_CUSTOMER_ADDRESS,
      {
         variables: {
            where: {
               id: {
                  _eq: storedCartId,
               },
            },
         },
      }
   )
   const selectedFulfillment = React.useMemo(
      () =>
         selectedOrderTab
            ? selectedOrderTab.orderFulfillmentTypeLabel
                 .replace('_', ' ')
                 .split(' ')[1]
            : orderTabs.length == 0
            ? null
            : orderTabs[0].orderFulfillmentTypeLabel
                 .replace('_', ' ')
                 .split(' ')[1],
      [orderTabs, selectedOrderTab]
   )
   const fulfillmentLabel = React.useMemo(() => {
      switch (selectedFulfillment) {
         case 'DELIVERY':
            return 'Delivery at'
         case 'PICKUP':
            return 'Pickup from'
         case 'DINEIN':
            return 'DineIn At'
      }
   }, [selectedFulfillment])

   const address = React.useMemo(() => {
      if (carts[0]?.address && !loading) {
         return carts?.[0]?.address
      } else {
         return {}
      }
   }, [carts, loading])

   return (
      <View style={styles.addressContainer}>
         <View
            style={{
               flex: 1,
               flexDirection: 'row',
               alignItems: 'center',
               justifyContent: 'space-between',
               height: '100%',
               marginLeft: 4,
            }}
         >
            <TouchableOpacity
               style={{
                  flex: 3,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
               }}
               onPress={() => {
                  navigation.navigate('LocationSelector')
               }}
            >
               <LocationIcon fill={globalStyle.color.grey} />
               <Text
                  style={{
                     fontFamily: globalStyle.font.medium,
                     // color: '#00000080',
                     marginLeft: 4,
                  }}
               >
                  {fulfillmentLabel}
               </Text>
               {/* <DownVector size={12} stroke={'#00000080'} /> */}
            </TouchableOpacity>
            {loading ? (
               <View style={{ flex: 6, flexShrink: 1, marginLeft: 30 }}>
                  <ActivityIndicator size="small" color={'#000'} />
               </View>
            ) : (
               <TouchableOpacity
                  style={{
                     // flex: 1,
                     // alignItems: 'center',
                     height: '100%',
                     // justifyContent: 'center',
                     marginRight: 8,
                  }}
                  onPress={() => {
                     navigation.navigate('RefineLocation', {
                        address: {
                           ...address,
                           latitude: address?.lat,
                           longitude: address?.lng,
                        },
                        fulfillmentType:
                           selectedOrderTab.orderFulfillmentTypeLabel,
                     })
                  }}
               >
                  <EditIcon
                     fill={
                        appConfig.brandSettings.buttonSettings.buttonBGColor
                           .value || '#00000080'
                     }
                     size={18}
                  />
               </TouchableOpacity>
            )}
         </View>
         <View>
            <TouchableOpacity
               style={{
                  flex: 6,
                  // flexShrink: 1,
                  marginLeft: 32,
                  marginRight: 22,
                  marginTop: 4,
               }}
               onPress={() => {
                  setNumberOfLines(prev => (prev == 1 ? 2 : 1))
               }}
            >
               <Text
                  numberOfLines={numberOfLines}
                  style={{
                     fontFamily: globalStyle.font.medium,
                     // color: '#00000080',
                  }}
               >
                  {`${address?.line1} ${address?.city} ${address?.state} ${address?.country},${address?.zipcode}`}
               </Text>
            </TouchableOpacity>
         </View>
         <View style={styles.divider}></View>
      </View>
   )
}
const styles = StyleSheet.create({
   addressContainer: {
      // height: 50,
      marginHorizontal: 2,
      marginBottom: 12,
      marginTop: 12,
      //   shadowColor: '#00000060',
      //   shadowOffset: { width: 0, height: 2 },
      //   shadowRadius: 6,
      //   elevation: 3,
      paddingVertical: 4,
      // borderRadius: 5,
      // borderWidth: 1,
      // borderColor: '#00000030',
   },
   divider: {
      height: 1,
      backgroundColor: '#00000030',
      marginTop: 20,
      marginHorizontal: 8,
   },
})
const GET_CUSTOMER_ADDRESS = gql`
   query carts($where: order_cart_bool_exp!) {
      carts(where: $where) {
         id
         address
         orderTabId
      }
   }
`
