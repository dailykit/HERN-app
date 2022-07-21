import { useSubscription } from '@apollo/client'
import React from 'react'
import { PRODUCTS, PRODUCTS_BY_CATEGORY } from '../graphql'
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
   const { brand, isConfigLoading, locationId, brandLocation } = useConfig()
   const [onDemandMenu, onDemandMenuDispatch] = React.useReducer(
      reducer,
      initialState
   )
   const [productsStatus, setProductsStatus] = React.useState('loading')
   const [hydratedMenu, setHydratedMenu] = React.useState([])

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

   const argsForByLocation = React.useMemo(
      () => ({
         brandId: brand?.id,
         locationId: locationId,
         brand_locationId: brandLocation?.id,
      }),
      [brand, locationId, brandLocation?.id]
   )

   const { loading: productsLoading, error: productsError } = useSubscription(
      PRODUCTS,
      {
         skip: onDemandMenu.isMenuLoading,
         variables: {
            ids: onDemandMenu.allProductIds,
            params: argsForByLocation,
         },
         // fetchPolicy: 'network-only',
         onSubscriptionData: ({ subscriptionData }) => {
            const { data } = subscriptionData
            if (data && data.products.length) {
               const productsList = data.products
               const updatedMenu = onDemandMenu.categories.map(category => {
                  const updatedProducts = category.products
                     .map(productId => {
                        const found = productsList.find(
                           ({ id }) => id === productId
                        )
                        if (found) {
                           return found
                        }
                        return null
                     })
                     .filter(Boolean)
                  return {
                     ...category,
                     products: updatedProducts,
                  }
               })
               setHydratedMenu(updatedMenu)
               setProductsStatus('success')
            }
         },
      }
   )
   React.useEffect(() => {
      if (productsError) {
         setProductsStatus('error')
         console.error('products fetch error', productsError)
      }
   }, [productsError])
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
         value={{
            onDemandMenu,
            onDemandMenuDispatch,
            hydratedMenu,
            productsStatus,
         }}
      >
         {children}
      </onDemandMenuContext.Provider>
   )
}
