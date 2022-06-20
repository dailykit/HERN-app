import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

export const LeftArrow = ({ size = 25, fill = '#ffffff' }) => (
   <Svg
      width={size}
      height={size}
      viewBox="0 0 24 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
   >
      <Path
         d="M10.9741 17.6436L6.71551 13.3849H19.0783V12.4474H6.71551L10.9741 8.18879L10.3112 7.52588L4.9209 12.9162L10.3112 18.3065L10.9741 17.6436Z"
         fill={fill}
      />
   </Svg>
)
