// src/app/exercise/[id]/page.tsx
import { Metadata } from 'next';
import { exercisesData } from '../../../data/exercises'; // مسیر صحیح به exercisesData
import ExerciseDetailPageClient from './ExerciseDetailPageClient'; // ایمپورت Client Component

// تابع generateMetadata برای تولید Metadata پویا
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function generateMetadata({ params }: { params: any }): Promise<Metadata> {
  // بر اساس خطای ترمینال Next.js، params باید await شود تا خصوصیات آن قابل دسترسی باشند.
  // این کار تضمین می‌کند که 'id' قبل از استفاده به طور کامل بارگذاری شده است.
  const resolvedParams = await params;
  const exercise = exercisesData.find(ex => ex.id === resolvedParams.id);

  if (!exercise) {
    return {
      title: "تمرین یافت نشد",
      description: "صفحه تمرین مورد نظر یافت نشد.",
    };
  }

  const title = `${exercise.name} | تمرین‌ساز`;
  const description = `در این صفحه با ${exercise.name} آشنا می‌شوید؛ از عضلات درگیر و تجهیزات مورد نیاز تا اجرای اصولی و حرفه‌ای حرکت.${exercise.otherNames ? ` این تمرین با عنوان ${exercise.otherNames} هم شناخته می‌شود.` : ''}`;
  const keywords = [
    exercise.name,
    ...exercise.targetMuscles,
    exercise.equipment,
    `تمرین ${exercise.name}`,
    `آموزش ${exercise.name}`,
    `نحوه انجام ${exercise.name}`,
    `حرکت ${exercise.name}`,
    `تمرین ${exercise.targetMuscles}`,
    "تمرین بدنسازی",
    "حرکات بدنسازی",
    "برنامه تمرینی",
    "ورزش در خانه",
    "آموزش تصویری تمرین",
    "فرم صحیح تمرین"
  ];
  if (exercise.otherNames) {
    keywords.push(...exercise.otherNames.split(',').map(name => name.trim()));
  }

  return {
    title: title,
    description: description,
    keywords: keywords.join(', '),
    openGraph: {
      title: title,
      description: description,
      url: `https://tamrinsaz.ir/exercise/${exercise.id}`,
      images: [
        {
          url: exercise.image && exercise.image.startsWith('http') ? exercise.image : `https://tamrinsaz.ir/images/${exercise.image || 'placeholder.webp'}`,
          width: 800,
          height: 450,
          alt: exercise.name,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: [exercise.image && exercise.image.startsWith('http') ? exercise.image : `https://tamrinsaz.ir/images/${exercise.image || 'placeholder.webp'}`],
    },
  };
}

// تابع generateStaticParams برای تولید مسیرهای استاتیک در زمان بیلد
export async function generateStaticParams() {
  return exercisesData.map((exercise) => ({
    id: exercise.id,
  }));
}

// کامپوننت صفحه
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function ExercisePage({ params }: { params: any }) {
  // بر اساس خطای ترمینال Next.js، params باید await شود تا خصوصیات آن قابل دسترسی باشند.
  // این کار تضمین می‌کند که 'id' قبل از ارسال به Client Component به طور کامل بارگذاری شده است.
  const resolvedParams = await params;
  // id را مستقیماً به Client Component ارسال می‌کنیم
  return <ExerciseDetailPageClient id={resolvedParams.id} />;
}
