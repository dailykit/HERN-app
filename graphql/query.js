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
