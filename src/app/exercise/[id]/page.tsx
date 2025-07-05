// src/app/exercise/[id]/page.tsx
// دستور "use client"; از این فایل حذف می‌شود تا به یک Server Component تبدیل شود.

import { exercisesData } from '../../../data/exercises';
import ExerciseDetailPageClient from './ExerciseDetailPageClient';

export async function generateStaticParams() {
  return exercisesData.map((exercise) => ({
    id: exercise.id,
  }));
}

export default async function ExerciseDetailPage() { // Removed '{ params }: { params: { id: string } }'
  return <ExerciseDetailPageClient />;
}