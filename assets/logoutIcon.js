import * as React from 'react'
import Svg, { Ellipse, Path } from 'react-native-svg'

export const LogoutIcon = ({ size = 20, fill = '#000000' }) => (
   <Svg
      width={size}
      height={size}
      viewBox="0 0 19 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
   >
      <Ellipse
         cx={7.00488}
         cy={7}
         rx={7.00488}
         ry={7}
         fill={fill}
         fillOpacity={0.6}
      />
      <Path
         d="M14.0973 4.66617L15.5606 6.2426H7.84843C7.42559 6.2426 7.08281 6.58538 7.08281 7.00822C7.08281 7.43106 7.42559 7.77384 7.84844 7.77384H15.5591L14.2047 9.22847C13.9102 9.54469 13.9279 10.0397 14.2441 10.3342C14.5609 10.6292 15.0571 10.6108 15.3512 10.2933L17.8831 7.5597C18.1803 7.23889 18.1754 6.74194 17.872 6.42701L15.185 3.63761C14.9201 3.36259 14.4906 3.33108 14.1884 3.56448C13.84 3.83351 13.7979 4.34358 14.0973 4.66617Z"
         fill={fill}
         fillOpacity={0.6}
         stroke="white"
         strokeWidth={0.6}
         strokeLinecap="round"
         strokeLinejoin="round"
      />
   </Svg>
)
