import { ConfirmDialog } from "@/components/composed/confirm-dialog";
import type { Project } from "@/types/project";

interface DeleteProjectDialogProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

/** The one "delete this project?" confirmation, shared by the card and header. */
export function DeleteProjectDialog({
  project,
  open,
  onOpenChange,
  onConfirm,
}: DeleteProjectDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Project"
      description={
        <>
          Are you sure you want to delete{" "}
          <strong className="break-all font-semibold text-foreground">
            {project.name}
          </strong>
          ? This action cannot be undone and will remove all associated sprints,
          tasks, and logged hours.
        </>
      }
      confirmLabel="Delete Project"
      // Irreversible: make the user click, don't let a stray Enter confirm.
      autoFocusConfirm={false}
      onConfirm={onConfirm}
    />
  );
}
