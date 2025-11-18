"use client";

interface QuestionFieldProps {
  value: string;
  error?: string;
  onChange: (value: string) => void;
}

export function QuestionField({ value, error, onChange }: QuestionFieldProps) {
  return (
    <div>
      <label
        htmlFor="text"
        className="
          block text-sm font-medium text-gray-700
          mb-1
        "
      >
        問題文 <span className="text-red-600">*</span>
      </label>
      <textarea
        id="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="例: 東京の首都はどこでしょう?"
        className="
          w-full rounded-md border border-gray-300
          bg-white px-3 py-2
          text-gray-900 placeholder-gray-500
          focus:border-blue-500 focus:outline-none
          focus:ring-1 focus:ring-blue-500
        "
        rows={3}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
