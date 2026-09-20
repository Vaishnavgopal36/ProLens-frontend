import * as React from "react";
import {
  Upload,
  FileText,
  Image as ImageIcon,
  FileCode,
  FileArchive,
  File as FileIcon,
  Download,
  X,
} from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { Label } from "@/components/ui/label";

export interface AttachmentEntry {
  id: string;
  name: string;
  size: string;
  url: string;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function iconFor(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["png", "jpg", "jpeg", "gif", "svg", "webp"].includes(ext))
    return ImageIcon;
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return FileArchive;
  if (["json", "js", "ts", "tsx", "sql", "yml", "yaml"].includes(ext))
    return FileCode;
  if (["pdf", "doc", "docx", "txt", "md"].includes(ext)) return FileText;
  return FileIcon;
}

export function filesToAttachments(files: FileList): AttachmentEntry[] {
  return Array.from(files).map((file) => ({
    id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: file.name,
    size: formatBytes(file.size),
    url: URL.createObjectURL(file),
  }));
}

interface AttachmentUploadFieldProps {
  label?: string;
  attachments: AttachmentEntry[];
  onAdd: (entries: AttachmentEntry[]) => void;
  onRemove: (id: string) => void;
}

export function AttachmentUploadField({
  label = "Attachments",
  attachments,
  onAdd,
  onRemove,
}: AttachmentUploadFieldProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">{label}</Label>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1 text-2xs font-medium text-teal-600 dark:text-teal-400 hover:underline"
        >
          <Icon icon={Upload} size={12} />
          Upload file
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              onAdd(filesToAttachments(e.target.files));
            }
            e.target.value = "";
          }}
        />
      </div>

      {attachments.length === 0 ? (
        <p className="rounded-md border border-dashed border-border-subtle bg-canvas-bg/40 px-2.5 py-3 text-center text-2xs text-muted-foreground">
          No files attached yet.
        </p>
      ) : (
        <div className="space-y-1 rounded-md border border-border-subtle bg-canvas-bg/40 p-1.5">
          {attachments.map((file) => {
            const FileTypeIcon = iconFor(file.name);
            return (
              <div
                key={file.id}
                className="flex items-center gap-2 rounded px-1.5 py-1.5 hover:bg-canvas-surface group"
              >
                <Icon
                  icon={FileTypeIcon}
                  size={16}
                  className="text-muted-foreground shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground">
                    {file.name}
                  </p>
                  <p className="text-3xs text-muted-foreground">{file.size}</p>
                </div>
                <a
                  href={file.url}
                  download={file.name}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                  aria-label={`Download ${file.name}`}
                >
                  <Icon icon={Download} size={14} />
                </a>
                <button
                  type="button"
                  onClick={() => onRemove(file.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                  aria-label={`Remove ${file.name}`}
                >
                  <Icon icon={X} size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
