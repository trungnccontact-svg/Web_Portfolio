import { setRequestLocale } from "next-intl/server";
import PersonalRulesScreen from "@/screens/personal-rules/personal-rules";

export const metadata = {
  title: "Trang Quản lý Quy tắc Cá nhân",
  description: "Hệ thống quản lý quy tắc kỷ luật cá nhân, theo dõi chuỗi thói quen và ngân sách quỹ thưởng/phạt.",
};

export default async function PersonalRulesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <PersonalRulesScreen />;
}
