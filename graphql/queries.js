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
