import * as React from 'react'
import Svg, { Rect } from 'react-native-svg'
import global from '../globalStyles'

const RadioIcon = ({
   size = 16,
   checked = false,
   stroke = global.primaryColor,
}) => (
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
         rx={7.5}
         stroke={stroke}
      />
      {checked ? (
         <Rect
            x={3.5}
            y={3.95801}
            width={9}
            height={9}
            rx={4.5}
            fill={stroke}
            stroke={stroke}
         />
      ) : null}
   </Svg>
)

export default RadioIcon
