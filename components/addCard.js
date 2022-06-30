import React, { useEffect } from 'react'
import tw, { styled, css } from 'twin.macro'
// import { useToasts } from 'react-toast-notifications'
// import { Skeleton } from 'antd'
import axios from 'axios'
import isEmpty from 'lodash/isEmpty'
import { useMutation } from '@apollo/client'

import { CardForm } from '../CardForm'
import { usePayment } from '../lib/payment'
import { useConfig } from '../lib/config'
// import { useUser } from '../context/user'
import * as QUERIES from '../graphql'
import PayButton from './payButton'

import {
   VisaIcon,
   MaestroIcon,
   MasterCardIcon,
   DebitCardIcon,
} from '../assets/paymentIcons'

// import { AddCardTunnel } from '../AddCardTunnel'

import { get_env, formatCurrency } from '../utils'

export const AddCard = ({ cartId, balanceToPay = 0, metaData = {} }) => {
   //    const { addToast } = useToasts()
   //    const { t } = useTranslation()
   //    const { user } = useUser()
   const { configOf, brand } = useConfig()
   const { setPaymentInfo, paymentInfo } = usePayment()
   const [intent, setIntent] = React.useState(null)

   // update platform customer
   const [updatePlatformCustomer] = useMutation(
      QUERIES.UPDATE_PLATFORM_CUSTOMER,
      {
         onCompleted: ({ platform_updateCustomer }) => {
            setPaymentInfo({
               selectedAvailablePaymentOption: {
                  ...paymentInfo.selectedAvailablePaymentOption,
                  selectedPaymentMethodId:
                     platform_updateCustomer?.defaultPaymentMethodId,
               },
            })
         },
         onError: error => {
            console.log('updatePlatformCustomer -> error -> ', error)
            addToast(t('Something went wrong!'), {
               appearance: 'error',
            })
         },
      }
   )

   //    React.useEffect(() => {
   //       if (user?.platform_customer?.paymentCustomerId && isClient && !intent) {
   //          ;(async () => {
   //             const setup_intent = await createSetupIntent(
   //                user?.platform_customer?.paymentCustomerId
   //             )
   //             console.log({ setup_intent })
   //             setIntent(setup_intent)
   //          })()
   //       }
   //    }, [user])

   const toggleTunnel = value => {
      setPaymentInfo({
         tunnel: {
            isVisible: value,
         },
      })
   }

   const showPaymentBrandIcon = brand => {
      switch (brand) {
         case 'visa':
            return <VisaIcon size="32" />
         case 'mastercard':
            return <MasterCardIcon size="32" />
         case 'maestro':
            return <MaestroIcon size="32" />
         case defult:
            return <DebitCardIcon size="32" />
      }
   }
   const theme = configOf('theme-color', 'Visual')

   return (
      <>
         <header tw="my-3 pb-1 border-b flex items-center justify-between">
            <SectionTitle theme={theme}>
               {user?.platform_customer?.paymentMethods.length > 0
                  ? 'Pay using added Cards'
                  : 'Add Card'}
            </SectionTitle>
         </header>

         {user?.platform_customer?.paymentMethods.length === 0 && (
            <div tw="w-full md:w-1/2 lg:w-full">
               <Skeleton
                  active
                  loading={isEmpty(intent)}
                  paragraph={{ rows: 2, width: Array(2).fill('100%') }}
               >
                  <CardForm intent={intent} />
               </Skeleton>
            </div>
         )}
         <PaymentMethods>
            {user?.platform_customer?.paymentMethods.map(method => (
               <PaymentMethod
                  key={method.paymentMethodId}
                  onClick={event => {
                     event.stopPropagation()
                     updatePlatformCustomer({
                        variables: {
                           keycloakId: user.keycloakId,
                           _set: {
                              defaultPaymentMethodId: method.paymentMethodId,
                           },
                        },
                     })
                  }}
                  className={`${
                     paymentInfo?.selectedAvailablePaymentOption
                        ?.selectedPaymentMethodId === method.paymentMethodId &&
                     'active'
                  }`}
               >
                  <div tw="flex flex-col items-start  sm:( flex-row items-center)">
                     <div tw="flex items-center flex-1">
                        <PaymentMethodIconWrap>
                           {showPaymentBrandIcon(method?.brand)}
                        </PaymentMethodIconWrap>

                        <section tw="w-full">
                           <div tw="flex flex-col">
                              <span tw="text-base sm:(text-xl) text-gray-500 font-semibold">
                                 XXXX-XXXXXXXX-{method.last4}
                              </span>
                              <span tw="text-gray-500 text-xs sm:(text-sm) font-medium">
                                 VALID TILL {method.expMonth}/{method.expYear}
                              </span>
                           </div>
                        </section>

                        {/* <PaymentMethodIconWrap>
                        <CheckIcon
                           size={24}
                           css={[
                              tw`stroke-current`,
                              paymentInfo?.selectedAvailablePaymentOption
                                 ?.selectedPaymentMethodId ===
                              method.paymentMethodId
                                 ? tw`text-blue-700`
                                 : tw`text-gray-400`,
                           ]}
                        />
                     </PaymentMethodIconWrap> */}
                     </div>
                     {paymentInfo?.selectedAvailablePaymentOption
                        ?.selectedPaymentMethodId ===
                        method.paymentMethodId && (
                        <PayButton
                           bg="#38a169"
                           className="payButton"
                           cartId={cartId}
                           fullWidthSkeleton={false}
                           balanceToPay={balanceToPay}
                           metaData={metaData}
                        >
                           Pay Now {formatCurrency(balanceToPay)}
                        </PayButton>
                     )}
                  </div>
               </PaymentMethod>
            ))}
         </PaymentMethods>

         {paymentInfo.tunnel.isVisible && <AddCardTunnel />}
      </>
   )
}

const PaymentMethods = styled.ul`
   ${tw`
   flex
   flex-col
   gap-4
   max-height[260px]
   overflow-y-auto
`}
   grid-auto-rows: minmax(120px, auto);
`

const SectionTitle = styled.h3(
   ({ theme }) => css`
      ${tw`text-green-600 text-lg`}
      ${theme?.accent && `color: ${theme.accent}`}
   `
)

const PaymentMethod = styled.li`
   ${tw`flex flex-col border text-gray-700 rounded hover:(border-2 border-color[#38a169])
   p-4`}
   > aside {
      width: 48px;
      ${tw`flex justify-center h-full`}
   }
   &.active {
      ${tw`border-2 border-color[#38a169]`}
      svg {
         ${tw`color[#38a169] `}
      }
   }
   :hover {
      svg {
         ${tw`color[#38a169]`}
      }
   }
   .payButton {
      ${tw`w-full sm:w-auto`}
   }
`

const PaymentMethodIconWrap = styled.aside(
   () => css`
      width: 48px;
      height: 48px;
      ${tw`h-full mr-2 flex flex-shrink-0 items-center justify-center`}
   `
)

const Button = styled.button(
   () => css`
      ${tw`bg-green-600 rounded text-white px-4 h-10 hover:bg-green-700`}
   `
)

const OutlineButton = styled(Button)`
   ${tw`bg-transparent color[#38a169]   hover:(border-color[#38a169]  bg-white)`}
`
const createSetupIntent = async customer => {
   try {
      console.log({ customer })
      const origin = isClient ? get_env('BASE_BRAND_URL') : ''
      const url = `${origin}/server/api/payment/setup-intent`
      const { data } = await axios.post(url, {
         customer,
      })
      console.log({ data: data.data })
      return data.data
   } catch (error) {
      return error
   }
}
