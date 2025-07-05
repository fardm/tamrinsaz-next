import { MetadataRoute } from 'next'
import { exercisesData } from '@/data/exercises'; // مطمئن شوید مسیر صحیح است

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://tamrinsaz.ir'; // آدرس اصلی سایت شما

  const exerciseUrls = exercisesData.map(exercise => ({
    url: `${baseUrl}/exercise/${exercise.id}`,
    lastModified: new Date(), // تاریخ آخرین تغییر، می‌توانید منطق دقیق‌تری داشته باشید
    changeFrequency: 'weekly' as const, // <--- این خط اصلاح شد
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
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
    ...exerciseUrls, // اضافه کردن URL تمرینات پویا
  ]
}