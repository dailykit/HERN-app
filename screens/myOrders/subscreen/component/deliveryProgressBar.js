import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import StepIndicator from 'react-native-step-indicator'
import { PickupIcon } from '../../../../assets/pickup'
import { DropOffIcon } from '../../../../assets/dropoff'
import { DeliveredIcon } from '../../../../assets/deliveredIcon'
import { PendingIcon } from '../../../../assets/pendingIcon'
import { UnderProcessingIcon } from '../../../../assets/underProcessingIcon'
import { DispatchIcon } from '../../../../assets/dispatchIcon'
import appConfig from '../../../../brandConfig.json'
import { isEmpty } from 'lodash'
import { PhoneIcon } from '../../../../assets/phoneIcon'
import { ProfileIcon } from '../../../../assets/profileIcon'
import moment from 'moment'

export const DeliveryProgressBar = ({ orderStatus, deliveryInfo }) => {
   const customStyles = React.useMemo(
      () => ({
         stepIndicatorSize: 30,
         currentStepIndicatorSize: 35,
         separatorStrokeWidth: 2,
         currentStepStrokeWidth: 0,
         stepStrokeCurrentColor: appConfig.brandSettings.brandColor.value,
         stepStrokeWidth: 0,
         stepStrokeFinishedColor: appConfig.brandSettings.brandColor.value,
         stepStrokeUnFinishedColor: '#aaaaaa',
         separatorFinishedColor: appConfig.brandSettings.brandColor.value,
         separatorUnFinishedColor: '#aaaaaa',
         stepIndicatorFinishedColor: appConfig.brandSettings.brandColor.value,
         stepIndicatorUnFinishedColor: '#a2a2a2',
         stepIndicatorCurrentColor: '#a2a2a2',
         stepIndicatorLabelFontSize: 13,
         currentStepIndicatorLabelFontSize: 13,
         stepIndicatorLabelCurrentColor:
            appConfig.brandSettings.brandColor.value,
         stepIndicatorLabelFinishedColor: '#ffffff',
         stepIndicatorLabelUnFinishedColor: '#aaaaaa',
         labelColor: '#999999',
         labelSize: 13,
         currentStepLabelColor: appConfig.brandSettings.brandColor.value,
         labelAlign: 'flex-start',
      }),
      []
   )

   const orderStatusArr = React.useMemo(
      () => [
         {
            id: 1,
            label: 'Order Pending',
            step: 'ORDER_PENDING',
            icon: PendingIcon,
            showDetails: false,
         },
         {
            id: 2,
            label: 'Order Under Processing',
            step: 'ORDER_UNDER_PROCESSING',
            icon: UnderProcessingIcon,
            showDetails: false,
         },
         {
            id: 3,
            label: 'Order Ready To Dispatch',
            step: 'ORDER_READY_TO_DISPATCH',
            icon: DispatchIcon,
            showDetails: false,
         },
         {
            id: 4,
            label: 'Order Pickup',
            step: 'order-picked-up',
            icon: PickupIcon,
            showDetails: true,
            status: deliveryInfo.pickup?.status?.value,
            time: deliveryInfo.pickup?.status?.timeStamp,
            details: {
               name: deliveryInfo.pickup?.pickupInfo?.organizationName,
               phone: deliveryInfo.pickup?.pickupInfo?.organizationPhone,
               assignedName: `${
                  deliveryInfo.assigned?.driverInfo?.driverFirstName
               } ${deliveryInfo.assigned?.driverInfo?.driverLastName || ''}`,
               assignedPhone: deliveryInfo.assigned?.driverInfo?.driverPhone,
            },
            address: deliveryInfo.pickup?.pickupInfo?.organizationAddress, //define the address of the pickup location or store
            tailHeight: 120,
         },
         {
            id: 5,
            label: 'Order Drop Off',
            step: 'order-drop-off',
            icon: DropOffIcon,
            showDetails: true,
            status: deliveryInfo.dropoff?.status?.value,
            time: deliveryInfo.dropoff?.status?.timeStamp,
            details: {
               name:
                  deliveryInfo.dropoff?.dropoffInfo?.customerFirstName +
                  ' ' +
                  deliveryInfo.dropoff?.dropoffInfo?.customerLastName,
               phone: deliveryInfo.dropoff?.dropoffInfo?.customerPhone,
            },
            address: deliveryInfo.dropoff?.dropoffInfo?.customerAddress, // define customer address
            tailHeight: 120,
         },
         {
            id: 6,
            label: 'Order Delivered',
            step: 'order-delivered',
            icon: DeliveredIcon,
            showDetails: true,
            status: deliveryInfo.dropoff?.status?.value,
            time: deliveryInfo.dropoff?.status?.timeStamp,
            tail: false,
            tailHeight: 0,
            details: {
               name: 'Order has been delivered',
            },
         },
      ],
      [deliveryInfo]
   )

   const currentPosition = React.useMemo(() => {
      if (!isEmpty(deliveryInfo)) {
         if (deliveryInfo.pickup.status.value !== 'SUCCEEDED') {
            return 4
         } else if (deliveryInfo.dropoff.status.value === 'WAITING') {
            return 5
         } else if (deliveryInfo.dropoff.status.value === 'SUCCEEDED') {
            return 6
         }
      } else {
         switch (orderStatus) {
            case 'ORDER_PENDING':
               return 1
            case 'ORDER_UNDER_PROCESSING':
               return 2
            case 'ORDER_READY_TO_DISPATCH':
               return 3
            default:
               return 3
         }
      }
   }, [orderStatus, deliveryInfo])

   return (
      <View style={{ flex: 1 }}>
         <View style={{ height: 330 }}>
            <StepIndicator
               customStyles={customStyles}
               currentPosition={currentPosition}
               labels={orderStatusArr.map((eachOrderStatus, index) => {
                  return (
                     <StepLabel
                        eachOrderStatus={eachOrderStatus}
                        isActive={index < currentPosition}
                        deliveryInfo={deliveryInfo}
                     />
                  )
               })}
               direction="vertical"
               stepCount={6}
               renderStepIndicator={({ position }) => {
                  const { icon: Icon } = orderStatusArr[position]
                  return <Icon />
               }}
            />
         </View>
      </View>
   )
}
const StepLabel = ({ eachOrderStatus, isActive, deliveryInfo }) => {
   return (
      <View key={eachOrderStatus.step}>
         <Text>{eachOrderStatus.label}</Text>
         {!isEmpty(deliveryInfo) &&
         eachOrderStatus.step == 'ORDER_READY_TO_DISPATCH' ? (
            <View
               style={{
                  flexDirection: 'row',
                  alignItems: 'center',
               }}
            >
               <TimeIcon />
               <Text
                  style={[
                     styles.time,
                     {
                        color: isActive ? '#00000080' : '#00000025',
                     },
                  ]}
               >
                  {moment(deliveryInfo.deliveryRequest.status.timeStamp).format(
                     'DD MMM YY hh:mm a'
                  )}
               </Text>
            </View>
         ) : null}
         {eachOrderStatus.showDetails && isActive ? (
            <View>
               <View
                  style={{
                     flexDirection: 'row',
                     alignItems: 'center',
                  }}
               >
                  <TimeIcon />
                  <Text
                     style={[
                        styles.time,
                        {
                           color: '#00000080',
                        },
                     ]}
                  >
                     {moment(eachOrderStatus.time).format('DD MMM YY hh:mm a')}
                  </Text>
               </View>
               {eachOrderStatus.step === 'order-picked-up' ? (
                  <View style={{ flexDirection: 'row' }}>
                     <View
                        style={{
                           flexDirection: 'row',
                           alignItems: 'center',
                        }}
                     >
                        <ProfileIcon size={10} />
                        <Text style={styles.assignedName}>
                           {eachOrderStatus.details.assignedName}
                        </Text>
                     </View>
                     <View
                        style={{
                           flexDirection: 'row',
                           alignItems: 'center',
                           marginLeft: 15,
                        }}
                     >
                        <PhoneIcon fill={'#00000060'} />
                        <Text style={styles.assignedPhone}>
                           {eachOrderStatus.details.assignedPhone}
                        </Text>
                     </View>
                  </View>
               ) : null}
            </View>
         ) : null}
      </View>
   )
}

const styles = StyleSheet.create({
   assignedName: {
      color: '#00000080',
      marginLeft: 8,
   },
   assignedPhone: {
      color: '#00000060',
      marginLeft: 8,
   },
   time: {
      fontStyle: 'italic',
      fontSize: 10,
      marginLeft: 4,
   },
})
