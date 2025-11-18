import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { QuestionField } from "./QuestionField";

describe("QuestionField", () => {
  it("should render textarea with correct placeholder", () => {
    const handleChange = vi.fn();
    render(<QuestionField value="" onChange={handleChange} />);

    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea).toBeInTheDocument();
    expect(textarea.placeholder).toContain("例:");
  });

  it("should update value when user types", () => {
    const handleChange = vi.fn();
    render(<QuestionField value="test" onChange={handleChange} />);

    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "new value" } });

    expect(handleChange).toHaveBeenCalledWith("new value");
  });

  it("should display error message when error prop is provided", () => {
    const handleChange = vi.fn();
    const errorMessage = "This field is required";

    render(
      <QuestionField value="" error={errorMessage} onChange={handleChange} />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
});
