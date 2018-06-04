import GoogleFit from 'react-native-google-fit';
import {DATA_TYPES, ERRORS} from './constants'

const funcMappings = {
  [DATA_TYPES.heartRateBpm]: GoogleFit.getHeartRateSamples
}

const Data = {
  Types: DATA_TYPES,

  authorize() {
    return new Promise((resolve, reject) => {
      GoogleFit.onAuthorize(() => {
        resolve()
      });

      GoogleFit.onAuthorizeFailure(error => {
        reject(new Error(ERRORS.failedInit))
      });

      GoogleFit.authorize();
    })
  },

  read(dataType, options) {
    return new Promise((resolve, reject) => {
      funcMappings[dataType](options, (err, samples) => {
        console.log(samples)
        if (err) reject(new Error(ERRORS.failedQuery))
        else resolve(samples)
      })
    })
  }
}

export default Data
