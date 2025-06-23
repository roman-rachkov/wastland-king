# GitHub Secrets Setup for ImgBB

## Required Secret

Для работы системы загрузки изображений в продакшене необходимо добавить секрет в GitHub:

### IMGBB_API_KEY

1. **Перейдите в настройки репозитория**:
   - GitHub → ваш репозиторий → Settings → Secrets and variables → Actions

2. **Добавьте новый секрет**:
   - Нажмите "New repository secret"
   - **Name**: `IMGBB_API_KEY`
   - **Value**: `4e22e91958b715051b583256f6ad5680`

3. **Сохраните секрет**

## Проверка настройки

После добавления секрета:

1. **Сделайте коммит в main ветку** или создайте Pull Request
2. **Проверьте GitHub Actions**:
   - Перейдите в Actions вкладку
   - Найдите запущенный workflow
   - В логах должно появиться:
     ```
     Image upload service: imgbb
     ImgBB API key configured: yes
     ```

## Локальная разработка

Для локальной разработки создайте файл `.env` в корне проекта:

```env
VITE_IMAGE_UPLOAD_SERVICE=imgbb
VITE_IMGBB_API_KEY=4e22e91958b715051b583256f6ad5680
VITE_MAX_FILE_SIZE=33554432
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp,image/bmp
```

## Безопасность

- ✅ API ключ хранится как GitHub Secret
- ✅ Ключ не попадает в код репозитория
- ✅ Работает только в продакшене через GitHub Actions
- ⚠️ Для локальной разработки ключ хранится в `.env` (нормально для клиентских приложений)

## Альтернативы

Если хотите использовать другой сервис:

### Cloudinary
```env
VITE_IMAGE_UPLOAD_SERVICE=cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### Base64 (без внешних сервисов)
```env
VITE_IMAGE_UPLOAD_SERVICE=base64
```

## Устранение неполадок

### "Service not configured" в продакшене
- Проверьте, что секрет `IMGBB_API_KEY` добавлен в GitHub
- Убедитесь, что значение секрета корректное
- Проверьте логи GitHub Actions

### Ошибки загрузки изображений
- Проверьте лимиты ImgBB (32MB на файл)
- Убедитесь, что формат файла поддерживается
- Проверьте консоль браузера на ошибки CORS 