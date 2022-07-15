import * as React from 'react'
import Svg, { Path } from 'react-native-svg'
import global from '../globalStyles'

export const CoinsIcon = ({ size = 20, fill = global.primaryColor }) => (
   <Svg
      width={size}
      height={size}
      viewBox="0 0 21 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
   >
      <Path
         d="M12.3793 0.879884C13.9804 0.879119 15.5335 1.42745 16.7793 2.43343C18.0252 3.4394 18.8886 4.84221 19.2256 6.40789C19.5625 7.97357 19.3526 9.60747 18.6309 11.0371C17.9092 12.4667 16.7193 13.6056 15.2596 14.2639C14.7931 15.2957 14.0833 16.1988 13.1911 16.8959C12.299 17.593 11.2511 18.0633 10.1373 18.2664C9.02354 18.4695 7.87716 18.3993 6.79646 18.0619C5.71577 17.7245 4.73301 17.1299 3.93249 16.3292C3.13196 15.5285 2.53755 14.5455 2.20024 13.4646C1.86293 12.3836 1.79278 11.2369 1.9958 10.1229C2.19883 9.00888 2.66897 7.96073 3.36591 7.06836C4.06286 6.17598 4.9658 5.46601 5.9973 4.99933C6.55215 3.77136 7.44938 2.72956 8.58137 1.99889C9.71335 1.26821 11.032 0.879675 12.3793 0.879884ZM8.87943 6.13092C8.19002 6.13092 7.50736 6.26675 6.87043 6.53064C6.23349 6.79453 5.65476 7.18131 5.16728 7.66892C4.67979 8.15652 4.29309 8.73539 4.02927 9.37248C3.76544 10.0096 3.62965 10.6924 3.62965 11.382C3.62965 12.0715 3.76544 12.7544 4.02927 13.3915C4.29309 14.0285 4.67979 14.6074 5.16728 15.095C5.65476 15.5826 6.23349 15.9694 6.87043 16.2333C7.50736 16.4972 8.19002 16.633 8.87943 16.633C10.2718 16.633 11.6071 16.0798 12.5916 15.095C13.5761 14.1103 14.1292 12.7746 14.1292 11.382C14.1292 9.9893 13.5761 8.65368 12.5916 7.66892C11.6071 6.68416 10.2718 6.13092 8.87943 6.13092ZM9.75439 7.0061V7.88127H11.5043V9.63162H8.00446C7.89514 9.63142 7.7897 9.67216 7.70892 9.74584C7.62813 9.81951 7.57785 9.92076 7.56797 10.0297C7.55809 10.1386 7.58933 10.2472 7.65555 10.3342C7.72176 10.4212 7.81814 10.4803 7.92572 10.4998L8.00446 10.5068H9.75439C10.3345 10.5068 10.8909 10.7373 11.3011 11.1476C11.7113 11.5579 11.9418 12.1144 11.9418 12.6947C11.9418 13.275 11.7113 13.8315 11.3011 14.2418C10.8909 14.6521 10.3345 14.8827 9.75439 14.8827V15.7578H8.00446V14.8827H6.25454V13.1323H9.75439C9.86371 13.1325 9.96915 13.0918 10.0499 13.0181C10.1307 12.9444 10.181 12.8432 10.1909 12.7343C10.2008 12.6254 10.1695 12.5167 10.1033 12.4297C10.0371 12.3427 9.94071 12.2836 9.83313 12.2641L9.75439 12.2571H8.00446C7.42433 12.2571 6.86795 12.0266 6.45774 11.6163C6.04752 11.206 5.81706 10.6495 5.81706 10.0692C5.81706 9.48893 6.04752 8.93242 6.45774 8.5221C6.86795 8.11179 7.42433 7.88127 8.00446 7.88127V7.0061H9.75439ZM12.3793 2.63023C11.6379 2.62936 10.9048 2.78596 10.2285 3.08966C9.55212 3.39336 8.94796 3.83725 8.45594 4.39195C9.44488 4.33191 10.4353 4.48253 11.3617 4.83387C12.2881 5.18521 13.1294 5.72926 13.8299 6.43004C14.5304 7.13082 15.0743 7.97237 15.4254 8.89904C15.7766 9.82571 15.927 10.8164 15.8669 11.8055C16.6624 11.0981 17.2241 10.1654 17.4775 9.13129C17.7309 8.09716 17.664 7.0104 17.2857 6.01516C16.9074 5.01992 16.2356 4.16322 15.3593 3.55869C14.4831 2.95415 13.4438 2.63035 12.3793 2.63023Z"
         fill={fill}
      />
   </Svg>
)
