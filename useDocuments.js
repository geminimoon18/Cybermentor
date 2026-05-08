// hooks/useDocuments.js
import { useState, useCallback, useEffect } from "react";

export function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Load existing docs on mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch {}
  };

  const uploadFile = useCallback(async (file) => {
    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setDocuments(prev => [...prev, data]);
      return data;
    } catch (err) {
      setUploadError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  }, []);

  const removeDocument = useCallback(async (docId) => {
    try {
      const res = await fetch(`/api/documents/${docId}`, { method: "DELETE" });
      if (res.ok) {
        setDocuments(prev => prev.filter(d => d.id !== docId));
      }
    } catch {}
  }, []);

  return {
    documents,
    uploading,
    uploadError,
    uploadFile,
    removeDocument,
  };
}
