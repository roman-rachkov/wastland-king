# Firebase Storage Setup Guide

## Проблема
При попытке загрузить изображения в форум возникает ошибка CORS. Это происходит потому, что Firebase Storage не настроен в проекте.

## Решение

### 1. Настройка Firebase Storage в консоли

1. Перейдите в [Firebase Console](https://console.firebase.google.com/)
2. Выберите проект `wastlandkings`
3. В левом меню найдите "Storage" и нажмите "Get Started"
4. Выберите регион (например, `us-central1`)
5. Выберите правила безопасности:
   - Для разработки: "Start in test mode"
   - Для продакшена: "Start in production mode"

### 2. Развертывание правил безопасности

После настройки Storage в консоли, разверните обновленные правила:

```bash
firebase deploy --only storage
```

### 3. Альтернативное решение (временное)

Если Firebase Storage недоступен, система автоматически использует base64 кодирование для изображений. Это работает, но изображения будут храниться в базе данных, что может быть неэффективно для больших файлов.

## Текущие правила безопасности

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Allow read access to all images
    match /{allPaths=**} {
      allow read: if true;
    }
    
    // Allow authenticated users to upload images to forum-images folder
    match /forum-images/{imageId} {
      allow write: if request.auth != null 
                   && request.resource.size < 10 * 1024 * 1024 // 10MB max
                   && request.resource.contentType.matches('image/.*');
    }
    
    // Allow authenticated users to upload images to other folders
    match /{folder}/{imageId} {
      allow write: if request.auth != null 
                   && request.resource.size < 10 * 1024 * 1024 // 10MB max
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

## Функции

После настройки Firebase Storage будут доступны:

1. **Загрузка изображений** - кнопка 🖼️ в редакторе
2. **Вставка из буфера обмена** - Ctrl+V для вставки изображений
3. **Спойлер-изображения** - кнопка 🚫 для создания спойлеров
4. **Автоматическая загрузка** в Firebase Storage
5. **Fallback на base64** если Storage недоступен

## Проверка работы

1. Создайте новый пост в форуме
2. Попробуйте вставить изображение из буфера обмена (Ctrl+V)
3. Или нажмите кнопку 🖼️ и выберите файл
4. Изображение должно загрузиться и отобразиться в посте

## Устранение неполадок

Если проблемы продолжаются:

1. Проверьте, что Firebase Storage включен в консоли
2. Убедитесь, что правила развернуты: `firebase deploy --only storage`
3. Проверьте консоль браузера на наличие ошибок CORS
4. Убедитесь, что пользователь аутентифицирован 