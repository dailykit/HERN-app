import PaymentOptionsRenderer from '../../components/paymentOptionRenderer'
import { useCart } from '../../context/cart'
import { PaymentOptionsHeader } from './paymentOptionsHeader'

const PaymentOptions = () => {
   const { cartState } = useCart()
   return (
      <>
         <PaymentOptionsHeader
            totalToPay={cartState.cart.cartOwnerBilling.totalToPay}
         />
         <PaymentOptionsRenderer
            cartId={cartState.cart.id}
            amount={cartState.cart.cartOwnerBilling.totalToPay}
         />
      </>
   )
}

export default PaymentOptions
