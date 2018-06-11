import { Data } from "../";

jest.mock("../data", () => Symbol(), { virtual: true });

import DataExportedFromDataJs from "../data";

it("exports named export Data from data.js", () => {
  expect(Data).toBe(DataExportedFromDataJs);
});
