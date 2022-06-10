import { getCurrencySymbol } from './getCurrencySymbol'

export const formatCurrency = (input = 0) => {
   const CURRENCY = 'INR'
   const currencySymbol = getCurrencySymbol(CURRENCY)
   return `${currencySymbol} ${input}`
}
