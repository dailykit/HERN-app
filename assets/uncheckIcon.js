import * as React from 'react'
import Svg, { Rect } from 'react-native-svg'

const UncheckIcon = ({ size = 16, fill = '#ffffff', stroke = '#A2A2A2' }) => (
   <Svg
      width={size}
      height={size}
      viewBox="0 0 16 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
   >
      <Rect
         x={0.5}
         y={0.958008}
         width={15}
         height={15}
         rx={3.5}
         fill={fill}
         stroke={stroke}
      />
   </Svg>
)

export default UncheckIcon
