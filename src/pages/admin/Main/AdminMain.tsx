// 1. Установите зависимости:
// npm install @tanstack/react-table @tanstack/react-query firebase luxon
import * as XLSX from 'xlsx';
// 2. Инициализация Firebase
import {DateTime} from 'luxon';

// 3. Создаем компонент таблицы
import {useQuery} from '@tanstack/react-query';
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
import {Button, Card, Pagination, Table} from "react-bootstrap";
import {Player} from "../../../types/Player.ts";
import {fetchWastelandDates} from "../../../api/fetchWastelandDates.ts";
import {useEffect, useState} from "react";
import {fetchPlayers} from "../../../api/fetchPlayers.ts";


function booleanFilter<T>(row: Row<T>, columnId: string, filterValue: any){
  return filterValue === "" || filterValue === 'true' && row.getValue(columnId) || filterValue === 'false' && !row.getValue(columnId);

}

const columns: ColumnDef<Player>[] = [
  {
    header: 'ID',
    accessorKey: 'id',
    id: 'id',
    sortingFn: "text"
    // sortDescFirst: false,
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
  {
    header: 'Name',
    accessorKey: 'name',
  }, {
    header: 'Alliance',
    accessorKey: 'alliance',
  }, {
    header: 'First shift',
    accessorKey: 'firstShift',
    filterFn: booleanFilter,
    meta: {
      filterVariant: 'booleanSelect',
    },
  }, {
    header: 'Second Shift',
    accessorKey: 'secondShift',
    filterFn: booleanFilter,
    meta: {
      filterVariant: 'booleanSelect',
    },
  }, {
    header: 'Troop tier',
    accessorKey: 'troopTier',
    filterFn: (row, columnId, filterValue) => row.getValue(columnId) === parseInt(filterValue),
    meta: {
      filterVariant: 'select',
    },
  }, {
    header: 'Is Fighter',
    accessorKey: 'troopFighter',
    filterFn: booleanFilter,
    meta: {
      filterVariant: 'booleanSelect',
    },
  }, {
    header: 'Is Shooter',
    accessorKey: 'troopShooter',
    filterFn: booleanFilter,
    meta: {
      filterVariant: 'booleanSelect',
    },
  }, {
    header: 'Is Rider',
    accessorKey: 'troopRider',
    filterFn: booleanFilter,
    meta: {
      filterVariant: 'booleanSelect',
    },
  }, {
    header: 'Is Capitan',
    accessorKey: 'isCapitan',
    filterFn: booleanFilter,
    meta: {
      filterVariant: 'booleanSelect',
    },
  }, {
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

];
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
      value={parseInt(columnFilterValue as string)}
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
      <option value="true">True</option>
      <option value="false">False</option>
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

  const {data: dates, isLoading: datesIsloading, isError: datesIsError, error: datesError} = useQuery({
    queryKey: ['wastelandDates'],
    queryFn: fetchWastelandDates
  });
  console.log(dates)
  const {data: playersData, isLoading: playesrsIsLoading, isError: playersIsError, error: playersError} = useQuery({
    queryKey: ['players'],
    queryFn: () => fetchPlayers(dates!),
    enabled: !!dates
  });

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
          desc: false, // sort by name in descending order by default
        },
      ],
    },
  });
  const handleExport = () => {
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
    XLSX.utils.book_append_sheet(workbook, worksheet, 'players');

    // Сохраняем файл напрямую через SheetJS
    XLSX.writeFile(workbook, 'players_export.xlsx', {
      bookType: 'xlsx',
      type: 'array',
    });
  };

  if (datesIsloading || playesrsIsLoading) return <div>Loading...</div>;
  if (datesIsError) return <div>Error loading dates: {datesError.message}</div>;
  if (playersIsError) return <div>Error loading players data: {playersError.message}</div>;
  return (
    <Card>
      <Card.Header className={'d-flex justify-content-between'}><h2>List of players</h2><Button onClick={handleExport}>download
        xlsx</Button></Card.Header>
      <Card.Body>
        <Table responsive className="w-full border-collapse">
          <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                return (
                  <th key={header.id} colSpan={header.colSpan}>
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
                <td key={cell.id} className="border-b p-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
          </tbody>
        </Table>

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
  );
}

export default AdminMain;