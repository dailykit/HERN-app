import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

export const TimeIcon = ({ size = 10, stroke = '#000000' }) => (
   <Svg
      width={size}
      height={size}
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
   >
      <Path
         d="M4.78027 3.50021V4.80615C4.78027 5.0823 5.00413 5.30615 5.28027 5.30615H6.35571M8.78027 5.30615C8.78027 7.51529 6.98941 9.30615 4.78027 9.30615C2.57113 9.30615 0.780273 7.51529 0.780273 5.30615C0.780273 3.09701 2.57113 1.30615 4.78027 1.30615C6.98941 1.30615 8.78027 3.09701 8.78027 5.30615Z"
         stroke={stroke}
         strokeOpacity={0.25}
         strokeWidth={0.8}
         strokeLinecap="round"
         strokeLinejoin="bevel"
      />
   </Svg>
)
