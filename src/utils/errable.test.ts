import { Failure, Success, fromFailure, fromSuccess } from "./errable"

describe("errable", () => {
  describe("fromFailure", () => {
    it("should return the message from error", () => {
      expect(fromFailure(Failure("test"))).toBe("test")
    })
    it("should throw when not an error", () => {
      expect(() => fromFailure(Success("test"))).toThrowError("expected failure")
    })
  })
  describe("fromSuccess", () => {
    it("should return the result from success", () => {
      expect(fromSuccess(Success("test"))).toBe("test")
    })
    it("should throw when not a success", () => {
      expect(() => fromSuccess(Failure("test"))).toThrowError("expected success")
    })
  })
})
