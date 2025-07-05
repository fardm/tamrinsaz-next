// src/app/exercise/[id]/page.tsx
import { Metadata } from 'next';
import { exercisesData } from '../../../data/exercises'; // مسیر صحیح به exercisesData
import ExerciseDetailPageClient from './ExerciseDetailPageClient'; // ایمپورت Client Component

// تابع generateMetadata برای تولید Metadata پویا
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function generateMetadata({ params }: { params: any }): Promise<Metadata> {
  const exercise = exercisesData.find(ex => ex.id === params.id);

  if (!exercise) {
    return {
      title: "تمرین یافت نشد - تمرین‌ساز",
      description: "صفحه تمرین مورد نظر یافت نشد.",
    };
  }

  const title = `${exercise.name} - تمرین‌ساز`;
  const description = `جزئیات کامل تمرین ${exercise.name} شامل عضلات درگیر، وسایل مورد نیاز و توضیحات. ${exercise.otherNames ? `نام‌های دیگر: ${exercise.otherNames}.` : ''}`;
  const keywords = [
    exercise.name,
    ...exercise.targetMuscles,
    exercise.equipment,
    "تمرین",
    "بدنسازی",
    "فیتنس",
    "آموزش",
    "ورزش"
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
      url: `https://app.tamrinsaz.ir/exercise/${exercise.id}`,
      images: [
        {
          url: exercise.image && exercise.image.startsWith('http') ? exercise.image : `https://app.tamrinsaz.ir/images/${exercise.image || 'placeholder.webp'}`,
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
      images: [exercise.image && exercise.image.startsWith('http') ? exercise.image : `https://app.tamrinsaz.ir/images/${exercise.image || 'placeholder.webp'}`],
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
export default function ExercisePage({ params }: { params: any }) {
  // id را مستقیماً به Client Component ارسال می‌کنیم
  return <ExerciseDetailPageClient id={params.id} />;
}
