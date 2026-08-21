"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Dumbbell, 
  Coins, 
  TrendingUp, 
  AlertTriangle, 
  Gift, 
  ShoppingBag, 
  Plus, 
  Minus, 
  RotateCcw,
  Sparkles,
  CloudLightning,
  Cloud,
  History,
  Edit2,
  Check
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";

interface Transaction {
  id: string;
  type: "penalty" | "reward" | "manual";
  amount: number;
  description: string;
  timestamp: string;
}

interface RulesState {
  playFund: number;
  walkingStreak: number;
  shopeeStreak: number;
  history: Transaction[];
}

const DEFAULT_STATE: RulesState = {
  playFund: 500000, // Default 500k VNĐ
  walkingStreak: 10,
  shopeeStreak: -2,
  history: [
    {
      id: "init-1",
      type: "manual",
      amount: 500000,
      description: "Khởi tạo quỹ mặc định",
      timestamp: new Date().toISOString()
    }
  ]
};

export default function PersonalRulesScreen() {
  const { data: session } = useSession();
  const { toast } = useToast();
  
  const [state, setState] = useState<RulesState>(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [dbSynced, setDbSynced] = useState(false);
  const [isEditingFund, setIsEditingFund] = useState(false);
  const [tempFundInput, setTempFundInput] = useState("");

  // Load state
  useEffect(() => {
    async function loadData() {
      if (session?.user?.email) {
        try {
          const res = await fetch("/api/personal-rules");
          if (res.ok) {
            const data = await res.json();
            setState(data);
            setDbSynced(true);
          } else {
            loadFromLocalStorage();
          }
        } catch (err) {
          console.error(err);
          loadFromLocalStorage();
        }
      } else {
        loadFromLocalStorage();
      }
      setLoading(false);
    }
    loadData();
  }, [session]);

  const loadFromLocalStorage = () => {
    const saved = localStorage.getItem("personal-rules-state");
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch (e) {
        setState(DEFAULT_STATE);
      }
    } else {
      setState(DEFAULT_STATE);
    }
    setDbSynced(false);
  };

  // Save state
  const saveState = useCallback(async (newState: RulesState) => {
    setState(newState);
    
    // Save to LocalStorage
    localStorage.setItem("personal-rules-state", JSON.stringify(newState));

    if (session?.user?.email) {
      setSyncing(true);
      try {
        const res = await fetch("/api/personal-rules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newState),
        });
        if (res.ok) {
          setDbSynced(true);
        } else {
          setDbSynced(false);
        }
      } catch (err) {
        setDbSynced(false);
      } finally {
        setSyncing(false);
      }
    }
  }, [session]);

  // Adjust play fund
  const handleAdjustFund = (amount: number, description: string, type: "penalty" | "reward" | "manual") => {
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      amount,
      description,
      timestamp: new Date().toISOString()
    };
    
    const newState = {
      ...state,
      playFund: state.playFund + amount,
      history: [newTx, ...state.history].slice(0, 20) // Limit to 20 logs
    };
    saveState(newState);

    toast({
      title: amount >= 0 ? "Nạp tiền thành công" : "Khấu trừ tiền thành công",
      description: `${amount >= 0 ? "+" : ""}${amount.toLocaleString()} VNĐ - ${description}`,
    });
  };

  // Custom manual edit of Play Fund
  const handleSaveManualFund = () => {
    const parsed = parseInt(tempFundInput.replace(/[^0-9-]/g, ""));
    if (isNaN(parsed)) {
      toast({
        title: "Lỗi nhập liệu",
        description: "Vui lòng nhập một số hợp lệ.",
        variant: "destructive"
      });
      return;
    }
    const diff = parsed - state.playFund;
    handleAdjustFund(diff, "Điều chỉnh số dư thủ công", "manual");
    setIsEditingFund(false);
  };

  // Streaks adjusting
  const adjustWalkingStreak = (val: number) => {
    const newStreak = state.walkingStreak + val;
    saveState({
      ...state,
      walkingStreak: newStreak
    });
  };

  const adjustShopeeStreak = (val: number) => {
    const newStreak = state.shopeeStreak + val;
    saveState({
      ...state,
      shopeeStreak: newStreak
    });
  };

  // Reset to default
  const handleReset = () => {
    if (confirm("Bạn có chắc chắn muốn đặt lại tất cả số liệu về mặc định?")) {
      saveState(DEFAULT_STATE);
      toast({
        title: "Đặt lại hoàn tất",
        description: "Số liệu đã quay về trạng thái ban đầu.",
      });
    }
  };

  // Milestone check helpers
  const getWalkingProgress = () => {
    const milestones = [30, 60, 90, 120, 150];
    const next = milestones.find(m => m > state.walkingStreak) || 150;
    const prev = milestones[milestones.indexOf(next) - 1] || 0;
    const percentage = Math.min(
      100,
      Math.max(0, ((state.walkingStreak - prev) / (next - prev)) * 100)
    );
    return { next, percentage, daysLeft: next - state.walkingStreak };
  };

  const getShopeeProgress = () => {
    const milestones = [30, 60, 90, 120, 150];
    const next = milestones.find(m => m > state.shopeeStreak) || 150;
    const prev = milestones[milestones.indexOf(next) - 1] || 0;
    const percentage = Math.min(
      100,
      Math.max(0, ((state.shopeeStreak - prev) / (next - prev)) * 100)
    );
    return { next, percentage, daysLeft: next - state.shopeeStreak };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        <p className="text-muted-foreground text-sm animate-pulse">Đang tải dữ liệu...</p>
      </div>
    );
  }

  const walkingProgress = getWalkingProgress();
  const shopeeProgress = getShopeeProgress();

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-6xl">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500">
            Trang Quản lý Quy tắc Cá nhân của Tôi
          </h1>
          <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1.5">
            {session ? (
              dbSynced ? (
                <>
                  <Cloud className="h-4 w-4 text-emerald-500" />
                  Đã đồng bộ đám mây ({session.user?.email})
                </>
              ) : (
                <>
                  <CloudLightning className="h-4 w-4 text-amber-500 animate-pulse" />
                  Lỗi kết nối DB. Đang lưu tạm offline.
                </>
              )
            ) : (
              <>
                <CloudLightning className="h-4 w-4 text-amber-500" />
                Chưa đăng nhập. Dữ liệu lưu tại LocalStorage thiết bị này.
              </>
            )}
            {syncing && <span className="text-xs animate-pulse opacity-70">(Đang đồng bộ...)</span>}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="p-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition duration-200 text-muted-foreground hover:text-foreground"
            title="Đặt lại dữ liệu ban đầu"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* PLAY FUND METRIC */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -z-10" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-emerald-500/20 rounded-2xl border border-emerald-500/30 text-emerald-400">
              <Coins className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wider text-emerald-400/80 uppercase">Số dư Quỹ Play</p>
              
              {isEditingFund ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={tempFundInput}
                    onChange={(e) => setTempFundInput(e.target.value)}
                    className="bg-black/40 border border-emerald-500/50 rounded-lg px-3 py-1 text-xl font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 w-44"
                    autoFocus
                    placeholder="Nhập VNĐ..."
                  />
                  <button
                    onClick={handleSaveManualFund}
                    className="p-1.5 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-black transition"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 mt-1">
                  <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                    {state.playFund.toLocaleString()} <span className="text-emerald-400 text-2xl">VNĐ</span>
                  </h2>
                  <button
                    onClick={() => {
                      setTempFundInput(state.playFund.toString());
                      setIsEditingFund(true);
                    }}
                    className="p-1 text-muted-foreground hover:text-white transition"
                    title="Chỉnh sửa trực tiếp số dư"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button
              onClick={() => handleAdjustFund(100000, "Thưởng nhanh", "reward")}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-emerald-500 text-black font-semibold text-sm hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
            >
              <Plus className="h-4 w-4" /> Thưởng 100k
            </button>
            <button
              onClick={() => handleAdjustFund(-100000, "Phạt nhanh", "penalty")}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 font-semibold text-sm hover:bg-red-500/35 transition flex items-center justify-center gap-1.5"
            >
              <Minus className="h-4 w-4" /> Phạt 100k
            </button>
          </div>
        </div>
      </div>

      {/* CONTROLS AREA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Walking/Gym Streak Card */}
        <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 dark:bg-black/20 p-6 shadow-xl hover:border-emerald-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 p-3 text-emerald-500/20 group-hover:text-emerald-500/30 transition-colors">
            <Dumbbell className="h-16 w-16" />
          </div>
          
          <span className="text-xs font-semibold text-emerald-400/90 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 uppercase tracking-wider">
            Sức Khỏe & Thể Thao
          </span>
          <h3 className="text-lg font-bold text-white mt-3">Chuỗi Đi bộ/Gym (ngày)</h3>
          
          <div className="flex items-center justify-between my-6">
            <button
              onClick={() => adjustWalkingStreak(-1)}
              className="p-3 bg-white/10 rounded-2xl hover:bg-white/15 active:scale-95 transition text-foreground border border-white/5"
            >
              <Minus className="h-5 w-5" />
            </button>
            
            <div className="text-center">
              <span className="text-5xl font-black text-white tracking-tight">{state.walkingStreak}</span>
              <span className="text-muted-foreground text-sm block mt-1">ngày liên tục</span>
            </div>
            
            <button
              onClick={() => adjustWalkingStreak(1)}
              className="p-3 bg-white/10 rounded-2xl hover:bg-white/15 active:scale-95 transition text-foreground border border-white/5"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          {/* Progress to next reward */}
          {state.walkingStreak >= 0 ? (
            <div className="space-y-2 mt-4 pt-4 border-t border-white/5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-muted-foreground">Tiến trình đến mốc thưởng {walkingProgress.next} ngày</span>
                <span className="text-emerald-400">{state.walkingStreak}/{walkingProgress.next} ngày</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500" 
                  style={{ width: `${walkingProgress.percentage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground italic">
                Còn {walkingProgress.daysLeft} ngày nữa để nhận phần thưởng kế tiếp!
              </p>
            </div>
          ) : (
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-red-400 text-xs">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Bạn đang vi phạm! Hãy đi tập để phục hồi chuỗi ngày.</span>
            </div>
          )}
        </div>

        {/* Shopee Screen Time Streak Card */}
        <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 dark:bg-black/20 p-6 shadow-xl hover:border-amber-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 p-3 text-amber-500/20 group-hover:text-amber-500/30 transition-colors">
            <ShoppingBag className="h-16 w-16" />
          </div>

          <span className="text-xs font-semibold text-amber-400/90 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 uppercase tracking-wider">
            Kỷ Luật Bản Thân
          </span>
          <h3 className="text-lg font-bold text-white mt-3">Chuỗi Shopee &lt; 9 phút/ngày (ngày)</h3>

          <div className="flex items-center justify-between my-6">
            <button
              onClick={() => adjustShopeeStreak(-1)}
              className="p-3 bg-white/10 rounded-2xl hover:bg-white/15 active:scale-95 transition text-foreground border border-white/5"
            >
              <Minus className="h-5 w-5" />
            </button>

            <div className="text-center">
              <span className={`text-5xl font-black tracking-tight ${state.shopeeStreak < 0 ? "text-red-400" : "text-white"}`}>
                {state.shopeeStreak}
              </span>
              <span className="text-muted-foreground text-sm block mt-1">ngày</span>
            </div>

            <button
              onClick={() => adjustShopeeStreak(1)}
              className="p-3 bg-white/10 rounded-2xl hover:bg-white/15 active:scale-95 transition text-foreground border border-white/5"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          {/* Progress or break status */}
          {state.shopeeStreak >= 0 ? (
            <div className="space-y-2 mt-4 pt-4 border-t border-white/5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-muted-foreground">Tiến trình đến thưởng Shopee mốc {shopeeProgress.next} ngày</span>
                <span className="text-amber-400">{state.shopeeStreak}/{shopeeProgress.next} ngày</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-500" 
                  style={{ width: `${shopeeProgress.percentage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground italic">
                Còn {shopeeProgress.daysLeft} ngày nữa để nhận phần thưởng Shopee!
              </p>
            </div>
          ) : (
            <div className="mt-4 pt-4 border-t border-white/5 space-y-2 bg-red-950/20 p-3 rounded-xl border border-red-500/10">
              <div className="flex items-center gap-2 text-red-400 text-xs font-semibold">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Đang phá vỡ chuỗi thưởng Shopee! ({Math.abs(state.shopeeStreak)} ngày)</span>
              </div>
              <p className="text-xs text-muted-foreground/80 leading-relaxed">
                Khi sử dụng Shopee quá 9 phút liên tiếp nhiều ngày, chuỗi bị âm. Tăng chuỗi trở lại dương để tiếp tục tích mốc thưởng.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* DETAIL RULES LIST (VIETNAMESE) */}
      <div className="space-y-6">
        <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-emerald-400" />
          Danh sách Quy tắc Chi tiết
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* I. PENALTY RULES */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-red-400 flex items-center gap-2 pb-2 border-b border-red-500/10">
              <AlertTriangle className="h-5 w-5" />
              I. Quy tắc Phạt
            </h3>

            {/* Rule 1 */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-2 hover:bg-white/[0.04] transition">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-red-400/80 bg-red-500/10 px-2 py-0.5 rounded-md uppercase">
                  Image_0.png
                </span>
                <span className="text-xs text-muted-foreground">Luyện tập hàng ngày</span>
              </div>
              <h4 className="font-bold text-white text-base">1. Quy tắc Luyện tập buổi sáng hoặc chiều</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Nếu mỗi ngày sáng không dành tối thiểu <strong className="text-white">30 phút</strong> để ra bờ kè Lái Thiêu đi bộ, thì chiều phải đi tập gym ít nhất <strong className="text-white">30 phút</strong>.
              </p>
            </div>

            {/* Penalty levels 3, 6, 9, 12 days */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-4 hover:bg-white/[0.04] transition">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-red-400/80 bg-red-500/10 px-2 py-0.5 rounded-md uppercase">
                  Image_1.png - Image_4.png
                </span>
                <span className="text-xs text-muted-foreground">Không luyện tập</span>
              </div>
              <h4 className="font-bold text-white text-base">Hệ thống Phạt Lũy Tiến khi ngắt tập luyện:</h4>

              <div className="grid grid-cols-1 gap-2.5">
                {[
                  { days: 3, cost: 100000, img: "Image_1.png" },
                  { days: 6, cost: 200000, img: "Image_2.png" },
                  { days: 9, cost: 300000, img: "Image_3.png" },
                  { days: 12, cost: 400000, img: "Image_4.png" },
                ].map((item, idx) => {
                  const isExceeded = state.walkingStreak <= -item.days; // assuming negative streak = consecutive days missed
                  return (
                    <div 
                      key={idx} 
                      className={`flex justify-between items-center p-3 rounded-xl border transition ${
                        isExceeded 
                          ? "bg-red-500/10 border-red-500/40 text-red-200" 
                          : "bg-white/5 border-white/5 text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${isExceeded ? "bg-red-500 animate-ping" : "bg-neutral-500"}`} />
                        <span className="text-sm font-semibold text-white">Không tập {item.days} ngày liên tiếp</span>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-bold block ${isExceeded ? "text-red-400" : "text-neutral-300"}`}>
                          Phạt -{item.cost / 1000}k VNĐ
                        </span>
                        <span className="text-[10px] text-muted-foreground block">{item.img}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* II. REWARD & DEDUCTION RULES */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-emerald-400 flex items-center gap-2 pb-2 border-b border-emerald-500/10">
              <Gift className="h-5 w-5" />
              II. Quy tắc Thưởng & Trừ Shopee
            </h3>

            {/* Walking Reward Table */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-3 hover:bg-white/[0.04] transition">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded-md uppercase">
                  Image_5.png
                </span>
                <span className="text-xs text-muted-foreground">Thói quen Đi bộ / Gym</span>
              </div>
              <h4 className="font-bold text-white text-base">Thưởng 🎁: Thói quen đi bộ hàng ngày</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Duy trì thói quen đi bộ hoặc tập gym trong <strong className="text-white">X</strong> ngày liên tục, hệ thống sẽ nạp <strong className="text-white">Y</strong> vào Quỹ Play. (Lưu ý: Bỏ lỡ một ngày sẽ làm mất chuỗi).
              </p>
              
              <div className="grid grid-cols-5 gap-1.5 mt-2">
                {[
                  { x: 30, y: 100000 },
                  { x: 60, y: 200000 },
                  { x: 90, y: 300000 },
                  { x: 120, y: 400000 },
                  { x: 150, y: 500000 },
                ].map((item, idx) => {
                  const isAchieved = state.walkingStreak >= item.x;
                  return (
                    <div 
                      key={idx} 
                      className={`text-center p-2 rounded-xl border transition ${
                        isAchieved 
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-200" 
                          : "bg-white/5 border-white/5 text-muted-foreground"
                      }`}
                    >
                      <span className="text-[10px] block font-medium">Mốc {item.x} ngày</span>
                      <span className={`text-xs font-bold ${isAchieved ? "text-emerald-400" : "text-neutral-400"}`}>
                        +{item.y / 1000}k
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shopee Limit Reward Table */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-3 hover:bg-white/[0.04] transition">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded-md uppercase">
                  Image_6.png
                </span>
                <span className="text-xs text-muted-foreground">Shopee dưới 9 phút</span>
              </div>
              <h4 className="font-bold text-white text-base">Thưởng 🎁: Giới hạn thời gian ứng dụng Shopee</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Sử dụng ứng dụng Shopee tối đa <strong className="text-white">9 phút/ngày</strong> trong <strong className="text-white">X</strong> ngày liên tục, hệ thống sẽ nạp <strong className="text-white">Y</strong> vào Quỹ Play.
              </p>

              <div className="grid grid-cols-5 gap-1.5 mt-2">
                {[
                  { x: 30, y: 100000 },
                  { x: 60, y: 200000 },
                  { x: 90, y: 300000 },
                  { x: 120, y: 400000 },
                  { x: 150, y: 500000 },
                ].map((item, idx) => {
                  const isAchieved = state.shopeeStreak >= item.x;
                  return (
                    <div 
                      key={idx} 
                      className={`text-center p-2 rounded-xl border transition ${
                        isAchieved 
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-200" 
                          : "bg-white/5 border-white/5 text-muted-foreground"
                      }`}
                    >
                      <span className="text-[10px] block font-medium">Mốc {item.x} ngày</span>
                      <span className={`text-xs font-bold ${isAchieved ? "text-emerald-400" : "text-neutral-400"}`}>
                        +{item.y / 1000}k
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shopee Break Deduction Table */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-3 hover:bg-white/[0.04] transition">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-red-400/80 bg-red-500/10 px-2 py-0.5 rounded-md uppercase">
                  Image_7.png
                </span>
                <span className="text-xs text-muted-foreground">Phá vỡ chuỗi Shopee</span>
              </div>
              <h4 className="font-bold text-white text-base">Trừ Quỹ 📱: Phá vỡ chuỗi thưởng Shopee</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Nếu sử dụng Shopee nhiều hơn <strong className="text-white">X</strong> phút trong một ngày, hệ thống sẽ phá vỡ chuỗi và trừ <strong className="text-white">Y</strong> từ Quỹ Play.
              </p>

              <div className="grid grid-cols-5 gap-1.5 mt-2">
                {[
                  { x: 20, y: 100000 },
                  { x: 30, y: 200000 },
                  { x: 40, y: 300000 },
                  { x: 50, y: 400000 },
                  { x: 60, y: 500000 },
                ].map((item, idx) => {
                  return (
                    <div 
                      key={idx} 
                      className="text-center p-2 rounded-xl border border-white/5 bg-white/5 text-muted-foreground hover:border-red-500/20 transition"
                      onClick={() => handleAdjustFund(-item.y, `Phá vỡ quy tắc Shopee > ${item.x} phút`, "penalty")}
                      style={{ cursor: "pointer" }}
                      title="Click để áp dụng phạt nhanh mức này"
                    >
                      <span className="text-[10px] block font-medium">&gt; {item.x} phút</span>
                      <span className="text-xs font-bold text-red-400/90 block">
                        -{item.y / 1000}k
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* HISTORY TRANSACTION LOGS */}
      <div className="rounded-3xl border border-white/10 bg-white/5 dark:bg-black/20 p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <History className="h-5 w-5 text-emerald-400" />
          Lịch sử Thay đổi Quỹ
        </h3>

        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
          {state.history && state.history.length > 0 ? (
            state.history.map((tx) => (
              <div 
                key={tx.id} 
                className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition border border-white/5"
              >
                <div>
                  <p className="text-sm font-semibold text-white">{tx.description}</p>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(tx.timestamp).toLocaleString("vi-VN")}
                  </span>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-bold ${
                    tx.amount > 0 ? "text-emerald-400" : tx.amount < 0 ? "text-red-400" : "text-neutral-400"
                  }`}>
                    {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString()} VNĐ
                  </span>
                  <span className="text-[10px] text-muted-foreground block capitalize">{tx.type}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Chưa có lịch sử giao dịch nào.</p>
          )}
        </div>
      </div>
    </div>
  );
}
