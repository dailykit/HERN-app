import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { useState } from 'react'
import { get_env } from './get_env'
import JWT from 'expo-jwt'

export const useSession = () => {
   const [isLoading, setIsLoading] = useState(true)
   const [session, setSession] = useState({})
   React.useEffect(() => {
      ;(async function () {
         const token = await AsyncStorage.getItem('accessToken')
         console.log('this is token', token)
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

   return { isLoading, session }
}
