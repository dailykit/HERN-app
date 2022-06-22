import { useMutation, useSubscription } from '@apollo/client'
import isEmpty from 'lodash/isEmpty'
import React, { useEffect, useState, useContext } from 'react'
import {
   CREATE_CART_ITEMS,
   GET_CART,
   MUTATIONS,
   DELETE_CART_ITEMS,
   GET_CARTS,
   UPDATE_CART_ITEMS,
   GET_CART_ITEMS_BY_CART,
} from '../graphql'
// import { useUser } from '.'
import { useConfig } from '../lib/config'
// import { useToasts } from 'react-toast-notifications'
import { combineCartItems } from '../utils'
import { indexOf } from 'lodash'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const CartContext = React.createContext()

const initialState = {
   cart: null,
   cartItems: null,
}

const reducer = (state, { type, payload }) => {
   switch (type) {
      case 'CART':
         return { ...state, cart: payload }
      case 'CART_ITEMS':
         return { ...state, cartItems: payload }
      default:
         return state
   }
}

const { isAuthenticated, user, isLoading } = {
   isAuthenticated: false,
   isLoading: false,
   user: {},
}
export const CartProvider = ({ children }) => {
   const {
      brand,
      selectedOrderTab,
      locationId,
      dispatch,
      orderTabs,
      brandLocation,
   } = useConfig()
   //    const { addToast } = useToasts()
   const oiType = React.useMemo(() => {
      return 'App Ordering'
   }, [])
   const [isFinalCartLoading, setIsFinalCartLoading] = React.useState(true)

   const [cartState, cartReducer] = React.useReducer(reducer, initialState)

   const [storedCartId, setStoredCartId] = useState(null)
   const [combinedCartItems, setCombinedCartData] = useState(null)
   const [showCartIconToolTip, setShowCartIconToolTip] = useState(false)
   const [dineInTableInfo, setDineInTableInfo] = useState(null)
   const [
      isCartValidByProductAvailability,
      setIsCartValidByProductAvailability,
   ] = useState(false)
   const argsForByLocation = React.useMemo(
      () => ({
         brandId: brand?.id,
         locationId: locationId,
         brand_locationId: brandLocation?.id,
      }),
      [brand, locationId, brandLocation?.id]
   )
   React.useEffect(() => {
      // case 1 - user is not authenticated
      //case 1.1 if there is cart-id in local storage , set storedCartId

      //case 1.2 if not then do nothing,set storedCartId null

      // case 2 - user is authenticated , handled by getCarts

      // case 3 - use is authenticated and clicked on logout, set storedCartId null

      ;(async function () {
         const cartId = await AsyncStorage.getItem('cart-id')
         if (cartId) {
            setStoredCartId(+cartId)
         } else {
            if (!isLoading && !isAuthenticated) {
               setStoredCartId(null)
            }
         }
      })()
   }, [isAuthenticated, isLoading])

   //initial cart when no auth
   const {
      loading: isCartLoading,
      error: getInitialCart,
      data: cartData = {},
   } = useSubscription(GET_CART, {
      skip: !storedCartId,
      variables: {
         where: {
            id: {
               _eq: storedCartId,
            },
            paymentStatus: {
               _eq: 'PENDING',
            },
            status: {
               _eq: 'CART_PENDING',
            },
         },
      },
      fetchPolicy: 'no-cache',
      onSubscriptionData: data => {
         setIsFinalCartLoading(false)
      },
   })

   // get cartItems
   const {
      loading: cartItemsLoading,
      error: cartItemsError,
      data: cartItemsData,
   } = useSubscription(GET_CART_ITEMS_BY_CART, {
      skip: !storedCartId,
      variables: {
         where: {
            level: {
               _eq: 1,
            },
            cartId: {
               _eq: storedCartId,
            },
            cart: {
               paymentStatus: {
                  _eq: 'PENDING',
               },
               status: {
                  _eq: 'CART_PENDING',
               },
            },
         },
         params: argsForByLocation,
      },
      fetchPolicy: 'no-cache',
   })

   React.useEffect(() => {
      if (cartItemsData?.cartItems) {
         for (let node of cartItemsData?.cartItems) {
            let isCartValid = true
            const selectedProductOption = node.product.productOptions.find(
               option => option.id === node.childs[0]?.productOption?.id
            )

            if (!isEmpty(selectedProductOption)) {
               isCartValid =
                  node.product.isAvailable &&
                  node.product.isPublished &&
                  !node.product.isArchived &&
                  selectedProductOption.isAvailable &&
                  selectedProductOption.isPublished &&
                  !selectedProductOption.isArchived
            } else {
               isCartValid =
                  node.product.isAvailable &&
                  node.product.isPublished &&
                  !node.product.isArchived
            }

            if (!isCartValid) {
               setIsCartValidByProductAvailability(false)
               return
            }

            if (
               indexOf(cartItemsData?.cartItems, node) ===
               cartItemsData?.cartItems.length - 1
            ) {
               if (isCartValid) {
                  setIsCartValidByProductAvailability(true)
               }
            }
         }
      }
   }, [cartItemsData?.cartItems])

   useEffect(() => {
      if (
         !isCartLoading &&
         !isEmpty(cartData) &&
         !isEmpty(cartData.carts) &&
         oiType === 'Kiosk Ordering'
      ) {
         const cart = cartData.carts[0]
         const terminalPaymentOption = cart?.paymentMethods.find(
            option =>
               option?.supportedPaymentOption?.paymentOptionLabel === 'TERMINAL'
         )
         const codPaymentOption = cart?.paymentMethods.find(
            option =>
               option?.supportedPaymentOption?.paymentOptionLabel === 'CASH'
         )
         const terminalPaymentOptionId = !isEmpty(terminalPaymentOption)
            ? terminalPaymentOption?.id
            : null
         const codPaymentOptionId = !isEmpty(codPaymentOption)
            ? codPaymentOption?.id
            : null
         cartReducer({
            type: 'KIOSK_PAYMENT_OPTION',
            payload: [
               {
                  label: 'TERMINAL',
                  id: terminalPaymentOptionId,
               },
               {
                  label: 'COD',
                  id: codPaymentOptionId,
               },
            ],
         })
      }
   }, [cartData, isCartLoading])

   useEffect(() => {
      if (cartItemsData?.cartItems) {
         const combinedCartItems = combineCartItems(cartItemsData?.cartItems)
         console.log('combinedCartItems', combinedCartItems)
         setCombinedCartData(combinedCartItems)
      } else {
         ;(async function () {
            const localCartId = await AsyncStorage.getItem('cart-id')
            if (!localCartId && !isAuthenticated && !isLoading) {
               setCombinedCartData([])
               setIsFinalCartLoading(false)
            }
         })()
      }
   }, [cartItemsData?.cartItems, isLoading])

   const cartToolTipStopper = () => {
      setShowCartIconToolTip(false)
   }

   //create cart
   const [createCart] = useMutation(MUTATIONS.CART.CREATE, {
      onCompleted: async data => {
         if (!isAuthenticated) {
            await AsyncStorage.setItem(
               'cart-id',
               JSON.stringify(data.createCart.id)
            )
         }
         console.log('cartCreated')
         setStoredCartId(data.createCart.id)
         setIsFinalCartLoading(false)
         setShowCartIconToolTip(true)
         setTimeout(cartToolTipStopper, 6000)
      },
      onError: error => {
         console.log(error)
         setIsFinalCartLoading(false)
         //  addToast(('Failed to create cart!'), {
         //     appearance: 'error',
         //  })
      },
   })
   //update cart
   const [updateCart] = useMutation(MUTATIONS.CART.UPDATE, {
      onCompleted: data => {
         if (!(oiType === 'Kiosk Ordering')) {
            // localStorage.removeItem('cart-id')
         }
         //  addToast(('Update Successfully!'), {
         //     appearance: 'success',
         //  })
         console.log('🍾 Cart updated with data!')
         setIsFinalCartLoading(false)
      },
      onError: error => {
         console.log(error)
         setIsFinalCartLoading(false)
         //  addToast(('Failed to update items!'), {
         //     appearance: 'error',
         //  })
      },
   })

   //delete cart
   const [deleteCart] = useMutation(MUTATIONS.CART.DELETE, {
      onCompleted: async () => {
         await AsyncStorage.removeItem('cart-id')
         setStoredCartId(null)
         setIsFinalCartLoading(false)
      },
      onError: error => {
         console.log('delete cart error', error)
         setIsFinalCartLoading(false)
      },
   })

   // create cartItems
   const [createCartItems] = useMutation(CREATE_CART_ITEMS, {
      onCompleted: () => {
         console.log('items added successfully')
         setIsFinalCartLoading(false)
         setShowCartIconToolTip(true)
         setTimeout(cartToolTipStopper, 6000)
      },
      onError: error => {
         console.log(error)
         setIsFinalCartLoading(false)
         //  addToast(('Failed to create items!'), {
         //     appearance: 'error',
         //  })
      },
   })

   // delete cartItems
   const [deleteCartItems] = useMutation(DELETE_CART_ITEMS, {
      onCompleted: ({ deleteCartItems = null }) => {
         if (
            deleteCartItems &&
            deleteCartItems.returning.length &&
            deleteCartItems.returning[0].cart.cartItems_aggregate.aggregate
               .count === 0 &&
            storedCartId
         ) {
            deleteCart({
               variables: {
                  id: storedCartId,
               },
            })
         }
         setIsFinalCartLoading(false)
         if (deleteCartItems && deleteCartItems.returning.length) {
            // addToast(('Item removed!'), {
            //    appearance: 'success',
            // })
         }
      },
      onError: error => {
         console.log(error)
         setIsFinalCartLoading(false)
         //  `addToast(('Failed to delete items!'), {
         //     appearance: 'error',
         //  })`
      },
   })

   //update cartItems
   const [updateCartItems] = useMutation(UPDATE_CART_ITEMS)
   //add to cart
   const addToCart = async (cartItem, quantity) => {
      // setIsFinalCartLoading(true)
      const cartItems = new Array(quantity).fill({ ...cartItem })
      const orderTabInLocal = await AsyncStorage.getItem('orderTab')
      let customerAddressFromLocal
      switch (orderTabInLocal) {
         case 'ONDEMAND_DELIVERY':
            customerAddressFromLocal = JSON.parse(
               await AsyncStorage.getItem('userLocation')
            )
            break
         case 'PREORDER_DELIVERY':
            customerAddressFromLocal = JSON.parse(
               await AsyncStorage.getItem('userLocation')
            )
            break
         case 'PREORDER_PICKUP':
            customerAddressFromLocal = JSON.parse(
               await AsyncStorage.getItem('storeLocation')
            )
            break
         case 'ONDEMAND_PICKUP':
            customerAddressFromLocal = JSON.parse(
               await AsyncStorage.getItem('storeLocation')
            )
            break
         case 'ONDEMAND_DINEIN':
            customerAddressFromLocal = JSON.parse(
               await AsyncStorage.getItem('storeLocation')
            )
            break
         case 'SCHEDULE_DINEIN':
            customerAddressFromLocal = JSON.parse(
               await AsyncStorage.getItem('storeLocation')
            )
            break
      }

      const customerAddress = {
         line1: customerAddressFromLocal?.line1 || '',
         line2: customerAddressFromLocal?.line2 || '',
         city: customerAddressFromLocal?.city || '',
         state: customerAddressFromLocal?.state || '',
         country: customerAddressFromLocal?.country || '',
         zipcode: customerAddressFromLocal?.zipcode || '',
         notes: customerAddressFromLocal?.notes || '',
         label: customerAddressFromLocal?.label || '',
         lat:
            customerAddressFromLocal?.latitude?.toString() ||
            customerAddressFromLocal?.lat?.toString(),
         lng:
            customerAddressFromLocal?.longitude?.toString() ||
            customerAddressFromLocal?.lng?.toString(),
         landmark: customerAddressFromLocal?.landmark || '',
         searched: customerAddressFromLocal?.searched || '',
      }
      if (!isAuthenticated) {
         //without login

         if (isEmpty(cartData?.carts)) {
            console.log('cartData check for empty', cartData)
            //new cart

            // finding terminal payment method option id for setting as default
            // payment method (only for kiosk ordering)

            const object = {
               cartItems: {
                  data: cartItems,
               },
               usedOrderInterface: oiType,
               orderTabId: selectedOrderTab?.id || null,
               locationId: locationId || null,
               brandId: brand?.id,
               address: customerAddress,
               locationTableId: dineInTableInfo?.id || null,
            }
            console.log('dataToBeSend', {
               usedOrderInterface: oiType,
               orderTabId: selectedOrderTab?.id || null,
               locationId: locationId || null,
               brandId: brand?.id,
               address: customerAddress,
               locationTableId: dineInTableInfo?.id || null,
            })
            // console.log('object new cart', object)
            await createCart({
               variables: {
                  object,
               },
            })
         } else {
            //cart already exist
            const cartItemsWithCartId = new Array(quantity).fill({
               ...cartItem,
               cartId: storedCartId,
            })
            // console.log('object new cart', cartItemsWithCartId)
            await createCartItems({
               variables: {
                  objects: cartItemsWithCartId,
               },
            })
         }
      } else {
         // logged in
         if (isEmpty(cartData?.carts)) {
            console.log('Login ✔ Cart ❌')
            // new cart
            const object = {
               isTest: user.isTest,
               // to be moved to headers
               customerId: user.id,
               usedOrderInterface: oiType,
               orderTabId: selectedOrderTab?.id || null,
               locationId: locationId || null,
               paymentMethodId: user.platform_customer.defaultPaymentMethodId,
               brandId: brand.id,
               paymentCustomerId: user.platform_customer?.paymentCustomerId,
               address: user.platform_customer.defaultCustomerAddress,
               locationTableId: dineInTableInfo?.id || null,
               customerKeycloakId: user?.keycloakId,
               cartItems: {
                  data: cartItems,
               },
               ...(user.platform_customer?.firstName && {
                  customerInfo: {
                     customerFirstName: user.platform_customer?.firstName,
                     customerLastName: user.platform_customer?.lastName,
                     customerEmail: user.platform_customer.email,
                     customerPhone: user.platform_customer.phoneNumber,
                  },
               }),
               address: customerAddress,
            }
            await createCart({
               variables: {
                  object,
               },
            })
         } else {
            // update existing cart
            const cartItemsWithCartId = new Array(quantity).fill({
               ...cartItem,
               cartId: storedCartId,
            })
            await createCartItems({
               variables: {
                  objects: cartItemsWithCartId,
               },
            })
         }
      }
   }

   // get user pending cart when logging in
   const { loading: existingCartLoading, error: existingCartError } =
      useSubscription(GET_CARTS, {
         variables: {
            where: {
               paymentStatus: { _eq: 'PENDING' },
               status: { _eq: 'CART_PENDING' },
               customerKeycloakId: {
                  _eq: user?.keycloakId,
               },
               source: {
                  _neq: 'subscription',
               },
            },
         },
         skip: !(brand?.id && user?.keycloakId && orderTabs.length > 0),
         fetchPolicy: 'no-cache',
         onSubscriptionData: async ({ subscriptionData }) => {
            console.log('subscriptionData', subscriptionData)
            // pending cart available
            ;(async () => {
               if (
                  subscriptionData.data.carts &&
                  subscriptionData.data.carts.length > 0
               ) {
                  const guestCartId = JSON.parse(
                     await AsyncStorage.getItem('cart-id')
                  )
                  if (guestCartId) {
                     // delete pending cart and assign guest cart to the user
                     await updateCart({
                        variables: {
                           id: guestCartId,
                           _set: {
                              // isTest: user.isTest,
                              customerId: user.id,
                              customerKeycloakId: user.keycloakId,
                              paymentMethodId:
                                 user.platform_customer?.defaultPaymentMethodId,
                              brandId: brand.id,
                              paymentCustomerId:
                                 user.platform_customer?.paymentCustomerId,
                              ...(user.platform_customer?.firstName && {
                                 customerInfo: {
                                    customerFirstName:
                                       user.platform_customer?.firstName,
                                    customerLastName:
                                       user.platform_customer?.lastName,
                                    customerEmail:
                                       user.platform_customer?.email,
                                    customerPhone:
                                       user.platform_customer?.phoneNumber,
                                 },
                              }),
                           },
                        },
                     })
                     // delete last one
                     await deleteCart({
                        variables: {
                           id: subscriptionData.data.carts[0].id,
                        },
                     })
                     await AsyncStorage.removeItem('cart-id')
                     setStoredCartId(guestCartId)
                     setIsFinalCartLoading(false)
                  } else {
                     const addressInCart =
                        subscriptionData.data.carts[0].address
                     const addressToBeSaveInLocal = {
                        city: addressInCart.city,
                        country: addressInCart.country,
                        label: addressInCart.label,
                        landmark: addressInCart.landmark,
                        latitude: addressInCart.lat,
                        line1: addressInCart.line1,
                        line2: addressInCart.line2,
                        longitude: addressInCart.lng,
                        mainText: addressInCart.line1,
                        notes: addressInCart.notes,
                        secondaryText: `${addressInCart.city}, ${addressInCart.state} ${addressInCart.zipcode}, ${addressInCart.country}`,
                        state: addressInCart.state,
                        zipcode: addressInCart.zipcode,
                        searched: addressInCart.searched || '',
                     }
                     const orderTabForLocal =
                        subscriptionData.data.carts[0].fulfillmentInfo?.type ||
                        orderTabs.find(
                           eachOrderTab =>
                              eachOrderTab.id ===
                              subscriptionData.data.carts[0].orderTabId
                        )?.orderFulfillmentTypeLabel
                     const locationIdForLocal =
                        subscriptionData.data.carts[0].locationId
                     await AsyncStorage.setItem('orderTab', orderTabForLocal)
                     if (
                        orderTabForLocal === 'ONDEMAND_PICKUP' ||
                        orderTabForLocal === 'PREORDER_PICKUP'
                     ) {
                        await AsyncStorage.setItem(
                           'storeLocation',
                           JSON.stringify(addressToBeSaveInLocal)
                        )
                     } else if (
                        orderTabForLocal === 'PREORDER_DELIVERY' ||
                        orderTabForLocal === 'ONDEMAND_DELIVERY'
                     ) {
                        await AsyncStorage.setItem(
                           'userLocation',
                           JSON.stringify(addressToBeSaveInLocal)
                        )
                        dispatch({
                           type: 'SET_USER_LOCATION',
                           payload: addressToBeSaveInLocal,
                        })
                     }
                     await AsyncStorage.setItem(
                        'storeLocationId',
                        JSON.stringify(locationIdForLocal)
                     )
                     dispatch({
                        type: 'SET_LOCATION_ID',
                        payload: locationIdForLocal,
                     })
                     dispatch({
                        type: 'SET_SELECTED_ORDER_TAB',
                        payload: orderTabs.find(
                           eachOrderTab =>
                              eachOrderTab.id ===
                              subscriptionData.data.carts[0].orderTabId
                        ),
                     })
                     dispatch({
                        type: 'SET_STORE_STATUS',
                        payload: {
                           status: true,
                           message: 'Store available on your location.',
                           loading: false,
                        },
                     })
                     setStoredCartId(subscriptionData.data.carts[0].id)
                     await AsyncStorage.removeItem('cart-id')
                     setIsFinalCartLoading(false)
                  }
               } else {
                  // no pending cart
                  if (storedCartId) {
                     await updateCart({
                        variables: {
                           id: storedCartId,
                           _set: {
                              // isTest: user.isTest,
                              customerId: user.id,
                              customerKeycloakId: user.keycloakId,
                              paymentMethodId:
                                 user.platform_customer?.defaultPaymentMethodId,
                              brandId: brand.id,
                              paymentCustomerId:
                                 user.platform_customer?.paymentCustomerId,
                              ...(user.platform_customer?.firstName && {
                                 customerInfo: {
                                    customerFirstName:
                                       user.platform_customer?.firstName,
                                    customerLastName:
                                       user.platform_customer?.lastName,
                                    customerEmail:
                                       user.platform_customer?.email,
                                    customerPhone:
                                       user.platform_customer?.phoneNumber,
                                 },
                              }),
                           },
                        },
                     })
                     await AsyncStorage.removeItem('cart-id')
                     setIsFinalCartLoading(false)
                  } else {
                     setCombinedCartData([])
                     setIsFinalCartLoading(false)
                  }
               }
            })()
         },
      })

   return (
      <CartContext.Provider
         value={{
            cartState: {
               cart: !isEmpty(cartData?.carts) ? cartData?.carts[0] : {} || {},
               cartItems: cartItemsData?.cartItems || {},
            },
            isFinalCartLoading,
            cartReducer,
            addToCart,
            combinedCartItems,
            setStoredCartId,
            isCartLoading,
            cartItemsLoading,
            storedCartId,
            showCartIconToolTip,
            setDineInTableInfo,
            dineInTableInfo,
            methods: {
               cartItems: {
                  delete: deleteCartItems,
               },
               cart: {
                  update: updateCart,
               },
            },
            isCartValidByProductAvailability,
         }}
      >
         {children}
      </CartContext.Provider>
   )
}

export const useCart = () => useContext(CartContext)