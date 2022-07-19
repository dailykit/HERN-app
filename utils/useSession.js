import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { useCallback, useState } from 'react'
import { get_env } from './get_env'
import JWT from 'expo-jwt'
import { GET_MOBILE_DEVICE_IDS } from '../graphql/queries'
import { client } from '../lib/apollo'
import { DELETE_BRAND_CUSTOMER_DEVICE } from '../graphql/mutations'
import * as Notifications from 'expo-notifications'
import { useMutation } from '@apollo/client'

export const useSession = () => {
   const [isLoading, setIsLoading] = useState(true)
   const [session, setSession] = useState({})

   const login = useCallback(async () => {
      const token = await AsyncStorage.getItem('accessToken')
      if (token !== null) {
         try {
            const decode = JWT.decode(
               JSON.parse(token),
               get_env('ADMIN_SECRET'),
               {
                  timeSkew: 30,
               }
            )
            setSession({
               status: true,
               user: {
                  id: decode.id,
               },
            })
         } catch (err) {
            console.log('err', err)
            setSession({
               status: false,
            })
         } finally {
            setIsLoading(false)
         }
      } else {
         setIsLoading(false)
         setSession({
            status: false,
         })
      }
   }, [])

   React.useEffect(() => {
      ;(async function () {
         const token = await AsyncStorage.getItem('accessToken')
         if (token !== null) {
            try {
               const decode = JWT.decode(
                  JSON.parse(token),
                  get_env('ADMIN_SECRET'),
                  {
                     timeSkew: 30,
                  }
               )
               setSession({
                  status: true,
                  user: {
                     id: decode.id,
                  },
               })
            } catch (err) {
               console.log('err', err)
               setSession({
                  status: false,
               })
            } finally {
               setIsLoading(false)
            }
         } else {
            setIsLoading(false)
            setSession({
               status: false,
            })
         }
      })()
   }, [])
   const [deleteBrandCustomerDevice] = useMutation(DELETE_BRAND_CUSTOMER_DEVICE)
   const logout = React.useCallback(async () => {
      try {
         const { status: existingStatus } =
            await Notifications.getPermissionsAsync()

         if (existingStatus === 'granted') {
            const token = (await Notifications.getExpoPushTokenAsync()).data
            // fetch mobile device id by current mobile's notificationToken
            const { data: { deviceHub_mobileDevice } = [] } =
               await client.query({
                  query: GET_MOBILE_DEVICE_IDS,
                  variables: {
                     where: {
                        notificationToken: {
                           _eq: token,
                        },
                     },
                  },
               })

            const flatMobileDeviceIds = deviceHub_mobileDevice.map(
               eachDevice => eachDevice.id
            )

            if (flatMobileDeviceIds.length > 0) {
               await deleteBrandCustomerDevice({
                  variables: {
                     mobileDeviceId: flatMobileDeviceIds[0],
                  },
               })
            }
         }

         await AsyncStorage.clear()
         setSession({
            status: false,
         })
      } catch (err) {
         console.error('logoutErr', err)
         setSession({
            status: false,
         })
      }
   }, [])
   return { isLoading, session, logout, login }
}
