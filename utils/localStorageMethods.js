import AsyncStorage from '@react-native-async-storage/async-storage'

export const setItem = async (key, value) => {
   try {
      const finalValue =
         typeof value === 'string' ? value : JSON.stringify(value)
      await AsyncStorage.setItem(key, finalValue)
   } catch (error) {
      console.log(error)
   }
}

export const getItem = async key => {
   try {
      const value = await AsyncStorage.getItem(key)
      return value != null
         ? typeof value === 'string'
            ? value
            : JSON.parse(value)
         : null
   } catch (error) {
      console.log(error)
   }
}

export const removeItem = async key => {
   try {
      await AsyncStorage.removeItem(key)
   } catch (error) {
      console.log(error)
   }
}
