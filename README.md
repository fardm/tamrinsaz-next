

# TamrinSaz

سایت تمرین‌ساز

این سایت مخصوص کسانیه که می‌خوان برنامه تمرینی خودشون رو بسازن یا برنامه‌ای که از مربی گرفتن رو وارد کنن و راحت‌تر پیگیری کنن.

  <br>

## ویژگی‌ها
✅ چک‌لیست و نوار پیشرفت برای هر جلسه

✅ آموزش اجرای صحیح حرکات

✅ فیلتر تمرین‌ها بر اساس عضله یا تجهیزات

✅ امکان ساخت برنامه با هوش مصنوعی (https://tamrinsaz.ir/ai-workout-generator)


⚠️ فعلا امکان لاگین نداره و اطلاعات روی مروگر خودتون ذخیره میشه. اما جای نگرانی نیست تا زمانی که تاریخچه یا کش رو پاک نکنید داده ها تون از بین نمیره. برای پشتیبان‌گیری هم می‌تونید از بخش «دانلود برنامه» استفاده کنید و فایل‌ رو به مرورگر یا دستگاه دیگه منتقل کنید.

<br>

## مشارکت در توسعه
داده های این سایت هنوز کامل نیست و میتونه موارد بیشتری بهش اضافه بشه. اگه پیشنهادی دارید یا دوست دارید  تمرینات جدیدی اضافه بشه میتونید برای توسعه و تکملیش مشارکت کنید.

تمرینات رو برام بفرستید تا خودم اضافه کنم یا مسقیما خودتون فایل ها رو ویرایش کنید.
هر فایل شامل این موارده:
- نام تمرین
- عضلات درگیر
- وسایل مورد نیاز
- تصویر
- نام دیگر
- شرح تمرین

همه تمرینات توی فایل [exercises.ts](/rc/data/exercises.ts) ذخیره شدند:

```ts
{
    id: '1',
    name: 'بارفیکس خوابیده',
    targetMuscles: ['پشت'],
    equipment: 'دستگاه',
    image: '1.webp',
    otherNames: 'Inverted Row',
    description: '<a href="https://musclewiki.com/bodyweight/male/traps-middle/inverted-row/" target="_blank" rel="noopener noreferrer">MuscleWiki</a>'
  },
```

تصویر حتما webp و کم حجم باشه. واتر مارک نداشته باشه. ابعادش ترجیحا 16:9 باشه. استایلش مثل همین تصاویر فعلی باشه.