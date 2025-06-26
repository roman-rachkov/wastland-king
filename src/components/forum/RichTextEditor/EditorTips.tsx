import React from 'react';
import { getServiceInfo, isServiceConfigured, ImageUploadService } from '../../../config/imageUpload';

interface EditorTipsProps {
  service: ImageUploadService;
}

const EditorTips: React.FC<EditorTipsProps> = ({ service }) => {
  const currentService = getServiceInfo(service);
  const isConfigured = isServiceConfigured(service);

  return (
    <div className="mt-2">
      <small className="text-muted">
        💡 Tip: You can paste images directly from clipboard (Ctrl+V)
      </small>
      <br />
      <small className="text-info">
        📸 Images hosted on <strong>{currentService.name}</strong>
        {!isConfigured && (
          <span className="text-warning ms-2">
            ⚠️ Not configured
          </span>
        )}
      </small>
    </div>
  );
};

export default EditorTips; 