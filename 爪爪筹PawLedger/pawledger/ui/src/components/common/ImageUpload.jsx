import React, { useRef, useState } from "react";
import { useLocale } from "../../hooks/useLocale";

const MAX_SIZE_MB = 5;
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

/**
 * Drag-and-drop image upload component.
 * Props:
 *   files: File[]                — controlled list of selected files
 *   onChange: (files: File[]) => void
 *   max: number                  — max number of images (default 5)
 */
export default function ImageUpload({ files = [], onChange, max = 5 }) {
  const { t } = useLocale();
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  const addFiles = (incoming) => {
    setSizeError(false);
    const valid = [];
    for (const f of incoming) {
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        setSizeError(true);
        continue;
      }
      if (!files.some((ex) => ex.name === f.name && ex.size === f.size)) {
        valid.push(f);
      }
    }
    const merged = [...files, ...valid].slice(0, max);
    onChange(merged);
  };

  const remove = (idx) => onChange(files.filter((_, i) => i !== idx));

  const onInputChange = (e) => {
    addFiles(Array.from(e.target.files));
    e.target.value = "";
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/")));
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {t("submit.upload_image")}
        <span className="ml-1 text-gray-400 font-normal text-xs">
          ({files.length}/{max})
        </span>
      </label>

      {/* Drop zone */}
      {files.length < max && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`
            flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed
            cursor-pointer px-4 py-8 transition-colors text-sm
            ${dragOver
              ? "border-emerald-400 bg-emerald-50"
              : "border-gray-300 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50"
            }
          `}
        >
          <span className="text-3xl">🐾</span>
          <p className="font-medium text-gray-700">{t("submit.upload_drag")}</p>
          <p className="text-gray-400 text-xs">{t("submit.upload_hint")}</p>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            multiple
            className="hidden"
            onChange={onInputChange}
          />
        </div>
      )}

      {sizeError && (
        <p className="text-xs text-red-500">{t("submit.upload_size_error")}</p>
      )}

      {/* Preview grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {files.map((file, idx) => {
            const url = URL.createObjectURL(file);
            return (
              <div key={idx} className="relative group rounded-lg overflow-hidden aspect-square bg-gray-100">
                <img
                  src={url}
                  alt={file.name}
                  className="w-full h-full object-cover"
                  onLoad={() => URL.revokeObjectURL(url)}
                />
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
