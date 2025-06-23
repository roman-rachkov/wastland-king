import React from 'react';
import { getServiceInfo, ImageUploadService } from '../../config/imageUpload';

interface EditorTipsProps {
  service: ImageUploadService;
}

const EditorTips: React.FC<EditorTipsProps> = ({ service }) => {
  return (
    <div className="mt-2">
      <small className="text-muted">
        💡 Tip: You can paste images directly from clipboard (Ctrl+V)
      </small>
      <br />
      <small className="text-info">
        📸 Images hosted on {getServiceInfo(service).name}
      </small>
    </div>
  );
};

export default EditorTips; 