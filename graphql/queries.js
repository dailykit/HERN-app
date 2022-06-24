import { gql } from '@apollo/client'

export const GET_BRAND_LOCATION = gql`
   query GET_BRAND_LOCATION($where: brands_brand_location_bool_exp!) {
      brandLocations: brands_brand_location(where: $where) {
         id
         brandId
         location {
            id
            locationAddress
            label
            zipcode
            city
            state
            lat
            lng
            country
         }
      }
   }
`
export const ORDER_TAB = gql`
   query ORDER_TAB($where: brands_orderTab_bool_exp!) {
      brands_orderTab(where: $where) {
         id
         orderFulfillmentTypeLabel
         label
         orderType
         availableOrderInterfaceLabel
      }
   }
`
export const SETTINGS_QUERY = gql`
   query settings($domain: String) {
      settings: brands_brand_brandSetting(
         where: {
            brand: {
               _or: [{ domain: { _eq: $domain } }, { isDefault: { _eq: true } }]
            }
         }
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
export const GET_ALL_RECURRENCES = gql`
   query GET_ALL_RECURRENCES($where: fulfilment_brand_recurrence_bool_exp!) {
      brandRecurrences(where: $where) {
         brandId
         brandLocationId
         recurrenceId
         recurrence {
            id
            rrule
            type
            timeSlots {
               from
               to
               pickUpPrepTime
               id
               pickUpLeadTime
               slotInterval
               mileRanges {
                  id
                  from
                  city
                  distanceType
                  to
                  zipcodes
                  state
                  prepTime
                  geoBoundary
                  isExcluded
                  leadTime
               }
            }
         }
      }
   }
`
export const PRODUCT_ONE = gql`
   query Product($id: Int!, $params: jsonb!) {
      product(id: $id) {
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
            additionalModifiers(where: { isActive: { _eq: true } }) {
               type
               label
               linkedToModifierCategoryOptionId
               productOptionId
               modifierId
               modifier {
                  id
                  name
                  categories(
                     where: { isVisible: { _eq: true } }
                     order_by: { position: desc_nulls_last }
                  ) {
                     id
                     name
                     isRequired
                     type
                     limits
                     options(
                        where: { isVisible: { _eq: true } }
                        order_by: { position: desc_nulls_last }
                     ) {
                        id
                        name
                        price: priceByLocation(args: { params: $params })
                        discount: discountByLocation(args: { params: $params })
                        quantity
                        image
                        isActive
                        additionalModifierTemplateId
                        isAdditionalModifierRequired
                        additionalModifierTemplate {
                           id
                           name
                           categories(
                              where: { isVisible: { _eq: true } }
                              order_by: { position: desc_nulls_last }
                           ) {
                              id
                              name
                              isRequired
                              type
                              limits
                              options(
                                 where: { isVisible: { _eq: true } }
                                 order_by: { position: desc_nulls_last }
                              ) {
                                 id
                                 name
                                 price: priceByLocation(
                                    args: { params: $params }
                                 )
                                 discount: discountByLocation(
                                    args: { params: $params }
                                 )
                                 quantity
                                 image
                                 isActive
                                 additionalModifierTemplateId
                                 isAdditionalModifierRequired
                                 sachetItemId
                                 ingredientSachetId
                                 cartItem: cartItemByLocation(
                                    args: { params: $params }
                                 )
                              }
                           }
                        }
                        sachetItemId
                        ingredientSachetId
                        cartItem: cartItemByLocation(args: { params: $params })
                     }
                  }
               }
            }
            modifier {
               id
               name
               categories(
                  where: { isVisible: { _eq: true } }
                  order_by: { position: desc_nulls_last }
               ) {
                  id
                  name
                  isRequired
                  type
                  limits
                  options(
                     where: { isVisible: { _eq: true } }
                     order_by: { position: desc_nulls_last }
                  ) {
                     id
                     name
                     price: priceByLocation(args: { params: $params })
                     discount: discountByLocation(args: { params: $params })
                     quantity
                     image
                     isActive
                     additionalModifierTemplateId
                     isAdditionalModifierRequired
                     sachetItemId
                     ingredientSachetId
                     cartItem: cartItemByLocation(args: { params: $params })
                     additionalModifierTemplate {
                        id
                        name
                        categories(
                           where: { isVisible: { _eq: true } }
                           order_by: { position: desc_nulls_last }
                        ) {
                           id
                           name
                           isRequired
                           type
                           limits
                           options(
                              where: { isVisible: { _eq: true } }
                              order_by: { position: desc_nulls_last }
                           ) {
                              id
                              name
                              price: priceByLocation(args: { params: $params })
                              discount: discountByLocation(
                                 args: { params: $params }
                              )
                              quantity
                              image
                              isActive
                              additionalModifierTemplateId
                              isAdditionalModifierRequired
                              sachetItemId
                              ingredientSachetId
                              cartItem: cartItemByLocation(
                                 args: { params: $params }
                              )
                           }
                        }
                     }
                  }
               }
            }
         }
      }
   }
`
export const PRODUCTS_QUERY = gql`
   query Products($ids: [Int!]!, $params: jsonb!) {
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
export const PLATFORM_CUSTOMERS = gql`
   query customers($where: platform_customer_bool_exp = {}) {
      customers: platform_customer(where: $where) {
         email
         password
         fullName
         id: keycloakId
      }
   }
`
export const CUSTOMER = {
   DETAILS: gql`
      subscription customer($keycloakId: String!, $brandId: Int!) {
         customer(keycloakId: $keycloakId) {
            id
            keycloakId
            isSubscriber
            isTest
            carts(
               where: {
                  source: { _eq: "subscription" }
                  brandId: { _eq: $brandId }
               }
            ) {
               id
               paymentStatus
               subscriptionOccurence {
                  fulfillmentDate
               }
            }
            brandCustomers(where: { brandId: { _eq: $brandId } }) {
               id
               isDemo
               brandId
               keycloakId
               isSubscriber
               isSubscriptionCancelled
               pausePeriod
               subscriptionId
               subscriptionAddressId
               subscriptionPaymentMethodId
               subscriptionOnboardStatus
               subscription {
                  recipes: subscriptionItemCount {
                     count
                     price
                     tax
                     isTaxIncluded
                     servingId: subscriptionServingId
                     serving: subscriptionServing {
                        size: servingSize
                     }
                  }
               }
            }
            platform_customer: platform_customer {
               email
               firstName
               lastName
               keycloakId
               phoneNumber
               paymentCustomerId
               defaultPaymentMethodId
               fullName
               addresses: customerAddresses(order_by: { created_at: desc }) {
                  id
                  lat
                  lng
                  line1
                  line2
                  city
                  state
                  country
                  zipcode
                  label
                  notes
               }
               paymentMethods: customerPaymentMethods {
                  brand
                  last4
                  country
                  expMonth
                  expYear
                  funding
                  keycloakId
                  cardHolderName
                  paymentMethodId
                  paymentCustomerId
                  supportedPaymentOptionId
               }
            }
         }
      }
   `,
   DETAILS_QUERY: gql`
      query customer($keycloakId: String!, $brandId: Int!) {
         customer(keycloakId: $keycloakId) {
            id
            keycloakId
            isSubscriber
            isTest
            carts {
               id
               paymentStatus
               subscriptionOccurence {
                  fulfillmentDate
               }
            }
            brandCustomers(where: { brandId: { _eq: $brandId } }) {
               id
               isDemo
               brandId
               keycloakId
               isSubscriber
               isSubscriptionCancelled
               pausePeriod
               subscriptionId
               subscriptionAddressId
               subscriptionPaymentMethodId
               subscriptionOnboardStatus
               subscription {
                  recipes: subscriptionItemCount {
                     count
                     price
                     tax
                     isTaxIncluded
                     servingId: subscriptionServingId
                     serving: subscriptionServing {
                        size: servingSize
                     }
                  }
               }
            }
            platform_customer: platform_customer {
               email
               firstName
               lastName
               keycloakId
               phoneNumber
               paymentCustomerId
               addresses: customerAddresses(order_by: { created_at: desc }) {
                  id
                  lat
                  lng
                  line1
                  line2
                  city
                  state
                  country
                  zipcode
                  label
                  notes
               }
               paymentMethods: customerPaymentMethods {
                  brand
                  last4
                  country
                  expMonth
                  expYear
                  funding
                  keycloakId
                  cardHolderName
                  paymentMethodId
               }
            }
         }
      }
   `,
   WITH_BRAND: gql`
      query customers(
         $where: crm_customer_bool_exp = {}
         $brandId: Int_comparison_exp = {}
      ) {
         customers(where: $where) {
            id
            brandCustomers(where: { brandId: $brandId }) {
               id
               subscriptionOnboardStatus
            }
         }
      }
   `,
}
export const CUSTOMER_REFERRALS = gql`
   subscription CustomerReferrals($brandId: Int!, $keycloakId: String!) {
      customerReferrals(
         where: { brandId: { _eq: $brandId }, keycloakId: { _eq: $keycloakId } }
      ) {
         id
         referralCode
         referredByCode
      }
   }
`
