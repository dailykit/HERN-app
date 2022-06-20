import { useSubscription } from '@apollo/client'
import React from 'react'
import { PRODUCTS_BY_CATEGORY } from '../graphql'
import { useConfig } from './../lib/config'

//on demand menu context
export const onDemandMenuContext = React.createContext()

//initial state
const initialState = {
   categories: [],
   allProductIds: [],
   isMenuLoading: true,
}

//reducer
const reducer = (state = initialState, { type, payload }) => {
   switch (type) {
      case 'SEED': {
         const ids = payload.menu.map(category => category.products).flat()
         return { ...state, categories: payload.menu, allProductIds: ids }
      }
      case 'MENU_LOADING':
         return { ...state, isMenuLoading: payload }
      default:
         return state
   }
}

export const OnDemandMenuProvider = ({ children }) => {
   const date = React.useMemo(() => new Date(Date.now()).toISOString(), [])
   const { brand, isConfigLoading, locationId } = useConfig()
   const [onDemandMenu, onDemandMenuDispatch] = React.useReducer(
      reducer,
      initialState
   )

   const { error: menuError } = useSubscription(PRODUCTS_BY_CATEGORY, {
      skip: isConfigLoading || !brand?.id,
      variables: {
         params: {
            brandId: brand?.id,
            date,
            locationId: locationId,
         },
      },
      onSubscriptionData: ({ subscriptionData }) => {
         const { data } = subscriptionData
         if (data?.onDemand_getMenuV2copy?.length) {
            const [res] = data.onDemand_getMenuV2copy
            const { menu } = res.data
            onDemandMenuDispatch({
               type: 'SEED',
               payload: { menu },
            })
            onDemandMenuDispatch({
               type: 'MENU_LOADING',
               payload: false,
            })
         }
      },
   })

   React.useEffect(() => {
      if (menuError) {
         onDemandMenuDispatch({
            type: 'MENU_LOADING',
            payload: false,
         })
         console.log(menuError)
      }
   }, [menuError])

   return (
      <onDemandMenuContext.Provider
         value={{ onDemandMenu, onDemandMenuDispatch }}
      >
         {children}
      </onDemandMenuContext.Provider>
   )
}
