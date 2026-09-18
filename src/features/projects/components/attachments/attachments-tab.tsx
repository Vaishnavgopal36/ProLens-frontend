import { FileText, Image, FileCode, FileType2, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import type { Project } from "@/types/project";

interface AttachmentFile {
  id: string;
  name: string;
  size: string;
  kind: "pdf" | "image" | "code" | "doc";
}

const MOCK_ATTACHMENTS: AttachmentFile[] = [
  { id: "att-1", name: "WCAG_Audit_v1.pdf", size: "2.4 MB", kind: "pdf" },
  { id: "att-2", name: "Figma_Export_Screens.zip", size: "18.1 MB", kind: "image" },
  { id: "att-3", name: "tailwind_theme_tokens.json", size: "42 KB", kind: "code" },
  { id: "att-4", name: "Stakeholder_Signoff.docx", size: "310 KB", kind: "doc" },
  { id: "att-5", name: "Homepage_Hero_Final.png", size: "6.7 MB", kind: "image" },
  { id: "att-6", name: "api_response_schema.json", size: "18 KB", kind: "code" },
];

const KIND_META: Record<
  AttachmentFile["kind"],
  { icon: typeof FileText; className: string }
> = {
  pdf: {
    icon: FileText,
    className: "text-rose-500 dark:text-rose-400",
  },
  image: {
    icon: Image,
    className: "text-teal-600 dark:text-teal-400",
  },
  code: {
    icon: FileCode,
    className: "text-amber-500 dark:text-amber-400",
  },
  doc: {
    icon: FileType2,
    className: "text-navy-500 dark:text-navy-300",
  },
};

interface AttachmentsTabProps {
  project: Project;
  selectedMemberId?: string | null;
}

export function AttachmentsTab({ project: _project, selectedMemberId: _selectedMemberId }: AttachmentsTabProps) {
  return (
    <div className="flex flex-col gap-4">
      <Card className="border-border-subtle bg-canvas-surface p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-sm text-foreground">
            Attachments &amp; Design Assets
          </h4>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs font-semibold bg-canvas-surface hover:bg-canvas-overlay"
          >
            <Icon icon={Upload} size={15} />
            <span>Upload File</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {MOCK_ATTACHMENTS.map((file) => {
            const meta = KIND_META[file.kind];
            return (
              <div
                key={file.id}
                className="p-3 rounded-lg border border-border-subtle flex items-center gap-3"
              >
                <Icon icon={meta.icon} size={24} className={meta.className} />
                <div className="min-w-0">
                  <span className="font-semibold text-foreground block truncate">
                    {file.name}
                  </span>
                  <span className="text-muted-foreground text-[10px]">
                    {file.size}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
