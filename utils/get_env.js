import { ADMIN_SECRET, DATAHUB_URL, DATA_HUB_WSS } from '@env'

var globalEnvs = { ADMIN_SECRET, DATAHUB_URL, DATA_HUB_WSS }

export const get_env = title => {
   return globalEnvs[title]
}
