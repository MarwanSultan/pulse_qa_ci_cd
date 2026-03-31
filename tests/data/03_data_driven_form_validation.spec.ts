import { test, expect } from "../fixtures/testFixtures";
import { validateEmail } from "../../src/testData/inputValidator";

test.describe("Data-driven: Form Validation with Zod Edge Cases", () => {
  test("validate valid email", () => {
    const result = validateEmail("test@example.com");
    expect(result.valid).toBe(true);
  });
  
  test("validate invalid email without @", () => {
    const result = validateEmail("testexample.com");
    expect(result.valid).toBe(false);
  });

  test("validate empty email", () => {
    const result = validateEmail("");
    expect(result.valid).toBe(false);
  });
});
