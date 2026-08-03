"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  Check, 
  X, 
  Camera, 
  Calendar,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

// Pre-defined avatar options (matching the colors/gradient look in the mockup)
const PRESET_AVATARS = [
  { id: "avatar-blue", bg: "bg-blue-500", label: "Blue Profile" },
  { id: "avatar-orange", bg: "bg-orange-500", label: "Orange Profile" },
  { id: "avatar-green", bg: "bg-emerald-500", label: "Green Profile" },
  { id: "avatar-pink", bg: "bg-pink-500", label: "Pink Profile" },
  { id: "avatar-purple", bg: "bg-purple-500", label: "Purple Profile" },
];

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  
  const localePrefix = pathname?.split("/")[1] || "en";

  // Form states
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [activeAvatar, setActiveAvatar] = useState<string>("");
  const [googleAvatar, setGoogleAvatar] = useState<string | null>(null);

  // Load session data when available
  useEffect(() => {
    if (session?.user) {
      setFullName(session.user.name || "TRUNG");
      setEmail(session.user.email || "nguyenchitrung.210902.junior.it.bd@gmail.com");
      setUsername(session.user.email ? session.user.email.split("@")[0] : "nguyenchitrung.210902.junior.it");
      
      if (session.user.image) {
        setGoogleAvatar(session.user.image);
        setActiveAvatar(session.user.image);
      }
    } else {
      // Default Mock Data matching the user's screenshot
      setFullName("TRUNG");
      setUsername("nguyenchitrung.210902.junior.it.bd");
      setEmail("nguyenchitrung.210902.junior.it.bd@gmail.com");
      setPhoneNumber("");
      setAddress("");
    }
  }, [session]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Thành công!",
      description: "Thông tin cá nhân của bạn đã được cập nhật.",
    });
  };

  const handleCancel = () => {
    router.push(`/${localePrefix}`);
  };

  const selectPresetAvatar = (bgClass: string) => {
    setActiveAvatar(bgClass);
    toast({
      description: "Đã chọn avatar có sẵn.",
    });
  };

  const selectGoogleAvatar = () => {
    if (googleAvatar) {
      setActiveAvatar(googleAvatar);
      toast({
        description: "Đã chọn ảnh đại diện Google.",
      });
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#0b0f19] text-slate-100 flex items-center justify-center p-4 md:p-8">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN: User Card & Avatars */}
        <div className="md:col-span-4 bg-[#111827] border border-[#1f2937] rounded-2xl p-6 flex flex-col items-center justify-between shadow-xl">
          
          {/* Main Avatar and Name Info */}
          <div className="w-full flex flex-col items-center text-center">
            
            {/* Circular Avatar */}
            <div className="relative group mb-4">
              <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-blue-600 flex items-center justify-center bg-blue-900 shadow-lg shadow-blue-900/30 transition-all duration-300 group-hover:scale-105">
                {activeAvatar && activeAvatar.startsWith("http") ? (
                  <img src={activeAvatar} alt="Profile" className="h-full w-full object-cover" />
                ) : activeAvatar ? (
                  <div className={`h-full w-full ${activeAvatar} flex items-center justify-center text-white text-4xl font-bold`}>
                    {fullName ? fullName.charAt(0).toUpperCase() : "U"}
                  </div>
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-5xl font-bold font-heading">
                    {fullName ? fullName.charAt(0).toUpperCase() : "W"}
                  </div>
                )}
              </div>
              
              {/* Camera Edit Overlay Button */}
              <button className="absolute bottom-1 right-1 h-9 w-9 bg-blue-600 hover:bg-blue-700 text-white rounded-full border border-[#111827] flex items-center justify-center cursor-pointer shadow-md transition-colors">
                <Camera className="h-4 w-4" />
              </button>
            </div>

            {/* Profile Name & Handle */}
            <h2 className="text-2xl font-bold tracking-tight text-white mb-1 uppercase">
              {fullName || "TRUNG"}
            </h2>
            <p className="text-sm text-slate-400 truncate max-w-full mb-6">
              @{username || "nguyenchitrung"}
            </p>

            {/* Join Date Card */}
            <div className="w-full bg-[#1e293b]/60 border border-[#334155]/40 rounded-xl p-4 flex flex-col items-center mb-6">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">
                NGÀY THAM GIA
              </span>
              <div className="flex items-center gap-2 text-white font-semibold text-lg">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span>28/1/2026</span>
              </div>
            </div>

            {/* Preset Avatars Section */}
            <div className="w-full mb-6">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block mb-3">
                AVATAR CÓ SẴN
              </span>
              <div className="flex flex-wrap gap-3 justify-center mb-3">
                {PRESET_AVATARS.slice(0, 4).map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => selectPresetAvatar(avatar.bg)}
                    className={`h-11 w-11 rounded-full border-2 cursor-pointer transition-all duration-200 hover:scale-110 ${
                      activeAvatar === avatar.bg ? "border-blue-500 scale-105" : "border-slate-700"
                    } ${avatar.bg} flex items-center justify-center text-white text-xs font-bold`}
                  >
                    {activeAvatar === avatar.bg && <Check className="h-4 w-4 text-white" />}
                  </button>
                ))}
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => selectPresetAvatar(PRESET_AVATARS[4].bg)}
                  className={`h-11 w-11 rounded-full border-2 cursor-pointer transition-all duration-200 hover:scale-110 ${
                    activeAvatar === PRESET_AVATARS[4].bg ? "border-blue-500 scale-105" : "border-slate-700"
                  } ${PRESET_AVATARS[4].bg} flex items-center justify-center text-white text-xs font-bold`}
                >
                  {activeAvatar === PRESET_AVATARS[4].bg && <Check className="h-4 w-4 text-white" />}
                </button>
              </div>
            </div>

            {/* Old / Google Avatar Section */}
            <div className="w-full pt-4 border-t border-slate-800">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block mb-3">
                AVATAR CŨ
              </span>
              <button 
                onClick={selectGoogleAvatar}
                disabled={!googleAvatar}
                className={`h-12 w-12 rounded-full border-2 flex items-center justify-center overflow-hidden mx-auto transition-all ${
                  googleAvatar ? "cursor-pointer hover:scale-110" : "opacity-60 cursor-not-allowed"
                } ${activeAvatar === googleAvatar ? "border-blue-500" : "border-slate-700 bg-blue-900"}`}
              >
                {googleAvatar ? (
                  <img src={googleAvatar} alt="Google Profile" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-blue-700 to-indigo-800 flex items-center justify-center text-white font-black text-xl">
                    W
                  </div>
                )}
              </button>
            </div>

          </div>

          {/* Bottom Note */}
          <p className="text-[10px] text-slate-500 text-center leading-relaxed mt-4 max-w-xs">
            Nếu bạn từng đăng nhập Google, ảnh Gmail sẽ xuất hiện trong danh sách này.
          </p>

        </div>

        {/* RIGHT COLUMN: Detailed Information Form */}
        <div className="md:col-span-8 bg-[#111827] border border-[#1f2937] rounded-2xl p-6 md:p-8 flex flex-col justify-between shadow-xl">
          
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Form Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-2">
              <h1 className="text-xl font-bold tracking-wide text-white">
                Thông tin chi tiết
              </h1>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="text-slate-400 hover:text-white cursor-pointer hover:bg-slate-800"
              >
                <X className="h-4 w-4 mr-1.5" />
                Hủy
              </Button>
            </div>

            {/* Row 1: Full Name & Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                  TÊN ĐẦY ĐỦ
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-[#1e293b]/70 border-slate-700 focus:border-blue-500 text-white placeholder-slate-500 h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username" className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                  TÊN ĐĂNG NHẬP
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-[#1e293b]/40 border-slate-800 text-slate-400 h-11 focus:outline-none cursor-not-allowed"
                  disabled
                />
              </div>
            </div>

            {/* Row 2: Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                EMAIL
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#1e293b]/40 border-slate-800 text-slate-400 h-11 focus:outline-none cursor-not-allowed"
                disabled
              />
            </div>

            {/* Row 3: Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                SỐ ĐIỆN THOẠI
              </Label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="Nhập số điện thoại"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="bg-[#1e293b]/70 border-slate-700 focus:border-blue-500 text-white placeholder-slate-500 pl-10 h-11"
                />
              </div>
            </div>

            {/* Row 4: Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                ĐỊA CHỈ
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  id="address"
                  type="text"
                  placeholder="Nhập địa chỉ"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="bg-[#1e293b]/70 border-slate-700 focus:border-blue-500 text-white placeholder-slate-500 pl-10 h-11"
                />
              </div>
            </div>

            {/* Buttons Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-3 pt-6 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                className="bg-transparent border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white h-11 gap-2 cursor-pointer transition-all"
              >
                <Lock className="h-4 w-4" />
                Đổi mật khẩu
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white h-11 px-6 font-semibold shadow-lg shadow-blue-600/25 hover:shadow-blue-600/35 transition-all duration-300 cursor-pointer"
              >
                Lưu thay đổi
              </Button>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
}
