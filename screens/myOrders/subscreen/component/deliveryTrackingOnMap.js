import React from 'react'
import { Image, View } from 'react-native'
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps'
import MapViewDirections from 'react-native-maps-directions'
import { get_env } from '../../../../utils/get_env'
import appConfig from '../../../../brandConfig.json'
import { isEmpty, isNull } from 'lodash'

export const MapTracking = ({ deliveryInfo }) => {
   if (isNull(deliveryInfo) || isEmpty(deliveryInfo)) {
      return null
   }
   const coordinates = React.useMemo(() => {
      return {
         driver: {
            center: {
               latitude: +deliveryInfo.tracking.location.latitude,
               longitude: +deliveryInfo.tracking.location.longitude,
            },
            pitch: 1,
            heading: 1,
            altitude: 3,
            zoom: 16,
         },
         customer: {
            latitude:
               +deliveryInfo.dropoff.dropoffInfo.customerAddress.latitude,
            longitude:
               +deliveryInfo.dropoff.dropoffInfo.customerAddress.longitude,
         },
         organization: {
            latitude:
               +deliveryInfo.pickup.pickupInfo.organizationAddress.latitude,
            longitude:
               +deliveryInfo.pickup.pickupInfo.organizationAddress.longitude,
         },
      }
   }, [
      deliveryInfo.tracking.location.latitude,
      deliveryInfo.tracking.location.longitude,
      deliveryInfo.dropoff.dropoffInfo.customerAddress.lat,
      deliveryInfo.dropoff.dropoffInfo.customerAddress.lng,
      deliveryInfo.pickup.pickupInfo.organizationAddress.lat,
      deliveryInfo.pickup.pickupInfo.organizationAddress.lng,
   ])
   return (
      <View style={{ height: 300, width: '100%' }}>
         <MapView
            style={{ flex: 1 }}
            provider={PROVIDER_GOOGLE}
            camera={coordinates.driver}
         >
            <MapViewDirections
               origin={coordinates.organization}
               destination={coordinates.customer}
               apikey={get_env('GOOGLE_API_KEY')}
               optimizeWaypoints={true}
               strokeWidth={2}
               strokeColor={appConfig.brandSettings.brandColor.value}
            />
            <Marker coordinate={coordinates.driver.center}>
               <Image
                  source={{
                     uri: 'https://dailykit-133-test.s3.us-east-2.amazonaws.com/icons/driver.png',
                     width: 41,
                     height: 52,
                  }}
               />
            </Marker>
            <Marker coordinate={coordinates.customer}>
               <Image
                  source={{
                     uri: 'https://dailykit-133-test.s3.us-east-2.amazonaws.com/icons/home.png',
                     width: 41,
                     height: 52,
                  }}
               />
            </Marker>
            <Marker coordinate={coordinates.organization}>
               <Image
                  source={{
                     uri: 'https://dailykit-133-test.s3.us-east-2.amazonaws.com/icons/store.png',
                     width: 41,
                     height: 52,
                  }}
               />
            </Marker>
         </MapView>
      </View>
   )
}
