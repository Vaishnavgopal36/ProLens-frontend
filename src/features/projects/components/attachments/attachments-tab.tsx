import * as React from "react";
import {
  FileText,
  Image,
  FileCode,
  FileType2,
  FileArchive,
  Upload,
  Folder,
  ChevronRight,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import type { Project } from "@/types/project";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { AttachmentRead } from "@/lib/api/types";

type AttachmentScope =
  | { type: "project" }
  | { type: "feature"; feature: string }
  | { type: "task"; feature: string; taskCode: string; taskTitle: string };

interface AttachmentFile {
  id: string;
  name: string;
  size: string;
  kind: "pdf" | "image" | "code" | "doc" | "zip";
  scope: AttachmentScope;
}

const MOCK_ATTACHMENTS: AttachmentFile[] = [
  {
    id: "att-1",
    name: "WCAG_Audit_v1.pdf",
    size: "2.4 MB",
    kind: "pdf",
    scope: { type: "project" },
  },
  {
    id: "att-4",
    name: "Stakeholder_Signoff.docx",
    size: "310 KB",
    kind: "doc",
    scope: { type: "project" },
  },
  {
    id: "att-2",
    name: "Figma_Export_Screens.zip",
    size: "18.1 MB",
    kind: "zip",
    scope: { type: "feature", feature: "Design System" },
  },
  {
    id: "att-3",
    name: "tailwind_theme_tokens.json",
    size: "42 KB",
    kind: "code",
    scope: { type: "feature", feature: "Design System" },
  },
  {
    id: "att-5",
    name: "Homepage_Hero_Final.png",
    size: "6.7 MB",
    kind: "image",
    scope: {
      type: "task",
      feature: "Design System",
      taskCode: "PROL-12",
      taskTitle: "UI Design & Prototyping",
    },
  },
  {
    id: "att-7",
    name: "Grid_Spec_Redlines.png",
    size: "1.1 MB",
    kind: "image",
    scope: {
      type: "task",
      feature: "Design System",
      taskCode: "PROL-14",
      taskTitle: "Frontend Layout Grid",
    },
  },
  {
    id: "att-6",
    name: "api_response_schema.json",
    size: "18 KB",
    kind: "code",
    scope: { type: "feature", feature: "Authentication" },
  },
  {
    id: "att-8",
    name: "OAuth_Flow_Diagram.pdf",
    size: "540 KB",
    kind: "pdf",
    scope: {
      type: "task",
      feature: "Authentication",
      taskCode: "PROL-15",
      taskTitle: "API Authentication Hook",
    },
  },
];

const KIND_META: Record<
  AttachmentFile["kind"],
  { icon: typeof FileText; className: string }
> = {
  pdf: { icon: FileText, className: "text-rose-500 dark:text-rose-400" },
  image: { icon: Image, className: "text-teal-600 dark:text-teal-400" },
  code: { icon: FileCode, className: "text-amber-500 dark:text-amber-400" },
  doc: { icon: FileType2, className: "text-navy-500 dark:text-navy-300" },
  zip: { icon: FileArchive, className: "text-violet-500 dark:text-violet-400" },
};

// Where in the folder tree we're currently browsing.
type FolderPath =
  | { level: "root" }
  | { level: "feature"; feature: string }
  | { level: "task"; feature: string; taskCode: string; taskTitle: string };

function scopeMatchesFolder(scope: AttachmentScope, path: FolderPath): boolean {
  if (path.level === "root") return scope.type === "project";
  if (path.level === "feature")
    return scope.type === "feature" && scope.feature === path.feature;
  return (
    scope.type === "task" &&
    scope.feature === path.feature &&
    scope.taskCode === path.taskCode
  );
}

function Tile({
  icon,
  iconClassName,
  label,
  meta,
  onClick,
}: {
  icon: typeof FileText;
  iconClassName: string;
  label: string;
  meta: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className="flex flex-col items-center gap-1.5 rounded-lg p-3 text-center hover:bg-canvas-overlay transition-colors disabled:cursor-default"
    >
      <Icon icon={icon} size={34} className={iconClassName} />
      <span className="w-full text-xs font-medium text-foreground truncate">
        {label}
      </span>
      <span className="text-3xs text-muted-foreground">{meta}</span>
    </button>
  );
}

interface AttachmentsTabProps {
  project: Project;
}

export function AttachmentsTab({ project }: AttachmentsTabProps) {
  const [path, setPath] = React.useState<FolderPath>({ level: "root" });
  const [attachments, setAttachments] =
    React.useState<AttachmentFile[]>(MOCK_ATTACHMENTS);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const loadAttachments = React.useCallback(async () => {
    try {
      const res = await api.attachments.list({ project_id: project.id });
      if (res.length > 0) {
        const mapped: AttachmentFile[] = res.map((a: AttachmentRead) => {
          const kind = a.mime_type.includes("image")
            ? "image"
            : a.mime_type.includes("pdf")
              ? "pdf"
              : a.mime_type.includes("zip") || a.mime_type.includes("tar")
                ? "zip"
                : a.mime_type.includes("json") ||
                    a.mime_type.includes("javascript")
                  ? "code"
                  : "doc";

          const sizeKb = Math.round(a.size_bytes / 1024);
          const sizeStr =
            sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

          return {
            id: a.id,
            name: a.file_name,
            size: sizeStr,
            kind,
            scope: { type: "project" },
          };
        });
        setAttachments([...mapped, ...MOCK_ATTACHMENTS]);
      }
    } catch {
      /* ignore */
    }
  }, [project.id]);

  React.useEffect(() => {
    loadAttachments();
  }, [loadAttachments]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast.info(`Uploading ${file.name}...`);
      await api.attachments.uploadFile(file, { project_id: project.id });
      toast.success("File uploaded successfully");
      await loadAttachments();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileClick = async (file: AttachmentFile) => {
    try {
      const { download_url } = await api.attachments.getDownloadUrl(file.id);
      window.open(download_url, "_blank");
    } catch {
      toast.info(`Previewing ${file.name}`);
    }
  };

  // Distinct features that have at least one attachment (feature-level or
  // nested under one of their tasks), so empty features don't show a folder.
  const featureFolders = React.useMemo(() => {
    const features = new Set<string>();
    for (const file of attachments) {
      if (file.scope.type === "feature" || file.scope.type === "task") {
        features.add(file.scope.feature);
      }
    }
    return Array.from(features);
  }, [attachments]);

  const taskFolders = React.useMemo(() => {
    if (path.level !== "feature") return [];
    const tasks = new Map<string, string>();
    for (const file of attachments) {
      if (file.scope.type === "task" && file.scope.feature === path.feature) {
        tasks.set(file.scope.taskCode, file.scope.taskTitle);
      }
    }
    return Array.from(tasks, ([taskCode, taskTitle]) => ({
      taskCode,
      taskTitle,
    }));
  }, [path, attachments]);

  const filesHere = React.useMemo(
    () => attachments.filter((f) => scopeMatchesFolder(f.scope, path)),
    [path, attachments],
  );

  const countInFeature = (feature: string) =>
    attachments.filter(
      (f) =>
        (f.scope.type === "feature" || f.scope.type === "task") &&
        f.scope.feature === feature,
    ).length;

  const countInTask = (feature: string, taskCode: string) =>
    attachments.filter(
      (f) =>
        f.scope.type === "task" &&
        f.scope.feature === feature &&
        f.scope.taskCode === taskCode,
    ).length;

  return (
    <div className="flex flex-col gap-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />
      <div className="rounded-xl border border-border-subtle bg-canvas-surface shadow-xs">
        <div className="flex items-center justify-between gap-3 p-4 pb-3">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm min-w-0">
            <button
              type="button"
              onClick={() => setPath({ level: "root" })}
              className={
                path.level === "root"
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground hover:text-foreground transition-colors"
              }
            >
              All Files
            </button>

            {path.level !== "root" && (
              <>
                <Icon
                  icon={ChevronRight}
                  size={13}
                  className="text-muted-foreground/60 shrink-0"
                />
                <button
                  type="button"
                  onClick={() =>
                    setPath({ level: "feature", feature: path.feature })
                  }
                  className={
                    path.level === "feature"
                      ? "font-semibold text-foreground truncate"
                      : "text-muted-foreground hover:text-foreground transition-colors truncate"
                  }
                >
                  {path.feature}
                </button>
              </>
            )}

            {path.level === "task" && (
              <>
                <Icon
                  icon={ChevronRight}
                  size={13}
                  className="text-muted-foreground/60 shrink-0"
                />
                <span className="font-semibold text-foreground truncate">
                  {path.taskCode}
                </span>
              </>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="h-8 gap-1.5 text-xs font-semibold bg-canvas-surface hover:bg-canvas-overlay shrink-0"
          >
            <Icon icon={Upload} size={15} />
            <span>Upload File</span>
          </Button>
        </div>

        <div className="border-t border-border-subtle p-3">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1">
            {/* Folders */}
            {path.level === "root" &&
              featureFolders.map((feature) => (
                <Tile
                  key={feature}
                  icon={Folder}
                  iconClassName="text-teal-500"
                  label={feature}
                  meta={`${countInFeature(feature)} files`}
                  onClick={() => setPath({ level: "feature", feature })}
                />
              ))}

            {path.level === "feature" &&
              taskFolders.map(({ taskCode, taskTitle }) => (
                <Tile
                  key={taskCode}
                  icon={Folder}
                  iconClassName="text-teal-500"
                  label={`${taskCode}`}
                  meta={`${countInTask(path.feature, taskCode)} files`}
                  onClick={() =>
                    setPath({
                      level: "task",
                      feature: path.feature,
                      taskCode,
                      taskTitle,
                    })
                  }
                />
              ))}

            {/* Files in the current folder */}
            {filesHere.map((file) => {
              const meta = KIND_META[file.kind];
              return (
                <Tile
                  key={file.id}
                  icon={meta.icon}
                  iconClassName={meta.className}
                  label={file.name}
                  meta={file.size}
                  onClick={() => handleFileClick(file)}
                />
              );
            })}
          </div>

          {path.level === "root" &&
            featureFolders.length === 0 &&
            filesHere.length === 0 && (
              <div className="py-10 text-center text-xs text-muted-foreground">
                No attachments yet.
              </div>
            )}

          {path.level === "feature" &&
            taskFolders.length === 0 &&
            filesHere.length === 0 && (
              <div className="py-10 text-center text-xs text-muted-foreground">
                No files in {path.feature} yet.
              </div>
            )}

          {path.level === "task" && filesHere.length === 0 && (
            <div className="py-10 text-center text-xs text-muted-foreground">
              No files on {path.taskCode} yet.
            </div>
          )}
        </div>
      </div>

      <p className="flex items-center gap-1.5 text-2xs text-muted-foreground px-1">
        <Icon icon={Briefcase} size={12} />
        Files uploaded from a feature or task page land in that folder
        automatically.
      </p>
    </div>
  );
}
