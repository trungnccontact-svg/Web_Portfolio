"use client";

import React, { useState, useEffect } from "react";
import { ClaudeArtifact } from "@/mockdata/artifacts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Sparkles,
  Plus,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  Link2,
  Tag,
} from "lucide-react";

const API_URL = "/api/artifacts";
const CATEGORIES = ["Tất cả", "AI Tool", "CV & Career", "Analytics", "Finance", "Utilities", "Education", "Khác"];

export default function ArtifactsScreen() {
  const { toast } = useToast();

  // State for artifacts list — loaded from server (Redis)
  const [artifacts, setArtifacts] = useState<ClaudeArtifact[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State for Adding New Artifact
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("AI Tool");
  const [newDescription, setNewDescription] = useState("");

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // Load initial data from server (Redis — shared across all devices)
  useEffect(() => {
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data: ClaudeArtifact[]) => {
        setArtifacts(data);
      })
      .catch((e) => {
        console.error("Failed to load artifacts from server", e);
        toast({
          title: "Lỗi kết nối",
          description: "Không thể tải danh sách. Vui lòng thử lại.",
          variant: "destructive",
        });
      })
      .finally(() => setIsLoaded(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save to server (Redis) — shared across all devices
  const saveArtifacts = async (updatedList: ClaudeArtifact[]) => {
    setArtifacts(updatedList);
    setIsSaving(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedList),
      });
      if (!res.ok) throw new Error("Save failed");
    } catch (e) {
      console.error("Failed to save artifacts to server", e);
      toast({
        title: "Lỗi lưu dữ liệu",
        description: "Không thể đồng bộ lên server. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Add New Link (OK Button)
  const handleAddArtifact = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedUrl = newUrl.trim();
    if (!trimmedUrl) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập đường dẫn URL!",
        variant: "destructive",
      });
      return;
    }

    // Basic URL validation
    try {
      new URL(trimmedUrl);
    } catch {
      toast({
        title: "URL không hợp lệ",
        description: "Vui lòng nhập đúng định dạng URL (vd: https://claude.ai/...).",
        variant: "destructive",
      });
      return;
    }

    // DUPLICATE CHECK: Prevent adding duplicate URLs
    const isDuplicate = artifacts.some(
      (item) => item.url.toLowerCase() === trimmedUrl.toLowerCase()
    );

    if (isDuplicate) {
      toast({
        title: "Link bị trùng lặp!",
        description: "Đường dẫn Claude Artifact này đã tồn tại trong danh sách.",
        variant: "destructive",
      });
      return;
    }

    // Auto-generate title if left empty
    const generatedTitle =
      newTitle.trim() || `Claude Artifact #${artifacts.length + 1}`;

    const newArtifact: ClaudeArtifact = {
      id: `custom-${Date.now()}`,
      title: generatedTitle,
      url: trimmedUrl,
      category: newCategory,
      createdAt: new Date().toISOString().split("T")[0],
      description: newDescription.trim() || "Thêm bởi người dùng",
    };

    const updated = [newArtifact, ...artifacts];
    await saveArtifacts(updated);

    // Reset Form
    setNewUrl("");
    setNewTitle("");
    setNewDescription("");

    toast({
      title: "Thêm thành công!",
      description: `Đã lưu link "${generatedTitle}" vào danh sách.`,
    });
  };

  // Handle Delete Artifact
  const handleDeleteArtifact = async (id: string, title: string) => {
    const updated = artifacts.filter((item) => item.id !== id);
    await saveArtifacts(updated);

    toast({
      title: "Đã xóa",
      description: `Đã xóa "${title}" khỏi danh sách.`,
    });
  };

  // Filter & Sort Logic
  const filteredArtifacts = artifacts
    .filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description &&
          item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.url.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "Tất cả" || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

  if (!isLoaded) {
    return (
      <div className="container max-w-6xl px-4 md:px-6 py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm">Đang tải danh sách từ server...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl px-4 md:px-6 py-6 md:py-10 space-y-6 md:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="h-6 w-6 animate-pulse" />
          <h1 className="text-3xl font-bold tracking-tight">Claude Artifacts Storage</h1>
        </div>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Trang quản lý và lưu trữ thông minh các liên kết Claude Artifact. Nhập đường dẫn mới, sắp xếp, tìm kiếm và lọc dữ liệu dễ dàng.
        </p>
      </div>

      {/* Top Section: Form Thêm Link Mới (Input + Button OK) */}
      <Card className="border-primary/20 bg-gradient-to-r from-card to-card/50 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Thêm Claude Link Mới
          </CardTitle>
          <CardDescription>
            Nhập đường dẫn link Claude vào ô dưới đây. Hệ thống sẽ tự động kiểm tra trùng lặp trước khi lưu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddArtifact} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* URL Input (Required) */}
              <div className="md:col-span-6">
                <div className="relative">
                  <Link2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Dán link Claude (https://claude.ai/public/artifacts/...)*"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Title Input (Optional) */}
              <div className="md:col-span-3">
                <Input
                  placeholder="Tên gợi nhớ (không bắt buộc)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              {/* Category Selection */}
              <div className="md:col-span-2">
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {CATEGORIES.filter((c) => c !== "Tất cả").map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Button OK / Thêm */}
              <div className="md:col-span-1">
                <Button type="submit" className="w-full font-bold" disabled={isSaving}>
                  {isSaving ? "..." : "OK"}
                </Button>
              </div>
            </div>

            {/* Optional Description Input */}
            <div>
              <Input
                placeholder="Ghi chú / Mô tả ngắn gọn..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="text-xs"
              />
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Control Bar: Search & Filter Options */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-card border">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên hoặc mô tả..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-9 px-3 text-xs bg-background border rounded-md focus:outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  Thể loại: {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date Sort Filter */}
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
              className="h-9 px-3 text-xs bg-background border rounded-md focus:outline-none"
            >
              <option value="newest">Ngày: Mới nhất</option>
              <option value="oldest">Ngày: Cũ nhất</option>
            </select>
          </div>
        </div>
      </div>

      {/* Artifact List (Grid Layout) */}
      {filteredArtifacts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed rounded-xl space-y-3">
          <AlertCircle className="h-10 w-10 text-muted-foreground/50" />
          <p className="font-semibold text-lg">Không tìm thấy link Claude nào</p>
          <p className="text-sm text-muted-foreground">
            Thử thay đổi từ khóa tìm kiếm hoặc bấm nút OK để thêm link mới.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredArtifacts.map((item) => (
            <Card key={item.id} className="flex flex-col justify-between hover:shadow-lg transition-all duration-200 group border-border/80">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="outline" className="text-[11px] font-normal bg-primary/5 text-primary border-primary/20">
                    <Tag className="h-3 w-3 mr-1" />
                    {item.category || "Khác"}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">
                    {item.createdAt}
                  </span>
                </div>
                <CardTitle className="text-base font-semibold line-clamp-1 mt-2 group-hover:text-primary transition-colors">
                  {item.title}
                </CardTitle>
                {item.description && (
                  <CardDescription className="text-xs line-clamp-2 mt-1">
                    {item.description}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="py-2 text-xs">
                <p className="text-muted-foreground truncate bg-muted/40 p-2 rounded border border-border/40 font-mono text-[11px]">
                  {item.url}
                </p>
              </CardContent>

              <CardFooter className="pt-3 border-t flex items-center justify-between">
                {/* External Link Button */}
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs font-medium text-primary hover:underline gap-1"
                >
                  Mở Artifact
                  <ExternalLink className="h-3 w-3" />
                </a>

                {/* Delete Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteArtifact(item.id, item.title)}
                  className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10 text-xs px-2.5"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Xóa
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
