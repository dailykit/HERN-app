export function groupByRootCartItemId(cartItems) {
   const groupByRootCartItemIdData = {}
   //    console.log('cartItems1', cartItems)
   cartItems.forEach(function (eachCartItem) {
      if (!groupByRootCartItemIdData[eachCartItem.rootCartItemId]) {
         groupByRootCartItemIdData[eachCartItem.rootCartItemId] = [eachCartItem]
      } else {
         groupByRootCartItemIdData[eachCartItem.rootCartItemId].push(
            eachCartItem
         )
      }
   })

   const rootIds = Object.keys(groupByRootCartItemIdData)

   const mapedData = rootIds.map(eachRootId => {
      const allCartItems = groupByRootCartItemIdData[eachRootId]
      let finalCartItem = {}
      allCartItems.forEach(eachCartItem => {
         if (eachCartItem.level === 1) {
            finalCartItem = {
               cartItemId: eachCartItem.cartItemId,
               parentCartItemId: eachCartItem.parentCartItemId,
               addOnLabel: eachCartItem.addOnLabel,
               addOnPrice: eachCartItem.addOnPrice,
               created_at: eachCartItem.created_at,
               price: eachCartItem.price,
               discount: eachCartItem.discount,
               name: eachCartItem.name,
               image: eachCartItem.image,
               rootCartItemId: eachCartItem.rootCartItemId,
               childs: [],
               product: {
                  id: eachCartItem.product.id,
                  name: eachCartItem.product.name,
                  price: eachCartItem.product.price,
                  discount: eachCartItem.product.discount,
                  isAvailable: eachCartItem.product.isAvailable,
                  isPublished: eachCartItem.product.isPublished,
               },
               productId: eachCartItem.productId,
            }
         } else if (eachCartItem.level === 2) {
            const childs = [
               {
                  price: eachCartItem.price,
                  discount: eachCartItem.discount,
                  name: eachCartItem.name,
                  productOption: {
                     id: eachCartItem.productOption.id,
                     label: eachCartItem.productOption.label,
                  },
                  childs: [],
               },
            ]
            finalCartItem.productOption = {
               id: eachCartItem.productOption.id,
               label: eachCartItem.productOption.label,
               price: eachCartItem.productOption.price,
               discount: eachCartItem.productOption.discount,
               isAvailable: eachCartItem.productOption.isAvailable,
               isPublished: eachCartItem.productOption.isPublished,
            }
            finalCartItem.childs = childs
         } else if (eachCartItem.level === 3) {
            const child = {
               price: eachCartItem.price,
               discount: eachCartItem.discount,
               name: eachCartItem.name,
               cartItemId: eachCartItem.id,
               modifierOption: {
                  id: eachCartItem.modifierOption.id,
                  name: eachCartItem.modifierOption.name,
               },
               childs: [],
            }
            finalCartItem.childs[0].childs.push(child)
         } else if (eachCartItem.level === 4) {
            const level3ChildsIndex = finalCartItem.childs[0].childs.findIndex(
               eachChild => eachChild.cartItemId === eachCartItem.id
            )
            const child = {
               price: eachCartItem.price,
               discount: eachCartItem.discount,
               name: eachCartItem.name,
               cartItemId: eachCartItem.id,
               modifierOption: {
                  id: eachCartItem.modifierOption.id,
                  name: eachCartItem.modifierOption.name,
               },
               childs: [],
            }
            finalCartItem.childs[0].childs[level3ChildsIndex].child.push(child)
         }
      })
      return finalCartItem
   })
   return mapedData
}
