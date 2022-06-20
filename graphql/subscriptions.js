import { gql } from '@apollo/client'

export const PRODUCTS_BY_CATEGORY = gql`
   subscription PRODUCTS_BY_CATEGORY($params: jsonb!) {
      onDemand_getMenuV2copy(args: { params: $params }) {
         data
         id
      }
   }
`
export const PRODUCTS = gql`
   subscription Products($ids: [Int!]!, $params: jsonb!) {
      products(where: { isArchived: { _eq: false }, id: { _in: $ids } }) {
         id
         name
         type
         assets
         tags
         VegNonVegType
         additionalText
         description
         price: priceByLocation(args: { params: $params })
         discount: discountByLocation(args: { params: $params })
         isPopupAllowed
         isPublished: publishedByLocation(args: { params: $params })
         isAvailable: availabilityByLocation(args: { params: $params })
         defaultProductOptionId
         defaultCartItem: defaultCartItemByLocation(args: { params: $params })
         productionOptionSelectionStatement
         subCategory
         productOptions(
            where: { isArchived: { _eq: false } }
            order_by: { position: desc_nulls_last }
         ) {
            id
            position
            type
            label
            price: priceByLocation(args: { params: $params })
            discount: discountByLocation(args: { params: $params })
            cartItem: cartItemByLocation(args: { params: $params })
            isPublished: publishedByLocation(args: { params: $params })
            isAvailable: availabilityByLocation(args: { params: $params })
         }
      }
   }
`

export const GET_CART = gql`
   subscription cart($where: order_cart_bool_exp!) {
      carts(where: $where) {
         id
         status
         tax
         source
         orderId
         discount
         itemTotal
         totalPrice
         customerId
         customerInfo
         paymentStatus
         deliveryPrice
         fulfillmentInfo
         paymentMethodId
         walletAmountUsed
         loyaltyPointsUsed
         walletAmountUsable
         locationId
         loyaltyPointsUsable
         customerKeycloakId
         cartOwnerBilling
         billing: billingDetails
         subscriptionOccurenceId
         toUseAvailablePaymentOptionId
         posistOrderStatus
         posistOrderResponse
         locationTableId
         locationTable {
            internalTableLabel
            id
            seatCover
         }
         subscriptionOccurence {
            id
            fulfillmentDate
         }
         address
         fulfillmentInfo
         cartItems_aggregate(where: { level: { _eq: 1 } }) {
            aggregate {
               count
            }
         }
         paymentMethods: availablePaymentOptionToCart(
            where: { isActive: { _eq: true } }
            order_by: { position: desc_nulls_last }
         ) {
            id
            isActive
            isDown
            isRecommended
            isValid
            label
            position
            publicCreds
            showCompanyName
            supportedPaymentOption {
               id
               country
               supportedPaymentCompanyId
               paymentOptionLabel
               supportedPaymentCompany {
                  id
                  label
               }
            }
         }
      }
   }
`

export const GET_CARTS = gql`
   subscription GET_CARTS($where: order_cart_bool_exp!) {
      carts(where: $where) {
         id
         address
         fulfillmentInfo
         locationId
         orderTabId
      }
   }
`
export const GET_CART_ITEMS_BY_CART = gql`
   subscription GET_CART_ITEMS_BY_CART(
      $where: order_cartItem_bool_exp!
      $params: jsonb!
   ) {
      cartItems(where: $where) {
         cartItemId: id
         parentCartItemId
         addOnLabel
         addOnPrice
         created_at
         price: unitPrice
         discount
         name: displayName
         image: displayImage
         childs(where: { ingredientId: { _is_null: true } }) {
            price: unitPrice
            name: displayName
            discount
            productOption {
               id
               label
            }
            childs(where: { ingredientId: { _is_null: true } }) {
               displayName
               price: unitPrice
               discount
               modifierOption {
                  id
                  name
               }
               childs(where: { ingredientId: { _is_null: true } }) {
                  displayName
                  price: unitPrice
                  discount
                  modifierOption {
                     id
                     name
                  }
               }
            }
         }
         product {
            isPublished: publishedByLocation(args: { params: $params })
            isAvailable: availabilityByLocation(args: { params: $params })
            isArchived
            productOptions {
               isPublished: publishedByLocation(args: { params: $params })
               isAvailable: availabilityByLocation(args: { params: $params })
               isArchived
               id
            }
         }
         productId
      }
   }
`
