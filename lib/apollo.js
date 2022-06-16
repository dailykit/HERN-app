import React from 'react'
import { AppRegistry } from 'react-native'
// Apollo Client Imports
import {
   ApolloClient,
   InMemoryCache,
   ApolloProvider as Provider,
   HttpLink,
   split,
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
import { getMainDefinition } from '@apollo/client/utilities'
import { get_env } from '../utils/get_env'

const authLink = setContext((_, { headers }) => {
   return {
      headers: {
         ...headers,
         'x-hasura-admin-secret': get_env('ADMIN_SECRET'),
      },
   }
})

const errorLink = onError(({ graphQLErrors, networkError }) => {
   if (graphQLErrors)
      graphQLErrors.forEach(({ message, locations, path }) =>
         console.log(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
         )
      )
   if (networkError) console.log(`[Network error]: ${networkError}`)
})

const httpLink = new HttpLink({
   uri: get_env('DATAHUB_URL'),
})

const wsLink = new GraphQLWsLink(
   createClient({
      url: get_env('DATA_HUB_WSS'),
      connectionParams: {
         headers: {
            'x-hasura-admin-secret': get_env('ADMIN_SECRET'),
         },
      },
   })
)

const link = split(
   ({ query }) => {
      const definition = getMainDefinition(query)
      return (
         definition.kind === 'OperationDefinition' &&
         definition.operation === 'subscription'
      )
   },
   errorLink.concat(wsLink),
   authLink.concat(errorLink).concat(httpLink)
)

export const client = new ApolloClient({
   link,
   cache: new InMemoryCache(),
})

export const ApolloProvider = ({ children }) => {
   return <Provider client={client}>{children}</Provider>
}
