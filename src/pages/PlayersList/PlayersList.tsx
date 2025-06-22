import {DateTime} from 'luxon';
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
import {Card, Pagination, Table} from "react-bootstrap";
import {Player} from "../../types/Player.ts";
import {fetchWastelandDates} from "../../api/fetchWastelandDates.ts";
import {useEffect, useState} from "react";
import {fetchPlayers} from "../../api/fetchPlayers.ts";

function booleanFilter<T>(row: Row<T>, columnId: string, filterValue: any){
  return filterValue === "" || filterValue === 'true' && row.getValue(columnId) || filterValue === 'false' && !row.getValue(columnId);
}

const columns: ColumnDef<Player>[] = [
  {
    header: 'Name',
    accessorKey: 'name',
  }, 
  {
    header: 'Alliance',
    accessorKey: 'alliance',
  }, 
  {
    header: 'Attack/Defense',
    accessorKey: 'isAttack',
    cell: ({ getValue }) => getValue() ? 'Attack' : 'Defense',
    filterFn: booleanFilter,
    meta: {
      filterVariant: 'booleanSelect',
    },
  }
];

function Filter({ column }: { column: Column<any, unknown> }) {
  const columnFilterValue = column.getFilterValue()
  // @ts-ignore
  const { filterVariant } = column.columnDef.meta ?? {}

  return filterVariant === 'booleanSelect' ? (
    <select
      onChange={e => column.setFilterValue(e.target.value)}
      value={columnFilterValue?.toString()}
    >
      <option value="">All</option>
      <option value="true">Attack</option>
      <option value="false">Defense</option>
    </select>
  ) : (
    <DebouncedInput
      className="w-36 border shadow rounded"
      onChange={value => column.setFilterValue(value)}
      placeholder={`Search...`}
      type="text"
      value={(columnFilterValue ?? '') as string}
    />
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

function PlayersList() {
  const {data: dates, isLoading: datesIsloading, isError: datesIsError, error: datesError} = useQuery({
    queryKey: ['wastelandDates'],
    queryFn: fetchWastelandDates
  });
  console.log(dates)
  
  const {data: playersData, isLoading: playersIsLoading, isError: playersIsError, error: playersError} = useQuery({
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
          id: 'name',
          desc: false,
        },
      ],
    },
  });

  if (datesIsloading || playersIsLoading) return <div>Loading...</div>;
  if (datesIsError) return <div>Error loading dates: {datesError.message}</div>;
  if (playersIsError) return <div>Error loading players data: {playersError.message}</div>;
  return (
    <Card>
      <Card.Header>
        <h2>List of players</h2>
      </Card.Header>
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
        <button className={'btn btn-secondary'} onClick={() => table.resetColumnFilters(true)}>Clear filters</button>
      </Card.Footer>
    </Card>
  );
}

export default PlayersList; 