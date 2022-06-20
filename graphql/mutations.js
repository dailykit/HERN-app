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
