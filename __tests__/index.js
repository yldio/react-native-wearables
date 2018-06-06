import DataAndroid from "../data.android";
import DataIOS from "../data.ios";
import { DATA_TYPES, ERRORS } from "../constants";

jest.mock(
  "react-native-google-fitness",
  () => {
    const mock = {
      requestPermissions: jest.fn(),
      History: {
        readData: jest.fn()
      },

      DataReadRequest: {
        Builder: jest.fn()
      },
      FitnessOptions: {
        Builder: jest.fn()
      },
      DataType: {
        TYPE_HEART_RATE_BPM: Symbol()
      },
      TimeUnit: {
        MILLISECONDS: Symbol()
      }
    };

    mock.FitnessOptions.Builder.prototype = {
      addDataType: jest.fn().mockReturnThis(),
      build: jest.fn().mockReturnValue(Symbol())
    };

    mock.DataReadRequest.Builder.prototype = {
      read_dataType: jest.fn().mockReturnThis(),
      setTimeRange: jest.fn().mockReturnThis(),
      build: jest.fn().mockReturnValue(Symbol())
    };

    return mock;
  },
  { virtual: true }
);

jest.mock(
  "rn-apple-healthkit",
  () => ({
    initHealthKit: jest.fn(),
    getHeartRateSamples: jest.fn(),

    Constants: {
      Permissions: {
        HeartRate: Symbol()
      }
    }
  }),
  { virtual: true }
);

const EXPECTED_SAMPLES = [
  {
    value: 95,
    startDate: "2018-06-06T13:59:47.375+0100",
    endDate: "2018-06-06T13:59:47.375+0100"
  },
  {
    value: 97,
    startDate: "2018-06-06T13:56:01.375+0100",
    endDate: "2018-06-06T13:56:01.375+0100"
  },
  {
    value: 96,
    startDate: "2018-06-06T13:47:45.498+0100",
    endDate: "2018-06-06T13:47:45.498+0100"
  }
];

const IOS_IMPLEMENTATION_SAMPLES = EXPECTED_SAMPLES;
const ANDROID_IMPLEMENTATION_SAMPLES = EXPECTED_SAMPLES; // this is wrong

import DataIOSImplementation from "rn-apple-healthkit";
import DataAndroidImplementation from "react-native-google-fitness";

describe("Data", () => {
  describe("on iOS", () => {
    it("exports types", () => {
      expect(DataIOS.Types).toBe(DATA_TYPES);
    });

    it("authorize returns a promise", async () => {
      DataIOSImplementation.initHealthKit.mockImplementationOnce(
        (types, cb) => {
          expect(types).toEqual({
            permissions: {
              read: [DataIOSImplementation.Constants.Permissions.HeartRate]
            }
          });

          cb(null);
        }
      );

      await expect(
        DataIOS.authorize([DataIOS.Types.heartRateBpm])
      ).resolves.toBe(undefined);

      DataIOSImplementation.initHealthKit.mockImplementationOnce(
        (types, cb) => {
          cb(new Error());
        }
      );

      await expect(
        DataIOS.authorize([DataIOS.Types.heartRateBpm])
      ).rejects.toThrow(new Error(ERRORS.failedInit));
    });

    it("read returns samples", async () => {
      const startDate = new Date("2018-05-01");
      const endDate = new Date("2018-05-10");

      DataIOSImplementation.getHeartRateSamples.mockImplementationOnce(
        (options, cb) => {
          expect(options.startDate).toBe(startDate.toISOString());
          expect(options.startDate).toBe(startDate.toISOString());

          cb(null, IOS_IMPLEMENTATION_SAMPLES);
        }
      );

      await expect(
        DataIOS.read(DataIOS.Types.heartRateBpm, {
          startDate,
          endDate
        })
      ).resolves.toEqual(EXPECTED_SAMPLES);

      DataIOSImplementation.getHeartRateSamples.mockImplementationOnce(
        (options, cb) => {
          cb(new Error());
        }
      );

      await expect(
        DataIOS.read(DataIOS.Types.heartRateBpm, {
          startDate,
          endDate
        })
      ).rejects.toThrow(new Error(ERRORS.failedQuery));
    });
  });

  describe("on Android", () => {
    it("exports types", () => {
      expect(DataAndroid.Types).toBe(DATA_TYPES);
    });

    it("authorize returns a promise", async () => {
      DataAndroidImplementation.requestPermissions.mockImplementationOnce(
        options => {
          expect(
            DataAndroidImplementation.FitnessOptions.Builder.prototype
              .addDataType
          ).toHaveBeenLastCalledWith(
            DataAndroidImplementation.DataType.TYPE_HEART_RATE_BPM
          );

          expect(options).toBe(
            DataAndroidImplementation.FitnessOptions.Builder.prototype.build()
          );

          return Promise.resolve();
        }
      );

      await expect(
        DataAndroid.authorize([DataAndroid.Types.heartRateBpm])
      ).resolves.toBe(undefined);

      DataAndroidImplementation.requestPermissions.mockImplementationOnce(
        () => {
          return Promise.reject();
        }
      );

      await expect(
        DataAndroid.authorize([DataAndroid.Types.heartRateBpm])
      ).rejects.toThrow(new Error(ERRORS.failedInit));
    });

    it("read returns samples", async () => {
      const startDate = new Date("2018-05-01");
      const endDate = new Date("2018-05-10");

      DataAndroidImplementation.History.readData.mockImplementationOnce(
        (options, cb) => {
          expect(
            DataAndroidImplementation.DataReadRequest.Builder.prototype
              .setTimeRange
          ).toHaveBeenLastCalledWith(
            +startDate,
            +endDate,
            DataAndroidImplementation.TimeUnit.MILLISECONDS
          );

          expect(options).toBe(
            DataAndroidImplementation.DataReadRequest.Builder.prototype.build()
          );

          return Promise.resolve({
            dataSets: [ANDROID_IMPLEMENTATION_SAMPLES]
          });
        }
      );

      await expect(
        DataAndroid.read(DataAndroid.Types.heartRateBpm, {
          startDate,
          endDate
        })
      ).resolves.toEqual(EXPECTED_SAMPLES);

      DataAndroidImplementation.History.readData.mockImplementationOnce(
        (options, cb) => {
          return Promise.reject();
        }
      );

      await expect(
        DataAndroid.read(DataAndroid.Types.heartRateBpm, {
          startDate,
          endDate
        })
      ).rejects.toThrow(new Error(ERRORS.failedQuery));
    });
  });
});
