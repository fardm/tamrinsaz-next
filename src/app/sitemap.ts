// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { exercisesData } from '@/data/exercises'; // بازگشت به استفاده از alias path که قبلاً کار می‌کرد

// اضافه کردن این خط برای اطمینان از تولید استاتیک در حالت 'output: export'
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://app.tamrinsaz.ir'; // دامنه اصلی سایت شما

  const exerciseRoutes = exercisesData.map((exercise) => ({
    url: `${baseUrl}/exercise/${exercise.id}`,
    lastModified: new Date(), // می‌توانید تاریخ آخرین تغییر را از داده‌های تمرین بگیرید
    changeFrequency: 'weekly' as const, // استفاده از 'as const' برای اطمینان از نوع صحیح
    priority: 0.7, // اولویت برای صفحات تمرین
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1, // اولویت بالاتر برای صفحه اصلی
    },
    {
      url: `${baseUrl}/my-workouts`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ai-workout-generator`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...exerciseRoutes,
  ];
}
