import AppleHealthKit from "rn-apple-healthkit";
import { DATA_TYPES, ERRORS } from "./constants";

const typeMappings = {
  [DATA_TYPES.heartRateBpm]: AppleHealthKit.Constants.Permissions.HeartRate
};

const funcMappings = {
  [DATA_TYPES.heartRateBpm]: AppleHealthKit.getHeartRateSamples
};

const Data = {
  Types: DATA_TYPES,

  authorize(dataTypes) {
    return new Promise((resolve, reject) => {
      AppleHealthKit.initHealthKit(
        {
          permissions: {
            read: dataTypes.map(dt => typeMappings[dt])
          }
        },
        err => {
          if (err) reject(new Error(ERRORS.failedInit));
          else resolve();
        }
      );
    });
  },

  read(dataType, options) {
    return new Promise((resolve, reject) => {
      funcMappings[dataType](
        {
          startDate: options.startDate.toISOString(),
          endDate: options.endDate.toISOString()
        },
        (err, samples) => {
          if (err) reject(new Error(ERRORS.failedQuery));
          else resolve(samples);
        }
      );
    });
  }
};

export default Data;
