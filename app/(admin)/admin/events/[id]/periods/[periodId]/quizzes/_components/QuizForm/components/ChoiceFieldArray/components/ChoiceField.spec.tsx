import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ChoiceField } from "./ChoiceField";

describe("ChoiceField", () => {
  const mockChoice = {
    text: "東京",
    imageUrl: "",
    isCorrect: false,
  };

  it("should render choice field with correct data", () => {
    const handleUpdate = vi.fn();
    const handleRemove = vi.fn();
    const handleUpload = vi.fn();
    const handleCorrect = vi.fn();

    render(
      <ChoiceField
        choice={mockChoice}
        index={0}
        totalChoices={2}
        onUpdateField={handleUpdate}
        onRemove={handleRemove}
        onUploadImage={handleUpload}
        onCorrectChange={handleCorrect}
      />
    );

    const input = screen.getByDisplayValue("東京") as HTMLInputElement;
    expect(input).toBeInTheDocument();
  });

  it("should not show delete button when only 2 choices remain", () => {
    const handleUpdate = vi.fn();
    const handleRemove = vi.fn();
    const handleUpload = vi.fn();
    const handleCorrect = vi.fn();

    render(
      <ChoiceField
        choice={mockChoice}
        index={0}
        totalChoices={2}
        onUpdateField={handleUpdate}
        onRemove={handleRemove}
        onUploadImage={handleUpload}
        onCorrectChange={handleCorrect}
      />
    );

    const deleteButton = screen.queryByText("削除");
    expect(deleteButton).not.toBeInTheDocument();
  });

  it("should show delete button when more than 2 choices", () => {
    const handleUpdate = vi.fn();
    const handleRemove = vi.fn();
    const handleUpload = vi.fn();
    const handleCorrect = vi.fn();

    render(
      <ChoiceField
        choice={mockChoice}
        index={0}
        totalChoices={3}
        onUpdateField={handleUpdate}
        onRemove={handleRemove}
        onUploadImage={handleUpload}
        onCorrectChange={handleCorrect}
      />
    );

    const deleteButton = screen.getByText("削除");
    expect(deleteButton).toBeInTheDocument();
  });

  it("should update text field when user types", () => {
    const handleUpdate = vi.fn();
    const handleRemove = vi.fn();
    const handleUpload = vi.fn();
    const handleCorrect = vi.fn();

    render(
      <ChoiceField
        choice={mockChoice}
        index={0}
        totalChoices={2}
        onUpdateField={handleUpdate}
        onRemove={handleRemove}
        onUploadImage={handleUpload}
        onCorrectChange={handleCorrect}
      />
    );

    const input = screen.getByDisplayValue("東京") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "京都" } });

    expect(handleUpdate).toHaveBeenCalledWith("text", "京都");
  });

  it("should call onCorrectChange when radio button is clicked", () => {
    const handleUpdate = vi.fn();
    const handleRemove = vi.fn();
    const handleUpload = vi.fn();
    const handleCorrect = vi.fn();

    render(
      <ChoiceField
        choice={mockChoice}
        index={0}
        totalChoices={2}
        onUpdateField={handleUpdate}
        onRemove={handleRemove}
        onUploadImage={handleUpload}
        onCorrectChange={handleCorrect}
      />
    );

    const radio = screen.getByRole("radio") as HTMLInputElement;
    fireEvent.click(radio);

    expect(handleCorrect).toHaveBeenCalledWith(true);
  });
});
