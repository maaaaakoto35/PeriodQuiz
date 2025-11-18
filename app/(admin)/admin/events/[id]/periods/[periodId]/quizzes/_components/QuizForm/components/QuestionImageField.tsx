"use client";

interface QuestionImageFieldProps {
  isUploaded: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function QuestionImageField({
  isUploaded,
  onChange,
}: QuestionImageFieldProps) {
  return (
    <div>
      <label
        htmlFor="questionImage"
        className="
          block text-sm font-medium text-gray-700
          mb-1
        "
      >
        問題画像 （任意）
      </label>
      <div className="flex items-center gap-4">
        <input
          id="questionImage"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={onChange}
          className="
            flex-1 rounded-md border border-gray-300
            bg-white px-3 py-2
            text-gray-900
            text-sm
          "
        />
        {isUploaded && (
          <span className="text-sm text-green-600">✓ アップロード済み</span>
        )}
      </div>
    </div>
  );
}
