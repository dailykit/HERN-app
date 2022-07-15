import React from 'react'
import { useNavigation } from '@react-navigation/native'
import {
   StyleSheet,
   Text,
   TouchableWithoutFeedback,
   View,
   Animated,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CardsIcon } from '../../assets/cardsIcon'
import LocationIcon from '../../assets/locationIcon'
import { LogoutIcon } from '../../assets/logoutIcon'
import { LoyaltyPoint, LoyaltyPointIcon } from '../../assets/loyaltyPointIcon'
import { OfferIcon } from '../../assets/offerIcon'
import { ReferIcon } from '../../assets/referIcon'
import { WalletIcon } from '../../assets/walletIcon'
import { LoginScreenForAuthScreen } from '../../components/authScreenLogin'
import { useUser } from '../../context/user'
import { AccountHeader } from './header'
import { UserInfo } from './userInfo'
import { Spinner } from '../../assets/loaders'
import { useConfig } from '../../lib/config'
import global from '../../globalStyles'

const AccountScreen = () => {
   const navigation = useNavigation()
   const { configOf } = useConfig()
   const { user, isAuthenticated, isLoading, logout } = useUser()
   const walletConfig = configOf('Wallet', 'rewards')
   const isWalletAvailable = React.useMemo(() => {
      return walletConfig?.Wallet?.isWalletAvailable?.value
   }, [walletConfig])
   const loyaltyPointConfig = configOf('Loyalty Points', 'rewards')
   const isLoyaltyPointsAvailable = React.useMemo(() => {
      return loyaltyPointConfig?.['Loyalty Points']?.IsLoyaltyPointsAvailable
         ?.value
   }, [loyaltyPointConfig])
   const referralsConfig = configOf('Referral', 'rewards')
   const isReferralAvailable = React.useMemo(() => {
      return referralsConfig?.['Referral']?.IsReferralAvailable?.value
   }, [referralsConfig])

   return (
      <SafeAreaView style={{ flex: 1 }}>
         <AccountHeader />
         {isLoading ? (
            <Spinner size={'large'} showText={true} />
         ) : isAuthenticated ? (
            <View style={{ marginHorizontal: 12 }}>
               <UserInfo />
               <View>
                  <Tile
                     onPress={() => {
                        navigation.navigate('Offers')
                     }}
                  >
                     <OfferIcon />
                     <Text style={styles.accountTileText}>Check Offers</Text>
                  </Tile>
                  <View
                     style={{ height: 0.5, backgroundColor: global.greyColor }}
                  ></View>
                  {isWalletAvailable ? (
                     <>
                        <Tile
                           onPress={() => {
                              navigation.navigate('Wallet')
                           }}
                        >
                           <WalletIcon />
                           <Text style={styles.accountTileText}>Wallet</Text>
                        </Tile>
                        <View
                           style={{
                              height: 0.5,
                              backgroundColor: global.greyColor,
                           }}
                        ></View>
                     </>
                  ) : null}
                  {isLoyaltyPointsAvailable ? (
                     <>
                        <Tile
                           onPress={() => {
                              navigation.navigate('LoyaltyPoints')
                           }}
                        >
                           <LoyaltyPointIcon />
                           <Text style={styles.accountTileText}>
                              Loyalty Points
                           </Text>
                        </Tile>
                        <View
                           style={{
                              height: 0.5,
                              backgroundColor: global.greyColor,
                           }}
                        ></View>
                     </>
                  ) : null}
                  <Tile>
                     <LocationIcon fill="#00000080" size={20} />
                     <Text style={styles.accountTileText}>
                        Manage Addresses
                     </Text>
                  </Tile>
                  <View
                     style={{ height: 0.5, backgroundColor: global.greyColor }}
                  ></View>
                  {isReferralAvailable ? (
                     <>
                        <Tile>
                           <ReferIcon />
                           <Text style={styles.accountTileText}>
                              Refer your friends
                           </Text>
                        </Tile>
                        <View
                           style={{
                              height: 0.5,
                              backgroundColor: global.greyColor,
                           }}
                        ></View>
                     </>
                  ) : null}
                  <Tile>
                     <CardsIcon />
                     <Text style={styles.accountTileText}>
                        Manage your cards
                     </Text>
                  </Tile>
                  <View
                     style={{ height: 0.5, backgroundColor: global.greyColor }}
                  ></View>
                  <Tile
                     onPress={async () => {
                        await logout()
                     }}
                  >
                     <LogoutIcon />
                     <Text style={styles.accountTileText}>Sign Out</Text>
                  </Tile>
               </View>
            </View>
         ) : (
            <LoginScreenForAuthScreen />
         )}
      </SafeAreaView>
   )
}
{
   /*
   <View style={{ marginHorizontal: 12 }}>
            <UserInfo />
            <View>
               <Tile
                  onPress={() => {
                     navigation.navigate('Offers')
                  }}
               >
                  <OfferIcon />
                  <Text style={styles.accountTileText}>Check Offers</Text>
               </Tile>
               <View style={{ height: 0.5, backgroundColor: global.greyColor }}></View>
               <Tile
                  onPress={() => {
                     navigation.navigate('Wallet')
                  }}
               >
                  <WalletIcon />
                  <Text style={styles.accountTileText}>Wallet</Text>
               </Tile>
               <View style={{ height: 0.5, backgroundColor: global.greyColor }}></View>
               <Tile
                  onPress={() => {
                     navigation.navigate('LoyaltyPoints')
                  }}
               >
                  <LoyaltyPointIcon />
                  <Text style={styles.accountTileText}>Loyalty Points</Text>
               </Tile>
               <View style={{ height: 0.5, backgroundColor: global.greyColor }}></View>
               <Tile>
                  <LocationIcon fill="#00000080" size={20} />
                  <Text style={styles.accountTileText}>Manage Addresses</Text>
               </Tile>
               <View style={{ height: 0.5, backgroundColor: global.greyColor }}></View>
               <Tile>
                  <ReferIcon />
                  <Text style={styles.accountTileText}>Refer your friends</Text>
               </Tile>
               <View style={{ height: 0.5, backgroundColor: global.greyColor }}></View>
               <Tile>
                  <CardsIcon />
                  <Text style={styles.accountTileText}>Manage your cards</Text>
               </Tile>
               <View style={{ height: 0.5, backgroundColor: global.greyColor }}></View>
               <Tile>
                  <LogoutIcon />
                  <Text style={styles.accountTileText}>Sign Out</Text>
               </Tile>
            </View>
         </View>
   */
}
const Tile = ({ children, onPress }) => {
   const animatedButtonScale = new Animated.Value(1)

   // When button is pressed in, animate the scale to 1.5
   const onPressIn = () => {
      Animated.spring(animatedButtonScale, {
         toValue: 0.9,
         useNativeDriver: true,
      }).start()
   }

   // When button is pressed out, animate the scale back to 1
   const onPressOut = () => {
      Animated.spring(animatedButtonScale, {
         toValue: 1,
         useNativeDriver: true,
      }).start()
   }

   // The animated style for scaling the button within the Animated.View
   const animatedScaleStyle = {
      transform: [{ scale: animatedButtonScale }],
   }
   return (
      <TouchableWithoutFeedback
         onPress={onPress}
         onPressIn={onPressIn}
         onPressOut={onPressOut}
         key={'CheckOffers'}
      >
         <Animated.View style={[animatedScaleStyle]}>
            <View style={styles.accountTile}>{children}</View>
         </Animated.View>
      </TouchableWithoutFeedback>
   )
}
const styles = StyleSheet.create({
   accountTile: {
      height: 60,
      alignItems: 'center',
      flexDirection: 'row',
   },
   accountTileText: {
      color: '#00000080',
      fontFamily: global.regular,
      fontSize: 18,
      marginLeft: 18,
   },
})
export default AccountScreen
