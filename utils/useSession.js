import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { useCallback, useState } from 'react'
import { get_env } from './get_env'
import JWT from 'expo-jwt'

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

   const logout = React.useCallback(async () => {
      try {
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
