import React, { useEffect, useRef, useState } from 'react'
import { View, Text } from 'react-native'

export const CardsLoader = ({ numberOfCards = 3 }) => {
   const cardsLoader = []

   for (var i = 0; i < numberOfCards; i++) {
      cardsLoader.push(
         <View
            key={`card-skeleton-${i}`}
            style={[
               styles.card,
               {
                  backgroundColor: `hsl(0, 4%, 85%)`,
               },
            ]}
         ></View>
      )
   }
   return <View style={styles.cardsContainer}>{cardsLoader}</View>
}

const styles = {
   cardsContainer: {
      display: 'flex',
      justifyContent: 'center',
   },
   card: {
      marginVertical: 10,
      marginHorizontal: 12,
      height: 37,
      borderRadius: 8,
   },
}
