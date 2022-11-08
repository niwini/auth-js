/* eslint-disable max-len */
import nock from "nock";

import remost from "./remost";

//#####################################################
// Constants
//#####################################################
const BASE_URL = "http://api.test.com";

//#####################################################
// Test definitions
//#####################################################
describe("remost test", () => {
  beforeEach(() => {
    nock(BASE_URL)
      .get("/success")
      .reply(200, { ok: true });
  });

  it("should make a get request with url directly", async () => {
    const response = await remost(`${BASE_URL}/success`);

    expect(response.data).toBeTruthy();
    expect(response.data.ok).toBe(true);
  });

  it("should make a get request with request config object", async () => {
    const response = await remost({
      url: `${BASE_URL}/success`,
    });

    expect(response.data).toBeTruthy();
    expect(response.data.ok).toBe(true);
  });

  it("should be able to create a new remost function with base url", async () => {
    const remostFn = remost.create({
      baseURL: BASE_URL,
    });

    const response = await remostFn({ url: "/success" });

    expect(response.data).toBeTruthy();
    expect(response.data.ok).toBe(true);
  });

  it("should make a post request using an object as the body data", async () => {
    nock(BASE_URL)
      .post("/success")
      .reply(200, (uri, body) => body);

    const data = {
      hello: "world",
    };

    const response = await remost({
      data,
      method: "post",
      url: `${BASE_URL}/success`,
    });

    expect(response.data).toBeTruthy();
    expect(response.data).toEqual(data);
  });
});
