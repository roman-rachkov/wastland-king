// 1. Установите зависимости:
// npm install @tanstack/react-table @tanstack/react-query firebase luxon
import * as XLSX from 'xlsx';
// 2. Инициализация Firebase
import {DateTime} from 'luxon';

// 3. Создаем компонент таблицы
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {
  Column,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  useReactTable,
} from '@tanstack/react-table';
import {Button, Card, Pagination, Table, Form} from "react-bootstrap";
import {Player} from "../../../types/Player.ts";
import {fetchWastelandDates} from "../../../services/api/fetchWastelandDates.ts";
import {useEffect, useState, useCallback, useMemo} from "react";
import {fetchPlayers} from "../../../services/api/fetchPlayers.ts";
import {fetchAllPlayers} from "../../../services/api/fetchAllPlayers.ts";
import {deletePlayer} from "../../../services/api/deletePlayer.ts";
import EditPlayerModal from "../../../components/players/EditPlayerModal";
import ColumnVisibilityToggle from "../../../components/common/ColumnVisibilityToggle";
import ActionsMenu from "../../../components/common/ActionsMenu";


function booleanFilter<T>(row: Row<T>, columnId: string, filterValue: any){
  return filterValue === "" || filterValue === 'true' && row.getValue(columnId) || filterValue === 'false' && !row.getValue(columnId);

}

function Filter({ column }: { column: Column<any, unknown> }) {
  const columnFilterValue = column.getFilterValue()
  // @ts-ignore
  const { filterVariant } = column.columnDef.meta ?? {}

  return filterVariant === 'range' ? (
    <div>
      <div className="flex space-x-2">
        {/* See faceted column filters example for min max values functionality */}
        <DebouncedInput
          type="number"
          value={(columnFilterValue as [number, number])?.[0] ?? ''}
          onChange={value =>
            column.setFilterValue((old: [number, number]) => [value, old?.[1]])
          }
          placeholder={`Min`}
          className="w-24 border shadow rounded"
        />
        <DebouncedInput
          type="number"
          value={(columnFilterValue as [number, number])?.[1] ?? ''}
          onChange={value =>
            column.setFilterValue((old: [number, number]) => [old?.[0], value])
          }
          placeholder={`Max`}
          className="w-24 border shadow rounded"
        />
      </div>
      <div className="h-1" />
    </div>
  ) : filterVariant === 'select' ? (
    <select
      onChange={e => column.setFilterValue(e.target.value)}
      value={columnFilterValue && columnFilterValue !== '' ? parseInt(columnFilterValue as string) : ''}
    >
      {/* See faceted column filters example for dynamic select options */}
      <option value="">All</option>
      <option value="10">T10</option>
      <option value="11">T11</option>
      <option value="12">T12</option>
      <option value="13">T13</option>
    </select>
  ) : filterVariant === 'booleanSelect' ? (
    <select
      onChange={e => column.setFilterValue(e.target.value)}
      value={columnFilterValue?.toString()}
    >
      {/* See faceted column filters example for dynamic select options */}
      <option value="">All</option>
      <option value="true">{column.id === 'isAttack' ? 'Attack' : 'True'}</option>
      <option value="false">{column.id === 'isAttack' ? 'Defense' : 'False'}</option>
    </select>
    ) : (
    <DebouncedInput
      className="w-36 border shadow rounded"
      onChange={value => column.setFilterValue(value)}
      placeholder={`Search...`}
      type="text"
      value={(columnFilterValue ?? '') as string}
    />
    // See faceted column filters example for datalist search suggestions
  )
}

// A typical debounced input react component
function DebouncedInput({
                          value: initialValue,
                          onChange,
                          debounce = 500,
                          ...props
                        }: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value])

  return (
    <input {...props} value={value} onChange={e => setValue(e.target.value)} />
  )
}


function AdminMain() {
  const [showAllPlayers, setShowAllPlayers] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const queryClient = useQueryClient();

  // Отслеживаем монтирование компонента
  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  // ВСЕ ХУКИ ДОЛЖНЫ БЫТЬ ВЫЗВАНЫ ДО ЛЮБЫХ УСЛОВНЫХ ОПЕРАТОРОВ
  const {data: dates, isLoading: datesIsloading, isError: datesIsError, error: datesError} = useQuery({
    queryKey: ['wastlandDates'],
    queryFn: fetchWastelandDates,
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут
    retry: 3,
    retryDelay: 1000,
  });
  
  const {data: playersData, isLoading: playersIsLoading, isError: playersIsError, error: playersError} = useQuery({
    queryKey: ['players', showAllPlayers],
    queryFn: () => showAllPlayers ? fetchAllPlayers() : fetchPlayers(dates!),
    enabled: !!dates || showAllPlayers,
    staleTime: 2 * 60 * 1000, // 2 минуты
    gcTime: 5 * 60 * 1000, // 5 минут
    retry: 3,
    retryDelay: 1000,
  });

  const handleEditPlayer = useCallback((player: Player) => {
    if (!isMounted) return;
    setSelectedPlayer(player);
    setShowEditModal(true);
  }, [isMounted]);

  const handleDeletePlayer = useCallback(async (player: Player) => {
    if (!isMounted) return;
    if (confirm(`Are you sure you want to delete player "${player.name}"? This action cannot be undone.`)) {
      try {
        await deletePlayer(player.id);
        // Refresh the data
        queryClient.invalidateQueries({ queryKey: ['players', showAllPlayers] });
        alert('Player deleted successfully!');
      } catch (error) {
        console.error('Error deleting player:', error);
        alert('Failed to delete player. Please try again.');
      }
    }
  }, [queryClient, showAllPlayers, isMounted]);

  const columns: ColumnDef<Player>[] = useMemo(() => [
    {
      header: 'Actions',
      id: 'actions',
      enableHiding: false, // Нельзя скрыть столбец действий
      cell: ({ row }) => {
        const player = row.original;
        return (
          <ActionsMenu
            player={player}
            onEdit={handleEditPlayer}
            onDelete={handleDeletePlayer}
          />
        );
      },
    },
    {
      header: 'ID',
      accessorKey: 'id',
      id: 'id',
      sortingFn: "text"
    },
    {
      header: 'Name',
      accessorKey: 'name',
    }, 
    {
      header: 'Alliance',
      accessorKey: 'alliance',
    }, 
    {
      header: 'March size',
      accessorKey: 'marchSize',
      meta: {
        filterVariant: 'range',
      },
    },
    {
      header: 'Rally size',
      accessorKey: 'rallySize',
      meta: {
        filterVariant: 'range',
      },
    },
    {
      header: 'Attack/Defense',
      accessorKey: 'isAttack',
      cell: ({ getValue }) => getValue() ? 'Attack' : 'Defense',
      filterFn: booleanFilter,
      meta: {
        filterVariant: 'booleanSelect',
      },
    },
    {
      header: 'First shift',
      accessorKey: 'firstShift',
      filterFn: booleanFilter,
      meta: {
        filterVariant: 'booleanSelect',
      },
    }, 
    {
      header: 'Second Shift',
      accessorKey: 'secondShift',
      filterFn: booleanFilter,
      meta: {
        filterVariant: 'booleanSelect',
      },
    }, 
    {
      header: 'Troop tier',
      accessorKey: 'troopTier',
      filterFn: (row, columnId, filterValue) => row.getValue(columnId) === parseInt(filterValue),
      meta: {
        filterVariant: 'select',
      },
    }, 
    {
      header: 'Is Fighter',
      accessorKey: 'troopFighter',
      filterFn: booleanFilter,
      meta: {
        filterVariant: 'booleanSelect',
      },
    }, 
    {
      header: 'Is Shooter',
      accessorKey: 'troopShooter',
      filterFn: booleanFilter,
      meta: {
        filterVariant: 'booleanSelect',
      },
    }, 
    {
      header: 'Is Rider',
      accessorKey: 'troopRider',
      filterFn: booleanFilter,
      meta: {
        filterVariant: 'booleanSelect',
      },
    }, 
    {
      header: 'Is Capitan',
      accessorKey: 'isCapitan',
      filterFn: booleanFilter,
      meta: {
        filterVariant: 'booleanSelect',
      },
    },
    {
      header: 'Created At',
      accessorFn: row => DateTime.fromJSDate(row.createdAt).toFormat('dd.MM.yyyy HH:mm'),
      sortingFn: "datetime",
    },
    {
      header: 'Updated At',
      accessorFn: row => DateTime.fromJSDate(row.updatedAt).toFormat('dd.MM.yyyy HH:mm'),
      sortingFn: "datetime",
    },
  ], [handleEditPlayer, handleDeletePlayer]);

  // Создаем таблицу с безопасными данными - ВСЕГДА ВЫЗЫВАЕМ ХУК
  const table = useReactTable({
    data: playersData || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      sorting: [
        {
          id: 'id',
          desc: false,
        },
      ],
      columnVisibility: {
        // По умолчанию скрываем некоторые столбцы для лучшего UX
        'Created At': false,
        'Updated At': false,
        'Is Fighter': false,
        'Is Shooter': false,
        'Is Rider': false,
        'Is Capitan': false,
      },
    },
  });

  const handleShowAllPlayersChange = useCallback((checked: boolean) => {
    if (!isMounted) return;
    setShowAllPlayers(checked);
  }, [isMounted]);

  // Простое логирование без избыточности
  console.log('AdminMain:', { isMounted, playersCount: playersData?.length || 0 });

  if (!isMounted) {
    return null;
  }

  if (datesIsloading || playersIsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (datesIsError || playersIsError) {
    return (
      <div className="text-red-500 p-4">
        <h2>Ошибка загрузки данных</h2>
        {datesError && <p>Ошибка дат: {datesError.message}</p>}
        {playersError && <p>Ошибка игроков: {playersError.message}</p>}
      </div>
    );
  }

  // Защита от создания таблицы с невалидными данными
  if (!Array.isArray(playersData)) {
    console.error('AdminMain: playersData is not an array:', playersData);
    return (
      <div className="text-red-500 p-4">
        <h2>Ошибка данных</h2>
        <p>Данные игроков не являются массивом</p>
      </div>
    );
  }

  const handleExport = () => {
    if (!isMounted) return;
    
    try {
      // Создаем новый рабочий лист
      const worksheet = XLSX.utils.json_to_sheet(
        table.getPrePaginationRowModel().rows.map(({original: item}) => ({
          id: item.id,
          name: item.name,
          alliance: item.alliance,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          firstShift: item.firstShift,
          secondShift: item.secondShift,
          troopTier: item.troopTier,
          troopFighter: item.troopFighter,
          troopShooter: item.troopShooter,
          troopRider: item.troopRider,
          isCapitan: item.isCapitan,
          marchSize: item.marchSize,
          rallySize: item.rallySize,

        }))
      );

      // Создаем рабочую книгу и добавляем лист
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, showAllPlayers ? 'all_players' : 'current_players');

      // Сохраняем файл напрямую через SheetJS
      XLSX.writeFile(workbook, `${showAllPlayers ? 'all_players' : 'current_players'}_export.xlsx`, {
        bookType: 'xlsx',
        type: 'array',
      });
    } catch (error) {
      console.error('Error during export:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const handlePlayerUpdated = () => {
    if (!isMounted) return;
    queryClient.invalidateQueries({ queryKey: ['players', showAllPlayers] });
  };

  return (
    <>
      <Card>
        <Card.Header className={'d-flex justify-content-between align-items-center'}>
          <div className="d-flex align-items-center gap-3">
            <h2 className="mb-0">List of players</h2>
            <Form.Check
              type="switch"
              id="show-all-players"
              label="Show all registered players"
              checked={showAllPlayers}
              onChange={(e) => handleShowAllPlayersChange(e.target.checked)}
            />
            <ColumnVisibilityToggle
              columns={table.getAllLeafColumns()}
              onToggleColumn={(columnId, visible) => {
                table.getColumn(columnId)?.toggleVisibility(visible);
              }}
            />
          </div>
          <Button onClick={handleExport}>
            Download {showAllPlayers ? 'all players' : 'current players'} xlsx
          </Button>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive" style={{ position: 'relative' }}>
            <Table className="w-full border-collapse">
              <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => {
                    return (
                      <th 
                        key={header.id} 
                        colSpan={header.colSpan}
                        style={{
                          position: header.id === 'actions' ? 'sticky' : 'static',
                          left: header.id === 'actions' ? 0 : 'auto',
                          backgroundColor: header.id === 'actions' ? 'white' : 'transparent',
                          zIndex: header.id === 'actions' ? 100 : 1,
                          borderRight: header.id === 'actions' ? '2px solid #dee2e6' : 'none',
                        }}
                      >
                        {header.isPlaceholder ? null : (
                          <>
                            <div
                              {...{
                                className: header.column.getCanSort()
                                  ? 'cursor-pointer select-none'
                                  : '',
                                onClick: header.column.getToggleSortingHandler(),
                              }}
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              {{
                                asc: ' 🔼',
                                desc: ' 🔽',
                              }[header.column.getIsSorted() as string] ?? null}
                            </div>
                            {header.column.getCanFilter() ? (
                              <div>
                                <Filter column={header.column} />
                              </div>
                            ) : null}
                          </>
                        )}
                      </th>
                    )
                  })}
                </tr>
              ))}
              </thead>
              <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map(cell => (
                    <td 
                      key={cell.id} 
                      className="border-b p-2"
                      style={{
                        position: cell.column.id === 'actions' ? 'sticky' : 'static',
                        left: cell.column.id === 'actions' ? 0 : 'auto',
                        backgroundColor: cell.column.id === 'actions' ? 'white' : 'transparent',
                        zIndex: cell.column.id === 'actions' ? 100 : 1,
                        borderRight: cell.column.id === 'actions' ? '2px solid #dee2e6' : 'none',
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
        <Card.Footer className={'d-flex justify-content-between'}>
          <Pagination>
            <Pagination.Item
              onClick={() => table.firstPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {'<<'}
            </Pagination.Item>
            <Pagination.Item
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {'<'}
            </Pagination.Item>
            <Pagination.Item
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              {'>'}
            </Pagination.Item>
            <Pagination.Item
              onClick={() => table.lastPage()}
              disabled={!table.getCanNextPage()}
            >
              {'>>'}
            </Pagination.Item>
            <select
              value={table.getState().pagination.pageSize}
              onChange={e => {
                table.setPageSize(Number(e.target.value))
              }}
            >
              {[10, 20, 30, 40, 50].map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </Pagination>
          <div className={'ms-3 me-auto fs-3'}>Total: {table.getRowCount()}</div>
          <Button variant={'secondary'} onClick={() => table.resetColumnFilters(true)}>Clear filters</Button>
        </Card.Footer>
      </Card>

      <EditPlayerModal
        show={showEditModal && isMounted}
        onHide={() => {
          if (isMounted) {
            setShowEditModal(false);
            setSelectedPlayer(null);
          }
        }}
        player={selectedPlayer}
        onPlayerUpdated={handlePlayerUpdated}
      />
    </>
  );
}

export default AdminMain;