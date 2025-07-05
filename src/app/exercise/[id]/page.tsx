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

// این تابع به عنوان Server Component عمل می‌کند.
// این تابع پارامترهای دینامیک را دریافت می‌کند و Client Component را رندر می‌کند.
export default function ExerciseDetailPage({ params }: { params: { id: string } }) {
  // Client Component (ExerciseDetailPageClient) می‌تواند خودش از useParams استفاده کند،
  // بنابراین نیازی به پاس دادن id از اینجا نیست مگر اینکه داده‌های سمت سرور دیگری لازم باشد.
  return <ExerciseDetailPageClient />;
}