import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

const HomeIcon = ({ size = 48, fill = '#ffffff' }) => (
   <Svg
      width={size}
      height={size}
      viewBox={`0 0 48 48`}
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
   >
      <Path
         d="M29.3113 17.9791C29.3113 21.0051 26.9334 23.4581 23.9999 23.4581C21.0664 23.4581 18.6885 21.0052 18.6885 17.9791C18.6885 14.9532 21.0664 12.5001 23.9999 12.5001C26.9334 12.5001 29.3113 14.9532 29.3113 17.9791Z"
         fill={fill}
      />
      <Path
         d="M12.0001 33.4589C12.0001 37.5138 36.0001 37.5138 36.0001 33.4589C35.9999 28.3947 30.6273 25.0143 23.9998 25.0143C17.3724 25.0143 12.0001 28.395 12.0001 33.4589Z"
         fill={fill}
      />
   </Svg>
)

export default HomeIcon
