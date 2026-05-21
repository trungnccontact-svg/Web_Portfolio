"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, Search, Briefcase, FileSignature, CheckCircle, AlertCircle, Download, Copy, Loader2, MapPin, Navigation } from "lucide-react";
import { callOpenRouter } from "@/lib/openrouter";
import { searchRealJobs } from "@/lib/googleSearch";
import { geocodeAddress, haversineDistance } from "@/lib/geocoding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

type CVAnalysisResult = {
  skills: string[];
  experience_years: number;
  suggested_positions: string[];
  strengths: string[];
  improvement_areas: string[];
  fullName?: string;
  experience_details?: string;
};

type JobResult = {
  title: string;
  company: string;
  location: string;
  salary_range: string;
  key_requirements: string[];
  apply_url: string;
  match_score: number;
  source: string;
  snippet?: string;
  lat?: number;
  lng?: number;
  distance_km?: number;
};

export function AIJobAgent() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Section 1 State
  const [file, setFile] = useState<File | null>(null);
  const [cvText, setCvText] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CVAnalysisResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Section 2 State (Search & Location)
  const [jobQuery, setJobQuery] = useState("");
  const [isSearchingJobs, setIsSearchingJobs] = useState(false);
  const [jobs, setJobs] = useState<JobResult[]>([]);
  
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [maxDistance, setMaxDistance] = useState<number>(20);
  const [manualAddress, setManualAddress] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  // Section 3 State
  const [selectedJob, setSelectedJob] = useState<JobResult | null>(null);
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // === Section 1: Upload & Analyze ===
  
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile);
    try {
      const text = await selectedFile.text();
      setCvText(text);
      toast({ title: "Tải file thành công", description: `Đã tải lên: ${selectedFile.name}` });
    } catch (error) {
      toast({ title: "Lỗi tải file", description: "Không thể đọc nội dung file. Hãy thử file .txt hoặc copy text trực tiếp.", variant: "destructive" });
    }
  };

  const analyzeCV = async () => {
    if (!cvText && !file) return;
    setIsAnalyzing(true);
    try {
      const prompt = `Bạn là chuyên gia tuyển dụng IT tại Việt Nam. Phân tích CV này và trả về JSON với các trường:
skills (array strings), experience_years (number), suggested_positions (array of strings in Vietnamese), strengths (array strings), improvement_areas (array strings), fullName (string), experience_details (string - tóm tắt ngắn gọn các công ty và dự án đã làm).
Tập trung vào các vị trí IT phù hợp tại Việt Nam.`;
      const responseText = await callOpenRouter(prompt, cvText || file!.name);
      try {
        const parsed = JSON.parse(responseText);
        setAnalysisResult(parsed);
        if (parsed.suggested_positions && parsed.suggested_positions.length > 0) {
          setJobQuery(parsed.suggested_positions[0]);
        }
        toast({ title: "Phân tích hoàn tất", description: "Đã phân tích xong CV của bạn." });
      } catch (parseError) {
        throw new Error("Lỗi định dạng dữ liệu trả về từ AI.");
      }
    } catch (error: any) {
      toast({ title: "Lỗi phân tích", description: error.message || "Đã xảy ra lỗi khi phân tích CV.", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // === Section 2: Find Jobs & Location ===

  const getUserLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLat(position.coords.latitude);
          setUserLng(position.coords.longitude);
          setIsLocating(false);
          toast({ title: "Đã lấy vị trí hiện tại" });
        },
        (error) => {
          setIsLocating(false);
          toast({ title: "Lỗi vị trí", description: "Vui lòng cho phép quyền truy cập vị trí.", variant: "destructive" });
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  const handleManualAddress = async () => {
    if (!manualAddress) return;
    setIsLocating(true);
    const loc = await geocodeAddress(manualAddress);
    if (loc) {
      setUserLat(loc.lat);
      setUserLng(loc.lng);
      toast({ title: "Đã xác định vị trí" });
    } else {
      toast({ title: "Không tìm thấy địa chỉ", variant: "destructive" });
    }
    setIsLocating(false);
  };

  const searchJobs = async () => {
    if (!jobQuery || !analysisResult) return;
    setIsSearchingJobs(true);
    
    const topSkill = analysisResult.skills[0] || "IT";
    const positionTitle = jobQuery;

    try {
      const googleResults = await Promise.all([
        searchRealJobs(`${positionTitle} tuyển dụng TP.HCM site:itviec.com`),
        searchRealJobs(`${topSkill} developer việc làm Hồ Chí Minh site:topcv.vn`),
        searchRealJobs(`${positionTitle} IT tuyển dụng HCM site:vietnamworks.com`)
      ]);

      const allItems = googleResults.flat();
      let allJobs: JobResult[] = allItems.map((item: any) => {
        const displayLink = item.displayLink || "";
        let source = "General";
        if (displayLink.includes("itviec.com")) source = "ITviec";
        else if (displayLink.includes("topcv.vn")) source = "TopCV";
        else if (displayLink.includes("vietnamworks.com")) source = "VietnamWorks";

        return {
          title: item.title,
          company: displayLink.replace("www.", "").split(".")[0],
          location: "Hồ Chí Minh", // Default, will geocode
          salary_range: "Thỏa thuận",
          key_requirements: [],
          apply_url: item.link,
          match_score: 0, // Will be scored by AI
          source: source,
          snippet: item.snippet
        };
      });

      // Remove duplicates
      const uniqueJobsMap = new Map();
      allJobs.forEach(j => {
        if (!uniqueJobsMap.has(j.apply_url)) uniqueJobsMap.set(j.apply_url, j);
      });
      allJobs = Array.from(uniqueJobsMap.values());

      // Batch scoring with OpenRouter
      if (allJobs.length > 0) {
        const scoringPrompt = `Bạn là chuyên gia nhân sự. Dựa trên CV có kỹ năng: ${analysisResult.skills.join(", ")}, hãy chấm điểm mức độ phù hợp (0-100) cho danh sách công việc sau. Trả về DUY NHẤT một JSON array dạng [{ "index": number, "score": number }].`;
        const jobListStr = allJobs.map((j, i) => `Job ${i}: ${j.title}. Mô tả: ${j.snippet}`).join("\n");
        
        try {
          const scoringResponse = await callOpenRouter(scoringPrompt, jobListStr, "deepseek/deepseek-v4-flash:free");
          const scores = JSON.parse(scoringResponse);
          if (Array.isArray(scores)) {
            scores.forEach((s: any) => {
              if (allJobs[s.index]) allJobs[s.index].match_score = s.score;
            });
          }
        } catch (e) {
          console.error("Batch scoring failed", e);
        }
      }

      // Geocode concurrently in background
      allJobs.forEach(async (job) => {
        const loc = await geocodeAddress(job.location);
        if (loc) {
          job.lat = loc.lat;
          job.lng = loc.lng;
          setJobs([...allJobs]); // Trigger re-render
        }
      });

      allJobs.sort((a, b) => b.match_score - a.match_score);
      setJobs(allJobs);
      toast({ title: "Tìm kiếm hoàn tất", description: `Đã tìm thấy ${allJobs.length} công việc thực tế.` });
    } catch (error: any) {
      toast({ title: "Lỗi tìm việc", description: error.message || "Đã xảy ra lỗi khi tìm kiếm công việc.", variant: "destructive" });
    } finally {
      setIsSearchingJobs(false);
    }
  };

  const filteredJobs = jobs.map(job => {
    let dist = undefined;
    if (userLat !== null && userLng !== null && job.lat !== undefined && job.lng !== undefined) {
      dist = haversineDistance(userLat, userLng, job.lat, job.lng);
    }
    return { ...job, distance_km: dist };
  }).filter(job => {
    if (userLat !== null && job.distance_km !== undefined) {
      return job.distance_km <= maxDistance;
    }
    return true; 
  });

  const getMatchColor = (score: number) => {
    if (score >= 80) return "bg-green-500/20 text-green-500 border-green-500/30";
    if (score >= 60) return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
    return "bg-red-500/20 text-red-500 border-red-500/30";
  };

  const getSourceColor = (source: string) => {
    if (source === "ITviec") return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    if (source === "TopCV") return "bg-green-500/10 text-green-500 border-green-500/20";
    if (source === "VietnamWorks") return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
    return "bg-gray-500/10 text-gray-500 border-gray-500/20";
  };

  // === Section 3: Cover Letter ===

  const openCoverLetterModal = (job: JobResult) => {
    setSelectedJob(job);
    setIsModalOpen(true);
    generateCoverLetter(job);
  };

  const generateCoverLetter = async (job: JobResult) => {
    setIsGeneratingLetter(true);
    setCoverLetter("");
    try {
      const cvData = {
        name: analysisResult?.fullName || "Ứng viên",
        exp: analysisResult?.experience_years,
        skills: analysisResult?.skills.join(", "),
        details: analysisResult?.experience_details
      };

      const prompt = `Bạn là chuyên gia viết cover letter IT tại Việt Nam. Hãy soạn một bản cover letter chuyên nghiệp cho ứng viên ${cvData.name} ứng tuyển vị trí ${job.title} tại ${job.company}.
      
Dữ liệu CV thực tế:
- Kinh nghiệm: ${cvData.exp} năm.
- Kỹ năng chính: ${cvData.skills}.
- Chi tiết kinh nghiệm: ${cvData.details}.

Yêu cầu QUAN TRỌNG:
1. TUYỆT ĐỐI không sử dụng các placeholder dạng []. Hãy dùng đúng tên người, tên công ty và số năm kinh nghiệm từ dữ liệu trên.
2. Cấu trúc 4 đoạn:
   - Đoạn 1: Giới thiệu bản thân, vị trí ứng tuyển và lý do yêu thích ${job.company}.
   - Đoạn 2: Nêu bật ${cvData.exp} năm kinh nghiệm và các dự án liên quan từ dữ liệu CV.
   - Đoạn 3: Khẳng định các kỹ năng ${cvData.skills} hoàn toàn phù hợp với yêu cầu công việc.
   - Đoạn 4: Lời chào chuyên nghiệp và mong muốn được phỏng vấn.
3. Ngôn ngữ: Tiếng Việt.
4. Trả về plain text, không markdown, không ký tự đặc biệt.`;
      
      const responseText = await callOpenRouter(prompt, "Viết cover letter", "deepseek/deepseek-v4-flash:free");
      setCoverLetter(responseText);
    } catch (error: any) {
      toast({ title: "Lỗi tạo Cover Letter", description: error.message || "Đã xảy ra lỗi khi viết Cover Letter.", variant: "destructive" });
    } finally {
      setIsGeneratingLetter(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(coverLetter);
    toast({ title: "Đã sao chép", description: "Đã lưu vào clipboard." });
  };

  const downloadTxt = () => {
    const element = document.createElement("a");
    const file = new Blob([coverLetter], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `Cover_Letter_${selectedJob?.company?.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-4 space-y-16">
      
      {/* Section 1: CV Upload & Analysis */}
      <section className="space-y-6">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">1. Tải lên CV của bạn</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Chúng tôi sẽ phân tích CV của bạn để tìm ra những điểm mạnh, kỹ năng cốt lõi và đề xuất các vị trí công việc phù hợp nhất.
          </p>
        </div>

        <Card className={cn("border-2 border-dashed transition-colors", isDragging ? "border-primary bg-primary/5" : "")}>
          <div
            className="p-12 flex flex-col items-center justify-center text-center cursor-pointer"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".pdf,.docx,.txt" />
            <Upload className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Kéo thả CV vào đây</h3>
            <p className="text-muted-foreground mb-4">Hỗ trợ PDF, DOCX (Tạm thời ưu tiên file TXT do giới hạn hệ thống)</p>
            {file && (
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <FileText className="h-4 w-4 mr-2 inline" />
                {file.name}
              </Badge>
            )}
          </div>
        </Card>

        <div className="space-y-2 max-w-3xl mx-auto">
          <div className="text-center text-sm text-muted-foreground flex items-center justify-center gap-4">
            <span className="w-12 h-px bg-border"></span> HOẶC <span className="w-12 h-px bg-border"></span>
          </div>
          <Textarea 
            placeholder="Dán trực tiếp nội dung CV (text) của bạn vào đây..."
            className="min-h-[150px]"
            value={cvText}
            onChange={(e) => { setCvText(e.target.value); if (file) setFile(null); }}
          />
        </div>

        <div className="flex justify-center">
          <Button size="lg" onClick={analyzeCV} disabled={!file && !cvText || isAnalyzing} className="w-full md:w-auto px-8">
            {isAnalyzing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang phân tích...</> : "Phân tích CV"}
          </Button>
        </div>

        {analysisResult && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center text-lg"><CheckCircle className="mr-2 h-5 w-5 text-green-500" /> Điểm mạnh & Kỹ năng</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">Kỹ năng cốt lõi:</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.skills.map((skill, i) => <Badge key={i} variant="outline" className="bg-primary/10">{skill}</Badge>)}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">Điểm mạnh:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {analysisResult.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center text-lg"><AlertCircle className="mr-2 h-5 w-5 text-yellow-500" /> Đề xuất & Cải thiện</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">Vị trí phù hợp:</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.suggested_positions.map((pos, i) => <Badge key={i} variant="secondary">{pos}</Badge>)}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">Cần cải thiện:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {analysisResult.improvement_areas.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </section>

      {/* Section 2: Job Match Finder & Location Filter */}
      {analysisResult && (
        <section className="space-y-6 pt-12 border-t border-border/50">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">2. Tìm việc phù hợp</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Sử dụng Google Custom Search để tìm các tin tuyển dụng thực tế 100% từ ITviec, TopCV và VietnamWorks.
            </p>
          </div>

          {/* Location Controls */}
          <Card className="max-w-2xl mx-auto bg-muted/30">
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <Button variant="outline" onClick={getUserLocation} disabled={isLocating} className="w-full sm:w-auto">
                  {isLocating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Navigation className="mr-2 h-4 w-4" />}
                  📍 Dùng vị trí của tôi
                </Button>
                <div className="flex w-full gap-2">
                  <Input placeholder="Hoặc nhập địa chỉ của bạn" value={manualAddress} onChange={(e) => setManualAddress(e.target.value)} />
                  <Button variant="secondary" onClick={handleManualAddress} disabled={!manualAddress || isLocating}>Xác định</Button>
                </div>
              </div>
              
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Khoảng cách tối đa: {maxDistance} km</span>
                  {(userLat !== null) && <span className="text-primary text-xs flex items-center"><CheckCircle className="h-3 w-3 mr-1"/> Đã xác định tọa độ</span>}
                </div>
                <input 
                  type="range" 
                  min="1" max="50" 
                  value={maxDistance} 
                  onChange={(e) => setMaxDistance(Number(e.target.value))}
                  className="w-full cursor-pointer accent-primary"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <Input 
              value={jobQuery} 
              onChange={(e) => setJobQuery(e.target.value)}
              placeholder="Nhập vị trí công việc (vd: Frontend Developer)"
              className="flex-1"
            />
            <Button onClick={searchJobs} disabled={isSearchingJobs || !jobQuery}>
              {isSearchingJobs ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang quét Google...</> : <><Search className="mr-2 h-4 w-4" /> Tìm Việc Thực Tế</>}
            </Button>
          </div>

          {filteredJobs.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6">
              {filteredJobs.map((job, index) => (
                <Card key={index} className="flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap gap-2 items-center mb-2">
                          <Badge variant="outline" className={cn("text-xs", getSourceColor(job.source))}>{job.source}</Badge>
                          <Badge className={cn("px-2 py-0.5 text-xs whitespace-nowrap border", getMatchColor(job.match_score))}>
                            Khớp {job.match_score}%
                          </Badge>
                        </div>
                        <CardTitle className="text-xl leading-tight">{job.title}</CardTitle>
                        <CardDescription className="flex items-center text-sm pt-1">
                          <Briefcase className="mr-1 h-3 w-3 shrink-0" /> <span className="truncate">{job.company}</span>
                        </CardDescription>
                        <CardDescription className="flex items-center text-sm">
                          <MapPin className="mr-1 h-3 w-3 shrink-0" /> <span className="truncate">{job.location}</span>
                          {job.distance_km !== undefined ? (
                            <Badge variant="secondary" className="ml-2 text-[10px]">{job.distance_km.toFixed(1)} km</Badge>
                          ) : (
                            <Badge variant="outline" className="ml-2 text-[10px] opacity-60">Đang tính...</Badge>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3 italic">
                      "{job.snippet}"
                    </p>
                  </CardContent>
                  <CardFooter className="flex gap-3 pt-4 border-t border-border/50">
                    <Button variant="outline" className="flex-1" onClick={() => {
                      const url = job.apply_url || "";
                      const finalUrl = url.startsWith("http") ? url : `https://${url}`;
                      window.open(finalUrl, "_blank");
                    }}>
                      Xem Tin
                    </Button>
                    <Button className="flex-1" onClick={() => openCoverLetterModal(job)}>
                      <FileSignature className="mr-2 h-4 w-4" />
                      Tạo Cover Letter
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Section 3: Cover Letter Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Cover Letter AI Generator</DialogTitle>
            <DialogDescription>
              Tạo thư ứng tuyển cá nhân hóa cho vị trí <span className="font-semibold">{selectedJob?.title}</span> tại {selectedJob?.company}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {isGeneratingLetter ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">AI đang tổng hợp dữ liệu thực từ CV để soạn Cover Letter...</p>
              </div>
            ) : (
              <Textarea 
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="min-h-[300px] text-sm leading-relaxed"
                placeholder="Nội dung cover letter sẽ hiển thị ở đây..."
              />
            )}
          </div>
          
          <DialogFooter className="flex justify-between sm:justify-between items-center w-full">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Đóng</Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={copyToClipboard} disabled={!coverLetter || isGeneratingLetter}>
                <Copy className="mr-2 h-4 w-4" /> Copy
              </Button>
              <Button onClick={downloadTxt} disabled={!coverLetter || isGeneratingLetter}>
                <Download className="mr-2 h-4 w-4" /> Tải về (.txt)
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
