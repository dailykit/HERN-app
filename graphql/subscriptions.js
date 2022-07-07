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
export const WALLETS = gql`
   subscription Wallets($brandId: Int!, $keycloakId: String!) {
      wallets(
         where: { brandId: { _eq: $brandId }, keycloakId: { _eq: $keycloakId } }
      ) {
         id
         amount
         walletTransactions(order_by: { created_at: desc_nulls_last }) {
            id
            type
            amount
            created_at
         }
      }
   }
`

export const GET_PAYMENT_OPTIONS = gql`
   subscription cart($id: Int!) {
      cart(id: $id) {
         id
         cartOwnerBilling
         isCartValid
         availablePaymentOptionToCart(
            where: { isActive: { _eq: true } }
            order_by: { position: desc_nulls_last }
         ) {
            id
            isActive
            isDown
            isRecommended
            isValid
            label
            description
            position
            publicCreds
            showCompanyName
            supportedPaymentOption {
               id
               country
               supportedPaymentCompanyId
               paymentOptionLabel
               isLoginRequired
               canShowWhileLoggedIn
               supportedPaymentCompany {
                  id
                  label
               }
            }
         }
      }
   }
`

export const LOYALTY_POINTS = gql`
   subscription LoyaltyPoints($brandId: Int!, $keycloakId: String!) {
      loyaltyPoints(
         where: { brandId: { _eq: $brandId }, keycloakId: { _eq: $keycloakId } }
      ) {
         points
         loyaltyPointTransactions(order_by: { created_at: desc_nulls_last }) {
            id
            points
            type
            created_at
         }
      }
   }
`
export const GET_CART_PAYMENT_INFO = gql`
   subscription GET_CART_PAYMENT_INFO($where: order_cartPayment_bool_exp!) {
      cartPayments(where: $where, limit: 1, order_by: { updated_at: desc }) {
         id
         amount
         cancelAttempt
         cartId
         cart {
            customerInfo
            source
         }
         isTest
         paymentStatus
         paymentType
         metaData
         transactionRemark
         isResultShown
         stripeInvoiceId
         transactionId
         actionUrl
         actionRequired
         availablePaymentOption {
            id
            label
            supportedPaymentOption {
               paymentOptionLabel
               id
               isRequestClientBased
               isWebhookClientBased
               supportedPaymentCompany {
                  label
                  id
               }
            }
         }
      }
   }
`
export const OTPS = gql`
   subscription otps($where: platform_otp_transaction_bool_exp = {}) {
      otps: platform_otp_transaction(
         where: $where
         order_by: { created_at: desc }
      ) {
         id
         code
         isValid
         validTill
         resendAttempts
         isResendAllowed
      }
   }
`
export const COUPONS = gql`
   subscription Coupons($params: jsonb, $brandId: Int!) {
      coupons(
         where: {
            isActive: { _eq: true }
            isArchived: { _eq: false }
            brands: { brandId: { _eq: $brandId }, isActive: { _eq: true } }
         }
      ) {
         id
         code
         isRewardMulti
         rewards(order_by: { position: desc_nulls_last }) {
            id
            condition {
               isValid(args: { params: $params })
            }
         }
         metaDetails
         visibilityCondition {
            isValid(args: { params: $params })
         }
      }
   }
`
export const GET_ORDER_DETAILS = gql`
   subscription GET_ORDER_DETAILS($where: order_cart_bool_exp!) {
      carts(
         where: $where
         order_by: { order: { created_at: desc_nulls_last } }
      ) {
         id
         status
         paymentStatus
         fulfillmentInfo
         billingDetails
         cartOwnerBilling
         address
         order {
            created_at
            deliveryInfo
         }
         cartPayments {
            id
            amount
            transactionRemark
         }
         availablePaymentOption {
            label
            supportedPaymentOption {
               id
               paymentOptionLabel
            }
         }
         cartItems(where: { level: { _eq: 1 } }) {
            cartItemId: id
            parentCartItemId
            addOnLabel
            addOnPrice
            created_at
            price: unitPrice
            discount
            name: displayName
            image: displayImage
            productId
         }
      }
   }
`
export const GET_ORDER_DETAIL_ONE_SUBS = gql`
   subscription GET_ORDER_DETAIL_ONE($where: order_cart_bool_exp!) {
      carts(where: $where, order_by: { order: { created_at: desc } }) {
         id
         status
         paymentStatus
         fulfillmentInfo
         billingDetails
         cartOwnerBilling
         address
         customerInfo
         order {
            created_at
            deliveryInfo
            isAccepted
            isRejected
         }
         cartPayments {
            id
            amount
            transactionRemark
         }
         availablePaymentOption {
            label
            supportedPaymentOption {
               id
               paymentOptionLabel
            }
         }
         cartItems(where: { level: { _eq: 1 } }) {
            cartItemId: id
            parentCartItemId
            addOnLabel
            addOnPrice
            created_at
            price: unitPrice
            discount
            name: displayName
            image: displayImage
            childs {
               price: unitPrice
               name: displayName
               discount
               productOption {
                  id
                  label
               }
               childs {
                  displayName
                  price: unitPrice
                  discount
                  modifierOption {
                     id
                     name
                  }
                  childs {
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
            productId
         }
      }
   }
`
export const GET_AVAILABLE_PAYMENT_OPTIONS = gql`
   subscription availablePaymentOptions($ids: [Int!]) {
      availablePaymentOptions: brands_availablePaymentOption(
         where: { isActive: { _eq: true }, id: { _in: $ids } }
         order_by: { position: desc_nulls_last }
      ) {
         id
         isActive
         isDown
         isRecommended
         isValid
         label
         description
         position
         publicCreds
         showCompanyName
         supportedPaymentOption {
            id
            country
            supportedPaymentCompanyId
            paymentOptionLabel
            isLoginRequired
            canShowWhileLoggedIn
            supportedPaymentCompany {
               id
               label
            }
         }
      }
   }
`
export const SETTINGS_QUERY = gql`
   subscription settings($domain: String) {
      settings: brands_brand_brandSetting(
         where: { brand: { _or: [{ domain: { _eq: $domain } }] } }
      ) {
         value
         brandId
         meta: brandSetting {
            id
            type
            identifier
         }
      }
   }
`
