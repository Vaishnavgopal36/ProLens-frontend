import { apiClient } from "./client";
import type {
  AttachmentCreate,
  AttachmentDownloadUrl,
  AttachmentRead,
  AttachmentUploadRequest,
  AttachmentUploadUrl,
} from "./types";

export interface ListAttachmentsParams {
  id?: string;
  project_id?: string;
  feature_id?: string;
  task_id?: string;
  activity_id?: string;
  uploaded_by?: string;
  page?: number;
  limit?: number;
}

export const attachmentsApi = {
  async getUploadUrl(data: AttachmentUploadRequest): Promise<AttachmentUploadUrl> {
    return apiClient.post<AttachmentUploadUrl>("/attachments/upload-url", data);
  },

  async create(data: AttachmentCreate): Promise<AttachmentRead> {
    return apiClient.post<AttachmentRead>("/attachments", data);
  },

  async list(params?: ListAttachmentsParams): Promise<AttachmentRead[]> {
    const query = new URLSearchParams();
    if (params?.id) query.append("id", params.id);
    if (params?.project_id) query.append("project_id", params.project_id);
    if (params?.feature_id) query.append("feature_id", params.feature_id);
    if (params?.task_id) query.append("task_id", params.task_id);
    if (params?.activity_id) query.append("activity_id", params.activity_id);
    if (params?.uploaded_by) query.append("uploaded_by", params.uploaded_by);
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));

    const qs = query.toString();
    return apiClient.get<AttachmentRead[]>(`/attachments${qs ? `?${qs}` : ""}`);
  },

  async getDownloadUrl(attachmentId: string): Promise<AttachmentDownloadUrl> {
    return apiClient.get<AttachmentDownloadUrl>(`/attachments/${attachmentId}/download-url`);
  },

  async delete(attachmentId: string): Promise<void> {
    return apiClient.delete<void>(`/attachments/${attachmentId}`);
  },

  async uploadFile(
    file: File,
    target: {
      project_id?: string;
      feature_id?: string;
      task_id?: string;
      activity_id?: string;
    }
  ): Promise<AttachmentRead> {
    const mimeType = file.type || "application/octet-stream";
    const uploadInfo = await this.getUploadUrl({
      file_name: file.name,
      mime_type: mimeType,
      size_bytes: file.size,
    });

    // Upload directly to presigned S3 URL
    await fetch(uploadInfo.upload_url, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": mimeType,
      },
    });

    // Register attachment in backend
    return this.create({
      file_name: file.name,
      s3_key: uploadInfo.s3_key,
      size_bytes: file.size,
      mime_type: mimeType,
      ...target,
    });
  },
};
