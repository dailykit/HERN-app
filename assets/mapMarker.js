import * as React from 'react'
import Svg, { Path, Circle } from 'react-native-svg'

const MapMarker = props => (
   <Svg
      width={24}
      height={48}
      viewBox="0 0 23 43"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
   >
      <Path
         fillRule="evenodd"
         clipRule="evenodd"
         d="M11.4159 0.666626C5.53666 0.666626 0.833252 5.46663 0.833252 11.4666C0.833252 18.3238 9.73614 25.5238 11.4159 42.6666C13.2637 25.5238 22.1666 18.3238 22.1666 11.4666C22.1666 5.46663 17.2952 0.666626 11.4159 0.666626Z"
         fill="#EA4335"
      />
      <Circle cx={11.4998} cy={11} r={3} fill="#811411" />
   </Svg>
)

export default MapMarker
