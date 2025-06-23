import React from 'react';
import { getServiceInfo, isServiceConfigured, ImageUploadService } from '../../config/imageUpload';

interface ServiceStatusProps {
  service: ImageUploadService;
}

const ServiceStatus: React.FC<ServiceStatusProps> = ({ service }) => {
  const currentService = getServiceInfo(service);
  const isConfigured = isServiceConfigured(service);

  return (
    <div className="service-status mb-2 p-2 bg-light rounded">
      <small className="text-muted">
        Image service: <strong>{currentService.name}</strong>
        {!isConfigured && (
          <span className="text-warning ms-2">
            ⚠️ Not configured - using fallback
          </span>
        )}
      </small>
    </div>
  );
};

export default ServiceStatus; 