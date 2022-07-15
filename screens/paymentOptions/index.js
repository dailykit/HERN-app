import PaymentOptionsRenderer from '../../components/paymentOptionRenderer'
import { useCart } from '../../context/cart'
import { PaymentOptionsHeader } from './paymentOptionsHeader'
import { View, Text } from 'react-native'
import isEmpty from 'lodash/isEmpty'
import { SafeAreaView } from 'react-native-safe-area-context'
import global from '../../globalStyles'

const PaymentOptions = () => {
   const { cartState } = useCart()
   if (!isEmpty(cartState?.cart)) {
      return (
         <SafeAreaView>
            <PaymentOptionsHeader
               totalToPay={cartState?.cart?.cartOwnerBilling?.totalToPay}
            />
            <PaymentOptionsRenderer
               cartId={cartState?.cart?.id}
               amount={cartState?.cart?.cartOwnerBilling?.totalToPay}
            />
         </SafeAreaView>
      )
   } else {
      return (
         <SafeAreaView>
            <Text style={{ fontFamily: global.medium }}>
               Redirect to Order Tracking Screen
            </Text>
         </SafeAreaView>
      )
   }
}

export default PaymentOptions
