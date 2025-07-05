// src/app/exercise/[id]/page.tsx
// دستور "use client"; از این فایل حذف می‌شود تا به یک Server Component تبدیل شود.

import { exercisesData } from '../../../data/exercises'; // مطمئن شوید مسیر صحیح است
import ExerciseDetailPageClient from './ExerciseDetailPageClient'; // ایمپورت کامپوننت Client

// تابع generateStaticParams() در Server Component باقی می‌ماند
export async function generateStaticParams() {
  return exercisesData.map((exercise) => ({
    id: exercise.id,
  }));
}

// این تابع به عنوان Server Component عمل می‌کند و به صورت async تعریف می‌شود.
export default async function ExerciseDetailPage({ params }: { params: { id: string } }) { // <--- async را اینجا اضافه کنید
  // Client Component (ExerciseDetailPageClient) می‌تواند خودش از useParams استفاده کند.
  return <ExerciseDetailPageClient />;
}