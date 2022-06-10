import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

export const VegNonVegIcon = ({ size = 12, fill = '#61D836' }) => (
   <Svg
      width={12}
      height={12}
      viewBox="0 0 6 7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
   >
      <Path
         d="M2.25 2.481a.75.75 0 0 0-.75.75v1.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75v-1.5a.75.75 0 0 0-.75-.75h-1.5Z"
         fill={fill}
      />
      <Path
         fillRule="evenodd"
         clipRule="evenodd"
         d="M0 2.481a1.5 1.5 0 0 1 1.5-1.5h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a1.5 1.5 0 0 1-1.5-1.5v-3Zm1.5-.75h3a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-.75.75h-3a.75.75 0 0 1-.75-.75v-3a.75.75 0 0 1 .75-.75Z"
         fill={fill}
      />
   </Svg>
)
