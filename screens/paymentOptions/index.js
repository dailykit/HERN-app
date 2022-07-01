import PaymentOptionsRenderer from '../../components/paymentOptionRenderer'
import { useCart } from '../../context/cart'
import { PaymentOptionsHeader } from './paymentOptionsHeader'
import { View, Text } from 'react-native'
import isEmpty from 'lodash/isEmpty'

const PaymentOptions = () => {
   const { cartState } = useCart()
   if (!isEmpty(cartState?.cart)) {
      return (
         <>
            <PaymentOptionsHeader
               totalToPay={cartState?.cart?.cartOwnerBilling?.totalToPay}
            />
            <PaymentOptionsRenderer
               cartId={cartState?.cart?.id}
               amount={cartState?.cart?.cartOwnerBilling?.totalToPay}
            />
         </>
      )
   } else {
      return (
         <View>
            <Text>Redirect to Order Tracking Screen</Text>
         </View>
      )
   }
}

export default PaymentOptions
