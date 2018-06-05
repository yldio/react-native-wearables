import Fitness, {DataReadRequest, FitnessOptions, DataType, TimeUnit} from 'react-native-google-fitness';
import {DATA_TYPES, ERRORS} from './constants'

const typeMappings = {
  [DATA_TYPES.heartRateBpm]: DataType.TYPE_HEART_RATE_BPM
}

const Data = {
  Types: DATA_TYPES,

  authorize(dataTypes) {
    const options = new FitnessOptions.Builder
    dataTypes.forEach(dt => options.addDataType(typeMappings[dt]))

    return Fitness.requestPermissions(options.build())
  },

  read(dataType, options) {
    const readRequest = new DataReadRequest.Builder()
      .read_dataType(typeMappings[dataType])
      .setTimeRange(+options.startDate, +options.endDate, TimeUnit.MILLISECONDS)
      .build();

    return Fitness.History.readData(readRequest).then(result => result.dataSets)

    // return new Promise((resolve, reject) => {
    //   funcMappings[dataType](options, (err, samples) => {
    //     console.log(samples)
    //     if (err) reject(new Error(ERRORS.failedQuery))
    //     else resolve(samples)
    //   })
    // })
  }
}

export default Data
