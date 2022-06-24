import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

export const OfferIcon = ({ size = 20, fill = '#000000' }) => (
   <Svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
   >
      <Path
         d="M20 10C20 9.03662 18.021 8.38747 17.7263 7.50793C17.4316 6.60752 18.6527 4.91116 18.0842 4.15723C17.5157 3.38243 15.5367 4.0316 14.7579 3.46616C14 2.92172 13.9789 0.827577 13.0736 0.534434C12.1894 0.241262 10.9683 1.91661 9.97886 1.91661C9.01035 1.91661 7.76828 0.241254 6.88411 0.534434C5.97891 0.827607 5.95775 2.90085 5.19985 3.46616C4.42094 4.03162 2.44198 3.38246 1.87352 4.15723C1.32619 4.91112 2.52612 6.60738 2.2314 7.50793C1.97896 8.38747 0 9.03662 0 10C0 10.9634 1.97899 11.6125 2.27369 12.4921C2.56842 13.3925 1.34734 15.0888 1.91582 15.8428C2.48428 16.6176 4.46327 15.9684 5.24214 16.5338C6.00004 17.0783 6.02106 19.1724 6.9264 19.4656C7.81061 19.7587 9.03167 18.0834 10.0211 18.0834C10.9896 18.0834 12.2317 19.7587 13.1159 19.4656C14.0211 19.1724 14.0423 17.0991 14.8001 16.5338C15.5791 15.9684 17.558 16.6175 18.1265 15.8428C18.6738 15.0889 17.4739 13.3926 17.7686 12.4921C18.021 11.6125 20 10.9634 20 10ZM7.41048 6.02113C8.18939 6.02113 8.82101 6.64941 8.82101 7.4242C8.82101 8.199 8.18939 8.82728 7.41048 8.82728C6.63157 8.82728 5.99995 8.199 5.99995 7.4242C5.99995 6.64926 6.63142 6.02113 7.41048 6.02113ZM12.5894 13.9789C11.8105 13.9789 11.1789 13.3506 11.1789 12.5758C11.1789 11.801 11.8105 11.1727 12.5894 11.1727C13.3684 11.1727 14 11.801 14 12.5758C14 13.3507 13.3685 13.9789 12.5894 13.9789ZM13.7684 7.57079L7.55781 13.7485C7.36837 13.937 7.13679 14.0208 6.88405 14.0208C6.65246 14.0208 6.39987 13.9371 6.21029 13.7485C5.85241 13.3925 5.85241 12.7851 6.21029 12.4292L12.4208 6.25145C12.7787 5.89546 13.3893 5.89546 13.7472 6.25145C14.1264 6.62847 14.1264 7.21483 13.7683 7.57079H13.7684Z"
         fill={fill}
         fillOpacity={0.6}
      />
   </Svg>
)