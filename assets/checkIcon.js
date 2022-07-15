import * as React from 'react'
import Svg, { Rect, Path } from 'react-native-svg'
import global from '../globalStyles'

const CheckIcon = ({
   size = 16,
   fill = global.primaryColor,
   checkFill = '#ffffff',
}) => (
   <Svg
      width={size}
      height={size}
      viewBox="0 0 16 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
   >
      <Rect y={0.458008} width={16} height={16} rx={4} fill={fill} />
      <Path
         d="M3.38773 9.27172L3.05678 9.49537C2.98439 9.54429 2.98073 9.64752 3.04861 9.70227C4.36979 10.7678 4.89621 11.682 5.6362 13.3791C5.66374 13.4423 5.73742 13.4739 5.80337 13.4501L6.64727 13.1453C6.68206 13.1328 6.71004 13.1058 6.72393 13.0722C8.3677 9.09628 9.67627 6.88831 12.9599 3.67501C13.0617 3.57534 12.9528 3.41266 12.8211 3.4699C9.87367 4.75072 8.34142 6.38494 6.22111 10.4721C6.17839 10.5544 6.06241 10.5694 6.00159 10.4988L5.14333 9.50154C4.70653 8.99403 3.94598 8.89447 3.38773 9.27172Z"
         fill={checkFill}
      />
   </Svg>
)

export default CheckIcon
