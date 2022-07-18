import PaymentOptionsRenderer from '../../components/paymentOptionRenderer'
import { useCart } from '../../context/cart'
import { PaymentOptionsHeader } from './paymentOptionsHeader'
import { View, Text } from 'react-native'
import isEmpty from 'lodash/isEmpty'
import { SafeAreaView } from 'react-native-safe-area-context'
import useGlobalStyle from '../../globalStyle'

const PaymentOptions = () => {
   const { cartState } = useCart()
   const { globalStyle } = useGlobalStyle()
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
            <Text style={{ fontFamily: globalStyle.font.medium }}>
               Redirect to Order Tracking Screen
            </Text>
         </SafeAreaView>
      )
   }
}

export default PaymentOptions
