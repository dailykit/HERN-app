export const getFormattedAddress = result => {
   const address = {}
   const formatted_address = result.formatted_address.split(',')
   // set line1 from formatted_address bcz it has more info than address_component
   address.line1 = formatted_address
      .slice(0, formatted_address.length - 3)
      .join(',')
   address.line2 = ''
   // line to most probably not use
   result.address_components.forEach(node => {
      if (node.types.includes('sublocality_level_3')) {
         address.line2 += `${node.long_name} `
      }
      if (node.types.includes('sublocality_level_2')) {
         address.line2 += `${node.long_name} `
      }
      if (node.types.includes('sublocality_level_1')) {
         address.line2 += `${node.long_name} `
      }
      if (node.types.includes('locality')) {
         address.city = node.long_name
      }
      if (node.types.includes('administrative_area_level_1')) {
         address.state = node.long_name
      }
      if (node.types.includes('country')) {
         address.country = node.long_name
      }
      if (node.types.includes('postal_code')) {
         address.zipcode = node.long_name
      }
   })
   if (address.zipcode) {
      return {
         status: true,
         address: address,
      }
   } else {
      // showWarningPopup()
      return {
         status: 'false',
         message: 'Zipcode not available',
      }
   }
}
