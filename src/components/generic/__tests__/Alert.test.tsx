import { describe, test, expect } from "bun:test";
import Alert from "../Alert";

describe("Alert Component", () => {
  test("should export Alert component", () => {
    expect(Alert).toBeDefined();
    expect(typeof Alert).toBe("function");
  });

  test("should have correct prop types", () => {
    // Test that the component accepts the expected props
    const props = {
      variant: "error" as const,
      title: "Test Title",
      description: "Test Description",
      actionLabel: "Test Action",
      onAction: () => {},
      className: "test-class",
      children: "Test Children"
    };

    // If this doesn't throw, the component accepts the props correctly
    expect(() => Alert(props)).not.toThrow();
  });

  test("should handle all variant types", () => {
    const variants = ["error", "warning", "info", "success"] as const;
    
    variants.forEach(variant => {
      expect(() => Alert({
        variant,
        title: "Test Title"
      })).not.toThrow();
    });
  });

  test("should handle optional props", () => {
    // Test with minimal props
    expect(() => Alert({
      variant: "error",
      title: "Test Title"
    })).not.toThrow();

    // Test with all optional props
    expect(() => Alert({
      variant: "error",
      title: "Test Title",
      description: "Test Description",
      actionLabel: "Test Action",
      onAction: () => {},
      className: "test-class",
      children: "Test Children"
    })).not.toThrow();
  });
});
