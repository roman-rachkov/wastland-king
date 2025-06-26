import React, { useMemo, useState } from 'react';
import { Table, Badge, Card, Form, InputGroup, Button, Row, Col, Accordion, Pagination } from 'react-bootstrap';
import { useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, getPaginationRowModel, flexRender, createColumnHelper, SortingState, ColumnFiltersState, PaginationState } from '@tanstack/react-table';
import { Player } from '../../../types/Player';
import { IBuildings, Shift, IAttackPlayer } from '../../../types/Buildings';

interface AvailablePlayersListProps {
  players: Player[];
  buildings: IBuildings[];
  attackPlayers?: IAttackPlayer[];
}

interface PlayerWithAssignments extends Player {
  assignments: {
    buildingName: string;
    shift: Shift;
    isCaptain: boolean;
    march: number;
  }[];
  isAssigned: boolean;
}

const AvailablePlayersList: React.FC<AvailablePlayersListProps> = ({ players, buildings, attackPlayers = [] }) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });

  const columnHelper = createColumnHelper<PlayerWithAssignments>();

  const playersWithAssignments = useMemo(() => {
    return players.map(player => {
      const assignments = buildings
        .filter(building => 
          building.capitan?.id === player.id || 
          building.players.some(p => p.player.id === player.id)
        )
        .map(building => ({
          buildingName: building.buildingName,
          shift: building.shift,
          isCaptain: building.capitan?.id === player.id,
          march: building.players.find(p => p.player.id === player.id)?.march || 0
        }));

      return {
        ...player,
        assignments,
        isAssigned: assignments.length > 0
      };
    });
  }, [players, buildings]);

  const getShiftName = (shift: Shift) => {
    return shift === Shift.first ? 'First Shift' : 'Second Shift';
  };

  const getTroopTypes = (player: Player) => {
    const types = [];
    if (player.troopFighter) types.push('Fighter');
    if (player.troopShooter) types.push('Shooter');
    if (player.troopRider) types.push('Rider');
    return types;
  };

  // Получаем уникальные значения тиров из данных
  const uniqueTiers = useMemo(() => {
    const tiers = new Set(players.map(player => player.troopTier).filter(tier => tier !== undefined && tier !== null));
    return Array.from(tiers).sort((a, b) => a - b);
  }, [players]);

  const getShifts = (player: Player) => {
    const shifts = [];
    if (player.firstShift) shifts.push('First');
    if (player.secondShift) shifts.push('Second');
    return shifts;
  };

  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: 'Player',
      cell: ({ row }) => (
        <div>
          <strong>({row.original.alliance}) {row.original.name}</strong>
          {row.original.isCapitan && <Badge bg="warning" className="ms-2">Captain</Badge>}
          {Array.isArray(attackPlayers) && attackPlayers.length > 0 && attackPlayers.some(a => String(a.id) === String(row.original.id)) && (
            <Badge bg="danger" className="ms-2">Атака</Badge>
          )}
        </div>
      ),
      enableSorting: true,
      enableColumnFilter: true,
    }),
    columnHelper.accessor('isCapitan', {
      header: 'Captain',
      cell: ({ getValue }) => (
        <Badge bg={getValue() ? "warning" : "light"} text={getValue() ? "white" : "dark"}>
          {getValue() ? 'Yes' : 'No'}
        </Badge>
      ),
      enableSorting: true,
      enableColumnFilter: true,
    }),
    columnHelper.accessor('troopTier', {
      header: 'Tier',
      cell: ({ getValue }) => <Badge bg="secondary">{getValue()}</Badge>,
      enableSorting: true,
      enableColumnFilter: true,
      filterFn: (row, columnId, filterValue) => {
        const value = row.getValue(columnId);
        if (!filterValue) return true;
        return value === parseInt(filterValue);
      },
    }),
    columnHelper.accessor('marchSize', {
      header: 'March Size',
      cell: ({ row }) => (
        <div>
          {row.original.marchSize}
          {row.original.isCapitan && (
            <div>
              <small className="text-muted">Rally: {row.original.rallySize}</small>
            </div>
          )}
        </div>
      ),
      enableSorting: true,
      enableColumnFilter: true,
    }),
    columnHelper.accessor('rallySize', {
      header: 'Rally Size',
      cell: ({ getValue, row }) => {
        const value = getValue();
        if (!row.original.isCapitan) return <span className="text-muted">-</span>;
        return <Badge bg="warning">{value}</Badge>;
      },
      enableSorting: true,
      enableColumnFilter: true,
    }),
    columnHelper.accessor('troopFighter', {
      header: 'Troop Types',
      cell: ({ row }) => (
        <div>
          {getTroopTypes(row.original).map(type => (
            <Badge key={type} bg="primary" className="me-1">
              {type}
            </Badge>
          ))}
        </div>
      ),
      enableSorting: false,
      enableColumnFilter: true,
      filterFn: (row, _, filterValue) => {
        const player = row.original;
        if (!filterValue || filterValue === 'all') return true;
        
        switch (filterValue) {
          case 'fighter':
            return player.troopFighter;
          case 'shooter':
            return player.troopShooter;
          case 'rider':
            return player.troopRider;
          default:
            return true;
        }
      },
    }),
    columnHelper.accessor('firstShift', {
      header: 'Shifts',
      cell: ({ row }) => (
        <div>
          {getShifts(row.original).map(shift => (
            <Badge key={shift} bg="info" className="me-1">
              {shift}
            </Badge>
          ))}
        </div>
      ),
      enableSorting: false,
      enableColumnFilter: true,
      filterFn: (row, _, filterValue) => {
        const player = row.original;
        if (!filterValue || filterValue === 'all') return true;
        
        switch (filterValue) {
          case 'first':
            return player.firstShift;
          case 'second':
            return player.secondShift;
          case 'both':
            return player.firstShift && player.secondShift;
          default:
            return true;
        }
      },
    }),
    columnHelper.accessor('isAssigned', {
      header: 'Status',
      cell: ({ getValue }) => (
        <Badge bg={getValue() ? "success" : "light"} text={getValue() ? "white" : "dark"}>
          {getValue() ? 'Assigned' : 'Not Assigned'}
        </Badge>
      ),
      enableSorting: true,
      enableColumnFilter: true,
    }),
    columnHelper.accessor('assignments', {
      header: 'Assignments',
      cell: ({ getValue }) => {
        const assignments = getValue();
        if (assignments.length === 0) {
          return <Badge bg="light" text="dark">Not Assigned</Badge>;
        }
        
        return (
          <div>
            {assignments.map((assignment, index) => (
              <div key={index} className="mb-1">
                <Badge 
                  bg={assignment.isCaptain ? "warning" : "success"}
                  className="me-1"
                >
                  {assignment.buildingName}
                </Badge>
                <Badge bg="info" className="me-1">
                  {getShiftName(assignment.shift)}
                </Badge>
                {assignment.isCaptain ? (
                  <Badge bg="warning">Captain</Badge>
                ) : (
                  <Badge bg="secondary">March: {assignment.march}</Badge>
                )}
              </div>
            ))}
          </div>
        );
      },
      enableSorting: false,
      enableColumnFilter: false,
    }),
  ], [columnHelper]);

  const table = useReactTable({
    data: playersWithAssignments,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const assignedCount = playersWithAssignments.filter(p => p.isAssigned).length;
  const captainCount = playersWithAssignments.filter(p => p.isCapitan).length;
  const regularPlayerCount = playersWithAssignments.filter(p => !p.isCapitan).length;

  const clearAllFilters = () => {
    setGlobalFilter('');
    setColumnFilters([]);
    setSorting([]);
    setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
  };

  // Generate pagination items
  const generatePaginationItems = () => {
    const items = [];
    const currentPage = table.getState().pagination.pageIndex;
    const totalPages = table.getPageCount();
    
    // Previous button
    items.push(
      <Pagination.Prev
        key="prev"
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
      />
    );

    // First page
    if (currentPage > 2) {
      items.push(
        <Pagination.Item
          key="first"
          onClick={() => table.setPageIndex(0)}
        >
          1
        </Pagination.Item>
      );
      if (currentPage > 3) {
        items.push(<Pagination.Ellipsis key="ellipsis1" />);
      }
    }

    // Pages around current page
    const startPage = Math.max(0, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);
    
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => table.setPageIndex(i)}
        >
          {i + 1}
        </Pagination.Item>
      );
    }

    // Last page
    if (currentPage < totalPages - 3) {
      if (currentPage < totalPages - 4) {
        items.push(<Pagination.Ellipsis key="ellipsis2" />);
      }
      items.push(
        <Pagination.Item
          key="last"
          onClick={() => table.setPageIndex(totalPages - 1)}
        >
          {totalPages}
        </Pagination.Item>
      );
    }

    // Next button
    items.push(
      <Pagination.Next
        key="next"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
      />
    );

    return items;
  };

  return (
    <Card>
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5>Available Players List</h5>
            <small className="text-muted">
              Total: {players.length} | Assigned: {assignedCount} | Captains: {captainCount} | Regular: {regularPlayerCount}
            </small>
          </div>
          <div>
            <Button 
              size="sm" 
              variant="outline-info"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </div>
      </Card.Header>
      <Card.Body>
        {/* Filters */}
        {showFilters && (
          <Accordion className="mb-3">
            <Accordion.Item eventKey="0">
              <Accordion.Header>Advanced Filters</Accordion.Header>
              <Accordion.Body>
                <Row>
                  <Col md={6}>
                    <InputGroup className="mb-3">
                      <InputGroup.Text>🔍</InputGroup.Text>
                      <Form.Control
                        placeholder="Search all columns..."
                        value={globalFilter ?? ''}
                        onChange={e => setGlobalFilter(e.target.value)}
                      />
                    </InputGroup>
                  </Col>
                  <Col md={3}>
                    <Form.Select
                      className="mb-3"
                      value={columnFilters.find(f => f.id === 'isAssigned')?.value as string || ''}
                      onChange={e => {
                        const value = e.target.value;
                        if (value) {
                          table.getColumn('isAssigned')?.setFilterValue(value === 'true');
                        } else {
                          table.getColumn('isAssigned')?.setFilterValue(undefined);
                        }
                      }}
                    >
                      <option value="">All Status</option>
                      <option value="true">Assigned</option>
                      <option value="false">Not Assigned</option>
                    </Form.Select>
                  </Col>
                  <Col md={3}>
                    <Form.Select
                      className="mb-3"
                      value={columnFilters.find(f => f.id === 'isCapitan')?.value as string || ''}
                      onChange={e => {
                        const value = e.target.value;
                        if (value) {
                          table.getColumn('isCapitan')?.setFilterValue(value === 'true');
                        } else {
                          table.getColumn('isCapitan')?.setFilterValue(undefined);
                        }
                      }}
                    >
                      <option value="">All Players</option>
                      <option value="true">Captains Only</option>
                      <option value="false">Regular Players Only</option>
                    </Form.Select>
                  </Col>
                </Row>
                <Row>
                  <Col md={3}>
                    <Form.Select
                      className="mb-3"
                      value={columnFilters.find(f => f.id === 'troopTier')?.value as string || ''}
                      onChange={e => {
                        const value = e.target.value;
                        if (value) {
                          table.getColumn('troopTier')?.setFilterValue(value);
                        } else {
                          table.getColumn('troopTier')?.setFilterValue(undefined);
                        }
                      }}
                    >
                      <option value="">All Tiers</option>
                      {uniqueTiers.map(tier => (
                        <option key={tier} value={tier.toString()}>
                          Tier {tier}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={3}>
                    <Form.Select
                      className="mb-3"
                      value={columnFilters.find(f => f.id === 'troopFighter')?.value as string || ''}
                      onChange={e => {
                        const value = e.target.value;
                        if (value && value !== 'all') {
                          table.getColumn('troopFighter')?.setFilterValue(value);
                        } else {
                          table.getColumn('troopFighter')?.setFilterValue(undefined);
                        }
                      }}
                    >
                      <option value="">All Troop Types</option>
                      <option value="fighter">Fighter</option>
                      <option value="shooter">Shooter</option>
                      <option value="rider">Rider</option>
                    </Form.Select>
                  </Col>
                  <Col md={3}>
                    <Form.Select
                      className="mb-3"
                      value={columnFilters.find(f => f.id === 'firstShift')?.value as string || ''}
                      onChange={e => {
                        const value = e.target.value;
                        if (value && value !== 'all') {
                          table.getColumn('firstShift')?.setFilterValue(value);
                        } else {
                          table.getColumn('firstShift')?.setFilterValue(undefined);
                        }
                      }}
                    >
                      <option value="">All Shifts</option>
                      <option value="first">First Shift Only</option>
                      <option value="second">Second Shift Only</option>
                      <option value="both">Both Shifts</option>
                    </Form.Select>
                  </Col>
                  <Col md={3}>
                    <Button 
                      variant="outline-secondary" 
                      onClick={clearAllFilters}
                      className="w-100"
                    >
                      Clear All Filters
                    </Button>
                  </Col>
                </Row>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        )}

        {/* Table */}
        <div className="table-responsive">
          <Table striped bordered hover>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th 
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                    >
                      <div className="d-flex align-items-center">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <span className="ms-1">
                            {{
                              asc: ' 🔼',
                              desc: ' 🔽',
                            }[header.column.getIsSorted() as string] ?? ' ↕️'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr 
                  key={row.id} 
                  className={row.original.isAssigned ? 'table-success' : ''}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {/* Pagination Controls */}
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="d-flex align-items-center">
            <span className="me-3">
              Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}{' '}
              of {table.getFilteredRowModel().rows.length} players
              {table.getFilteredRowModel().rows.length !== players.length && (
                <span className="text-muted ms-2">
                  (filtered from {players.length} total)
                </span>
              )}
            </span>
            
            <Form.Select
              value={table.getState().pagination.pageSize}
              onChange={e => {
                table.setPageSize(Number(e.target.value));
              }}
              style={{ width: 'auto' }}
              size="sm"
            >
              {[10, 25, 50, 100].map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </Form.Select>
          </div>
          
          <div className="d-flex align-items-center">
            <Pagination className="mb-0 me-3">
              {generatePaginationItems()}
            </Pagination>
            
            <Button 
              size="sm" 
              variant="outline-secondary"
              onClick={clearAllFilters}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default AvailablePlayersList; 