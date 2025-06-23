import React from 'react';
import { Row, Col, Pagination as BootstrapPagination } from 'react-bootstrap';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  if (totalPages <= 1) return null;

  return (
    <Row className="mb-4">
      <Col>
        <div className="d-flex justify-content-center">
          <BootstrapPagination>
            <BootstrapPagination.First 
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
            />
            <BootstrapPagination.Prev 
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            />
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <BootstrapPagination.Item
                  key={pageNum}
                  active={pageNum === currentPage}
                  onClick={() => onPageChange(pageNum)}
                >
                  {pageNum}
                </BootstrapPagination.Item>
              );
            })}
            
            <BootstrapPagination.Next 
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
            <BootstrapPagination.Last 
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
            />
          </BootstrapPagination>
        </div>
      </Col>
    </Row>
  );
};

export default Pagination; 