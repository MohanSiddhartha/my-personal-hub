import { useState, useEffect, useCallback } from "react";
import { FolderLock, Upload, Trash2, Download, FileText, Image, File, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GlitchText } from "@/components/GlitchText";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface StoredFile {
  name: string;
  id: string;
  created_at: string;
  metadata: { size: number; mimetype: string } | null;
}

const FILE_ICONS: Record<string, typeof FileText> = {
  "application/pdf": FileText,
  "image/": Image,
};

function getFileIcon(mime: string | undefined) {
  if (!mime) return File;
  for (const [key, Icon] of Object.entries(FILE_ICONS)) {
    if (mime.startsWith(key)) return Icon;
  }
  return File;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function FileLocker() {
  const { user } = useAuth();
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchFiles = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase.storage.from("vault-files").list(user.id, {
      sortBy: { column: "created_at", order: "desc" },
    });
    if (error) {
      toast.error("Failed to load files");
      console.error(error);
    } else {
      setFiles((data || []).filter(f => f.name !== ".emptyFolderPlaceholder") as StoredFile[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList?.length || !user) return;
    setUploading(true);

    for (const file of Array.from(fileList)) {
      if (file.size > 20 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 20MB limit`);
        continue;
      }
      const path = `${user.id}/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from("vault-files").upload(path, file);
      if (error) {
        toast.error(`Failed to upload ${file.name}`);
        console.error(error);
      } else {
        toast.success(`Uploaded ${file.name}`);
      }
    }
    setUploading(false);
    fetchFiles();
    e.target.value = "";
  };

  const handleDownload = async (fileName: string) => {
    if (!user) return;
    const { data, error } = await supabase.storage.from("vault-files").download(`${user.id}/${fileName}`);
    if (error) { toast.error("Download failed"); return; }
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.replace(/^\d+_/, "");
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (fileName: string) => {
    if (!user) return;
    const { error } = await supabase.storage.from("vault-files").remove([`${user.id}/${fileName}`]);
    if (error) { toast.error("Delete failed"); return; }
    toast.success("File deleted");
    fetchFiles();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FolderLock className="h-8 w-8 text-primary" style={{ animation: "float 6s ease-in-out infinite" }} />
          <GlitchText text="FILE LOCKER" className="text-2xl md:text-3xl" />
        </div>
        <label>
          <input type="file" multiple className="hidden" onChange={handleUpload} accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.txt,.md,.csv,.xlsx" />
          <Button asChild disabled={uploading} className="bg-primary hover:bg-primary/80 text-primary-foreground cursor-pointer">
            <span>
              {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
              Upload Files
            </span>
          </Button>
        </label>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
          <FolderLock className="h-16 w-16 opacity-20" />
          <p className="font-mono text-sm">Your vault is empty. Upload PDFs, certificates, resumes...</p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="grid gap-3">
            {files.map((file) => {
              const Icon = getFileIcon(file.metadata?.mimetype);
              const displayName = file.name.replace(/^\d+_/, "");
              return (
                <div
                  key={file.id || file.name}
                  className="group flex items-center justify-between p-4 rounded-xl border border-border/30 bg-card/30 backdrop-blur-sm hover:border-primary/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="h-5 w-5 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{displayName}</p>
                      <p className="text-[10px] font-mono text-muted-foreground">
                        {file.metadata?.size ? formatSize(file.metadata.size) : "—"} • {new Date(file.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownload(file.name)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(file.name)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
