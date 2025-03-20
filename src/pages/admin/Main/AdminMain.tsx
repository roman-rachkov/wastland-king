// 1. Установите зависимости:
// npm install @tanstack/react-table @tanstack/react-query firebase luxon
import * as XLSX from 'xlsx';
// 2. Инициализация Firebase
import {collection, getDocs} from 'firebase/firestore';
import {DateTime} from 'luxon';

// 3. Создаем компонент таблицы
import {useQuery} from '@tanstack/react-query';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {db} from "../../../services/firebase.ts";
import {Button, Card, Pagination, Table} from "react-bootstrap";
import {Player} from "../../../types/Player.ts";


const columns: ColumnDef<Player>[] = [
  {
    header: 'ID',
    accessorKey: 'id',
    id: 'id',
    sortDescFirst: false,
  },
  {
    header: 'Created At',
    accessorFn: row => DateTime.fromJSDate(row.createdAt).toFormat('dd.MM.yyyy HH:mm'),
  },
  {
    header: 'Updated At',
      accessorFn: row => DateTime.fromJSDate(row.updatedAt).toFormat('dd.MM.yyyy HH:mm'),
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
  }, {
    header: 'Second Shift',
    accessorKey: 'secondShift',
  }, {
    header: 'Troop tier',
    accessorKey: 'troopTier',
  }, {
    header: 'Is Fighter',
    accessorKey: 'troopFighter',
  }, {
    header: 'Is Shooter',
    accessorKey: 'troopShooter',
  }, {
    header: 'Is Rider',
    accessorKey: 'troopRider',
  }, {
    header: 'Is Capitan',
    accessorKey: 'isCapitan',
  }, {
    header: 'March size',
    accessorKey: 'marchSize',
  },
  {
    header: 'Rally size',
    accessorKey: 'rallySize',
  },

];

const fetchPlayers = async (): Promise<Player[]> => {
  const querySnapshot = await getDocs(collection(db, 'players'));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
    updatedAt: doc.data().updatedAt.toDate(),
  })) as Player[];
};

function AdminMain() {
  const {data, isLoading, isError} = useQuery({
    queryKey: ['players'],
    queryFn: fetchPlayers,
  });

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
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

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading data</div>;

  return (
    <Card>

      <Card.Header className={'d-flex justify-content-between'}><h2>List of players</h2><Button onClick={handleExport}>download xlsx</Button></Card.Header>
      <Card.Body>
        <Table responsive className="w-full border-collapse">
          <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className="border-b p-2 text-left font-semibold"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
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
      <Card.Footer>
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

      </Card.Footer>
    </Card>
  );
}

export default AdminMain;