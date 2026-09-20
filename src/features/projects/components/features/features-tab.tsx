import * as React from "react";
import { Layers } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import type { Project } from "@/types/project";
import { MOCK_FEATURE_STREAMS, type FeatureStream } from "./mock-data";
import { FeatureDetailDialog } from "./feature-detail-dialog";

interface FeaturesTabProps {
  project: Project;
  selectedMemberId?: string | null;
}

export function FeaturesTab({
  project,
  selectedMemberId: _selectedMemberId,
}: FeaturesTabProps) {
  const [selectedFeature, setSelectedFeature] =
    React.useState<FeatureStream | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider text-muted-foreground">
          Feature Milestone Streams for {project.name} (Click to view allocated
          tasks)
        </span>
      </div>

      {MOCK_FEATURE_STREAMS.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border-subtle bg-canvas-bg/40 py-14 text-center">
          <Icon icon={Layers} size={22} className="text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">
            No feature streams yet
          </p>
          <p className="max-w-xs text-xs text-muted-foreground">
            Feature streams will appear here once tasks are grouped into
            milestones for this project.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MOCK_FEATURE_STREAMS.map((stream) => {
            const isActive = stream.status === "ACTIVE";

            return (
              <Card
                key={stream.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setSelectedFeature(stream);
                  setIsDetailOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedFeature(stream);
                    setIsDetailOpen(true);
                  }
                }}
                className={`group flex cursor-pointer flex-col justify-between p-5 shadow-xs transition hover:shadow-md ${
                  isActive ? "hover:border-teal-500" : "hover:border-amber-500"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <Badge
                      variant="outline"
                      className={
                        isActive
                          ? "text-3xs px-2 py-0.5 font-bold border-teal-500/30 text-teal-600 bg-teal-500/10 dark:text-teal-400"
                          : "text-3xs px-2 py-0.5 font-bold border-amber-500/30 text-amber-700 bg-amber-500/10 dark:text-amber-400"
                      }
                    >
                      {stream.status}
                    </Badge>
                    <h4
                      className={`mt-1.5 text-base font-bold text-foreground ${
                        isActive
                          ? "group-hover:text-teal-600 dark:group-hover:text-teal-400"
                          : "group-hover:text-amber-700 dark:group-hover:text-amber-400"
                      }`}
                    >
                      {stream.name}
                    </h4>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      isActive
                        ? "text-teal-600 dark:text-teal-400"
                        : "text-amber-700 dark:text-amber-400"
                    }`}
                  >
                    {stream.progress}%
                  </span>
                </div>

                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                  {stream.description}
                </p>

                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${
                      isActive ? "bg-teal-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${stream.progress}%` }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border-subtle pt-3 text-xs text-muted-foreground">
                  <span>
                    {stream.tasksCount} Tasks ({stream.tasksCompleted}{" "}
                    Completed)
                  </span>
                  <div className="flex -space-x-1.5">
                    {stream.avatars.map((avatar, index) => (
                      <Avatar
                        key={`${stream.id}-${avatar.initials}-${index}`}
                        className="h-6 w-6 border border-canvas-surface"
                      >
                        <AvatarFallback
                          className={`text-3xs font-bold text-white ${avatar.colorClass}`}
                        >
                          {avatar.initials}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <FeatureDetailDialog
        feature={selectedFeature}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  );
}
