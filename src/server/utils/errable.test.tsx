import { Failure, Success, fromFailure, fromSuccess } from "./errable"

describe("errable", () => {
  describe("fromFailure", () => {
    it("should return the message from error", () => {
      expect(fromFailure(new Failure("test"))).toBe("test")
    })
    it("should throw when not an error", () => {
      expect(() => fromFailure(new Success("test"))).toThrowError("expected failure")
    })
  })
  describe("fromSuccess", () => {
    it("should return the result from success", () => {
      expect(fromSuccess(new Success("test"))).toBe("test")
    })
    it("should throw when not a success", () => {
      expect(() => fromSuccess(new Failure("test"))).toThrowError("expected success")
    })
  })
})
