import { gql } from '@apollo/client'

export const MUTATIONS = {
   CART: {
      CREATE: gql`
         mutation createCart($object: order_cart_insert_input!) {
            createCart(object: $object) {
               id
            }
         }
      `,
      UPDATE: gql`
         mutation updateCart(
            $id: Int!
            $_set: order_cart_set_input!
            $_inc: order_cart_inc_input = {}
         ) {
            updateCart(pk_columns: { id: $id }, _set: $_set, _inc: $_inc) {
               id
               itemTotal
               tax
               deliveryPrice
               discount
               totalPrice
            }
         }
      `,
      UPSERT: gql`
         mutation upsertCart(
            $object: order_cart_insert_input!
            $on_conflict: order_cart_on_conflict!
         ) {
            upsertCart: createCart(object: $object, on_conflict: $on_conflict) {
               id
            }
         }
      `,
      DELETE: gql`
         mutation deleteCart($id: Int!) {
            deleteCart(id: $id) {
               id
            }
         }
      `,
   },
   CUSTOMER: {
      UPDATE: gql`
         mutation updateCustomer(
            $keycloakId: String!
            $_set: crm_customer_set_input!
         ) {
            updateCustomer(
               pk_columns: { keycloakId: $keycloakId }
               _set: $_set
            ) {
               id
            }
         }
      `,
      CREATE: gql`
         mutation createCustomer($object: crm_customer_insert_input!) {
            createCustomer(object: $object) {
               id
               keycloakId
            }
         }
      `,
      ADDRESS: {
         CREATE: gql`
            mutation createCustomerAddress(
               $object: platform_customerAddress_insert_input!
            ) {
               createCustomerAddress: insert_platform_customerAddress_one(
                  object: $object
               ) {
                  id
               }
            }
         `,
      },
   },
}
export const CREATE_CART_ITEMS = gql`
   mutation CREATE_CART_ITEMS($objects: [order_cartItem_insert_input!]!) {
      createCartItems(objects: $objects) {
         returning {
            id
         }
      }
   }
`
export const DELETE_CART_ITEMS = gql`
   mutation DELETE_CART_ITEMS($where: order_cartItem_bool_exp!) {
      deleteCartItems(where: $where) {
         returning {
            id
            cart {
               id
               cartItems_aggregate {
                  aggregate {
                     count
                  }
               }
            }
         }
      }
   }
`
export const UPDATE_CART_ITEMS = gql`
   mutation UPDATE_CART_ITEMS(
      $where: order_cartItem_bool_exp!
      $_set: order_cartItem_set_input!
   ) {
      updateCartItems(where: $where, _set: $_set) {
         affected_rows
      }
   }
`
export const INSERT_OTP_TRANSACTION = gql`
   mutation insertOtp($object: platform_otp_transaction_insert_input!) {
      insertOtp: insert_platform_otp_transaction_one(object: $object) {
         id
      }
   }
`
export const UPDATE_BRAND_CUSTOMER = gql`
   mutation updateBrandCustomer(
      $id: Int!
      $_set: crm_brand_customer_set_input = {}
   ) {
      updateBrandCustomer(pk_columns: { id: $id }, _set: $_set) {
         id
         subscriptionOnboardStatus
      }
   }
`
export const RESEND_OTP = gql`
   mutation resend($id: uuid!) {
      resend: update_platform_otp_transaction_by_pk(
         pk_columns: { id: $id }
         _inc: { resendAttempts: 1 }
      ) {
         id
      }
   }
`
