"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { hirzexaApiClient, type CameraUpdateInput } from "@/lib/api-client";

export const queryKeys = {
  status: ["status"] as const,
  events: ["events"] as const,
  alerts: ["alerts"] as const,
  alertCount: ["alert-count"] as const,
  incidents: ["incidents"] as const,
  evidence: ["persisted-evidence"] as const,
  tracks: ["tracks"] as const,
  statistics: ["statistics"] as const,
  semanticResults: ["semantic-results"] as const,
  evidenceSearchStatus: ["evidence-search-status"] as const,
  evidenceSearch: (request: unknown) => ["evidence-search", request] as const,
  evidenceSearchDetail: (eventId: string) => ["evidence-search-detail", eventId] as const,
  cameras: ["cameras"] as const,
  cameraEvents: (cameraId: string) => ["camera-events", cameraId] as const,
  cameraDetections: (cameraId: string) => ["camera-detections", cameraId] as const,
  cameraOverlays: (cameraId: string) => ["camera-overlays", cameraId] as const
};

export function useStatusQuery() {
  return useQuery({
    queryKey: queryKeys.status,
    queryFn: () => hirzexaApiClient.getStatus()
  });
}

export function useEventsQuery() {
  return useQuery({
    queryKey: queryKeys.events,
    queryFn: () => hirzexaApiClient.getEvents()
  });
}

export function useAlertsQuery(activeOnly = false, limit?: number) {
  return useQuery({
    queryKey: [...queryKeys.alerts, activeOnly ? "active" : "all", limit ?? "default"],
    queryFn: () => hirzexaApiClient.getAlerts(activeOnly, limit),
    refetchInterval: 3000
  });
}

export function useAlertCountQuery() {
  return useQuery({
    queryKey: queryKeys.alertCount,
    queryFn: () => hirzexaApiClient.getAlertCount(),
    refetchInterval: 3000
  });
}

export function useIncidentsQuery() {
  return useQuery({
    queryKey: queryKeys.incidents,
    queryFn: () => hirzexaApiClient.getIncidents(),
    refetchInterval: 5000
  });
}

export function usePersistedEvidenceQuery() {
  return useQuery({
    queryKey: queryKeys.evidence,
    queryFn: () => hirzexaApiClient.getPersistedEvidence(),
    refetchInterval: 5000
  });
}

export function useTracksQuery() {
  return useQuery({
    queryKey: queryKeys.tracks,
    queryFn: () => hirzexaApiClient.getTracks(),
    refetchInterval: 3000
  });
}

export function useStatisticsQuery() {
  return useQuery({
    queryKey: queryKeys.statistics,
    queryFn: () => hirzexaApiClient.getStatistics()
  });
}

export function useSemanticResultsQuery() {
  return useQuery({
    queryKey: queryKeys.semanticResults,
    queryFn: () => hirzexaApiClient.getSemanticResults(),
    refetchInterval: 5000
  });
}

export function useEvidenceSearchStatusQuery() {
  return useQuery({ queryKey: queryKeys.evidenceSearchStatus, queryFn: () => hirzexaApiClient.getEvidenceSearchStatus(), refetchInterval: 10000 });
}

export function useEvidenceSearchQuery(request: Parameters<typeof hirzexaApiClient.searchEvidence>[0], enabled: boolean) {
  return useQuery({ queryKey: queryKeys.evidenceSearch(request), queryFn: () => hirzexaApiClient.searchEvidence(request), enabled, staleTime: 0 });
}

export function useEvidenceSearchDetailQuery(eventId: string | null) {
  return useQuery({ queryKey: queryKeys.evidenceSearchDetail(eventId ?? "none"), queryFn: () => hirzexaApiClient.getEvidenceSearchDetail(eventId!), enabled: Boolean(eventId) });
}

export function useSemanticQueryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (prompt: string) =>
      hirzexaApiClient.submitSemanticQuery({
        prompt,
        priority: 50
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.semanticResults });
    }
  });
}

export function useCamerasQuery() {
  return useQuery({
    queryKey: queryKeys.cameras,
    queryFn: () => hirzexaApiClient.getCameras(),
    refetchInterval: 3000
  });
}

export function useCameraEventsQuery(cameraId?: string) {
  return useQuery({
    queryKey: queryKeys.cameraEvents(cameraId ?? ""),
    queryFn: () => hirzexaApiClient.getCameraEvents(cameraId ?? ""),
    enabled: Boolean(cameraId),
    refetchInterval: 5000
  });
}

export function useCameraDetectionsQuery(cameraId?: string) {
  return useQuery({
    queryKey: queryKeys.cameraDetections(cameraId ?? ""),
    queryFn: () => hirzexaApiClient.getCameraDetections(cameraId ?? ""),
    enabled: Boolean(cameraId),
    refetchInterval: 3000
  });
}

export function useCameraOverlaysQuery(cameraId?: string) {
  return useQuery({
    queryKey: queryKeys.cameraOverlays(cameraId ?? ""),
    queryFn: () => hirzexaApiClient.getCameraOverlays(cameraId ?? ""),
    enabled: Boolean(cameraId),
    refetchInterval: 3000
  });
}

export function useCreateCameraMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: hirzexaApiClient.createCamera.bind(hirzexaApiClient),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cameras });
      void queryClient.invalidateQueries({ queryKey: queryKeys.status });
    }
  });
}

export function useUpdateCameraMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cameraId, input }: { cameraId: string; input: CameraUpdateInput }) => hirzexaApiClient.updateCamera(cameraId, input),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cameras });
      void queryClient.invalidateQueries({ queryKey: queryKeys.cameraOverlays(variables.cameraId) });
    }
  });
}

export function useCameraConnectionTestMutation() {
  return useMutation({
    mutationFn: hirzexaApiClient.testCameraConnection.bind(hirzexaApiClient)
  });
}

export function useStartCameraMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cameraId: string) => hirzexaApiClient.startCamera(cameraId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cameras });
      void queryClient.invalidateQueries({ queryKey: queryKeys.status });
    }
  });
}

export function useStopCameraMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cameraId: string) => hirzexaApiClient.stopCamera(cameraId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cameras });
      void queryClient.invalidateQueries({ queryKey: queryKeys.status });
    }
  });
}

export function useDeleteCameraMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cameraId: string) => hirzexaApiClient.deleteCamera(cameraId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cameras });
      void queryClient.invalidateQueries({ queryKey: queryKeys.status });
    }
  });
}

export function useBrowserFrameMutation() {
  const queryClient = useQueryClient();
  const lastInvalidatedAt = useRef(0);

  return useMutation({
    mutationFn: ({ cameraId, frame }: { cameraId: string; frame: string }) =>
      hirzexaApiClient.sendBrowserFrame(cameraId, frame),
    onSuccess: (_, variables) => {
      const now = Date.now();
      // Background inference and the camera WebSocket supply live updates.
      // Avoid re-fetching every dashboard query for every 200 ms frame.
      if (now - lastInvalidatedAt.current < 2_000) return;
      lastInvalidatedAt.current = now;
      void queryClient.invalidateQueries({ queryKey: queryKeys.cameraEvents(variables.cameraId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.cameraDetections(variables.cameraId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.cameras });
    }
  });
}

export function useUploadVideoMutation() {
  return useMutation({
    mutationFn: (file: File) => hirzexaApiClient.uploadVideo(file)
  });
}

export function useProcessVideoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ videoId, cameraId }: { videoId: string; cameraId?: string }) =>
      hirzexaApiClient.processVideo(videoId, cameraId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cameras });
      void queryClient.invalidateQueries({ queryKey: queryKeys.status });
    }
  });
}
