# عيادة النور الطبي — تشغيل البرنامج الحقيقي

## الخطوة 1: اعمل أول مستخدم (مدير) في Supabase
1. من لوحة تحكم Supabase، روح على **Authentication** → **Users** → **Add user**
2. اكتب بريدك الإلكتروني وكلمة سر، وفعّل **Auto Confirm User**
3. انسخ الـ **User UID** اللي هيظهر بعد إنشاء المستخدم
4. روح على **SQL Editor** وشغل الكود ده (غيّر `PASTE_USER_UID_HERE` بالـ UID اللي نسخته):

```sql
insert into profiles (id, display_name, is_admin, permissions)
values ('PASTE_USER_UID_HERE', 'مدير النظام', true, '{}'::jsonb);
```

## الخطوة 2: ارفع الملفات دي على GitHub
1. روح على الـ Repository اللي عملته
2. دوس **Add file** → **Upload files**
3. اسحب كل الملفات والمجلدات دي وارفعها
4. دوس **Commit changes**

## الخطوة 3: انشر البرنامج على Vercel
1. روح على **vercel.com** واعمل حساب (فيه تسجيل دخول بحساب GitHub مباشرة)
2. دوس **Add New** → **Project**
3. اختار الـ Repository بتاعك (`clinic-system`)
4. قبل الضغط على Deploy، افتح **Environment Variables** وضيف:
   - `VITE_SUPABASE_URL` = رابط مشروعك في Supabase
   - `VITE_SUPABASE_ANON_KEY` = الـ anon key بتاعك
5. دوس **Deploy** واستنى دقيقة لحد ما يخلص

## بعد كده
هيديك Vercel رابط حقيقي (زي `clinic-system.vercel.app`) تقدر تفتحه من أي جهاز وتسجل دخول بالإيميل والباسورد اللي عملتهم في الخطوة 1.

## ملاحظة
النسخة دي بتغطي: تسجيل الدخول، المرضى، والمواعيد فقط. الحسابات والرواتب وصف الانتظار هنوصلهم بنفس الطريقة في الخطوة الجاية.
